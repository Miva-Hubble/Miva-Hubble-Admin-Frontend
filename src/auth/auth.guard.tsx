"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/useAuth";
import { setRedirectTarget } from "@/auth/auth.storage";
import { BookOpen } from "lucide-react";

/**
 * Wrap any protected layout/page with this. Renders nothing (well, a
 * loading state) until we know whether there's a valid session, then either
 * renders `children` or redirects to `/login`.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (typeof window !== "undefined") {
        setRedirectTarget(`${window.location.pathname}${window.location.search}`);
      }
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-5 bg-background">
        {/* Brand mark */}
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant animate-pulse">
          <BookOpen className="h-6 w-6" />
        </div>
        {/* Animated progress bar */}
        <div className="h-0.5 w-48 overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/2 rounded-full bg-primary animate-[shimmer_1.4s_ease-in-out_infinite] origin-left" />
        </div>
        <p className="text-xs text-muted-foreground">
          Connecting to MIVA Hubble…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
