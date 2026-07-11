"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

/**
 * Owns the logout *interaction* only — confirmation, in-flight state, user
 * feedback, and where the admin lands afterward. It does not own any auth
 * state itself; the actual session teardown is delegated to
 * `useAuth().logout()`, which goes through:
 *
 *   AuthProvider.logout()
 *     -> authService.logout()   (src/auth/auth.service.ts)
 *     -> logoutRequest()        (src/api/auth.api.ts -> POST /admin/auth/logout)
 *
 * That call clears the HttpOnly adminAccessToken/adminRefreshToken cookies
 * server-side and clears the in-memory `admin` state client-side.
 *
 * Rendered as a <SidebarMenu>/<SidebarMenuItem> so it inherits the same
 * icon-collapsed + tooltip behavior as the rest of the sidebar nav, but it
 * has no other dependency on AppSidebar — it could be dropped into a top
 * bar or a settings page by swapping the Sidebar* wrappers for a plain
 * <Button/>, since all the logic lives here rather than in the caller.
 */
export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Signed out successfully.");
    } catch {
      // authService.logout() clears local admin state in its `finally`
      // block even if the network request itself fails, so the admin is
      // effectively signed out on this device either way — the only thing
      // that may not have happened is the server-side cookie/session
      // teardown, which is worth surfacing but not worth blocking on.
      toast.error(
        "Signed out on this device, but we couldn't reach the server. Please check your connection.",
      );
    } finally {
      setIsLoggingOut(false);
      setOpen(false);
      router.replace("/");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Ignore dismiss attempts (overlay click / Escape) while a logout
        // request is in flight, so it can't be abandoned mid-way.
        if (!isLoggingOut) setOpen(next);
      }}
    >
      <SidebarMenu>
        <SidebarMenuItem>
          <DialogTrigger
            render={
              <SidebarMenuButton
                tooltip="Log out"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              />
            }
          >
            <LogOut />
            <span>Log out</span>
          </DialogTrigger>
        </SidebarMenuItem>
      </SidebarMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log out of MIVA Hubble Admin?</DialogTitle>
          <DialogDescription>
            You&apos;ll need to sign in again to access the admin console.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isLoggingOut} />}>
            Cancel
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoggingOut}>
            {isLoggingOut ? "Signing out..." : "Log out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
