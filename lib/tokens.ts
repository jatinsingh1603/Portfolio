/**
 * Source of truth for the red/black palette in app/globals.css. Both retained
 * theme keys intentionally match, including previously saved light choices.
 * The styleguide and contrast tests share these values with every page.
 */
const caseNotesPalette = {
  "film-ink": "#11110f",
  "film-paper": "#efebe2",
  "film-red": "#ed3826",
  "film-muted": "#b4afa5",
  "film-card-surface": "#34211e",
  "film-card-secondary": "#beafa8",
  "film-status": "#f58e7f",
  "film-chapter-status": "#f49183",
  "film-accent": "#ff8b7b",
  "film-stamp-surface": "#b92e20",
  "film-stamp-text": "#fff0e9",
  bg: "#11110f",
  "bg-subtle": "#171414",
  surface: "#1a1919",
  "surface-raised": "#242222",
  text: "#f3efeb",
  "text-secondary": "#c1b9b5",
  "text-tertiary": "#b4aaa5",
  accent: "#ff7766",
  "accent-hover": "#ffa99d",
  "accent-on": "#11110f",
  "accent-2": "#ff7766",
  focus: "#ff7766",
  "sev-critical": "#ff7766",
  "sev-high": "#ff9d8e",
  "sev-medium": "#d8b9b3",
  "sev-low": "#c8c0bb",
  "sev-info": "#b4aaa5",
} as const;

export const palette = {
  light: caseNotesPalette,
  dark: caseNotesPalette,
} as const;

export type Theme = keyof typeof palette;
export type TokenName = keyof (typeof palette)["light"];

/** Scoped lab colours, checked against .film-labs in app/cinematic.css. */
export const filmLabPalette = {
  ...caseNotesPalette,
  surface: "#1b1818",
  "surface-raised": "#27201f",
  "text-secondary": "#c7bdb7",
  "text-tertiary": "#bbaeaa",
  accent: "#ff8b7b",
  "accent-hover": "#ffc3b8",
  "accent-2": "#ff8b7b",
  focus: "#ff8b7b",
} as const;

/** Literal cinematic declarations that need an audited foreground/background. */
export const cinematicBindings = [
  {
    selector: ".paper-sheet",
    property: "background",
    token: "film-card-surface",
  },
  {
    selector: ".terminal-window p > span",
    property: "color",
    token: "film-card-secondary",
  },
  {
    selector: ".case-copy > .film-eyebrow",
    property: "color",
    token: "film-status",
  },
  { selector: ".chapter-tag", property: "color", token: "film-chapter-status" },
  { selector: ".file-stamp", property: "color", token: "film-accent" },
  {
    selector: ".paper-sheet--back",
    property: "background",
    token: "film-stamp-surface",
  },
  {
    selector: ".paper-sheet--back",
    property: "color",
    token: "film-stamp-text",
  },
] as const;

/** Border alphas, which are declared as rgba() rather than hex. */
export const borderAlpha = {
  light: { border: 0.15, "border-strong": 0.31, over: "#ffffff" },
  dark: { border: 0.15, "border-strong": 0.31, over: "#ffffff" },
} as const;

/**
 * Every foreground/background pair the site actually renders. The contrast
 * test walks this list; adding a new combination to a component means adding
 * it here, which is the point — an unaudited pair should fail review.
 *
 * Both stored theme preferences now use the same red/black palette. The
 * cinematic card audit uses the lightest dark card as its conservative ground.
 */
export const usedPairs: {
  fg: TokenName;
  bg: TokenName;
  /** Large text and non-text UI boundaries need 3:1; body needs 4.5:1. */
  large?: boolean;
  note: string;
}[] = [
  { fg: "film-ink", bg: "film-red", note: "cinematic red opening and method" },
  { fg: "film-paper", bg: "film-ink", note: "cinematic dark text" },
  { fg: "film-ink", bg: "film-paper", note: "cinematic paper text" },
  { fg: "film-muted", bg: "film-ink", note: "cinematic secondary text" },
  {
    fg: "film-red",
    bg: "film-ink",
    large: true,
    note: "cinematic large emphasis and icons",
  },
  { fg: "film-paper", bg: "film-card-surface", note: "dark card body copy" },
  { fg: "film-muted", bg: "film-card-surface", note: "dark card caption" },
  {
    fg: "film-card-secondary",
    bg: "film-card-surface",
    note: "dark card secondary copy",
  },
  {
    fg: "film-status",
    bg: "film-card-surface",
    note: "dark card status labels",
  },
  {
    fg: "film-chapter-status",
    bg: "film-card-surface",
    note: "chapter status labels",
  },
  {
    fg: "film-accent",
    bg: "film-card-surface",
    note: "dark card accent and links",
  },
  {
    fg: "film-stamp-text",
    bg: "film-stamp-surface",
    note: "red evidence paper text",
  },
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
    note: "captions on a raised panel",
  },
  { fg: "text-tertiary", bg: "bg", note: "captions and mono labels" },
  { fg: "text-tertiary", bg: "bg-subtle", note: "captions on a wash" },
  { fg: "text-tertiary", bg: "surface", note: "captions on a panel" },
  {
    fg: "text-tertiary",
    bg: "surface-raised",
    note: "captions on the raised ground",
  },
  { fg: "accent", bg: "bg", note: "links and the security signal" },
  { fg: "accent", bg: "bg-subtle", note: "links on a wash" },
  { fg: "accent", bg: "surface", note: "links on a panel" },
  { fg: "accent-hover", bg: "bg", note: "link hover" },
  { fg: "accent-2", bg: "bg", note: "the machine-reasoning signal as text" },
  { fg: "accent-2", bg: "surface", note: "secondary accent labels on a panel" },
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
