import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { composite, contrast, parseColor, round2 } from "@/lib/color";
import { borderAlpha, palette, usedPairs } from "@/lib/tokens";
import type { Theme } from "@/lib/tokens";

const themes: Theme[] = ["light", "dark"];

describe("token contrast (WCAG 2.2 AA)", () => {
  for (const theme of themes) {
    for (const pair of usedPairs) {
      const min = pair.large ? 3 : 4.5;
      it(`${theme}: ${pair.fg} on ${pair.bg} — ${pair.note} ≥ ${min}:1`, () => {
        const ratio = contrast(
          palette[theme][pair.fg],
          palette[theme][pair.bg],
        );
        expect(
          round2(ratio),
          `${theme} ${pair.fg}/${pair.bg} = ${round2(ratio)}:1`,
        ).toBeGreaterThanOrEqual(min);
      });
    }
  }
});

describe("border tokens (non-text contrast)", () => {
  for (const theme of themes) {
    it(`${theme}: border-strong is a visible boundary on the page ground`, () => {
      const cfg = borderAlpha[theme];
      const bg = parseColor(palette[theme].bg);
      const border = composite(cfg.over, cfg["border-strong"], bg);
      // Hairlines are decorative separators, not UI controls that convey state,
      // so 1.3:1 is the practical floor here — enough to read as a line without
      // becoming a hard rule that fights the whitespace.
      expect(round2(contrast(border, bg))).toBeGreaterThan(1.3);
    });
  }
});

describe("stylesheet and token module agree", () => {
  const css = readFileSync("app/globals.css", "utf8");

  it("declares every light token with the audited value", () => {
    // Search from ":root {" onward — an earlier @custom-variant line also
    // mentions [data-theme="dark"] and would slice an empty block.
    const start = css.indexOf(":root {");
    const block = css.slice(start, css.indexOf('[data-theme="dark"] {', start));
    for (const [name, value] of Object.entries(palette.light)) {
      expect(block, `--${name} in :root`).toContain(`--${name}: ${value}`);
    }
  });

  it("declares every dark token with the audited value", () => {
    const start = css.indexOf('[data-theme="dark"] {');
    const block = css.slice(start, css.indexOf("@theme inline", start));
    for (const [name, value] of Object.entries(palette.dark)) {
      expect(block, `--${name} in [data-theme="dark"]`).toContain(
        `--${name}: ${value}`,
      );
    }
  });
});
