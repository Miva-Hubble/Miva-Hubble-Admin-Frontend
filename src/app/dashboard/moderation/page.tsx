"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Archive,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudentResources } from "@/hooks/useStudentResources";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { ModerationTable } from "@/components/moderation-table";
import { ModerationReviewModal } from "@/components/moderation-review-modal";
import type { StudentResource, StudentResourceStatus } from "@/types/student-resource";

const STATUS_TABS: Array<{
  id: StudentResourceStatus | "ALL";
  label: string;
  icon: typeof Clock;
}> = [
  { id: "ALL", label: "All Submissions", icon: ShieldCheck },
  { id: "PENDING_REVIEW", label: "Pending Review", icon: Clock },
  { id: "APPROVED", label: "Approved & Vaulted", icon: CheckCircle2 },
  { id: "REJECTED", label: "Rejected", icon: XCircle },
  { id: "ARCHIVED", label: "Archived", icon: Archive },
];

export default function ModerationPage() {
  const [selectedStatus, setSelectedStatus] = useState<StudentResourceStatus | "ALL">("PENDING_REVIEW");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<string>("ALL");
  const [level, setLevel] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [selectedResource, setSelectedResource] = useState<StudentResource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { departments, levels } = useTaxonomy();

  const queryParams = {
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
    page,
    limit: 15,
    search: search ? search.trim() : undefined,
    department: department === "ALL" ? undefined : department,
    level: level === "ALL" ? undefined : level,
  };

  const {
    resources,
    total,
    totalPages,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    reviewResource,
    isReviewing,
    archiveResource,
    isArchiving,
  } = useStudentResources(queryParams);

  // Separate query just to get real count for pending review badge
  const { total: pendingCount } = useStudentResources({
    status: "PENDING_REVIEW",
    limit: 1,
  });

  const handleOpenReview = (resource: StudentResource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleApprove = async (resourceId: string) => {
    await reviewResource({
      resourceId,
      payload: { action: "APPROVE" },
    });
  };

  const handleReject = async (resourceId: string, reason: string) => {
    await reviewResource({
      resourceId,
      payload: { action: "REJECT", reason },
    });
  };

  const handleArchive = async (resourceId: string, reason: string) => {
    await archiveResource({
      resourceId,
      payload: { reason },
    });
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              Student Submissions Moderation
            </h1>
            {pendingCount > 0 && (
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold">
                {pendingCount} Pending
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review, approve, or provide structured revision feedback on student study material uploads.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="w-fit rounded-full text-xs gap-1.5 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh Queue
        </Button>
      </div>

      {/* KPI stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => {
            setSelectedStatus("PENDING_REVIEW");
            setPage(1);
          }}
          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
            selectedStatus === "PENDING_REVIEW"
              ? "border-amber-500/50 bg-amber-500/5 shadow-xs"
              : "border-border/40 bg-card hover:border-amber-500/30"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Awaiting Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-display tracking-tight text-foreground">
            {pendingCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Requires moderator approval</p>
        </div>

        <div
          onClick={() => {
            setSelectedStatus("APPROVED");
            setPage(1);
          }}
          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
            selectedStatus === "APPROVED"
              ? "border-emerald-500/50 bg-emerald-500/5 shadow-xs"
              : "border-border/40 bg-card hover:border-emerald-500/30"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Approved Vault</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-display tracking-tight text-foreground">
            {selectedStatus === "APPROVED" ? total : "—"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Live & readable in Vault</p>
        </div>

        <div
          onClick={() => {
            setSelectedStatus("REJECTED");
            setPage(1);
          }}
          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
            selectedStatus === "REJECTED"
              ? "border-destructive/50 bg-destructive/5 shadow-xs"
              : "border-border/40 bg-card hover:border-destructive/30"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Rejected</span>
            <XCircle className="h-4 w-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold font-display tracking-tight text-foreground">
            {selectedStatus === "REJECTED" ? total : "—"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Feedback provided</p>
        </div>

        <div
          onClick={() => {
            setSelectedStatus("ARCHIVED");
            setPage(1);
          }}
          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
            selectedStatus === "ARCHIVED"
              ? "border-border bg-muted/30 shadow-xs"
              : "border-border/40 bg-card hover:border-border"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Archived</span>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold font-display tracking-tight text-foreground">
            {selectedStatus === "ARCHIVED" ? total : "—"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Revoked / Superseded</p>
        </div>
      </div>

      {/* Filter Tabs & Search Matrix */}
      <div className="space-y-4">
        {/* Status Pill Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-3">
          {STATUS_TABS.map((tab) => {
            const isActive = selectedStatus === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedStatus(tab.id);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.id === "PENDING_REVIEW" && pendingCount > 0 && (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                      isActive ? "bg-white/20 text-white" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 lg:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or student name…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9.5 rounded-xl border-border/60 text-xs"
            />
          </div>

          <div className="sm:col-span-3 lg:col-span-4">
            <Select
              value={department}
              onValueChange={(val) => {
                if (val) {
                  setDepartment(val);
                  setPage(1);
                }
              }}
            >
              <SelectTrigger className="h-9.5 rounded-xl border-border/60 text-xs">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-3 lg:col-span-3">
            <Select
              value={level}
              onValueChange={(val) => {
                if (val) {
                  setLevel(val);
                  setPage(1);
                }
              }}
            >
              <SelectTrigger className="h-9.5 rounded-xl border-border/60 text-xs">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">All Levels</SelectItem>
                {levels.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l.startsWith("Level") ? l : `Level ${l}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Moderation Submissions Table */}
      <ModerationTable
        resources={resources}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onSelectResource={handleOpenReview}
        onApprove={handleApprove}
        isProcessing={isReviewing || isArchiving}
      />

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <p className="text-xs text-muted-foreground">
            Showing Page <span className="font-semibold text-foreground">{page}</span> of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span> ({total} submissions total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full text-xs h-8 px-3"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full text-xs h-8 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Review & Action Modal */}
      <ModerationReviewModal
        resource={selectedResource}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onApprove={handleApprove}
        onReject={handleReject}
        onArchive={handleArchive}
        isProcessing={isReviewing || isArchiving}
      />
    </div>
  );
}
