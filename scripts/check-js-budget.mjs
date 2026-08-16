/**
 * Enforces the §6.2 budget: < 120 KB of gzipped JS on the home route.
 *
 * Turbopack emits no per-route manifest, so the honest measurement is to render
 * the route and read the <script src> tags the browser would actually fetch.
 * Boots `next start` on a scratch port, measures, tears down.
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";

const LIMIT_KB = Number(process.env.JS_BUDGET_KB ?? 120);
const ROUTE = process.env.JS_BUDGET_ROUTE ?? "/";
const PORT = 3457;

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  stdio: "ignore",
});

async function waitForServer(deadlineMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < deadlineMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}${ROUTE}`);
      if (res.ok) return res.text();
    } catch {
      // Server not listening yet.
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("next start did not become ready within 60s");
}

let exitCode = 0;
try {
  const html = await waitForServer();
  const tags = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]);

  const sized = new Map();
  for (const tag of tags) {
    const src = /src="([^"]+)"/.exec(tag)?.[1];
    if (!src?.startsWith("/_next/")) continue;
    const file = path.join(".next", src.replace("/_next/", ""));
    // Next emits its legacy polyfill bundle as noModule; every ES-module
    // browser skips the request entirely, so it is not part of what a real
    // visitor downloads. Next's own "First Load JS" excludes it too.
    sized.set(src, {
      bytes: gzipSync(readFileSync(file)).length,
      legacy: /\bnomodule\b/i.test(tag),
    });
  }

  const entries = [...sized.values()];
  const shipped = entries.filter((e) => !e.legacy);
  const kb = shipped.reduce((s, e) => s + e.bytes, 0) / 1024;
  const legacyKb =
    entries.filter((e) => e.legacy).reduce((s, e) => s + e.bytes, 0) / 1024;

  const pass = kb < LIMIT_KB;
  console.log(
    `${ROUTE} JS: ${kb.toFixed(1)} KB gzipped across ${shipped.length} ` +
      `scripts (limit ${LIMIT_KB} KB) — ${pass ? "PASS" : "FAIL"}` +
      `\n  + ${legacyKb.toFixed(1)} KB noModule polyfills (legacy browsers only, not counted)`,
  );
  if (!pass) exitCode = 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  exitCode = 1;
} finally {
  server.kill();
}

process.exit(exitCode);
