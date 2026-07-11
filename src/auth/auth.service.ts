import { fetchCurrentAdmin, loginRequest, logoutRequest } from "@/api/auth.api";
import { refreshSession } from "@/services/refresh.service";
import type { AdminUser, LoginCredentials } from "@/auth/auth.types";

/**
 * Business-logic layer for authentication. Components/hooks talk to this
 * (never to `@/api/auth.api` or axios directly).
 */
export const authService = {
  async login(credentials: LoginCredentials): Promise<AdminUser> {
    return loginRequest(credentials);
  },

  async logout(): Promise<void> {
    await logoutRequest();
  },

  /** Throws if there is no valid session (caller decides how to handle it). */
  async getCurrentAdmin(options?: { silent?: boolean }): Promise<AdminUser> {
    return fetchCurrentAdmin(options);
  },

  /**
   * Explicitly refreshes the session, then re-fetches the admin profile.
   * Returns null if the refresh token is also invalid/expired.
   */
  async refresh(): Promise<AdminUser | null> {
    const refreshed = await refreshSession();
    if (!refreshed) return null;
    return fetchCurrentAdmin();
  },
};
