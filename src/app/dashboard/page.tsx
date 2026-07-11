import { Badge } from "@/components/ui/badge";
import {Sparkles, Upload} from "lucide-react";
import { UploadResourceDialog } from "@/components/upload-resource-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export default function Overview() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant sm:p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 right-32 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <Badge className="border-white/20 bg-white/15 text-white hover:bg-white/20">
              <Sparkles className="mr-1 h-3 w-3" /> Term 2 · 2025/26
            </Badge>
            <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl lg:text-4xl">
              Welcome back, Ada.
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/85 sm:text-base">
              5,893 students opened the library today. 12 new uploads are
              awaiting your review.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <UploadResourceDialog
              trigger={
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <Upload className="h-4 w-4" /> Upload resource
                </Button>
              }
            />
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
    </div>
  );
}
