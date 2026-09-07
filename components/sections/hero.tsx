import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { SceneLoader } from "@/components/hero/scene-loader";
import { SystemSvg } from "@/components/hero/system-svg";
import { Button, Container } from "@/components/primitives";
import { brand } from "@/content/brand";
import { identity, positioning } from "@/content/site";

/**
 * Station 01. The text column argues; the object to its right is the argument
 * rendered: the five stations of the system in real depth, with data moving
 * through the authorisation gate. On phones the object sits above the words.
 */
export function Hero() {
  const labels = brand.system.map((s) => ({ id: s.id, label: s.label }));
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
                    style={{ ["--rise-delay" as string]: `${120 + i * 90}ms` }}
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
      {/* The object comes AFTER the words in the DOM so the headline is parsed
          and painted first; on phones it is shown above them with CSS order. */}
      <div className="hero-stage">
        <div className="hero-stage__inner">
          <div
            className="system-scene"
            role="img"
            aria-label={`System diagram: ${brand.system.map((s) => s.label).join(", then ")}.`}
          >
            <SystemSvg className="system-scene__svg" labels={labels} />
            <SceneLoader labels={labels} />
          </div>
          <ol
            className="t-label mt-2 flex flex-wrap gap-x-3 gap-y-1 lg:hidden"
            aria-hidden="true"
          >
            {brand.system.map((s, i) => (
              <li key={s.id} className="inline-flex items-center gap-2">
                <span className="text-[var(--text-tertiary)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[var(--text-secondary)]">{s.label}</span>
                {i < brand.system.length - 1 ? (
                  <span aria-hidden="true">→</span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
