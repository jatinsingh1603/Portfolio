import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { SceneLoader } from "@/components/hero/scene-loader";
import { SystemSvg } from "@/components/hero/system-svg";
import { Button, Container } from "@/components/primitives";
import { brand } from "@/content/brand";
import { identity, positioning } from "@/content/site";

/**
 * Station 01. The text column argues; the object beside it is the argument
 * rendered: the five stations of the system in real depth, with data moving
 * through the authorisation gate. On phones the object sits above the words.
 *
 * DOM order is words first, object second, so the headline is parsed and
 * painted before the inline SVG; the reversed column puts the object on top
 * visually below the lg breakpoint.
 */
export function Hero() {
  const labels = brand.system.map((s) => ({ id: s.id, label: s.label }));
  const sceneLabel = `System diagram: ${brand.system.map((s) => s.label).join(", then ")}.`;

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      data-station={1}
      data-station-label="Hero"
      data-zone="teal"
      className="relative flex min-h-[100svh] flex-col-reverse justify-end overflow-hidden pt-24 pb-16 md:pt-32 lg:flex-row lg:items-center lg:justify-start"
    >
      <Container width="wide" className="relative w-full">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <p className="t-label">
              <span className="text-[var(--text)]">{identity.name}</span>
              <span aria-hidden="true"> · </span>
              {identity.title}
              <span aria-hidden="true"> · </span>
              {identity.location}
            </p>

            <h1 id="hero-title" className="t-display mt-6">
              {brand.headline.map((line, i) => (
                <span key={line} className="rise">
                  <span
                    style={{
                      ["--rise-delay" as string]: `${120 + i * 90}ms`,
                    }}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <p className="t-lede mt-7">{positioning.intro}</p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                href={brand.ctas.work.href}
                magnetic
                className="w-full sm:w-auto"
              >
                {brand.ctas.work.label}
              </Button>
              <Button
                href={brand.ctas.github.href}
                variant="ghost"
                external
                magnetic
                className="w-full sm:w-auto"
              >
                {brand.ctas.github.label}
              </Button>
              <Button
                href={brand.ctas.contact.href}
                variant="ghost"
                magnetic
                className="w-full sm:w-auto"
              >
                {brand.ctas.contact.label}
              </Button>
            </div>

            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Credibility">
              {brand.credibility.map((chip) => (
                <li key={chip.label}>
                  <Link
                    href={chip.href}
                    className="chip transition-colors duration-[var(--dur-micro)] hover:border-[var(--accent)] hover:text-[var(--text)]"
                  >
                    {chip.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div
              className="mt-14 hidden items-center gap-4 lg:flex"
              aria-hidden="true"
            >
              <span className="scroll-cue" />
              <span className="t-label inline-flex items-center gap-2">
                Scroll <ArrowDown size={12} strokeWidth={1.5} />
              </span>
            </div>
          </div>
        </div>
      </Container>

      <div className="hero-stage">
        <div className="hero-stage__inner">
          <div className="system-scene" role="img" aria-label={sceneLabel}>
            <SystemSvg className="system-scene__svg" labels={labels} />
            <SceneLoader labels={labels} />
          </div>
          {/* Phones get a legend instead of projected labels. It is a
              width-driven grid, so its row count cannot change when the mono
              face swaps in — a wrapped row here moved the whole hero. */}
          <ol
            className="t-label mt-3 grid gap-x-3 gap-y-1 lg:hidden"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(126px, 1fr))",
            }}
            aria-hidden="true"
          >
            {brand.system.map((s, i) => (
              <li
                key={s.id}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <span className="text-[var(--text-tertiary)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[var(--text-secondary)]">{s.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
