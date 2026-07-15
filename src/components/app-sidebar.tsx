"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Library,
  Users,
  BarChart3,
  ShieldCheck,
  Bell,
  Settings,
  BookOpen,
  Upload,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuth } from "@/auth/useAuth";

function getInitials(name?: string, email?: string) {
  const source = name?.trim() || email?.trim() || "";
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

const nav = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Library", url: "/library", icon: Library },
  { title: "Users", url: "/users", icon: Users },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const manage = [
  { title: "Moderation", url: "/moderation", icon: ShieldCheck },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { admin } = useAuth();
  const isActive = (u: string) =>
    u === "/" ? pathname === "/" : pathname.startsWith(u);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2.5 px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate font-display text-base font-bold leading-none">
              MIVA Hubble
            </span>
            <span className="mt-1 truncate text-[11px] text-muted-foreground">
              Admin Console
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton
                    render={<Link href={i.url} />}
                    isActive={isActive(i.url)}
                    tooltip={i.title}
                  >
                    <i.icon />
                    <span>{i.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manage.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton
                    render={<Link href={i.url} />}
                    isActive={isActive(i.url)}
                    tooltip={i.title}
                  >
                    <i.icon />
                    <span>{i.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="rounded-xl bg-gradient-primary p-3 text-primary-foreground shadow-elegant group-data-[collapsible=icon]:hidden">
          <p className="font-display text-sm font-semibold">Upload resource</p>
          <p className="mt-0.5 text-[11px] opacity-90">
            Publish a new book, PDF or reading pack.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-2 h-8 w-full bg-white/95 text-primary hover:bg-white"
          >
            <Upload className="h-3.5 w-3.5" />
            New upload
          </Button>
        </div>

        <SidebarSeparator className="my-1" />

        {admin && (
          <div className="flex items-center gap-2.5 rounded-xl border border-sidebar-border/70 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:px-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-gradient-primary text-[11px] font-semibold text-primary-foreground">
                {getInitials(admin.name, admin.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-xs font-medium text-sidebar-foreground">
                {admin.name || admin.email}
              </span>
              <span className="truncate text-[11px] capitalize text-sidebar-foreground/60">
                {admin.role || admin.email}
              </span>
            </div>
          </div>
        )}

        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
