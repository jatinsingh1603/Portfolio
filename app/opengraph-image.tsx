import { ImageResponse } from "next/og";
import { identity } from "@/content/site";

export const alt = `${identity.name} — ${identity.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * A typographic card in the site's own system: no photo, no gradient, no
 * decoration. Rendered at build time by next/og. Uses a system-stack font
 * rather than fetching Geist, because an OG route that fetches a font file is
 * a build-time network dependency that will eventually fail in CI.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#f5f5f7",
        color: "#1d1d1f",
        padding: "80px",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 26, color: "#6e6e73" }}>
        {identity.title}
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 92,
          fontWeight: 600,
          letterSpacing: "-0.035em",
          lineHeight: 1.05,
        }}
      >
        {identity.name}
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 26,
          color: "#6e6e73",
          borderTop: "1px solid rgba(0,0,0,0.16)",
          paddingTop: 28,
        }}
      >
        CRTP · Recognised by Google, CERT-In, Meta and Kraken
      </div>
    </div>,
    size,
  );
}
