import Link from "next/link";
import { Container, ExternalLink } from "@/components/primitives";
import { ThemeToggle } from "@/components/theme-toggle";
import { profiles } from "@/content/profiles";
import { identity, nav } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] py-16">
      <Container width="wide">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div>
            <p className="font-medium tracking-[-0.02em]">{identity.name}</p>
            <p className="t-caption mt-2">
              {identity.title} · {identity.location}
            </p>
            <p className="t-mono mt-6 text-[var(--text-tertiary)]">
              <Link
                href="/.well-known/security.txt"
                className="hover:text-[var(--text)]"
              >
                /.well-known/security.txt
              </Link>
            </p>
          </div>

          <div className="flex gap-12">
            <nav aria-label="Footer">
              <h2 className="t-caption mb-4">Sections</h2>
              <ul className="flex flex-col gap-1">
                {[...nav, { label: "Résumé", href: "/resume" }].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      /* py-1 lifts the target to 26px — WCAG 2.2 §2.5.8 wants 24×24. */
                      className="t-small inline-block py-1 text-[var(--text-secondary)] transition-colors duration-[var(--dur-micro)] hover:text-[var(--text)]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="t-caption mb-4">Elsewhere</h2>
              <ul className="flex flex-col gap-1">
                {profiles.slice(0, 5).map((p) => (
                  <li key={p.url}>
                    <ExternalLink
                      href={p.url}
                      label={`${p.platform} profile`}
                      showIcon={false}
                      className="t-small inline-block py-1 !text-[var(--text-secondary)] hover:!text-[var(--text)]"
                    >
                      {p.platform}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="t-caption mb-4">Theme</h2>
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-[var(--border)] pt-8 md:flex-row md:items-center md:justify-between">
          <p className="t-caption">© 2026 {identity.name}</p>
          {/* True, and a positioning statement for a privacy-literate audience. */}
          <p className="t-caption">No cookies. No tracking.</p>
        </div>
      </Container>
    </footer>
  );
}
