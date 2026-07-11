import axios from "axios";
import { API_BASE_URL } from "@/api/config";
import { attachRequestInterceptor } from "@/interceptors/request.interceptor";
import { attachResponseInterceptor } from "@/interceptors/response.interceptor";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Skip the 401 -> refresh -> retry -> redirect lifecycle for this request. */
    skipAuthRedirect?: boolean;
    /**
     * Still attempt the 401 -> refresh -> retry lifecycle, but suppress the
     * hard redirect + "session expired" toast if refresh ultimately fails.
     * Used for the initial bootstrap /auth/me call, where failure just
     * means "never logged in" (not "was logged in, now isn't") — the
     * RequireAuth guard handles that redirect quietly on its own.
     */
    silentAuthFailure?: boolean;
    /** Marks a request as already-retried so it isn't retried twice. */
    _retry?: boolean;
  }
}

/**
 * Single Axios instance for the whole app.
 *
 * The backend authenticates admins via HttpOnly cookies
 * (adminAccessToken / adminRefreshToken), so this client never attaches an
 * Authorization header and never reads/writes tokens in JS. `withCredentials`
 * is what makes the browser send those cookies automatically.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

attachRequestInterceptor(apiClient);
attachResponseInterceptor(apiClient);
