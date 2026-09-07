import { ImageResponse } from "next/og";
import { brand } from "@/content/brand";
import { identity } from "@/content/site";

export const alt = `${identity.name} — ${identity.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * A title block in the site's own system: deep ground, mono register, the
 * name large, the tagline and the five stations of the system. Rendered at
 * build time by next/og with a system font stack (no network dependency).
 */
export default function OpenGraphImage() {
  const mono = "Menlo, Consolas, monospace";
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#0a0e13",
        color: "#e6ebf0",
        padding: "72px 80px",
        fontFamily: "Helvetica, Arial, sans-serif",
        backgroundImage:
          "radial-gradient(60% 50% at 80% 10%, rgba(56,217,192,0.14), transparent 70%)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: mono,
          fontSize: 22,
          letterSpacing: "0.14em",
          color: "#78838e",
        }}
      >
        <div style={{ display: "flex" }}>{identity.title.toUpperCase()}</div>
        <div style={{ display: "flex" }}>{identity.location.toUpperCase()}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 600,
            letterSpacing: "-0.035em",
            lineHeight: 1.02,
          }}
        >
          {identity.name}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#a2aeb9" }}>
          {brand.tagline}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          borderTop: "1px solid rgba(230,235,240,0.18)",
          paddingTop: 28,
          fontFamily: mono,
          fontSize: 20,
          letterSpacing: "0.12em",
          color: "#38d9c0",
        }}
      >
        {brand.system.map((s, i) => (
          <div
            key={s.id}
            style={{ display: "flex", alignItems: "center", gap: 18 }}
          >
            <div style={{ display: "flex" }}>
              {String(i + 1).padStart(2, "0")} {s.label.toUpperCase()}
            </div>
            {i < brand.system.length - 1 ? (
              <div
                style={{
                  display: "flex",
                  width: 28,
                  height: 1,
                  background: "#78838e",
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
