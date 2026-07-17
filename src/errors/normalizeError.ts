import axios, { type AxiosError } from "axios";
import type { AppError, ErrorType } from "@/errors/error.types";

/**
 * The backend (Nest) error body shapes this normalizer knows how to read.
 * Kept loose/defensive on purpose — this is the one place in the app
 * allowed to assume things about an untrusted response body, precisely so
 * nothing else has to.
 */
interface BackendErrorBody {
  statusCode?: number;
  /** Nest's default: a plain string, OR an array of validation messages. */
  message?: string | string[];
  error?: string;
  /** Some endpoints return field errors as a flat map already. */
  fieldErrors?: Record<string, string>;
  errors?:
    | Record<string, string>
    | Array<{
        field?: string;
        property?: string;
        message?: string;
        constraints?: Record<string, string>;
      }>;
}

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

/**
 * The ONLY function in the app allowed to read a raw AxiosError or raw
 * backend response body. Everything else consumes its output (AppError).
 *
 * Never re-throws, never returns the raw error — always produces a safe,
 * classified, user-facing AppError.
 */
export function normalizeError(error: unknown): AppError {
  if (!axios.isAxiosError(error)) {
    return unknownError(error);
  }

  if (!error.response) {
    return networkError(error);
  }

  return httpError(error);
}

// ---------------------------------------------------------------------------
// NETWORK — request never reached the server (offline, DNS, CORS, timeout).
// ---------------------------------------------------------------------------

function networkError(error: AxiosError): AppError {
  const isTimeout = error.code === "ECONNABORTED";

  return {
    title: isTimeout ? "Request Timed Out" : "Connection Problem",
    message: isTimeout
      ? "The request took too long. Please check your connection and try again."
      : "Unable to connect to the server. Please check your internet connection.",
    status: 0,
    type: "NETWORK",
    fieldErrors: {},
    isNetworkError: true,
    retryable: true,
  };
}

// ---------------------------------------------------------------------------
// HTTP errors — the server responded, but with an error status.
// ---------------------------------------------------------------------------

function httpError(error: AxiosError): AppError {
  const status = error.response!.status;
  const body = (error.response!.data ?? {}) as BackendErrorBody;
  const type = classify(status);

  const base = {
    status,
    type,
    fieldErrors: type === "VALIDATION" ? extractFieldErrors(body) : {},
    isNetworkError: false,
    retryable: isRetryable(type),
  };

  switch (type) {
    case "AUTHENTICATION":
      return {
        ...base,
        title: "Authentication Failed",
        message: safeMessage(body, "Invalid email or password."),
      };

    case "AUTHORIZATION":
      return {
        ...base,
        title: "Access Denied",
        message: safeMessage(
          body,
          "You don't have permission to do that.",
        ),
      };

    case "VALIDATION":
      return {
        ...base,
        title: "Check Your Input",
        message:
          Object.keys(base.fieldErrors).length > 0
            ? "Please check the highlighted fields."
            : safeMessage(body, "Please check the highlighted fields."),
      };

    case "BUSINESS_LOGIC":
      return {
        ...base,
        title: "Action Couldn't Be Completed",
        // Business-logic messages (e.g. "Email already exists", "Event
        // already published") are written for end users by design, so —
        // unlike SERVER errors — it's safe to surface the backend's
        // message here rather than a generic fallback.
        message: safeMessage(body, "This action couldn't be completed."),
      };

    case "SERVER":
      return {
        ...base,
        title: "Server Error",
        // Deliberately ignore whatever the backend sent (stack traces,
        // "Internal Server Error", framework noise) — 5xx bodies are never
        // meant for end users.
        message:
          "Something went wrong on our end. Please try again in a moment.",
      };

    default:
      return {
        ...base,
        type: "UNKNOWN",
        title: "Unexpected Error",
        message: GENERIC_MESSAGE,
      };
  }
}

// ---------------------------------------------------------------------------
// Non-Axios errors — thrown JS errors, rejected promises with a plain
// Error/string/whatever. Should be rare (most app code only ever throws
// through the apiClient), but never let one reach a component unshaped.
// ---------------------------------------------------------------------------

function unknownError(_error: unknown): AppError {
  return {
    title: "Unexpected Error",
    message: GENERIC_MESSAGE,
    status: 0,
    type: "UNKNOWN",
    fieldErrors: {},
    isNetworkError: false,
    retryable: false,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function classify(status: number): ErrorType {
  if (status === 401) return "AUTHENTICATION";
  if (status === 403) return "AUTHORIZATION";
  if (status === 400 || status === 422) return "VALIDATION";
  if (status === 409 || status === 412) return "BUSINESS_LOGIC";
  if (status >= 500) return "SERVER";
  return "UNKNOWN";
}

function isRetryable(type: ErrorType): boolean {
  // NETWORK is handled separately (always true) — this only covers HTTP
  // statuses. SERVER errors are transient-by-assumption (the same GET/POST
  // may well succeed a moment later). Everything else needs the user to
  // change something (credentials, permissions, input, a conflicting
  // record) before retrying would ever help.
  return type === "SERVER";
}

/**
 * Pulls a backend message out of the body ONLY for error types where the
 * backend's message is written for end users (auth, validation, business
 * logic). Falls back to `fallback` if the body doesn't have a usable
 * string — never surfaces things like "AxiosError", raw objects, or
 * empty strings.
 */
function safeMessage(body: BackendErrorBody, fallback: string): string {
  const { message } = body;
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }
  if (Array.isArray(message) && message.length > 0 && !hasFieldShape(body)) {
    // A single-element message array with no field structure (e.g. a
    // business-rule message Nest happened to wrap in an array) — still
    // safe to show; join defensively in case there's more than one.
    return message.join(" ");
  }
  return fallback;
}

/** True if `body.errors`/`message` look like per-field validation output. */
function hasFieldShape(body: BackendErrorBody): boolean {
  return Boolean(
    body.fieldErrors ||
      (body.errors &&
        (Array.isArray(body.errors)
          ? body.errors.length > 0
          : Object.keys(body.errors).length > 0)),
  );
}

/**
 * Normalizes every validation-error shape this backend (or a future one)
 * might send into a flat `{ field: message }` map:
 *
 *   1. { fieldErrors: { email: "..." } }                       — already flat
 *   2. { errors: { email: "..." } }                            — already flat
 *   3. { errors: [{ field: "email", message: "..." }] }        — array of pairs
 *   4. { errors: [{ property: "email", constraints: {...} }] } — raw class-validator
 *   5. { message: ["email must be an email", ...] }            — Nest default,
 *      no field name available — kept out of fieldErrors (would misattach
 *      to the wrong input) and surfaced as the general message instead.
 */
function extractFieldErrors(body: BackendErrorBody): Record<string, string> {
  if (body.fieldErrors) return body.fieldErrors;

  if (body.errors && !Array.isArray(body.errors)) {
    return body.errors;
  }

  if (Array.isArray(body.errors)) {
    const out: Record<string, string> = {};
    for (const entry of body.errors) {
      const field = entry.field ?? entry.property;
      if (!field) continue;

      const message =
        entry.message ??
        (entry.constraints ? Object.values(entry.constraints)[0] : undefined);

      if (message) out[field] = message;
    }
    return out;
  }

  return {};
}
