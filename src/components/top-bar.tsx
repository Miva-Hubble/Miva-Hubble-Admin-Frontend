"use client";

import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { clearAuthToken } from "@/lib/auth/token";
import { Bell, LogOut, MessageSquare, Search, Sparkles } from "lucide-react";

export function TopBar() {
  const router = useRouter();
  function handleLogout() {
    clearAuthToken();
    router.replace("/");
  }
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="relative hidden max-w-xl flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search books, users, courses, departments…"
          className="h-10 rounded-xl border-border/70 bg-muted/60 pl-9 pr-16 focus-visible:bg-background"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          aria-label="AI assistant"
          className="hidden sm:inline-flex"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Messages"
          className="relative"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-info" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>
        <div className="ml-2 flex items-center gap-2.5 rounded-full border border-border/70 py-1 pl-1 pr-3">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-gradient-primary text-[11px] font-semibold text-primary-foreground">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-xs font-semibold">Ada Okafor</p>
            <p className="text-[10px] text-muted-foreground">
              Librarian · MIVA
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
