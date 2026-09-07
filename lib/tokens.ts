/**
 * Mirrors the colour tokens declared in app/globals.css. Kept in TS so the
 * contrast test and the styleguide can read them; the test asserts this file
 * and the stylesheet have not drifted apart.
 *
 * Dark is the canonical theme. Light is a real theme, not an inversion: every
 * pair below is audited in both.
 */
export const palette = {
  light: {
    bg: "#f5f7f9",
    "bg-subtle": "#edf0f3",
    surface: "#ffffff",
    "surface-raised": "#fbfcfd",
    text: "#0e141a",
    "text-secondary": "#41505c",
    "text-tertiary": "#5c6b77",
    accent: "#0a7263",
    "accent-hover": "#085a4e",
    "accent-on": "#ffffff",
    "accent-2": "#9a5b00",
    focus: "#0a7263",
    "sev-critical": "#c0392b",
    "sev-high": "#9c5000",
    "sev-medium": "#8a6d00",
    "sev-low": "#1e7a54",
    "sev-info": "#2a5da8",
  },
  dark: {
    bg: "#0a0e13",
    "bg-subtle": "#10151b",
    surface: "#141a21",
    "surface-raised": "#1b222b",
    text: "#e6ebf0",
    "text-secondary": "#a2aeb9",
    "text-tertiary": "#78838e",
    accent: "#38d9c0",
    "accent-hover": "#5fe3ce",
    "accent-on": "#04120f",
    "accent-2": "#f2b441",
    focus: "#7fe9da",
    "sev-critical": "#ff6b6b",
    "sev-high": "#ff9f5a",
    "sev-medium": "#f2c94c",
    "sev-low": "#56cc9d",
    "sev-info": "#7fa8e0",
  },
} as const;

export type Theme = keyof typeof palette;
export type TokenName = keyof (typeof palette)["light"];

/** Border alphas, which are declared as rgba() rather than hex. */
export const borderAlpha = {
  light: { border: 0.12, "border-strong": 0.2, over: "#000000" },
  dark: { border: 0.1, "border-strong": 0.18, over: "#ffffff" },
} as const;

/**
 * Every foreground/background pair the site actually renders. The contrast
 * test walks this list; adding a new combination to a component means adding
 * it here, which is the point — an unaudited pair should fail review.
 *
 * Deliberate omission: text-tertiary on surface-raised. It measures 4.15:1 in
 * dark and is therefore banned — captions on raised panels use text-secondary.
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
  { fg: "text", bg: "surface", note: "body copy on a panel" },
  { fg: "text", bg: "surface-raised", note: "body copy on a raised panel" },
  { fg: "text-secondary", bg: "bg", note: "secondary copy, ledes" },
  { fg: "text-secondary", bg: "bg-subtle", note: "secondary copy on a wash" },
  { fg: "text-secondary", bg: "surface", note: "secondary copy on a panel" },
  {
    fg: "text-secondary",
    bg: "surface-raised",
    note: "captions on a raised panel (tertiary is banned there)",
  },
  { fg: "text-tertiary", bg: "bg", note: "captions and mono labels" },
  { fg: "text-tertiary", bg: "bg-subtle", note: "captions on a wash" },
  { fg: "text-tertiary", bg: "surface", note: "captions on a panel" },
  { fg: "accent", bg: "bg", note: "links and the security signal" },
  { fg: "accent", bg: "bg-subtle", note: "links on a wash" },
  { fg: "accent", bg: "surface", note: "links on a panel" },
  { fg: "accent-hover", bg: "bg", note: "link hover" },
  { fg: "accent-2", bg: "bg", note: "the machine-reasoning signal as text" },
  { fg: "accent-2", bg: "surface", note: "amber labels on a panel" },
  { fg: "accent-on", bg: "accent", note: "text on the filled primary button" },
  {
    fg: "accent-on",
    bg: "accent-hover",
    note: "text on the primary button, hovered",
  },
  { fg: "focus", bg: "bg", large: true, note: "focus ring against the page" },
  { fg: "focus", bg: "surface", large: true, note: "focus ring on a panel" },
  { fg: "sev-critical", bg: "bg", note: "critical severity word" },
  { fg: "sev-high", bg: "bg", note: "high severity word" },
  { fg: "sev-medium", bg: "bg", note: "medium severity word" },
  { fg: "sev-low", bg: "bg", note: "low severity word" },
  { fg: "sev-info", bg: "bg", note: "info severity word" },
  {
    fg: "sev-critical",
    bg: "surface",
    note: "critical severity word on a panel",
  },
  { fg: "sev-high", bg: "surface", note: "high severity word on a panel" },
  { fg: "sev-medium", bg: "surface", note: "medium severity word on a panel" },
  { fg: "sev-low", bg: "surface", note: "low severity word on a panel" },
  { fg: "sev-info", bg: "surface", note: "info severity word on a panel" },
];
