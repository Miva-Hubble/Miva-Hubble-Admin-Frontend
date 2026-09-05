"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Upload, Users, BookOpen, Clock, ArrowUpRight, ShieldCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { UploadResourceForm } from "@/components/upload-resource-form";
import { AdminBooksTable } from "@/components/admin-books-table";
import { useAdminBooks } from "@/hooks/useAdminBooks";
import { useStudentResources } from "@/hooks/useStudentResources";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get("view") || "overview";
  const { books, isLoading: isBooksLoading } = useAdminBooks();
  const {
    resources: pendingSubmissions,
    total: pendingCount,
    isLoading: isPendingLoading,
  } = useStudentResources({ status: "PENDING_REVIEW", limit: 5 });

  const handleShowUpload = () => {
    router.push("/dashboard?view=upload");
  };

  const handleBackToOverview = () => {
    router.push("/dashboard");
  };

  if (view === "upload") {
    return (
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
        <UploadResourceForm
          onDone={handleBackToOverview}
          onCancel={handleBackToOverview}
          isInline={true}
        />
      </div>
    );
  }

  const totalResources = isBooksLoading ? null : books.length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant sm:p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 right-32 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold sm:text-3xl lg:text-4xl">
              Welcome back, Ada.
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/85 sm:text-base">
              {pendingCount > 0
                ? `${pendingCount} student submission${pendingCount > 1 ? "s are" : " is"} awaiting your moderation review.`
                : "Manage your library resources and review student submissions."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 cursor-pointer"
              onClick={handleShowUpload}
            >
              <Upload className="h-4 w-4" /> Upload resource
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              render={<Link href="/dashboard/analytics" />}
            >
              View progression <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-xs flex flex-col justify-between h-36">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Today&apos;s Visits</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-display tracking-tight text-foreground">0</h3>
            <p className="text-xs text-muted-foreground mt-1">Visit tracking analytics active</p>
          </div>
        </div>

        <Link
          href="/dashboard/moderation"
          className="rounded-2xl border border-border/40 bg-card p-6 shadow-xs flex flex-col justify-between h-36 hover:border-amber-500/40 transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Awaiting Moderation</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold font-display tracking-tight text-foreground">
                {isPendingLoading ? "…" : pendingCount}
              </h3>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold group-hover:underline flex items-center">
                Open queue <ChevronRight className="h-3 w-3 ml-0.5" />
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Student submissions for Vault review</p>
          </div>
        </Link>

        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-xs flex flex-col justify-between h-36">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total E-Resources</span>
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-display tracking-tight text-foreground">
              {totalResources ?? 0}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">PDF &amp; EPUB books available</p>
          </div>
        </div>
      </div>

      {/* Pending Reviews Queue Strip (if any items exist) */}
      {pendingSubmissions.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h4 className="font-bold text-sm text-foreground">
                Pending Student Submissions ({pendingCount})
              </h4>
            </div>
            <Link
              href="/dashboard/moderation"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center"
            >
              View all in Moderation <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingSubmissions.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href="/dashboard/moderation"
                className="rounded-xl border border-border/60 bg-background/80 p-3 hover:border-amber-500/40 transition-colors block"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="secondary" className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-600">
                    {item.fileFormat || "PDF"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    Level {item.level}
                  </span>
                </div>
                <p className="font-semibold text-xs text-foreground truncate">{item.title}</p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {item.user?.name ? `by ${item.user.name}` : item.department}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded books — real data */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-4">
          <h4 className="font-semibold text-sm text-foreground">Uploaded Books Catalog</h4>
        </div>
        <AdminBooksTable />
      </div>
    </div>
  );
}

export default function Overview() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
