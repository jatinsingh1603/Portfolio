import { Chip, Container, SectionHeader } from "@/components/primitives";
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
      className="ground-wash py-[var(--section-y)]"
    >
      <Container width="wide">
        <SectionHeader
          id="capabilities-heading"
          eyebrow="Capabilities"
          title="What I actually work with."
          intro="No percentage bars and no star ratings — a number against &ldquo;Burp Suite&rdquo; is a claim nobody can check."
        />

        <div className="mt-20 grid items-start gap-6 lg:grid-cols-12">
          {capabilities.map((group, index) => (
            <Reveal
              key={group.label}
              delay={index * 60}
              className={`material lift rounded-[var(--radius-surface)] p-8 ${spans[group.label] ?? "lg:col-span-6"}`}
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
