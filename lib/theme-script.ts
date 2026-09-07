/**
 * Applied pre-paint via an inline <script> in <head> so the document never
 * renders with the wrong theme (flash of incorrect theme).
 *
 * Kept as a single exported string because next.config.ts hashes this exact
 * text for the CSP `script-src 'sha256-...'` entry — one source of truth means
 * the hash can never drift from the script that actually ships.
 *
 * Three states: "light" and "dark" are explicit user choices persisted in
 * localStorage; anything else resolves to dark. Dark is the canonical design —
 * the light theme is offered, not assumed from the OS, because the 3D hero
 * and the section grounds are composed for a deep ground first.
 */
export const THEME_STORAGE_KEY = "theme";

export const THEME_SCRIPT = `!function(){try{var e=localStorage.getItem("${THEME_STORAGE_KEY}");var t="light"===e?"light":"dark";document.documentElement.setAttribute("data-theme",t)}catch(e){}}();`;
