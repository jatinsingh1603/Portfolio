import Link from "next/link";
import { Container } from "@/components/primitives";
import { Reveal } from "@/components/reveal";
import { awards } from "@/content/career";
import { projectBySlug } from "@/content/projects";

export function Recognition() {
  return (
    <section
      id="recognition"
      aria-labelledby="recognition-heading"
      className="py-[var(--section-y)]"
    >
      <Container width="wide">
        <p className="t-caption">Recognition &amp; competition</p>
        <h2 id="recognition-heading" className="t-h2 mt-3">
          Judged against other teams, three times.
        </h2>

        <ul className="mt-12 grid gap-10 lg:grid-cols-3">
          {awards.map((award, index) => {
            const project = projectBySlug(award.projectSlug);
            return (
              <Reveal
                as="li"
                key={award.event}
                delay={index * 60}
                className="border-t border-[var(--border-strong)] pt-5"
              >
                <h3 className="t-h3">{award.placement}</h3>
                <p className="t-body mt-2">{award.event}</p>
                <p className="t-caption mt-2">
                  {award.organiser}
                  {award.venue ? ` · ${award.venue}` : ""}
                </p>
                {project ? (
                  <p className="t-small mt-4">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="text-[var(--accent)] underline-offset-4 hover:underline"
                    >
                      {project.name}
                    </Link>
                  </p>
                ) : null}
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
