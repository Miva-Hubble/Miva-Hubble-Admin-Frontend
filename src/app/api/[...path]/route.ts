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
  // undici's fetch() transparently decompresses gzip/br bodies but leaves
  // the ORIGINAL (compressed) Content-Length header untouched. Forwarding
  // that stale length alongside the now-decompressed body causes the
  // browser to see a byte count that doesn't match what's actually
  // streamed, and abort the response mid-read with
  // net::ERR_CONTENT_LENGTH_MISMATCH — the response status (e.g. 401)
  // still arrives, but the JSON body never does, so callers can't read
  // the real backend error message. Dropping it here lets the runtime
  // recompute (or chunk) it correctly for the actual bytes being sent.
  "content-length",
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
    const cause =
      error instanceof Error && "cause" in error
        ? (error.cause as { code?: string } | undefined)
        : undefined;
    console.error(`[api-proxy] ${req.method} ${targetUrl} failed:`, error);

    // In dev, say exactly what's wrong instead of a bare "502" — this is
    // the failure mode that used to take a trip through this file's git
    // blame to diagnose. In prod, keep the response generic; the real
    // detail is still in the server logs above.
    const devDetail =
      process.env.NODE_ENV !== "production"
        ? {
            target: targetUrl.toString(),
            code: cause?.code ?? null,
            hint:
              cause?.code === "ECONNREFUSED"
                ? "Nothing is listening at BACKEND_ORIGIN. Either start the backend locally, or point BACKEND_ORIGIN in .env.local at the Render URL."
                : "If BACKEND_ORIGIN points at Render, the free-tier instance may be spinning up from idle (can take 30-60s) — retry in a moment.",
          }
        : {};

    return NextResponse.json(
      {
        statusCode: 502,
        message: "Could not reach the backend service.",
        ...devDetail,
      },
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
