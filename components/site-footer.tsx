import Link from "next/link";
import { brand } from "@/content/brand";
import { profiles } from "@/content/profiles";
import { identity, nav } from "@/content/site";
import { Container } from "./primitives";

/**
 * The title block. A drawing is signed in its bottom-right corner; so is this
 * site. Every cell is a fact from /content, and the revision is the build date.
 */
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const social = profiles.filter((p) =>
  ["GitHub", "LinkedIn", "X"].includes(p.platform),
);

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] py-16">
      <Container width="wide">
        <div className="panel overflow-hidden">
          <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {[
              { k: "Drawn by", v: identity.name },
              { k: "Title", v: brand.tagline },
              { k: "Location", v: identity.location },
              { k: "Sheet", v: "01 of 01" },
              { k: "Rev", v: BUILD_DATE },
              {
                k: "Contact",
                v: (
                  <a
                    href={`mailto:${identity.email}`}
                    className="break-all text-[var(--accent)] underline-offset-4 hover:underline"
                  >
                    {identity.email}
                  </a>
                ),
              },
            ].map((cell) => (
              <div
                key={cell.k}
                className="border-r border-b border-[var(--border)] p-4 last:border-r-0 lg:border-b-0 md:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:border-r lg:[&:nth-child(6n)]:border-r-0"
              >
                <dt className="t-label">{cell.k}</dt>
                <dd className="t-data mt-2 text-[var(--text)]">{cell.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="t-label text-[var(--text-secondary)] hover:text-[var(--text)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/resume"
                className="t-label text-[var(--text-secondary)] hover:text-[var(--text)]"
              >
                Résumé
              </Link>
            </li>
            <li>
              <Link
                href="/security"
                className="t-label text-[var(--text-secondary)] hover:text-[var(--text)]"
              >
                Disclosure record
              </Link>
            </li>
          </ul>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {social.map((p) => (
              <li key={p.url}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${p.platform} profile (opens in a new tab)`}
                  className="t-label text-[var(--text-secondary)] hover:text-[var(--text)]"
                >
                  {p.platform}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="t-caption mt-10 max-w-[70ch]">
          No third-party scripts. No trackers. No cookies.
          Content-Security-Policy: script-src &apos;self&apos;. Vulnerability
          reports:{" "}
          <a
            href="/.well-known/security.txt"
            className="t-mono text-[var(--accent)] underline-offset-4 hover:underline"
          >
            /.well-known/security.txt
          </a>
          . Machine-readable summary:{" "}
          <a
            href="/llms.txt"
            className="t-mono text-[var(--accent)] underline-offset-4 hover:underline"
          >
            /llms.txt
          </a>
          .
        </p>
      </Container>
    </footer>
  );
}
