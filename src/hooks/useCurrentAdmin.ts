"use client";

import { useAuth } from "@/auth/useAuth";

/** Convenience hook for components that only care about the admin profile. */
export function useCurrentAdmin() {
  const { admin, isLoading } = useAuth();
  return { admin, isLoading };
}
