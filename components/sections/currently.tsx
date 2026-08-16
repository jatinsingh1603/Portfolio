import { Container, SectionHeader } from "@/components/primitives";
import { Reveal } from "@/components/reveal";
import { roles } from "@/content/career";

/**
 * The experience section is where density earns trust — a sparse card grid
 * would undersell six substantive workstreams. Set as a definition list so the
 * label/detail relationship survives a screen reader.
 */
export function Currently() {
  const role = roles[0];
  if (!role) return null;

  return (
    <section
      id="about"
      aria-labelledby="currently-heading"
      className="ground-wash py-[var(--section-y)]"
    >
      <Container width="wide">
        <SectionHeader
          id="currently-heading"
          eyebrow="Currently"
          title={role.title}
          intro={`${role.company} · ${role.arrangement} · ${role.start} to ${role.end}`}
        />

        <div className="mt-20 grid gap-x-12 gap-y-10 lg:grid-cols-2">
          <dl className="contents">
            {role.highlights.map((item, index) => (
              <Reveal
                key={item.label}
                delay={Math.min(index, 4) * 60}
                className="material rounded-[var(--radius-surface)] p-8"
              >
                <dt className="t-h3">{item.label}</dt>
                <dd className="t-small mt-3 text-[var(--text-secondary)]">
                  {item.detail}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
