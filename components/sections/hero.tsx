import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { ArrowDown, Download } from "lucide-react";
import { Button, Chip, Container } from "@/components/primitives";
import { credibilityChips, identity, positioning } from "@/content/site";

/**
 * Evaluated at build time. If the headshot has not been added yet the hero
 * renders as a single full-measure column — a legitimate layout rather than a
 * broken image — and picks up the 7/5 split automatically once the file lands.
 */
const hasHeadshot = existsSync(
  path.join(process.cwd(), "public", identity.headshot.replace(/^\//, "")),
);

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      /* 88vh, not 100vh: the fold should promise a next section, not hide it. */
      className="flex min-h-[88vh] items-center py-24"
      /* The single opacity fade named in §5.1 — nothing else moves on load. */
      style={{ animation: "hero-in var(--dur-base) var(--ease-out-soft)" }}
    >
      <Container width="wide">
        <div
          className={
            hasHeadshot
              ? "grid items-center gap-16 lg:grid-cols-12"
              : "grid gap-16"
          }
        >
          <div className={hasHeadshot ? "lg:col-span-7" : ""}>
            <p className="t-caption">
              {identity.title} · {identity.location}
            </p>

            <h1 id="hero-heading" className="t-display mt-5 max-w-[16ch]">
              {positioning.headline}
            </h1>

            <p className="t-intro mt-7">{positioning.intro}</p>

            <ul className="mt-9 flex flex-wrap gap-2">
              {credibilityChips.map((chip) => (
                <li key={chip}>
                  <Chip>{chip}</Chip>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="#research">
                View security research
                <ArrowDown size={18} strokeWidth={1.5} aria-hidden="true" />
              </Button>
              <Button href={identity.resumePdf} variant="secondary" download>
                <Download size={18} strokeWidth={1.5} aria-hidden="true" />
                Download résumé
              </Button>
            </div>
          </div>

          {hasHeadshot ? (
            <div className="lg:col-span-5">
              {/* The offset plate is the only compositional flourish on the
                  page: a subtle wash rectangle behind the portrait, not a ring,
                  glow or gradient. */}
              <div className="relative mx-auto w-full max-w-[420px]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 translate-x-6 translate-y-6 rounded-[var(--radius-surface)] bg-[var(--bg-subtle)]"
                />
                <Image
                  src={identity.headshot}
                  alt={identity.headshotAlt}
                  width={1254}
                  height={1254}
                  priority
                  sizes="(min-width: 1024px) 420px, (min-width: 640px) 60vw, 90vw"
                  className="relative rounded-[var(--radius-surface)] border border-[var(--border)]"
                />
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
