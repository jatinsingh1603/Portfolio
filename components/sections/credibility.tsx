import { Container, SectionHeader } from "@/components/primitives";
import { Reveal } from "@/components/reveal";
import { recognitions } from "@/content/site";

/**
 * Text only, deliberately. Company logos here would be trademark use that reads
 * as endorsement — and a wall of grey logos is the single most common tell of a
 * generated portfolio.
 *
 * This is the page's one inverted band. It lands immediately after the hero so
 * the first scroll produces an obvious change of ground rather than more of the
 * same white page.
 */
export function Credibility() {
  return (
    <section
      aria-labelledby="credibility-heading"
      className="ground-invert py-[var(--section-y)]"
    >
      <Container width="wide">
        <SectionHeader
          id="credibility-heading"
          eyebrow="Recognition"
          title="Four organisations have accepted a report."
          intro="Google, CERT-In, Meta and Kraken. Each one is a finding someone else verified — not a self-assessment."
        />

        <ul className="mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {recognitions.map((item, index) => (
            <Reveal
              as="li"
              key={item.org}
              delay={index * 80}
              className="text-center"
            >
              <p className="t-h2">{item.org}</p>
              <hr className="seam mx-auto mt-6 w-12" />
              <p className="t-small mx-auto mt-6 max-w-[32ch] text-[var(--text-secondary)]">
                {item.detail}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
