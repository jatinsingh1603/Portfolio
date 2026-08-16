import Link from "next/link";
import { PhotoViewer } from "@/components/photo-viewer";
import { Container, SectionHeader } from "@/components/primitives";
import { Reveal } from "@/components/reveal";
import { awards } from "@/content/career";
import { awardPhotos } from "@/content/awards-media";
import { projectBySlug } from "@/content/projects";

export function Recognition() {
  return (
    <section
      id="recognition"
      aria-labelledby="recognition-heading"
      className="ground-page py-[var(--section-y)]"
    >
      <Container width="wide">
        <SectionHeader
          id="recognition-heading"
          eyebrow="Competition"
          title="Judged against other teams, three times."
          intro="The same two platforms, put in front of judges at Thapar, IIT Delhi and Bharat Mandapam."
        />

        <ul className="mt-20 grid gap-8 lg:grid-cols-3">
          {awards.map((award, index) => {
            const project = projectBySlug(award.projectSlug);
            // Empty until photos are added to public/images/awards/, and the
            // card simply renders without a gallery until then.
            const photos = awardPhotos(award.event);
            return (
              <Reveal
                as="li"
                key={award.event}
                delay={index * 80}
                className="material lift rounded-[var(--radius-surface)] p-8 text-center"
              >
                <h3 className="t-h3 text-[var(--accent)]">{award.placement}</h3>
                <p className="t-body mx-auto mt-3">{award.event}</p>
                <p className="t-caption mt-3">
                  {award.organiser}
                  {award.venue ? ` · ${award.venue}` : ""}
                </p>
                <PhotoViewer
                  photos={photos}
                  alt={`${award.placement}, ${award.event}`}
                />

                {project ? (
                  <p className="t-small mt-6">
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
