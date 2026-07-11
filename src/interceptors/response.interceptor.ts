import axios, { AxiosError, type AxiosInstance } from "axios";
import { refreshSession } from "@/services/refresh.service";
import { redirectToLogin } from "@/auth/session";

type ErrorPayload = {
  message?: string;
  error?: string;
  errors?: Record<string, string | string[]>;
};

export interface ApiClientError extends Error {
  status?: number;
  fieldErrors: Record<string, string>;
  isNetworkError: boolean;
  retryable: boolean;
}

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

  if (!axios.isAxiosError(error)) {
    const unknownError = new Error(
      "Something went wrong. Please try again.",
    ) as ApiClientError;
    unknownError.fieldErrors = {};
    unknownError.isNetworkError = false;
    unknownError.retryable = false;
    return unknownError;
  }

  const axiosError = error as AxiosError<ErrorPayload>;
  const status = axiosError.response?.status;
  const payload = axiosError.response?.data;
  const fieldErrors = normalizeFieldErrors(payload?.errors);
  const message =
    payload?.message ??
    payload?.error ??
    fallbackErrorMessage(status, axiosError.message);

  const appError = new Error(message) as ApiClientError;
  appError.status = status;
  appError.fieldErrors = fieldErrors;
  appError.isNetworkError = !axiosError.response;
  appError.retryable =
    appError.isNetworkError || (typeof status === "number" && status >= 500);

  return appError;
}

function normalizeFieldErrors(
  errors?: Record<string, string | string[]>,
): Record<string, string> {
  if (!errors) return {};

  const normalized: Record<string, string> = {};
  for (const [field, value] of Object.entries(errors)) {
    normalized[field] = Array.isArray(value) ? value[0] ?? "Invalid value" : value;
  }
  return normalized;
}

function fallbackErrorMessage(status?: number, defaultMessage?: string): string {
  if (!status) {
    return "Network error. Please check your connection and try again.";
  }
  if (status === 401) {
    return "Invalid credentials. Please check your email and password.";
  }
  if (status === 422) {
    return "Validation failed. Please check your input.";
  }
  if (status >= 500) {
    return "Server error. Please try again in a moment.";
  }
  return defaultMessage || "An unexpected error occurred. Please try again.";
}
