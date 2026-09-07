import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { securityHeaders } from "./lib/csp";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  reactStrictMode: true,
  poweredByHeader: false,
  // The stylesheet is ~11 KB gzipped; inlining it removes a full round trip
  // from the critical path, which is what the LCP budget is made of on a
  // throttled connection. style-src already permits inline styles.
  experimental: { inlineCss: true },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders(isDev) }];
  },
};

export default createMDX()(nextConfig);
