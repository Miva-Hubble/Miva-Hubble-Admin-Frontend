import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

// Rendered inside dashboard/layout.tsx (sidebar + topbar stay visible) any
// time notFound() fires within the dashboard tree — currently only from
// the [...catchAll] route, but also available to any future page that
// calls notFound() itself (e.g. "resource with this id doesn't exist").
export default function DashboardNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <FileQuestion className="h-7 w-7" />
      </div>
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-bold text-foreground">
          This section isn&apos;t built yet
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          There&apos;s no page here yet. If you followed a link to get here,
          it may point at a section still in progress.
        </p>
      </div>
      <Button render={<Link href="/dashboard" />} className="mt-2">
        Back to Overview
      </Button>
    </div>
  );
}
