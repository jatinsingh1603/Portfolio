import { Container } from "@/components/primitives";
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
      className="py-[var(--section-y)]"
    >
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="t-caption">Currently</p>
            <h2 id="currently-heading" className="t-h2 mt-3">
              {role.title}
            </h2>
            <p className="t-body mt-4 text-[var(--text-secondary)]">
              {role.company} · {role.arrangement}
            </p>
            <p className="t-mono mt-2 text-[var(--text-tertiary)]">
              {role.start} — {role.end}
            </p>
          </div>

          <dl className="lg:col-span-8">
            {role.highlights.map((item, index) => (
              <Reveal
                key={item.label}
                delay={Math.min(index, 4) * 60}
                className="border-t border-[var(--border)] py-6 first:border-t-0 first:pt-0"
              >
                <dt className="t-h3">{item.label}</dt>
                <dd className="t-body mt-2 text-[var(--text-secondary)]">
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
