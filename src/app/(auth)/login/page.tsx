import type { Metadata } from "next";


import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "MIVA Hubble Admin - Sign In",
  description: "Sign in to your MIVA Hubble Admin account",
};

export default function LoginPage() {
  return (
  
      <div className="flex flex-col items-center gap-4">
        <LoginForm />
      </div>
   
  );
}
