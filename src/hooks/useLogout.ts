"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import { isApiClientError } from "@/interceptors/response.interceptor";

export function useLogout() {
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Signed out.");
    } catch (error) {
      // Logout clears local state regardless (see AuthProvider.logout), so
      // the admin is signed out client-side either way — this just tells
      // them the server-side session revoke may not have gone through.
      const message = isApiClientError(error)
        ? error.message
        : "Signed out, but we couldn't confirm it with the server.";
      toast.error(message);
    } finally {
      setIsLoggingOut(false);
      router.replace("/login");
    }
  }, [logout, router]);

  return { logout: handleLogout, isLoggingOut };
}
