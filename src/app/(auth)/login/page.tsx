import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "MIVA Hubble Admin - Sign In",
  description: "Sign in to your MIVA Hubble Admin account",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-hero px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_18%_20%,rgba(252,251,252,0.16),transparent_45%),radial-gradient(circle_at_82%_78%,rgba(124,29,36,0.35),transparent_45%)]"
      />
      <div className="relative flex w-full flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2.5 text-primary-foreground">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <BookOpen className="h-6 w-6" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            MIVA Hubble
          </span>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
