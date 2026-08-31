#!/usr/bin/env node
// Pings BACKEND_ORIGIN before `next dev` starts so a dead or misconfigured
// backend shows up as an obvious terminal warning at boot, instead of a
// confusing 502 the first time someone clicks "log in" in the browser.
// Never blocks `pnpm dev` from starting — it only warns.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function loadEnvLocal() {
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) return {};
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnvLocal();
const backendOrigin =
  process.env.BACKEND_ORIGIN ??
  env.BACKEND_ORIGIN ??
  "https://miva-hubble-backend.onrender.com";

const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

async function check() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(backendOrigin, { signal: controller.signal });
    clearTimeout(timeout);
    console.log(
      `${GREEN}\u2713 Backend reachable${RESET} ${DIM}(${backendOrigin} \u2014 HTTP ${res.status})${RESET}`,
    );
  } catch {
    clearTimeout(timeout);
    const isLocal = backendOrigin.includes("localhost");
    console.warn(
      `\n${YELLOW}\u26a0 Could not reach BACKEND_ORIGIN: ${backendOrigin}${RESET}\n` +
        (isLocal
          ? `  Nothing seems to be listening locally. Start the backend, or point\n  BACKEND_ORIGIN in .env.local at the Render URL instead.\n`
          : `  If this is the Render free tier, it may just be spinning up from\n  idle (can take 30-60s) \u2014 the first request will be slow, not\n  necessarily broken. Refresh and try again in a moment.\n`) +
        `  Every /api/* call (including login) will 502 until this resolves.\n`,
    );
  }
}

await check();
