/**
 * Applied pre-paint via an inline <script> in <head> so the document never
 * renders with the wrong theme (flash of incorrect theme).
 *
 * Kept as a single exported string because next.config.ts hashes this exact
 * text for the CSP `script-src 'sha256-...'` entry — one source of truth means
 * the hash can never drift from the script that actually ships.
 *
 * Three states: "system" (or absent) defers to prefers-color-scheme; "light"
 * and "dark" are explicit user choices persisted in localStorage.
 */
export const THEME_STORAGE_KEY = "theme";

export const THEME_SCRIPT = `!function(){try{var e=localStorage.getItem("${THEME_STORAGE_KEY}");var t="dark"===e||"light"===e?e:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}}();`;
