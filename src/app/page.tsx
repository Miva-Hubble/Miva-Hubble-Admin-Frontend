import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "MIVA Hubble Admin - Sign In",
  description: "Sign in to your MIVA Hubble Admin account",
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12 bg-background">
      {/* Decorative background blobs for a premium visual aesthetic */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      
      <div className="relative z-10 w-full max-w-md flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
