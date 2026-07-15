"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";
import type { LoginFormData } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/useAuth";
import { isApiClientError } from "@/interceptors/response.interceptor";
import { consumeRedirectTarget } from "@/auth/auth.storage";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DEMO_EMAIL = "admin@miva.edu";
const DEMO_PASSWORD = "admin123";
const LOGIN_FIELDS = ["email", "password"] as const;

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => Promise<void>;
}

// Shared styling for the filled, icon-leading "Apple settings row" style
// field seen in the design reference — no visible border, soft filled
// background, generous height, icon inset on the left.
const FIELD_CLASSES = cn(
  "h-14 w-full rounded-2xl border-none bg-zinc-100 pl-12 pr-4 text-base !text-black caret-black shadow-none",
  "placeholder:text-zinc-400",
  "focus-visible:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-primary/25",
  "aria-invalid:bg-destructive/5 aria-invalid:ring-2 aria-invalid:ring-destructive/30",
);

export function LoginForm({ onSubmit }: LoginFormProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    mode: "onBlur",
  });

  // Surface the "you were signed out" toast here (after the hard redirect
  // from the axios interceptor lands us back on this page) rather than
  // trying to show it right before the redirect, where it'd never render.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("session") === "expired") {
      toast.error("Your session has expired. Please sign in again.");
    }
  }, []);

  const handleFormSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setSuccessMessage(null);
    setCanRetry(false);
    clearErrors();

    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        await login(data);
      }

      setSuccessMessage("Signed in successfully.");
      toast.success("Signed in successfully.");
      reset({ ...data, password: "" });

      const next = consumeRedirectTarget();
      router.replace(next ?? "/dashboard");
    } catch (error) {
      if (isApiClientError(error)) {
        let hasFieldErrors = false;

        for (const field of LOGIN_FIELDS) {
          const message = error.fieldErrors[field];
          if (message) {
            setError(field, { type: "server", message });
            hasFieldErrors = true;
          }
        }

        if (!hasFieldErrors) {
          setServerError(error.message);
          setCanRetry(error.retryable);
          toast.error(error.message);
        } else {
          toast.error("Please fix the highlighted fields and try again.");
        }
        return;
      }

      setServerError("An unexpected error occurred. Please try again.");
      setCanRetry(true);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Card
      className={`w-full max-w-lg rounded-[2rem] border-none bg-white p-2 shadow-2xl ${isSubmitting ? "opacity-95" : ""}`}
    >
      <CardHeader className="space-y-1.5 px-8 pt-10 text-center sm:px-10">
        <CardTitle className="font-display text-3xl font-bold tracking-tight text-black">
          MIVA Hubble Admin
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Sign in to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-6 px-8 pb-10 pt-2 sm:px-10"
          aria-busy={isSubmitting}
        >
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[17px] font-semibold text-black">
              Email address
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-600"
                strokeWidth={1.75}
              />
              <Input
                id="email"
                type="email"
                placeholder="admin@miva.edu"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
                disabled={isSubmitting}
                className={FIELD_CLASSES}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-xs text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[17px] font-semibold text-black">
              Password
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-600"
                strokeWidth={1.75}
              />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                disabled={isSubmitting}
                className={FIELD_CLASSES}
              />
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Server Error */}
          {serverError && (
            <div
              className="flex items-center justify-between rounded-2xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-destructive"
              role="alert"
            >
              <span>{serverError}</span>
              {canRetry && (
                <button
                  type="button"
                  className="ml-3 cursor-pointer text-xs underline"
                  onClick={() => handleSubmit(handleFormSubmit)()}
                  aria-label="Retry sign in"
                  disabled={isSubmitting}
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              className="rounded-2xl border border-accent bg-accent/10 p-3.5 text-sm text-accent-foreground"
              role="status"
              aria-live="polite"
            >
              {successMessage}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`h-14 w-full rounded-2xl text-base font-semibold text-primary-foreground ${isSubmitting ? "cursor-wait" : "cursor-pointer"} bg-primary hover:bg-primary/90`}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          {/* Demo Credentials */}
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
