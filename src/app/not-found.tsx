import Link from "next/link";
import { BookOpen, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

// Root-level fallback for any URL that doesn't correspond to a real route
// anywhere in the app (outside /dashboard's own not-found.tsx, which
// handles unbuilt sections inside the app shell). No sidebar/topbar
// context exists this far out, so this is a standalone branded page.
export default function RootNotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-background px-4 text-center">
      <div className="flex items-center gap-2 text-primary">
        <BookOpen className="h-5 w-5" />
        <span className="font-display text-sm font-semibold tracking-tight">
          MIVA Hubble
        </span>
      </div>
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <FileQuestion className="h-7 w-7" />
      </div>
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Page not found
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have
          moved.
        </p>
      </div>
      <Button render={<Link href="/dashboard" />} className="mt-1">
        Go to Dashboard
      </Button>
    </div>
  );
}
