import { Container } from "@/components/primitives";
import { Reveal } from "@/components/reveal";
import { recognitions } from "@/content/site";

/**
 * Text only, deliberately. Company logos here would be trademark use that
 * reads as endorsement — and a wall of grey logos is the single most common
 * tell of a generated portfolio. Naming the recognition in words is both more
 * credible and more accurate.
 */
export function Credibility() {
  return (
    <section
      aria-labelledby="credibility-heading"
      className="border-y border-[var(--border)] bg-[var(--bg-subtle)] py-20"
    >
      <Container width="wide">
        <h2 id="credibility-heading" className="sr-only">
          Recognition from vendors and national CERT
        </h2>
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {recognitions.map((item, index) => (
            <Reveal
              as="li"
              key={item.org}
              delay={index * 60}
              className="border-t border-[var(--border-strong)] pt-5"
            >
              <p className="t-h3">{item.org}</p>
              <p className="t-small mt-2 text-[var(--text-secondary)]">
                {item.detail}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
