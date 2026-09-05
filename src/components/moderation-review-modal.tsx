"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Archive,
  FileText,
  User,
  ExternalLink,
  AlertTriangle,
  Calendar,
  BookOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DocumentPreviewer } from "@/components/document-previewer";
import type { StudentResource } from "@/types/student-resource";

interface ModerationReviewModalProps {
  resource: StudentResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (resourceId: string) => Promise<void>;
  onReject: (resourceId: string, reason: string) => Promise<void>;
  onArchive: (resourceId: string, reason: string) => Promise<void>;
  isProcessing?: boolean;
}

const REJECTION_PRESETS = [
  "Incomplete document. Please upload the complete notes or textbook.",
  "Low scan quality or text is illegible.",
  "Course, department, or level does not match the material.",
  "Duplicate resource already available in the Vault.",
  "Document contains copyrighted or unauthorized examination material.",
];

export function ModerationReviewModal({
  resource,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onArchive,
  isProcessing = false,
}: ModerationReviewModalProps) {
  const [mode, setMode] = useState<"view" | "reject" | "archive">("view");
  const [activeTab, setActiveTab] = useState<"reader" | "details">("reader");
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  if (!resource) return null;

  const handleClose = () => {
    setMode("view");
    setReason("");
    setReasonError(null);
    onOpenChange(false);
  };

  const handleApprove = async () => {
    await onApprove(resource.id);
    handleClose();
  };

  const handleConfirmReject = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError("A rejection reason is mandatory.");
      return;
    }
    await onReject(resource.id, trimmed);
    handleClose();
  };

  const handleConfirmArchive = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError("An archive reason is mandatory.");
      return;
    }
    await onArchive(resource.id, trimmed);
    handleClose();
  };

  const isPending = resource.status === "PENDING_REVIEW";
  const formattedType = (resource.bookType || resource.fileFormat || "Study Guide")
    .toLowerCase()
    .replace(/_/g, " ");

  const submitterInitials = resource.user?.name
    ? resource.user.name.slice(0, 2).toUpperCase()
    : "ST";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[96vw] sm:max-w-5xl lg:max-w-7xl max-h-[94vh] overflow-y-auto rounded-3xl p-5 sm:p-7 md:p-9 shadow-elegant">
        {/* Header */}
        <DialogHeader className="border-b border-border/40 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-6">
            <div>
              <div className="flex items-center gap-2.5">
                <DialogTitle className="font-display text-xl sm:text-2xl font-bold tracking-tight text-primary">
                  Review Student Submission
                </DialogTitle>
                <Badge
                  variant={
                    resource.status === "APPROVED"
                      ? "default"
                      : resource.status === "PENDING_REVIEW"
                      ? "secondary"
                      : resource.status === "REJECTED"
                      ? "destructive"
                      : "outline"
                  }
                  className="text-xs uppercase tracking-wider font-semibold"
                >
                  {(resource.status || "PENDING_REVIEW").replace(/_/g, " ")}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Submitted on{" "}
                {resource.createdAt
                  ? new Date(resource.createdAt).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </DialogDescription>
            </div>

            {/* View Mode Toggle Switcher */}
            <div className="flex items-center rounded-xl bg-muted/40 p-1 border border-border/40">
              <button
                type="button"
                onClick={() => setActiveTab("reader")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "reader"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Live Document Reader
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "details"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Full Metadata
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Dynamic Body Content */}
        {activeTab === "reader" ? (
          /* Live Document Reader Mode (Split: 7 Cols Document Previewer + 5 Cols Actions & Details) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
            {/* Left: Embedded Document Previewer */}
            <div className="lg:col-span-7 flex flex-col min-h-[480px]">
              <DocumentPreviewer
                resourceId={resource.id}
                title={resource.title}
                fileUrl={resource.fileUrl || resource.path}
                fileFormat={resource.fileFormat}
                coverImageUrl={resource.coverImageUrl}
                className="flex-1"
              />
            </div>

            {/* Right: Quick Review Sidebar */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Resource Info */}
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Document Metadata
                  </span>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {resource.title || "Untitled Submission"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Author:{" "}
                    <span className="font-medium text-foreground">
                      {resource.author || "Unknown"}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-border/40">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Department
                      </span>
                      <p className="font-semibold text-foreground truncate">
                        {resource.department || "General"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Level
                      </span>
                      <p className="font-semibold text-foreground">
                        {resource.level ? `Level ${resource.level}` : "All Levels"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submitter info */}
                {resource.user && (
                  <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/10 p-3.5">
                    <Avatar className="h-10 w-10 border border-border/40">
                      {resource.user.avatarUrl && (
                        <AvatarImage src={resource.user.avatarUrl} />
                      )}
                      <AvatarFallback className="bg-gradient-primary text-[10px] font-bold text-primary-foreground">
                        {submitterInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">
                        {resource.user.name || "Student Contributor"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {resource.user.email || "student@miva.university"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sub-form: Reject reason mode */}
                {mode === "reject" && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-destructive">
                        Reason for Rejection <span className="text-destructive">*</span>
                      </Label>
                      <button
                        type="button"
                        onClick={() => setMode("view")}
                        className="text-xs text-muted-foreground hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {REJECTION_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setReason(preset);
                            setReasonError(null);
                          }}
                          className="rounded-lg border border-border/80 bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:border-destructive/40 hover:text-foreground transition-colors cursor-pointer"
                        >
                          {preset.slice(0, 32)}…
                        </button>
                      ))}
                    </div>

                    <Textarea
                      placeholder="Write feedback for the student..."
                      value={reason}
                      onChange={(e) => {
                        setReason(e.target.value);
                        if (reasonError) setReasonError(null);
                      }}
                      rows={3}
                      className="rounded-xl border-destructive/30 bg-background text-xs resize-none"
                    />
                    {reasonError && (
                      <p className="text-xs text-destructive">{reasonError}</p>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMode("view")}
                        disabled={isProcessing}
                        className="rounded-full text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleConfirmReject}
                        disabled={isProcessing}
                        className="rounded-full text-xs font-semibold gap-1.5 shadow-xs"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Confirm Rejection
                      </Button>
                    </div>
                  </div>
                )}

                {/* Sub-form: Archive reason mode */}
                {mode === "archive" && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Archive Resource
                      </Label>
                      <button
                        type="button"
                        onClick={() => setMode("view")}
                        className="text-xs text-muted-foreground hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <Textarea
                      placeholder="Reason for archiving (e.g. Superseded by newer edition)..."
                      value={reason}
                      onChange={(e) => {
                        setReason(e.target.value);
                        if (reasonError) setReasonError(null);
                      }}
                      rows={3}
                      className="rounded-xl border-amber-500/30 bg-background text-xs resize-none"
                    />
                    {reasonError && (
                      <p className="text-xs text-destructive">{reasonError}</p>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMode("view")}
                        disabled={isProcessing}
                        className="rounded-full text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleConfirmArchive}
                        disabled={isProcessing}
                        className="rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
                      >
                        <Archive className="h-3.5 w-3.5" />
                        Confirm Archive
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons in Reader View */}
              {mode === "view" && (
                <div className="border-t border-border/40 pt-4 flex flex-col gap-2">
                  {isPending && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMode("reject")}
                        disabled={isProcessing}
                        className="rounded-full text-xs text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5 cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve to Vault
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    {resource.status !== "ARCHIVED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMode("archive")}
                        disabled={isProcessing}
                        className="rounded-full text-xs text-muted-foreground hover:text-amber-600 gap-1"
                      >
                        <Archive className="h-3 w-3" />
                        Archive
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClose}
                      disabled={isProcessing}
                      className="rounded-full text-xs ml-auto"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Full Metadata Overview Tab */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            {/* Left Col (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative aspect-[3/4] max-h-[360px] w-full overflow-hidden rounded-3xl border border-border/60 bg-muted/30 shadow-inner flex flex-col items-center justify-center p-6 text-center">
                {resource.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resource.coverImageUrl}
                    alt={resource.title || "Cover image"}
                    className="h-full w-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="space-y-3 my-auto">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary shadow-xs">
                      <FileText className="h-8 w-8" />
                    </div>
                    <span className="inline-block rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary uppercase">
                      {resource.fileFormat || "PDF DOCUMENT"}
                    </span>
                    <p className="text-sm font-semibold text-foreground mt-2 line-clamp-2 px-2">
                      {resource.title || "Untitled Submission"}
                    </p>
                  </div>
                )}
              </div>

              {resource.user && (
                <div className="rounded-3xl border border-border/60 bg-muted/20 p-5 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary" />
                    Student Contributor
                  </span>
                  <div className="flex items-center gap-3.5">
                    <Avatar className="h-12 w-12 border-2 border-border/60 shadow-xs">
                      {resource.user.avatarUrl && (
                        <AvatarImage src={resource.user.avatarUrl} />
                      )}
                      <AvatarFallback className="bg-gradient-primary text-xs font-bold text-primary-foreground">
                        {submitterInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground truncate">
                        {resource.user.name || "Student Contributor"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {resource.user.email || "student@miva.university"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Col (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Resource Details
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground mt-1">
                  {resource.title || "Untitled Submission"}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Authored by{" "}
                  <span className="font-medium text-foreground">
                    {resource.author || "Unknown Author"}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Department
                  </span>
                  <p className="font-bold text-sm text-foreground mt-1 truncate">
                    {resource.department || "General"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Target Level
                  </span>
                  <p className="font-bold text-sm text-foreground mt-1">
                    {resource.level ? `Level ${resource.level}` : "All Levels"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Format Type
                  </span>
                  <p className="font-bold text-sm text-foreground mt-1 capitalize">
                    {formattedType}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Vault Status
                  </span>
                  <p className="font-bold text-sm text-foreground mt-1">
                    {resource.status === "APPROVED" ? "Live in Vault" : "Under Review"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Summary & Content Description
                </span>
                <div className="rounded-2xl border border-border/60 bg-muted/15 p-4 text-xs sm:text-sm text-foreground leading-relaxed">
                  {resource.description || (
                    <span className="text-muted-foreground italic">
                      No summary description provided.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
