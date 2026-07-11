import type { NextConfig } from "next";

// Backend origin the /api/* rewrite proxies to. Kept here (not read from
// NEXT_PUBLIC_API_BASE_URL) because this runs server-side at request time,
// not in the browser bundle.
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN ?? "https://miva-hubble-backend.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
