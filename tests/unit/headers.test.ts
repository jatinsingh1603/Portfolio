import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * next.config.ts headers apply to `next start`; vercel.json applies at the edge
 * on Vercel. They must not drift — a header that exists only in one place is a
 * header that disappears in exactly one environment.
 */
describe("security headers", () => {
  const config = readFileSync("next.config.ts", "utf8");
  const vercel = JSON.parse(readFileSync("vercel.json", "utf8")) as {
    headers: { source: string; headers: { key: string; value: string }[] }[];
  };
  const edge = vercel.headers[0]?.headers ?? [];

  it("never allows unsafe-eval", () => {
    expect(config).not.toContain("unsafe-eval");
    expect(JSON.stringify(vercel)).not.toContain("unsafe-eval");
  });

  it("declares the same header set in both places", () => {
    const required = [
      "Content-Security-Policy",
      "Strict-Transport-Security",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Cross-Origin-Opener-Policy",
      "X-Frame-Options",
    ];
    for (const key of required) {
      expect(config, `${key} in next.config.ts`).toContain(key);
      expect(
        edge.map((h) => h.key),
        `${key} in vercel.json`,
      ).toContain(key);
    }
  });

  it("keeps the CSP directives identical across both", () => {
    const edgeCsp =
      edge.find((h) => h.key === "Content-Security-Policy")?.value ?? "";
    for (const directive of [
      "default-src 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ]) {
      expect(edgeCsp).toContain(directive);
      expect(config).toContain(directive);
    }
  });
});
