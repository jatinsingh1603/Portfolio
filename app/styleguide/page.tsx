import type { Metadata } from "next";
import {
  Button,
  Chip,
  Container,
  KeyValue,
  Panel,
  Reveal,
  Rule,
  SeverityTag,
} from "@/components/primitives";
import { PipelineDiagram } from "@/components/pipeline-diagram";
import type { Severity } from "@/content/schema";
import { diagrams } from "@/content/diagrams";
import { contrast, round2 } from "@/lib/color";
import { palette, usedPairs, type Theme } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const themes: Theme[] = ["light", "dark"];

const severities: Severity[] = ["critical", "high", "medium", "low", "info"];

const typeSamples: { cls: string; note: string }[] = [
  { cls: "t-display", note: "Hero only" },
  { cls: "t-h1", note: "Page title" },
  { cls: "t-h2", note: "Station title" },
  { cls: "t-h3", note: "Card title" },
  { cls: "t-lede", note: "Section lede" },
  { cls: "t-body", note: "Reading copy" },
  { cls: "t-small", note: "Dense copy" },
  { cls: "t-caption", note: "Captions" },
  { cls: "t-label", note: "Mono eyebrow / index" },
  { cls: "t-data", note: "Mono tabular id / metric" },
];

const sample = "The system proves the control is fixed.";

export default function StyleguidePage() {
  const swift = diagrams.swiftpentest;

  return (
    <main id="main" className="pt-32 pb-24">
      <Container width="wide">
        <Reveal>
          <p className="t-label">Design system</p>
          <h1 className="t-h1 mt-5">Design system</h1>
          <p className="t-lede mt-5">
            The tokens, type ramp and components the site is built from, with
            live contrast ratios computed in both themes.
          </p>
          <Rule ticked className="mt-8" />
        </Reveal>

        {/* ── Colour ─────────────────────────────────────────────────── */}
        <section aria-labelledby="sg-colour" className="mt-16">
          <h2 id="sg-colour" className="t-h3">
            Colour
          </h2>

          {themes.map((theme) => (
            <div key={theme} className="mt-8">
              <p className="t-label">{theme} palette</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Object.entries(palette[theme]).map(([name, hex]) => (
                  <div key={name}>
                    <div
                      className="border-border h-14 w-full rounded-lg border"
                      style={{ backgroundColor: hex }}
                      aria-hidden="true"
                    />
                    <p className="t-data mt-2">{name}</p>
                    <p className="t-data text-tertiary">{hex}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-10">
            <p className="t-label">Used pairs — live contrast</p>
            <div className="scroll-x mt-4">
              <table className="ledger w-full min-w-[640px]">
                <thead>
                  <tr>
                    <th scope="col">Pair</th>
                    <th scope="col">Note</th>
                    <th scope="col">Light</th>
                    <th scope="col">Dark</th>
                    <th scope="col">Min</th>
                    <th scope="col">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {usedPairs.map((pair) => {
                    const min = pair.large ? 3 : 4.5;
                    const light = round2(
                      contrast(palette.light[pair.fg], palette.light[pair.bg]),
                    );
                    const dark = round2(
                      contrast(palette.dark[pair.fg], palette.dark[pair.bg]),
                    );
                    const pass = light >= min && dark >= min;
                    return (
                      <tr key={`${pair.fg}-${pair.bg}`}>
                        <td className="t-data">
                          {pair.fg} on {pair.bg}
                        </td>
                        <td className="t-small text-secondary">{pair.note}</td>
                        <td className="t-data">{light.toFixed(2)}</td>
                        <td className="t-data">{dark.toFixed(2)}</td>
                        <td className="t-data">{min.toFixed(1)}</td>
                        <td className="t-data">{pass ? "Pass" : "Fail"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Type ───────────────────────────────────────────────────── */}
        <section aria-labelledby="sg-type" className="mt-20">
          <h2 id="sg-type" className="t-h3">
            Type
          </h2>
          <ul className="mt-8 flex flex-col gap-8">
            {typeSamples.map((t) => (
              <li
                key={t.cls}
                className="border-border grid gap-2 border-t pt-6 md:grid-cols-[160px_1fr] md:gap-6"
              >
                <div>
                  <p className="t-data">.{t.cls}</p>
                  <p className="t-caption">{t.note}</p>
                </div>
                <p className={t.cls}>{sample}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Components ─────────────────────────────────────────────── */}
        <section aria-labelledby="sg-components" className="mt-20">
          <h2 id="sg-components" className="t-h3">
            Components
          </h2>

          <div className="mt-8 flex flex-col gap-10">
            <div>
              <p className="t-label">Buttons</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button href="#sg-components">Primary</Button>
                <Button href="#sg-components" variant="ghost">
                  Ghost
                </Button>
              </div>
            </div>

            <div>
              <p className="t-label">Chips</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Chip>Chip</Chip>
                <Chip xref="Used in: Recon, Discovery">Cross-referenced</Chip>
              </div>
            </div>

            <div>
              <p className="t-label">Severity</p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {severities.map((severity) => (
                  <SeverityTag key={severity} severity={severity} />
                ))}
              </div>
            </div>

            <div>
              <p className="t-label">Panels</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Panel className="p-6">
                  <p className="t-h3">Panel</p>
                  <p className="t-small text-secondary mt-2">
                    Matte panel on the base elevation plane.
                  </p>
                </Panel>
                <Panel raised className="p-6">
                  <p className="t-h3">Panel raised</p>
                  <p className="t-small text-secondary mt-2">
                    The raised plane; captions use secondary here.
                  </p>
                </Panel>
              </div>
            </div>

            <div>
              <p className="t-label">Rule ticked</p>
              <Rule ticked className="mt-4" />
            </div>

            <div>
              <p className="t-label">KeyValue register</p>
              <div className="mt-4 max-w-[520px]">
                <KeyValue
                  rows={[
                    { label: "Panel radius", value: "14px" },
                    { label: "Plane radius", value: "18px" },
                    { label: "Base duration", value: "520ms" },
                    { label: "Container wide", value: "1280px" },
                  ]}
                />
              </div>
            </div>

            <div className="perspective">
              <p className="t-label">PipelineDiagram</p>
              {swift ? (
                <div className="mt-4">
                  <PipelineDiagram
                    stages={swift.stages}
                    title={swift.title}
                    description={swift.description}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
