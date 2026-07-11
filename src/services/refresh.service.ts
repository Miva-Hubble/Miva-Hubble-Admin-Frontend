import axios from "axios";
import { API_BASE_URL } from "@/api/config";

/**
 * Bare axios instance used ONLY for the refresh call.
 *
 * It intentionally does NOT go through `apiClient` / the response
 * interceptor — refresh must never trigger another refresh on a 401,
 * or a 401 from an expired refresh token would recurse forever.
 */
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

let inFlightRefresh: Promise<boolean> | null = null;

/**
 * Calls the refresh endpoint, which (on success) sets fresh
 * adminAccessToken / adminRefreshToken cookies via Set-Cookie.
 *
 * Concurrent callers (e.g. several requests failing with 401 at the same
 * time) share a single in-flight refresh request instead of each firing
 * their own.
 *
 * Returns true if the session was refreshed, false if the refresh token
 * is also invalid/expired (session is over).
 */
export function refreshSession(): Promise<boolean> {
  if (!inFlightRefresh) {
    inFlightRefresh = refreshClient
      .post("/admin/auth/refresh")
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        inFlightRefresh = null;
      });
  }

  return inFlightRefresh;
}
