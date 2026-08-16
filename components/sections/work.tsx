import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PipelineDiagram } from "@/components/pipeline-diagram";
import { Chip, Container, ExternalLink } from "@/components/primitives";
import { Reveal } from "@/components/reveal";
import { diagrams } from "@/content/diagrams";
import { projects } from "@/content/projects";

export function Work() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="py-[var(--section-y)]"
    >
      <Container width="wide">
        <p className="t-caption">Selected work</p>
        <h2 id="work-heading" className="t-h2 mt-3 max-w-[20ch]">
          Three systems, built to produce evidence rather than opinions.
        </h2>
      </Container>

      <div className="mt-20 flex flex-col gap-[var(--section-y)]">
        {projects.map((project, index) => {
          const diagram = diagrams[project.slug];
          // Alternate which side the artifact sits on so a three-entry list
          // does not read as a repeated template.
          const flip = index % 2 === 1;

          return (
            <Container width="wide" key={project.slug}>
              <Reveal className="grid gap-12 lg:grid-cols-12">
                <div className={`lg:col-span-6 ${flip ? "lg:order-2" : ""}`}>
                  <p className="t-mono text-[var(--text-tertiary)]">
                    {project.stack.join(" · ")}
                  </p>
                  <h3 className="t-h2 mt-4">{project.name}</h3>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Chip>{project.role}</Chip>
                    {project.license ? <Chip>{project.license}</Chip> : null}
                  </div>

                  <p className="t-body mt-6 text-[var(--text-secondary)]">
                    {project.summary}
                  </p>

                  <dl className="mt-8">
                    {project.outcomes.map((outcome) => (
                      <div
                        key={outcome.label}
                        className="border-t border-[var(--border)] py-5"
                      >
                        <dt className="font-medium">{outcome.label}</dt>
                        <dd className="t-small mt-1.5 text-[var(--text-secondary)]">
                          {outcome.detail}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {project.recognition ? (
                    <p className="t-small mt-6 border-l-2 border-[var(--accent)] pl-4 text-[var(--text-secondary)]">
                      {project.recognition}
                    </p>
                  ) : null}

                  <div className="mt-8 flex flex-wrap items-center gap-6">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-1 text-[var(--accent)] underline-offset-4 hover:underline"
                    >
                      Read the writeup
                      <ArrowUpRight
                        size={16}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </Link>
                    {project.repo ? (
                      <ExternalLink
                        href={project.repo}
                        label={`${project.name} repository on GitHub`}
                      >
                        Repository
                      </ExternalLink>
                    ) : null}
                  </div>
                </div>

                {diagram ? (
                  <div
                    className={`flex h-full flex-col justify-center rounded-[var(--radius-surface)] border border-[var(--border)] bg-[var(--bg-subtle)] p-8 lg:col-span-6 ${flip ? "lg:order-1" : ""}`}
                  >
                    <PipelineDiagram
                      title={diagram.title}
                      description={diagram.description}
                      stages={diagram.stages}
                    />
                  </div>
                ) : null}
              </Reveal>
            </Container>
          );
        })}
      </div>
    </section>
  );
}
