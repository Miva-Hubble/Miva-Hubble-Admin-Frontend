/**
 * Single source of truth for what an "error" IS in this app.
 *
 *   API
 *     -> Axios/Fetch client
 *     -> normalizeError()   (src/errors/normalizeError.ts)
 *     -> AppError            (this file)
 *     -> UI components
 *
 * No component, hook, or service should ever branch on a raw AxiosError,
 * a raw fetch Response, or a raw backend response body. Everything that
 * can fail funnels through normalizeError() and comes out shaped like
 * this instead.
 */

/**
 * Every error belongs to exactly one category. The category — not the
 * raw HTTP status — drives how the UI reacts (stay on page vs redirect,
 * show retry vs disable retry, focus a field vs show a banner, etc).
 */
export type ErrorType =
  /** 401 — bad/missing credentials, or a session that could not be refreshed. */
  | "AUTHENTICATION"
  /** 403 — authenticated, but not allowed to do this. */
  | "AUTHORIZATION"
  /** 400 / 422 — the request body/params failed validation. */
  | "VALIDATION"
  /** 409 / 412 — well-formed request, rejected by a business rule (e.g. "email already exists"). */
  | "BUSINESS_LOGIC"
  /** 500 / 502 / 503 / other 5xx — the backend broke. */
  | "SERVER"
  /** No HTTP response at all — offline, DNS failure, CORS, timeout. */
  | "NETWORK"
  /** Anything that doesn't match a known shape. Should be rare. */
  | "UNKNOWN";

/**
 * The normalized shape every screen renders errors from.
 *
 * `title` / `message` are ALWAYS safe, user-facing copy — never a raw
 * backend string, never "AxiosError", never a stack trace. See
 * normalizeError.ts for how each ErrorType gets its copy.
 */
export interface AppError {
  /** Short heading, e.g. for a toast title or error-state header. */
  title: string;
  /** Full user-facing sentence. Safe to render directly. */
  message: string;
  /** HTTP status if one exists; 0 for NETWORK errors (no response received). */
  status: number;
  type: ErrorType;
  /**
   * Per-field messages for VALIDATION errors, keyed by field name, e.g.
   * `{ email: "Please enter a valid email address" }`.
   * Always present (possibly empty) so callers never need an `?.` chain —
   * see LoginForm.tsx's `error.fieldErrors[field]` usage.
   */
  fieldErrors: Record<string, string>;
  /** True only for NETWORK errors (request never reached the server). */
  isNetworkError: boolean;
  /**
   * Whether an automatic "Try again" affordance is appropriate.
   * true for NETWORK and SERVER (transient, safe to retry the same read/write).
   * false for AUTHENTICATION, AUTHORIZATION, VALIDATION, BUSINESS_LOGIC
   * (retrying with the same input will fail the same way — the user needs
   * to change something first, or it's a mutation that must never
   * auto-retry, per the "retry only when safe" rule).
   */
  retryable: boolean;
}
