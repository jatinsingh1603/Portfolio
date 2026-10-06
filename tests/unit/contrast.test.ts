import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { composite, contrast, parseColor, round2 } from "@/lib/color";
import {
  borderAlpha,
  cinematicBindings,
  filmLabPalette,
  palette,
  usedPairs,
} from "@/lib/tokens";
import type { Theme } from "@/lib/tokens";

const themes: Theme[] = ["light", "dark"];

/** Read exact declarations, so a stale duplicate cannot pass a substring check. */
function declarations(css: string, selector: string) {
  const result = new Map<string, string>();
  for (const [, rawSelectors, body] of css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = rawSelectors!.split(";").at(-1)!;
    if (!selectors.split(",").some((item) => item.trim() === selector))
      continue;
    for (const [, property, value] of body!.matchAll(
      /([\w-]+)\s*:\s*([^;]+);/g,
    )) {
      result.set(property!, value!.trim());
    }
  }
  return result;
}

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

describe("scoped lab contrast (WCAG 2.2 AA)", () => {
  for (const pair of usedPairs) {
    const min = pair.large ? 3 : 4.5;
    it(`${pair.fg} on ${pair.bg} with lab overrides ≥ ${min}:1`, () => {
      const ratio = contrast(filmLabPalette[pair.fg], filmLabPalette[pair.bg]);
      expect(round2(ratio)).toBeGreaterThanOrEqual(min);
    });
  }
});

describe("stylesheet and token module agree", () => {
  const css = readFileSync("app/globals.css", "utf8");
  const filmCss = readFileSync("app/cinematic.css", "utf8");

  for (const theme of themes) {
    const selector = theme === "light" ? ":root" : '[data-theme="dark"]';
    it(`declares every ${theme} token with its audited value`, () => {
      const block = declarations(css, selector);
      for (const [name, value] of Object.entries(palette[theme])) {
        expect(block.get(`--${name}`), `--${name} in ${selector}`).toBe(value);
      }
    });
  }

  it("keeps previously saved light and dark choices visually consistent", () => {
    expect(palette.light).toEqual(palette.dark);
  });

  it("does not replace audited page tokens with unaudited body overrides", () => {
    const body = declarations(filmCss, "body");
    for (const [name, value] of Object.entries(palette.dark)) {
      const override = body.get(`--${name}`);
      if (override !== undefined)
        expect(override, `body --${name}`).toBe(value);
    }
  });

  it("audits the actual lab scope after inheritance and local overrides", () => {
    const inherited = declarations(css, '[data-theme="dark"]');
    const overrides = declarations(filmCss, ".film-labs");
    for (const [name, value] of Object.entries(filmLabPalette)) {
      expect(
        overrides.get(`--${name}`) ?? inherited.get(`--${name}`),
        `.film-labs --${name}`,
      ).toBe(value);
    }
  });

  it("keeps cinematic card text, status, and surfaces tied to their audit", () => {
    for (const { selector, property, token } of cinematicBindings) {
      const value = declarations(filmCss, selector).get(property);
      // Components may consume the token directly or retain the audited literal.
      expect([palette.dark[token], `var(--${token})`], selector).toContain(
        value,
      );
    }
  });
});
