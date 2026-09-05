"use client";

import {
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  Clock,
  Archive,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { StudentResource, StudentResourceStatus } from "@/types/student-resource";
import type { AppError } from "@/errors/error.types";

interface ModerationTableProps {
  resources: StudentResource[];
  isLoading: boolean;
  isError: boolean;
  error: AppError | Error | null;
  onSelectResource: (resource: StudentResource) => void;
  onApprove: (resourceId: string) => Promise<void>;
  isProcessing?: boolean;
}

const STATUS_BADGE: Record<
  StudentResourceStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  PENDING_REVIEW: {
    label: "Pending Review",
    variant: "secondary",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  APPROVED: {
    label: "Approved & Live",
    variant: "default",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  REJECTED: {
    label: "Rejected",
    variant: "destructive",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  ARCHIVED: {
    label: "Archived",
    variant: "outline",
    className: "bg-muted/50 text-muted-foreground border-border/60",
  },
  DRAFT: {
    label: "Draft",
    variant: "outline",
    className: "bg-muted/30 text-muted-foreground border-border/40",
  },
};

export function ModerationTable({
  resources,
  isLoading,
  isError,
  error,
  onSelectResource,
  onApprove,
  isProcessing = false,
}: ModerationTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 py-12 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-semibold text-foreground">
          Failed to load student submissions
        </p>
        <p className="max-w-md text-xs text-muted-foreground">
          {error?.message || "There was an error communicating with the moderation queue."}
        </p>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/40 bg-card/50 py-16 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground mb-1">
          <Clock className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-foreground">No submissions found</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          No student submissions match the active filter or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border/40 bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-3.5 pl-5 pr-3">Resource & Document</th>
              <th className="px-3 py-3.5">Department / Level</th>
              <th className="px-3 py-3.5">Submitted By</th>
              <th className="px-3 py-3.5">Status</th>
              <th className="px-3 py-3.5">Date</th>
              <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {resources.map((item) => {
              const statusCfg = (item.status && STATUS_BADGE[item.status]) || STATUS_BADGE.PENDING_REVIEW;
              const formattedType = (item.bookType || item.fileFormat || "STUDY_GUIDE")
                .toLowerCase()
                .replace(/_/g, " ");
              const submitterInitials = item.user?.name
                ? item.user.name.slice(0, 2).toUpperCase()
                : "ST";

              return (
                <tr
                  key={item.id}
                  className="group hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onSelectResource(item)}
                >
                  {/* Title and format */}
                  <td className="py-4 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary font-mono text-[10px] font-bold">
                        {item.fileFormat || "PDF"}
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {item.title || "Untitled Submission"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate capitalize">
                          {formattedType} {item.author ? `· ${item.author}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Dept / Level */}
                  <td className="px-3 py-4">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground truncate max-w-[140px]">
                        {item.department || "General"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.level ? `Level ${item.level}` : "All Levels"}
                      </p>
                    </div>
                  </td>

                  {/* Submitter */}
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 border border-border/40">
                        {item.user?.avatarUrl && (
                          <AvatarImage src={item.user.avatarUrl} />
                        )}
                        <AvatarFallback className="bg-gradient-primary text-[9px] font-bold text-primary-foreground">
                          {submitterInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 max-w-[130px]">
                        <p className="font-medium text-foreground truncate text-[11px]">
                          {item.user?.name || "Student Contributor"}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {item.user?.email || "Student"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-3 py-4">
                    <Badge
                      variant={statusCfg.variant}
                      className={`text-[10px] font-semibold border ${statusCfg.className}`}
                    >
                      {statusCfg.label}
                    </Badge>
                  </td>

                  {/* Date */}
                  <td className="px-3 py-4 text-muted-foreground whitespace-nowrap">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>

                  {/* Actions */}
                  <td className="py-4 pl-3 pr-5 text-right">
                    <div
                      className="flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.status === "PENDING_REVIEW" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 cursor-pointer"
                          disabled={isProcessing}
                          onClick={() => onApprove(item.id)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 rounded-full text-[11px] font-medium cursor-pointer"
                        onClick={() => onSelectResource(item)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
