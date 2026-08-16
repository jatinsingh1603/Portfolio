import { ArrowUpRight } from "lucide-react";
import { Container, SectionHeader } from "@/components/primitives";
import { profiles } from "@/content/profiles";

/**
 * Rows, not cards. A metric renders only when it was verified — a profile with
 * no number simply shows no number, which is the honest state and reads better
 * than a padded stat.
 */
export function Elsewhere() {
  return (
    <section
      id="elsewhere"
      aria-labelledby="elsewhere-heading"
      className="ground-wash py-[var(--section-y)]"
    >
      <Container width="wide">
        <SectionHeader
          id="elsewhere-heading"
          eyebrow="Elsewhere"
          title="Where the work is."
          intro="A metric appears only where it was verified. Rows without one are links, not estimates."
        />

        <ul className="mx-auto mt-20 max-w-[var(--container)]">
          {profiles.map((profile) => (
            <li key={profile.url}>
              <a
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${profile.platform} profile (opens in a new tab)`}
                className="group flex min-h-[44px] items-center gap-6 border-b border-[var(--border)] py-5 transition-colors duration-[var(--dur-micro)] hover:bg-[color-mix(in_oklab,var(--text)_3%,transparent)]"
              >
                <span className="w-[10rem] shrink-0 font-medium">
                  {profile.platform}
                </span>
                <span className="t-mono truncate text-[var(--text-secondary)]">
                  {profile.handle}
                </span>
                <span className="t-caption ml-auto hidden text-right sm:block">
                  {profile.metric ?? ""}
                </span>
                <ArrowUpRight
                  size={18}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="shrink-0 text-[var(--text-tertiary)] transition-colors duration-[var(--dur-micro)] group-hover:text-[var(--text)]"
                />
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
