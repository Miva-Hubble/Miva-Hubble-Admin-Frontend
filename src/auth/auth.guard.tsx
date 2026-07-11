"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/useAuth";
import { setRedirectTarget } from "@/auth/auth.storage";

/**
 * Wrap any protected layout/page with this. Renders nothing (well, a
 * loading state) until we know whether there's a valid session, then either
 * renders `children` or redirects to `/`.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (typeof window !== "undefined") {
        setRedirectTarget(`${window.location.pathname}${window.location.search}`);
      }
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
