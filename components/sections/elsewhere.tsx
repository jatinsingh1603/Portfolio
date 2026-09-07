import { ArrowUpRight } from "lucide-react";
import { Reveal, Station } from "@/components/primitives";
import { profiles } from "@/content/profiles";
import type { GithubStats } from "@/lib/github";

/**
 * Station 10. The rest of the footprint as honest link rows: a metric appears
 * only where it was verified in writing or at build time; every other row is a
 * plain link, never an estimate. The GitHub row prefers the build-time repo
 * count when a fetch succeeded, and falls back to the verified static metric.
 */
export function Elsewhere({ github }: { github: GithubStats | null }) {
  return (
    <Station
      index={10}
      id="elsewhere"
      eyebrow="Elsewhere"
      title="Where the rest of it lives."
      lede="A metric appears only where it was verified; rows without one are links, not estimates."
      zone="teal"
    >
      <ul className="mx-auto max-w-[46rem]">
        {profiles.map((profile, i) => {
          const isGithub = profile.platform === "GitHub";
          const metric =
            isGithub && github
              ? `${github.publicRepos} public repositories`
              : profile.metric;
          const caption = isGithub
            ? github
              ? "verified at build"
              : profile.metric
                ? "verified"
                : undefined
            : undefined;

          return (
            <Reveal as="li" key={profile.url} delay={Math.min(i, 5) * 60}>
              <a
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${profile.platform} profile (opens in a new tab)`}
                className="link-row group"
              >
                <span className="min-w-0">
                  <span className="t-h3 block !text-[1.125rem]">
                    {profile.platform}
                  </span>
                  <span className="t-data block text-[var(--text-secondary)]">
                    {profile.handle}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3 text-right">
                  {metric ? (
                    <span className="min-w-0">
                      <span className="t-data block">{metric}</span>
                      {caption ? (
                        <span className="t-caption block">{caption}</span>
                      ) : null}
                    </span>
                  ) : null}
                  <ArrowUpRight
                    size={18}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="shrink-0 text-[var(--text-tertiary)] transition-colors duration-[var(--dur-micro)] group-hover:text-[var(--accent)]"
                  />
                </span>
              </a>
            </Reveal>
          );
        })}
      </ul>
    </Station>
  );
}
