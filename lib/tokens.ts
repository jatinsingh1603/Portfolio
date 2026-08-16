/**
 * Mirrors the colour tokens declared in app/globals.css. Kept in TS so the
 * contrast test and the styleguide can read them; the test asserts this file
 * and the stylesheet have not drifted apart.
 */
export const palette = {
  light: {
    bg: "#ffffff",
    "bg-subtle": "#f5f5f7",
    surface: "#fbfbfd",
    text: "#1d1d1f",
    "text-secondary": "#55555a",
    "text-tertiary": "#6e6e73",
    accent: "#0066cc",
    "accent-hover": "#0055aa",
    "accent-on": "#ffffff",
    focus: "#0066cc",
    "sev-critical": "#b3261e",
    "sev-high": "#c2410c",
    "sev-medium": "#a16207",
    "sev-low": "#4d7c0f",
    "sev-info": "#6e6e73",
  },
  dark: {
    bg: "#000000",
    "bg-subtle": "#0a0a0b",
    surface: "#131315",
    text: "#f5f5f7",
    "text-secondary": "#a1a1a6",
    "text-tertiary": "#86868b",
    accent: "#2997ff",
    "accent-hover": "#5aaeff",
    "accent-on": "#1d1d1f",
    focus: "#2997ff",
    "sev-critical": "#ff6b61",
    "sev-high": "#ff9f5a",
    "sev-medium": "#e0b341",
    "sev-low": "#9ccc5a",
    "sev-info": "#a1a1a6",
  },
} as const;

export type Theme = keyof typeof palette;
export type TokenName = keyof (typeof palette)["light"];

/** Border alphas, which are declared as rgba() rather than hex. */
export const borderAlpha = {
  light: { border: 0.08, "border-strong": 0.16, over: "#000000" },
  dark: { border: 0.1, "border-strong": 0.2, over: "#ffffff" },
} as const;

/**
 * Every foreground/background pair the site actually renders. The contrast
 * test walks this list; adding a new combination to a component means adding
 * it here, which is the point — an unaudited pair should fail review.
 */
export const usedPairs: {
  fg: TokenName;
  bg: TokenName;
  /** Large text and non-text UI boundaries need 3:1; body needs 4.5:1. */
  large?: boolean;
  note: string;
}[] = [
  { fg: "text", bg: "bg", note: "body copy" },
  { fg: "text", bg: "bg-subtle", note: "body copy on a section wash" },
  { fg: "text", bg: "surface", note: "body copy on a raised surface" },
  { fg: "text-secondary", bg: "bg", note: "secondary copy, intro paragraphs" },
  { fg: "text-secondary", bg: "bg-subtle", note: "secondary copy on a wash" },
  { fg: "text-tertiary", bg: "bg", note: "captions" },
  { fg: "text-tertiary", bg: "bg-subtle", note: "captions on a wash" },
  { fg: "accent", bg: "bg", note: "links and the email focal element" },
  { fg: "accent", bg: "bg-subtle", note: "links on a wash" },
  { fg: "accent-hover", bg: "bg", note: "link hover" },
  { fg: "accent-on", bg: "accent", note: "text on the filled primary button" },
  {
    fg: "accent-on",
    bg: "accent-hover",
    note: "text on the primary button, hovered",
  },
  { fg: "focus", bg: "bg", large: true, note: "focus ring against the page" },
  { fg: "focus", bg: "bg-subtle", large: true, note: "focus ring on a wash" },
  { fg: "sev-critical", bg: "bg-subtle", note: "critical severity chip" },
  { fg: "sev-high", bg: "bg-subtle", note: "high severity chip" },
  { fg: "sev-medium", bg: "bg-subtle", note: "medium severity chip" },
  { fg: "sev-low", bg: "bg-subtle", note: "low severity chip" },
  { fg: "sev-info", bg: "bg-subtle", note: "info severity chip" },
];
