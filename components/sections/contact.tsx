import { ArrowUpRight } from "lucide-react";
import { Button, Reveal, Station } from "@/components/primitives";
import { profiles } from "@/content/profiles";
import { identity } from "@/content/site";
import type { GithubStats } from "@/lib/github";
import { ContactCopy } from "./contact-client";

/**
 * Station 09. The close: every channel and every public profile in one place.
 * No form on purpose — email is the fastest route to a security researcher,
 * and a form that pretends to send is worse than none. A metric appears only
 * where it was verified; the GitHub count refreshes at build with a verified
 * static fallback.
 */
export function Contact({ github }: { github: GithubStats | null }) {
  return (
    <Station
      index={9}
      id="contact"
      eyebrow="Contact"
      title="Send the scope."
      lede={`Based in ${identity.location}. Open to application security, red team and coordinated disclosure enquiries. Email is the fastest route — there is no contact form on purpose.`}
      width="default"
    >
      <Reveal>
        <div className="flex flex-col gap-4 border-t border-[var(--border)] py-6 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={`mailto:${identity.email}`}
            className="t-h3 break-all text-[var(--text)] underline-offset-8 hover:underline"
          >
            {identity.email}
          </a>
          <ContactCopy email={identity.email} />
        </div>
      </Reveal>

      <ul className="m-0 list-none p-0">
        {profiles.map((profile, i) => {
          const isGithub = profile.platform === "GitHub";
          const metric =
            isGithub && github
              ? `${github.publicRepos} public repositories`
              : profile.metric;
          return (
            <Reveal as="li" key={profile.url} delay={Math.min(i, 6) * 50}>
              <a
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${profile.platform} profile (opens in a new tab)`}
                className="link-row"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="t-h3">{profile.platform}</span>
                  <span className="t-data text-[var(--text-secondary)]">
                    {profile.handle}
                  </span>
                </span>
                <span className="flex min-w-0 shrink items-center gap-4">
                  {metric ? (
                    <span className="flex min-w-0 flex-col items-end text-right">
                      <span className="t-data">{metric}</span>
                      <span className="t-caption">
                        {isGithub && github ? "verified at build" : "verified"}
                      </span>
                    </span>
                  ) : null}
                  <ArrowUpRight
                    size={18}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
              </a>
            </Reveal>
          );
        })}
      </ul>

      <Reveal delay={120}>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button href={identity.resumePdf} variant="ghost" download>
            Download résumé (PDF)
          </Button>
          <p className="t-small text-[var(--text-secondary)]">
            Vulnerability in this site?{" "}
            <a
              href="/.well-known/security.txt"
              className="t-mono text-[var(--accent)] underline-offset-4 hover:underline"
            >
              /.well-known/security.txt
            </a>{" "}
            per RFC 9116.
          </p>
        </div>
      </Reveal>
    </Station>
  );
}
