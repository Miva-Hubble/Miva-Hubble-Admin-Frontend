import { apiClient } from "@/api/axios";
import type { AdminUser, LoginCredentials } from "@/auth/auth.types";

/**
 * Raw endpoint wrappers only — no state, no toasts, no business logic.
 * Components should never call these directly; go through
 * `@/auth/auth.service` (or `useAuth()`) instead.
 *
 * Matches the backend's documented admin auth routes, mounted under
 * /api/admin/auth/*. `apiClient`'s baseURL already includes the leading
 * /api, so paths here start at /admin/auth/*.
 */

interface LoginResponseBody {
  admin: AdminUser;
  accessToken: string;
  expiresIn: number;
}

interface MeResponseBody {
  admin: AdminUser;
}

export async function loginRequest(credentials: LoginCredentials): Promise<AdminUser> {
  const { data } = await apiClient.post<LoginResponseBody>(
    "/admin/auth/login",
    credentials,
    { skipAuthRedirect: true },
  );
  // The access token also comes back in the body, but the architecture is
  // cookie-only — the body's accessToken is intentionally ignored here and
  // never persisted in JS-accessible storage.
  return data.admin;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post("/admin/auth/logout", undefined, {
    skipAuthRedirect: true,
  });
}

export async function fetchCurrentAdmin(options?: { silent?: boolean }): Promise<AdminUser> {
  const { data } = await apiClient.get<MeResponseBody>("/admin/auth/me", {
    silentAuthFailure: options?.silent,
  });
  return data.admin;
}
