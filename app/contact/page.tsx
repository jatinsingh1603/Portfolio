import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Button, Container, Reveal } from "@/components/primitives";
import { profiles } from "@/content/profiles";
import { identity } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Email ${identity.name} — ${identity.title}, ${identity.location}.`,
  alternates: { canonical: "/contact" },
};

/**
 * The contact station as its own route. No form on purpose: email is the
 * fastest route to a real person, and a form would only add a service that
 * touches the message. Every fact — the address, the profiles, the location —
 * is imported from /content; nothing about the person is typed here.
 */
export default function ContactPage() {
  return (
    <main id="main" className="pt-32 pb-24">
      <Container width="default">
        <Reveal>
          <p className="t-label">Contact</p>
          <h1 className="t-h1 mt-5 break-words">
            <a
              href={`mailto:${identity.email}`}
              className="text-[var(--accent)] underline-offset-4 hover:underline"
            >
              {identity.email}
            </a>
          </h1>
          <p className="t-lede mt-6">
            Based in {identity.location}. Open to application security, red team
            and coordinated disclosure enquiries. Email is the fastest route —
            there is no contact form on purpose.
          </p>
          <div className="mt-8">
            <Button href={identity.resumePdf} variant="ghost" download>
              Download résumé (PDF)
            </Button>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <section aria-labelledby="report-title" className="mt-16">
            <h2 id="report-title" className="t-h3">
              Reporting a vulnerability
            </h2>
            <p className="t-body mt-4 text-[var(--text-secondary)]">
              For security reports, start with the{" "}
              <a
                href="/.well-known/security.txt"
                className="text-[var(--accent)]"
              >
                security.txt
              </a>{" "}
              policy (RFC 9116). It names the contact address, preferred
              language and the disclosure terms this site follows.
            </p>
          </section>
        </Reveal>

        <Reveal delay={140}>
          <section aria-labelledby="elsewhere-title" className="mt-16">
            <h2 id="elsewhere-title" className="t-h3">
              Elsewhere
            </h2>
            <ul className="mt-6">
              {profiles.map((profile) => (
                <li key={profile.platform} className="link-row">
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${profile.platform}, ${profile.handle} (opens in a new tab)`}
                    className="flex min-h-[44px] w-full flex-1 items-center justify-between gap-4"
                  >
                    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="t-body font-medium">
                        {profile.platform}
                      </span>
                      <span className="t-data text-[var(--text-tertiary)]">
                        {profile.handle}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      {profile.metric ? (
                        <span className="t-data text-[var(--text-secondary)]">
                          {profile.metric}
                        </span>
                      ) : null}
                      <ArrowUpRight
                        size={16}
                        strokeWidth={1.5}
                        aria-hidden="true"
                        className="text-[var(--text-tertiary)]"
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      </Container>
    </main>
  );
}
