import { ArrowUpRight } from "lucide-react";
import { Button, Reveal, Station } from "@/components/primitives";
import type { Profile } from "@/content/schema";
import { profiles } from "@/content/profiles";
import { identity } from "@/content/site";
import { ContactCopy } from "./contact-client";

/** The three off-site channels, in order, resolved from the profile list. */
const CHANNELS = ["GitHub", "LinkedIn", "X"] as const;

function byPlatform(platform: string): Profile | undefined {
  return profiles.find((profile) => profile.platform === platform);
}

/**
 * Station 11. The close. No form on purpose: the fastest route to a security
 * engineer is an address you can paste into your own client, so the email is
 * the primary control and everything else is a plain, verifiable link. The one
 * interactive nicety — copy-to-clipboard — is a progressively-enhanced client
 * island; the mailto link works with or without it.
 */
export function Contact() {
  const channels = CHANNELS.map(byPlatform).filter(
    (profile): profile is Profile => profile !== undefined,
  );

  return (
    <Station
      index={11}
      id="contact"
      eyebrow="Contact"
      title="Send the scope."
      lede={`Based in ${identity.location}. Open to application security, red team and coordinated disclosure enquiries. Email is the fastest route — there is no contact form on purpose.`}
      zone="teal"
    >
      <div className="max-w-[52rem]">
        <ul className="m-0 list-none p-0">
          <Reveal as="li">
            <div
              className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] py-3"
              style={{ minHeight: 64 }}
            >
              <a
                href={`mailto:${identity.email}`}
                className="t-h3 text-[var(--text)] underline-offset-4 hover:underline"
              >
                {identity.email}
              </a>
              <ContactCopy email={identity.email} />
            </div>
          </Reveal>

          {channels.map((profile, index) => (
            <Reveal as="li" key={profile.platform} delay={60 * (index + 1)}>
              <a
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${profile.platform} profile (opens in a new tab)`}
                className="link-row"
              >
                <span className="flex flex-col gap-1">
                  <span className="t-h3 text-[var(--text)]">
                    {profile.platform}
                  </span>
                  <span className="t-data text-[var(--text-tertiary)]">
                    {profile.handle}
                  </span>
                </span>
                <ArrowUpRight
                  size={20}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="shrink-0 text-[var(--text-secondary)]"
                />
              </a>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={60 * (channels.length + 1)}>
          <div className="mt-10 flex flex-col gap-6">
            <Button href={identity.resumePdf} variant="ghost" download>
              Download résumé (PDF)
            </Button>

            <p className="t-small text-[var(--text-secondary)]">
              Vulnerability reports for this site:{" "}
              <a
                href="/.well-known/security.txt"
                className="text-[var(--accent)]"
              >
                security.txt
              </a>{" "}
              per RFC 9116.
            </p>
          </div>
        </Reveal>
      </div>
    </Station>
  );
}
