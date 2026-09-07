import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Favicon: the nameplate. A mono "J" inside a hairline square on the deep
 * ground, in the site's own palette. Generated rather than shipped as a
 * binary so it can never drift from the tokens. System font stack: fetching a
 * webfont here would make the icon a build-time network dependency.
 */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0e13",
        color: "#38d9c0",
        fontSize: 34,
        fontWeight: 500,
        letterSpacing: "-0.02em",
        fontFamily: "Menlo, Consolas, monospace",
        border: "3px solid #38d9c0",
        borderRadius: 10,
        paddingBottom: 3,
      }}
    >
      J
    </div>,
    size,
  );
}
