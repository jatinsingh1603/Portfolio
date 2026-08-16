import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildCsp, securityHeaders } from "@/lib/csp";

/**
 * next.config.ts headers apply to `next start`; vercel.json applies at the edge
 * on Vercel. They must not drift — a header that exists only in one place is a
 * header that disappears in exactly one environment.
 */
describe("security headers", () => {
  const vercel = JSON.parse(readFileSync("vercel.json", "utf8")) as {
    headers: { source: string; headers: { key: string; value: string }[] }[];
  };
  const edge = vercel.headers[0]?.headers ?? [];
  const shipped = securityHeaders(false);

  it("never allows unsafe-eval in a shipped build", () => {
    expect(buildCsp(false)).not.toContain("unsafe-eval");
    expect(JSON.stringify(vercel)).not.toContain("unsafe-eval");
  });

  it("allows eval only in development, where the dev runtime needs it", () => {
    // Without this, `next dev` cannot hydrate at all — see lib/csp.ts.
    expect(buildCsp(true)).toContain("unsafe-eval");
    expect(buildCsp(true)).toContain("ws:");
  });

  it("declares the same header set in both places", () => {
    for (const { key } of shipped) {
      expect(
        edge.map((h) => h.key),
        `${key} in vercel.json`,
      ).toContain(key);
    }
    expect(edge).toHaveLength(shipped.length);
  });

  it("keeps every header value identical across both", () => {
    for (const { key, value } of shipped) {
      const edgeValue = edge.find((h) => h.key === key)?.value;
      expect(edgeValue, `${key} value`).toBe(value);
    }
  });
});
