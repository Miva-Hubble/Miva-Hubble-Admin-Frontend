"use client";

import { AlertCircle, Users as UsersIcon, CheckCircle2, CircleDashed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AdminUser } from "@/types/user";
import type { AppError } from "@/errors/error.types";

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  isError: boolean;
  error: AppError | Error | null;
}

function initials(name?: string, email?: string) {
  const source = name?.trim() || email?.trim() || "";
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function UsersTable({ users, isLoading, isError, error }: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 py-12 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-base font-semibold text-foreground">Failed to load users</p>
        <p className="max-w-md text-sm text-muted-foreground">
          {error?.message || "There was an error communicating with the backend."}
        </p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/40 bg-card/50 py-16 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground mb-1">
          <UsersIcon className="h-6 w-6" />
        </div>
        <p className="text-base font-semibold text-foreground">No users found</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          No students match the active filter or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/40 bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[16%]" />
            <col className="w-[34%]" />
            <col className="w-[12%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead className="border-b border-border/40 bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-4 pl-6 pr-4">Student</th>
              <th className="px-4 py-4">Department / Level</th>
              <th className="px-4 py-4">Goals</th>
              <th className="px-4 py-4">Onboarding</th>
              <th className="px-4 py-4">Verified</th>
              <th className="py-4 pl-4 pr-6">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {users.map((user) => (
              <tr
                key={user.id}
                className="cursor-pointer transition-colors hover:bg-muted/40 focus-within:bg-muted/40"
              >
                {/* Identity */}
                <td className="py-5 pl-6 pr-4 align-top">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border/40 shrink-0">
                      {user.picture && <AvatarImage src={user.picture} />}
                      <AvatarFallback className="bg-gradient-primary text-xs font-bold text-primary-foreground">
                        {initials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Dept / Level */}
                <td className="px-4 py-5 align-top">
                  {user.onboarding ? (
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground text-sm truncate">
                        {user.onboarding.department}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.onboarding.level}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                {/* Goals — every goal shown, wrapped, none hidden behind "+N" */}
                <td className="px-4 py-5 align-top">
                  {user.onboarding && user.onboarding.goals.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {user.onboarding.goals.map((goal) => (
                        <Badge
                          key={goal}
                          variant="outline"
                          className="text-xs font-medium border-border/60 bg-muted/30 whitespace-normal"
                        >
                          {goal.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                {/* Onboarding status */}
                <td className="px-4 py-5 align-top">
                  {user.onboarding ? (
                    <Badge className="text-xs font-semibold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Onboarded
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs font-semibold bg-muted/40 text-muted-foreground border-border/50"
                    >
                      <CircleDashed className="h-3.5 w-3.5 mr-1" />
                      Pending
                    </Badge>
                  )}
                </td>

                {/* Email verified */}
                <td className="px-4 py-5 align-top">
                  {user.emailVerified ? (
                    <Badge className="text-xs font-semibold border bg-primary/10 text-primary border-primary/20">
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs font-semibold bg-muted/30 text-muted-foreground border-border/40"
                    >
                      Unverified
                    </Badge>
                  )}
                </td>

                {/* Joined date */}
                <td className="py-5 pl-4 pr-6 align-top text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
