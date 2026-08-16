import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Favicon: a single capital J. Generated rather than shipped as a binary so it
 * inherits the site's colours and can never drift from them. Uses a system
 * font stack — fetching a webfont here would make the icon a build-time
 * network dependency for the sake of one glyph.
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
        background: "#1d1d1f",
        color: "#ffffff",
        fontSize: 46,
        fontWeight: 600,
        letterSpacing: "-0.04em",
        fontFamily: "Helvetica, Arial, sans-serif",
        // Optical centring: a cap-height J sits low on the baseline, so the
        // glyph needs lifting to look centred rather than measured centred.
        paddingBottom: 6,
      }}
    >
      J
    </div>,
    size,
  );
}
