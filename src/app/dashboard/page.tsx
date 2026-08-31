"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Upload, Users, BookOpen, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UploadResourceForm } from "@/components/upload-resource-form";
import { AdminBooksTable } from "@/components/admin-books-table";
import { useAdminBooks } from "@/hooks/useAdminBooks";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get("view") || "overview";
  const { books, isLoading } = useAdminBooks();

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

  // Real counts derived from the same book list the table below renders —
  // one fetch, no duplicated/mocked numbers. Zero until the books actually
  // load, never a placeholder figure.
  const totalResources = isLoading ? null : books.length;
  const awaitingReview = isLoading ? null : books.filter((b) => b.status === "DRAFT").length;

  // Otherwise, render the Overview view
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
              Manage your library resources and review submissions.
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
              View analytics <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Metrics — every number here is real (or 0 while loading /
          if nothing exists yet). No fabricated figures. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-xs flex flex-col justify-between h-36">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Today&apos;s Visits</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-display tracking-tight text-foreground">0</h3>
            <p className="text-xs text-muted-foreground mt-1">Visit tracking not yet implemented</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-xs flex flex-col justify-between h-36">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Awaiting Review</span>
            <Clock className="h-4 w-4 text-secondary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-display tracking-tight text-foreground">
              {awaitingReview ?? 0}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Requires librarian approval</p>
          </div>
        </div>

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

      {/* Uploaded books — real data, with per-book preview/download counts
          and delete. Replaces the old static "Recent Submissions" mock. */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-4">
          <h4 className="font-semibold text-sm text-foreground">Uploaded Books</h4>
        </div>
        <AdminBooksTable />
      </div>
    </div>
  );
}

export default function Overview() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
