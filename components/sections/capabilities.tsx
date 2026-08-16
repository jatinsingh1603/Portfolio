import { Chip, Container } from "@/components/primitives";
import { Reveal } from "@/components/reveal";
import { capabilities } from "@/content/career";

/**
 * The one place a bento arrangement earns its keep: the four groups have
 * genuinely different densities, so equal columns would leave three of them
 * half-empty. Tools spans wider because it holds sixteen items; Frameworks sits
 * narrow because it holds five. No bars, no star ratings — a percentage against
 * "Burp Suite" would be a number nobody can verify.
 */
export function Capabilities() {
  const spans: Record<string, string> = {
    Security: "lg:col-span-7",
    "AI & automation": "lg:col-span-5",
    Tools: "lg:col-span-8",
    "Frameworks & standards": "lg:col-span-4",
  };

  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-heading"
      className="border-y border-[var(--border)] bg-[var(--bg-subtle)] py-[var(--section-y)]"
    >
      <Container width="wide">
        {/* No eyebrow here: "Capabilities" above "What I actually work with."
            labels the same thing twice, and every section carrying the same
            eyebrow-then-heading pair is what makes a long page read as a
            template rather than a document. */}
        <h2 id="capabilities-heading" className="t-h2">
          What I actually work with.
        </h2>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-12">
          {capabilities.map((group, index) => (
            <Reveal
              key={group.label}
              delay={index * 60}
              className={`rounded-[var(--radius-surface)] border border-[var(--border)] bg-[var(--bg)] p-8 ${spans[group.label] ?? "lg:col-span-6"}`}
            >
              <h3 className="t-caption">{group.label}</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item}>
                    <Chip>{item}</Chip>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
