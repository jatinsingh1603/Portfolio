import type { Metadata } from "next";
import { Button, Chip, Container } from "@/components/primitives";
import { contrast, round2 } from "@/lib/color";
import { palette, usedPairs } from "@/lib/tokens";
import type { Theme } from "@/lib/tokens";

/**
 * Internal reference for the design system. Kept out of the sitemap and marked
 * noindex — it is a working tool, not part of what a recruiter should find.
 */
export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const typeScale = [
  {
    cls: "t-display",
    label: "display",
    spec: "clamp(2.5rem, 6vw, 5rem) · 600 · -0.035em",
  },
  {
    cls: "t-h1",
    label: "h1",
    spec: "clamp(2rem, 4.5vw, 3.5rem) · 600 · -0.028em",
  },
  {
    cls: "t-h2",
    label: "h2",
    spec: "clamp(1.625rem, 3vw, 2.5rem) · 600 · -0.022em",
  },
  { cls: "t-h3", label: "h3", spec: "21px · 600 · -0.012em" },
  {
    cls: "t-intro",
    label: "intro",
    spec: "clamp(1.125rem, 2vw, 1.3125rem) · 400",
  },
  { cls: "t-body", label: "body", spec: "17px · 400 · 1.62" },
  { cls: "t-small", label: "small", spec: "15px · 400" },
  { cls: "t-caption", label: "caption", spec: "13px · 500 · 0.01em" },
  { cls: "t-mono", label: "mono", spec: "14px · 400 · -0.01em" },
];

const space = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 200];

function ContrastTable({ theme }: { theme: Theme }) {
  return (
    <table className="mt-6 w-full border-collapse text-left">
      <caption className="sr-only">
        Measured contrast ratios for every rendered colour pair in the {theme}{" "}
        theme.
      </caption>
      <thead>
        <tr className="border-b border-[var(--border-strong)]">
          <th scope="col" className="t-caption py-2 pr-4 font-medium">
            Pair
          </th>
          <th scope="col" className="t-caption py-2 pr-4 font-medium">
            Sample
          </th>
          <th scope="col" className="t-caption py-2 pr-4 font-medium">
            Ratio
          </th>
          <th scope="col" className="t-caption py-2 font-medium">
            Required
          </th>
        </tr>
      </thead>
      <tbody>
        {usedPairs.map((pair) => {
          const fg = palette[theme][pair.fg];
          const bg = palette[theme][pair.bg];
          const ratio = round2(contrast(fg, bg));
          const min = pair.large ? 3 : 4.5;
          return (
            <tr
              key={`${pair.fg}-${pair.bg}`}
              className="border-b border-[var(--border)]"
            >
              <td className="t-mono py-2 pr-4">
                {pair.fg} / {pair.bg}
              </td>
              <td className="py-2 pr-4">
                <span
                  className="inline-block rounded-[var(--radius-chip)] px-3 py-1 text-[13px]"
                  style={{ color: fg, backgroundColor: bg }}
                >
                  {pair.note}
                </span>
              </td>
              <td className="t-mono py-2 pr-4">{ratio}:1</td>
              <td className="t-mono py-2">
                {min}:1 {ratio >= min ? "pass" : "FAIL"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function StyleguidePage() {
  return (
    <main id="main" className="py-20">
      <Container width="wide">
        <p className="t-caption">Internal</p>
        <h1 className="t-h1 mt-3">Styleguide</h1>
        <p className="t-intro mt-6">
          Every token the site renders, with measured contrast. Ratios below are
          computed at render time from lib/tokens.ts, the same source the CI
          contrast test asserts against.
        </p>

        <h2 className="t-h2 mt-20">Type</h2>
        <div className="mt-8 flex flex-col gap-8">
          {typeScale.map((t) => (
            <div key={t.cls} className="border-t border-[var(--border)] pt-5">
              <p className="t-mono text-[var(--text-tertiary)]">
                {t.label} — {t.spec}
              </p>
              <p className={`${t.cls} mt-2`}>
                Break the control. Prove the fix.
              </p>
            </div>
          ))}
        </div>

        <h2 className="t-h2 mt-20">Colour</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(palette.light).map(([name, value]) => (
            <div key={name}>
              <div
                className="h-16 rounded-[var(--radius-card)] border border-[var(--border)]"
                style={{ backgroundColor: value }}
              />
              <p className="t-mono mt-2">{name}</p>
              <p className="t-caption">{value}</p>
            </div>
          ))}
        </div>

        <h3 className="t-h3 mt-16">Contrast — light</h3>
        <ContrastTable theme="light" />
        <h3 className="t-h3 mt-16">Contrast — dark</h3>
        <ContrastTable theme="dark" />

        <h2 className="t-h2 mt-20">Space</h2>
        <div className="mt-8 flex flex-col gap-2">
          {space.map((n) => (
            <div key={n} className="flex items-center gap-4">
              <span className="t-mono w-14 text-[var(--text-tertiary)]">
                {n}
              </span>
              <span
                className="h-3 bg-[var(--accent)]"
                style={{ width: `${n}px` }}
              />
            </div>
          ))}
        </div>

        <h2 className="t-h2 mt-20">Radii &amp; elevation</h2>
        <div className="mt-8 flex flex-wrap gap-6">
          {[
            { label: "chip 6px", radius: "var(--radius-chip)" },
            { label: "card 12px", radius: "var(--radius-card)" },
            { label: "surface 18px", radius: "var(--radius-surface)" },
            { label: "pill", radius: "9999px" },
          ].map((r) => (
            <div key={r.label}>
              <div
                className="h-24 w-40 border border-[var(--border)] bg-[var(--bg-subtle)]"
                style={{ borderRadius: r.radius }}
              />
              <p className="t-caption mt-2">{r.label}</p>
            </div>
          ))}
          <div>
            <div
              className="h-24 w-40 rounded-[var(--radius-card)] bg-[var(--bg)]"
              style={{ boxShadow: "var(--shadow-md)" }}
            />
            <p className="t-caption mt-2">shadow-md (none in dark)</p>
          </div>
        </div>

        <h2 className="t-h2 mt-20">Components</h2>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button href="#">Primary</Button>
          <Button href="#" variant="secondary">
            Secondary
          </Button>
          <Chip>Neutral chip</Chip>
          {(["critical", "high", "medium", "low", "info"] as const).map((t) => (
            <Chip key={t} tone={t}>
              {t}
            </Chip>
          ))}
        </div>
      </Container>
    </main>
  );
}
