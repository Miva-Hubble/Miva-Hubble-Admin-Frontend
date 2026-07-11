import axios, { AxiosError, AxiosHeaders } from "axios";
import { clearAuthToken, getAuthToken } from "@/lib/auth/token";

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

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
    skipAuthHeader?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

let isRedirectingToLogin = false;

apiClient.interceptors.request.use((config) => {
  if (config.skipAuthHeader) {
    return config;
  }

  const token = getAuthToken();
  if (!token) {
    return config;
  }

  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (shouldHandleUnauthorized(error)) {
      handleUnauthorized();
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export function isApiClientError(error: unknown): error is ApiClientError {
  return (
    error instanceof Error &&
    "fieldErrors" in error &&
    "isNetworkError" in error &&
    "retryable" in error
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
  if (!errors) {
    return {};
  }

  const normalized: Record<string, string> = {};

  for (const [field, value] of Object.entries(errors)) {
    if (Array.isArray(value)) {
      normalized[field] = value[0] ?? "Invalid value";
    } else {
      normalized[field] = value;
    }
  }

  return normalized;
}

function fallbackErrorMessage(
  status?: number,
  defaultMessage?: string,
): string {
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

function shouldHandleUnauthorized(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  if (error.response?.status !== 401) {
    return false;
  }

  return error.config?.skipAuthRedirect !== true;
}

function handleUnauthorized(): void {
  clearAuthToken();

  if (typeof window === "undefined") {
    return;
  }

  if (isRedirectingToLogin) {
    return;
  }

  if (isAuthPage(window.location.pathname)) {
    return;
  }

  isRedirectingToLogin = true;
  const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const query = new URLSearchParams({
    session: "expired",
    next,
  });

  window.location.assign(`/?${query.toString()}`);
}

function isAuthPage(pathname: string): boolean {
  return pathname === "/" || pathname === "/login";
}
