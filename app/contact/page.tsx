import type { Metadata } from "next";
import { Container } from "@/components/primitives";
import { profiles } from "@/content/profiles";
import { identity } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Email ${identity.name} — ${identity.title}, ${identity.location}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main id="main" className="py-20">
      <Container width="wide">
        <p className="t-caption">Contact</p>
        <h1 className="mt-4">
          <a
            href={`mailto:${identity.email}`}
            className="t-h1 break-words text-[var(--accent)] underline-offset-8 hover:underline"
          >
            {identity.email}
          </a>
        </h1>

        <p className="t-intro mt-8">
          Based in {identity.location}. Open to application security and red
          team work, and to coordinated disclosure enquiries. Email is the
          fastest route — there is no contact form here on purpose.
        </p>
      </Container>

      <Container width="text" className="mt-20">
        <h2 className="t-h3">Reporting a vulnerability</h2>
        <p className="t-body mt-3 text-[var(--text-secondary)]">
          If you have found an issue in this site or in something I maintain,
          the machine-readable policy is at{" "}
          <a
            href="/.well-known/security.txt"
            className="t-mono text-[var(--accent)] underline-offset-4 hover:underline"
          >
            /.well-known/security.txt
          </a>
          , per RFC 9116.
        </p>

        <h2 className="t-h3 mt-12">Elsewhere</h2>
        <ul className="mt-4 flex flex-col gap-1">
          {profiles.map((profile) => (
            <li key={profile.url}>
              <a
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${profile.platform} profile (opens in a new tab)`}
                className="t-small inline-block py-1 text-[var(--accent)] underline-offset-4 hover:underline"
              >
                {profile.platform}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
