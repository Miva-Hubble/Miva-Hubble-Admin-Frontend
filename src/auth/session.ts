const AUTH_PATHS = new Set(["/", "/login"]);

export function isAuthPage(pathname: string): boolean {
  return AUTH_PATHS.has(pathname);
}

let isRedirecting = false;

/**
 * Hard-redirects to the login screen after a session is confirmed dead
 * (refresh failed / never authenticated). Used outside React (in the axios
 * response interceptor) where hooks aren't available.
 */
export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  if (isRedirecting) return;
  if (isAuthPage(window.location.pathname)) return;

  isRedirecting = true;

  const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const query = new URLSearchParams({ session: "expired", next });

  window.location.assign(`/?${query.toString()}`);
}
