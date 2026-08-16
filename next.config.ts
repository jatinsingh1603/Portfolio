import { createHash } from "node:crypto";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { THEME_SCRIPT } from "./lib/theme-script";

/**
 * The pre-paint theme script is the only inline script on the site. Hashing it
 * lets `script-src` stay at `'self'` + this hash — no `'unsafe-inline'`, and no
 * nonce (a nonce would force dynamic rendering and lose static generation).
 */
const themeScriptHash = `'sha256-${createHash("sha256").update(THEME_SCRIPT).digest("base64")}'`;

const csp = [
  "default-src 'self'",
  `script-src 'self' ${themeScriptHash}`,
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
