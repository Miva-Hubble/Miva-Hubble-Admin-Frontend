"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "@/auth/AuthContext";
import { authService } from "@/auth/auth.service";
import type { AdminUser, LoginCredentials } from "@/auth/auth.types";

/**
 * Single source of truth for "who is the authenticated admin, if anyone".
 *
 * On mount it calls GET /auth/me. The axios response interceptor already
 * handles the 401 -> POST /auth/refresh -> retry /me dance transparently,
 * so by the time the promise here resolves/rejects we know the final
 * answer: authenticated (with a profile) or not.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authService
      .getCurrentAdmin({ silent: true })
      .then((profile) => {
        if (!cancelled) setAdmin(profile);
      })
      .catch(() => {
        if (!cancelled) setAdmin(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const profile = await authService.login(credentials);
    setAdmin(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setAdmin(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    const profile = await authService.refresh();
    setAdmin(profile);
    return profile;
  }, []);

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: admin !== null,
      isLoading,
      login,
      logout,
      refresh,
    }),
    [admin, isLoading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
