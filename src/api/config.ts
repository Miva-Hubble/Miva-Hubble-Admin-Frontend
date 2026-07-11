/**
 * Single source of truth for the backend origin. Every axios instance in
 * the app reads from here — never hardcode the backend URL anywhere else.
 *
 * Defaults to the relative "/api" path so browser requests stay same-origin
 * and get proxied to the Render backend via the rewrite in next.config.ts.
 * This is required for the HttpOnly auth cookies (SameSite=Lax) to work —
 * do NOT default this back to the absolute onrender.com URL, or requests
 * will bypass the rewrite and go cross-origin again.
 *
 * Override via NEXT_PUBLIC_API_BASE_URL only for contexts that don't go
 * through the browser (e.g. server-side calls outside the rewrite).
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
