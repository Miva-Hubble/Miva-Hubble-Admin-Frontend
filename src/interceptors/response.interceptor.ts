import axios, { type AxiosInstance } from "axios";
import { refreshSession } from "@/services/refresh.service";
import { redirectToLogin } from "@/auth/session";
import { normalizeError } from "@/errors/normalizeError";
import type { AppError } from "@/errors/error.types";

export interface ApiClientError extends Error, AppError {}

export function isApiClientError(error: unknown): error is ApiClientError {
  return (
    error instanceof Error &&
    "fieldErrors" in error &&
    "isNetworkError" in error &&
    "retryable" in error
  );
}

/**
 * Owns the authentication lifecycle on the response side:
 *
 *   401 on a request
 *     -> already retried once? logout / redirect to login
 *     -> else: try POST /auth/refresh
 *         -> success: retry the original request once
 *         -> failure: redirect to login (session is over)
 */
export function attachResponseInterceptor(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(normalizeApiError(error));
      }

      const status = error.response?.status;
      const config = error.config;

      const shouldAttemptRefresh =
        status === 401 && config && config.skipAuthRedirect !== true && !config._retry;

      if (!shouldAttemptRefresh) {
        return Promise.reject(normalizeApiError(error));
      }

      config._retry = true;

      const refreshed = await refreshSession();

      if (!refreshed) {
        if (config.silentAuthFailure !== true) {
          redirectToLogin();
        }
        return Promise.reject(normalizeApiError(error));
      }

      return client(config);
    },
  );
}

function normalizeApiError(error: unknown): ApiClientError {
  if (isApiClientError(error)) {
    return error;
  }

  const appError = normalizeError(error);
  const apiError = new Error(appError.message) as ApiClientError;
  apiError.title = appError.title;
  apiError.status = appError.status;
  apiError.type = appError.type;
  apiError.fieldErrors = appError.fieldErrors;
  apiError.isNetworkError = appError.isNetworkError;
  apiError.retryable = appError.retryable;
  return apiError;
}
