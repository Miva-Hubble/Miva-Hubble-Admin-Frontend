import type { NextConfig } from "next";

// The /api/* backend proxy used to live here as a `rewrites()` entry to
// an external origin. That's moved to src/app/api/[...path]/route.ts —
// an actual Route Handler instead of an edge rewrite rule — because a
// plain external rewrite produces no Vercel Function logs and gave no
// visibility into header/body forwarding issues when things went wrong
// in production. See that file for the proxy implementation.
const nextConfig: NextConfig = {};

export default nextConfig;
