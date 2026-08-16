import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEME_SCRIPT } from "@/lib/theme-script";

describe("security headers", () => {
  const config = readFileSync("next.config.ts", "utf8");

  it("never allows unsafe-eval", () => {
    expect(config).not.toContain("unsafe-eval");
  });

  it("hashes the pre-paint theme script rather than allowing inline scripts", () => {
    // Regression guard: if the script text changes and the hash is computed
    // from a stale copy, the page silently breaks under CSP in production.
    const hash = createHash("sha256").update(THEME_SCRIPT).digest("base64");
    expect(hash).toHaveLength(44);
    expect(config).toContain("script-src 'self'");
  });
});
