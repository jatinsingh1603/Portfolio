import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { SystemSvg } from "@/components/hero/system-svg";
import { Button, Container } from "@/components/primitives";
import { brand } from "@/content/brand";
import { identity, positioning } from "@/content/site";

/**
 * Station 01. The words sit over the world; the system itself is ahead of the
 * camera, flown through as the page scrolls. The static SVG of the same
 * object is the hero's image whenever the world cannot run (reduced motion,
 * no hardware WebGL) and is hidden once it does.
 *
 * DOM order is words first, image second, so the headline is parsed and
 * painted before the inline SVG. On phones the image sits below the words;
 * once the world runs it is hidden but keeps its box, so nothing shifts.
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
      className="hero relative flex flex-col justify-center overflow-hidden pt-28 pb-12 md:pt-32 lg:flex-row lg:items-center lg:justify-start"
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
              {brand.credibility.map((chip) =>
                chip.external ? (
                  <li key={chip.label}>
                    <a
                      href={chip.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${chip.label} — evidence (opens in a new tab)`}
                      className="chip transition-colors duration-[var(--dur-micro)] hover:border-[var(--accent)] hover:text-[var(--text)]"
                    >
                      {chip.label}
                    </a>
                  </li>
                ) : (
                  <li key={chip.label}>
                    <Link
                      href={chip.href}
                      className="chip transition-colors duration-[var(--dur-micro)] hover:border-[var(--accent)] hover:text-[var(--text)]"
                    >
                      {chip.label}
                    </Link>
                  </li>
                ),
              )}
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
          </div>
        </div>
      </div>
    </section>
  );
}
