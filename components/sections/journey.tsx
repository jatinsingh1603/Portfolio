import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExternalLink, Reveal, Station } from "@/components/primitives";
import { journey, phases } from "@/content/journey";
import type { Milestone } from "@/content/schema";

/**
 * Station 08. The route as a routed path, not a dated timeline: a single left
 * spine, each phase a mono marker, each milestone a beat on the spine. Dates
 * print only where the record carries one; milestones without a date are
 * gathered under an explicit "UNDATED" marker rather than borrowing a year.
 * Server component: no state, no interaction.
 */

/** A UI label for a milestone's link, chosen by destination. */
function beatLinkLabel(href: string): string {
  if (href.startsWith("/projects")) return "Read the build";
  if (href.startsWith("/security")) return "The disclosure record";
  if (href.startsWith("/resume")) return "The full résumé";
  return "Open the record";
}

function Beat({ milestone }: { milestone: Milestone }) {
  const { title, detail, date, href } = milestone;
  const label = href ? beatLinkLabel(href) : "";
  return (
    <li className="beat relative pl-6">
      {date ? (
        <p className="t-data text-[var(--text-tertiary)]">{date}</p>
      ) : null}
      <p
        className="t-h3 mt-1"
        style={{ fontSize: "clamp(1.0625rem, 1.2vw, 1.1875rem)" }}
      >
        {title}
      </p>
      <p className="t-small mt-2 max-w-[58ch] text-[var(--text-secondary)]">
        {detail}
      </p>
      {href ? (
        <p className="mt-3">
          {href.startsWith("/") ? (
            <Link
              href={href}
              className="inline-flex min-h-[44px] items-center gap-1 text-[var(--accent)] underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:underline"
            >
              {label}
              <ArrowRight
                size={16}
                strokeWidth={1.5}
                aria-hidden="true"
                className="shrink-0"
              />
            </Link>
          ) : (
            <ExternalLink href={href} label={label} className="min-h-[44px]">
              {label}
            </ExternalLink>
          )}
        </p>
      ) : null}
    </li>
  );
}

export function Journey() {
  return (
    <Station
      index={8}
      id="journey"
      eyebrow="Journey"
      title="The route, from lecture hall to live UPI logs."
      lede="A routed path, not a timeline: dates appear only where the record carries them."
      zone="teal"
    >
      <ol className="mx-auto max-w-[760px] border-l border-[var(--border-strong)]">
        {phases.map((phase, phaseIndex) => {
          const inPhase = journey.filter((m) => m.phase === phase.id);
          if (inPhase.length === 0) return null;
          const dated = inPhase.filter((m) => m.date);
          const undated = inPhase.filter((m) => !m.date);
          return (
            <Reveal
              as="li"
              key={phase.id}
              delay={phaseIndex * 60}
              className="pb-12 last:pb-0"
            >
              <div className="relative pl-6">
                <span
                  aria-hidden="true"
                  className="absolute top-[7px] left-[-4px] h-[7px] w-[7px] bg-[var(--accent)]"
                />
                <h3 className="t-label text-[var(--text)]">{phase.label}</h3>
              </div>

              {dated.length > 0 ? (
                <ul className="mt-6 flex flex-col gap-8">
                  {dated.map((m) => (
                    <Beat key={m.id} milestone={m} />
                  ))}
                </ul>
              ) : null}

              {undated.length > 0 ? (
                <div className="mt-8">
                  <p className="t-data pl-6 text-[var(--text-tertiary)]">
                    UNDATED · ON THE RECORD
                  </p>
                  <ul className="mt-6 flex flex-col gap-8">
                    {undated.map((m) => (
                      <Beat key={m.id} milestone={m} />
                    ))}
                  </ul>
                </div>
              ) : null}
            </Reveal>
          );
        })}
      </ol>
    </Station>
  );
}
