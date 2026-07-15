import { NextRequest, NextResponse } from "next/server";

// Explicit, loggable replacement for the old next.config.ts external
// rewrite. A plain `rewrites()` entry to an external origin is just an
// edge routing rule — there's no application code and therefore no
// Vercel Function log for that hop, which made the POST /admin/auth/login
// 500 impossible to diagnose from the Vercel side. This route handler is
// a real serverless function: it shows up in Vercel's Functions logs,
// and we control exactly which headers/body bytes get forwarded in each
// direction, rather than trusting Vercel's rewrite proxy to do it right
// for every method/body combination.
//
// Still same-origin from the browser's point of view (requests hit
// https://<frontend>/api/*), so the HttpOnly, SameSite=Lax auth cookies
// keep working exactly as before.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN ?? "https://miva-hubble-backend.onrender.com";

// Headers that must never be forwarded as-is between hops — either
// they're connection-specific (meaningless/harmful to replay) or fetch
// will recompute them itself from the body we pass it.
const STRIPPED_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "accept-encoding", // let undici negotiate its own encoding with the origin
]);

const STRIPPED_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "transfer-encoding",
]);

async function proxy(req: NextRequest, path: string[]) {
  const targetUrl = new URL(`${BACKEND_ORIGIN}/api/${path.join("/")}`);
  targetUrl.search = req.nextUrl.search;

  const requestHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (!STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) {
      requestHeaders.set(key, value);
    }
  });

  const hasBody = !["GET", "HEAD"].includes(req.method);

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method: req.method,
      headers: requestHeaders,
      body: hasBody ? await req.arrayBuffer() : undefined,
      redirect: "manual",
      // @ts-expect-error -- required by undici when streaming a body
      duplex: hasBody ? "half" : undefined,
    });
  } catch (error) {
    console.error(`[api-proxy] ${req.method} ${targetUrl} failed:`, error);
    return NextResponse.json(
      { statusCode: 502, message: "Could not reach the backend service." },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase()) && key.toLowerCase() !== "set-cookie") {
      responseHeaders.set(key, value);
    }
  });

  // Multiple Set-Cookie headers (access + refresh token) collapse into one
  // comma-joined string if copied via a plain get/set — copy them
  // individually via getSetCookie() so both cookies survive the hop.
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", cookie);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path);
}
export async function PUT(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path);
}
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path);
}
