import type { AxiosInstance } from "axios";

/**
 * Request interceptor stays intentionally lightweight.
 *
 * It must NOT attach an Authorization header — the browser already sends
 * the HttpOnly adminAccessToken/adminRefreshToken cookies on every request
 * because `withCredentials: true` is set on the instance. This only adds
 * lightweight, non-sensitive metadata.
 */
export function attachRequestInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use((config) => {
    config.headers = config.headers ?? {};
    config.headers["X-Request-Id"] = createRequestId();
    return config;
  });
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
