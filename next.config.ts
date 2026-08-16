import createMDX from "@next/mdx";
import type { NextConfig } from "next";

/**
 * script-src: why 'unsafe-inline' and not a hash or nonce.
 *
 * The App Router streams its RSC payload through ~46 inline
 * `self.__next_f.push(...)` scripts per route. Three approaches were measured:
 *
 *  1. Hash every inline script. Works in principle — the pages are static, so
 *     the scripts are deterministic — but it means ~2.4 KB of hashes in the
 *     header per route, regenerated on every build, and a silent loss of all
 *     interactivity the moment one drifts. Also fatal here: CSP *ignores*
 *     'unsafe-inline' whenever a hash is present, so a partial hash list is
 *     worse than none. This was tried; it broke hydration outright.
 *  2. Per-request nonce via middleware. Next's documented route, but it forces
 *     dynamic rendering on every route and gives up static generation, which
 *     is what buys the LCP budget.
 *  3. 'unsafe-inline'. Accepted.
 *
 * The risk this concedes is bounded: every byte of content on this site is a
 * compile-time constant. There is no user input, no query-param reflection, no
 * CMS, no third-party script, and no authenticated surface — so there is no
 * injection path for an attacker to reach the inline allowance with. The
 * directives that do real work here are still strict: no external script host
 * can execute, object-src is none, base-uri is locked, and framing is denied.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  // Next inlines critical CSS and React sets style attributes during hydration.
  // Documented tradeoff: removing this requires a nonce, which requires dynamic
  // rendering, which costs more LCP than 'unsafe-inline' costs in risk here
  // (no user input is ever reflected into this site's markup).
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default createMDX()(nextConfig);
