"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { LoginFormData } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginRequest } from "@/lib/api/auth";
import { isApiClientError } from "@/lib/api/client";
import { setAuthToken } from "@/lib/auth/token";
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

export function LoginForm({ onSubmit }: LoginFormProps) {
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

  const handleFormSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setSuccessMessage(null);
    setCanRetry(false);
    clearErrors();

    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        const response = await loginRequest(data);
        if (response.success === false) {
          setServerError(response.error ?? response.message ?? "Authentication failed.");
          return;
        }
        if (response.token) {
          setAuthToken(response.token);
        }
      }

      setSuccessMessage("Signed in successfully.");
      reset({ ...data, password: "" });
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
        }
        return;
      }

      setServerError("An unexpected error occurred. Please try again.");
      setCanRetry(true);
    }
  };

  return (
    <Card className={`w-full max-w-md bg-white rounded-2xl shadow-md ${isSubmitting ? "opacity-95" : ""}`}>
      <CardHeader className="space-y-1 text-center px-6 pt-6">
        <CardTitle className="text-2xl font-bold font-display text-primary">MIVA Hubble Admin</CardTitle>
        <CardDescription className="text-muted-foreground">Sign in to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4 px-6 pb-6"
          aria-busy={isSubmitting}
        >
          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
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
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
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
            />
            {errors.password && (
              <p id="password-error" className="text-xs text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Server Error */}
          {serverError && (
            <div
              className="flex items-center justify-between p-2.5 bg-destructive/10 border border-destructive text-destructive rounded-lg text-xs"
              role="alert"
            >
              <span>{serverError}</span>
              {canRetry && (
                <button
                  type="button"
                  className="ml-3 text-xs underline"
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
            <div className="p-2.5 bg-accent/10 border border-accent rounded-lg text-accent-foreground text-sm" role="status" aria-live="polite">
              {successMessage}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-primary-foreground ${isSubmitting ? "cursor-wait" : "cursor-pointer"} bg-primary hover:bg-primary/90`}
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
          <p className="text-center text-muted-foreground text-xs mt-1">
            Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
