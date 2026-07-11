/**
 * IMPORTANT: this file must NEVER store access/refresh tokens or any part
 * of a JWT. Tokens live only in HttpOnly cookies, set by the backend, and
 * are never readable from JS. This storage is only for small, non-sensitive
 * UX state — e.g. "where was the admin trying to go before we bounced them
 * to the login page".
 */

const REDIRECT_KEY = "auth_redirect_target";

export function setRedirectTarget(path: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(REDIRECT_KEY, path);
}

export function consumeRedirectTarget(): string | null {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(REDIRECT_KEY);
  if (value) window.sessionStorage.removeItem(REDIRECT_KEY);
  return value;
}
