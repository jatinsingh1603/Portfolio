import { PipelineDiagram } from "@/components/pipeline-diagram";
import {
  Button,
  Chip,
  ExternalLink,
  Panel,
  Plane,
  Reveal,
  Station,
} from "@/components/primitives";
import { diagrams } from "@/content/diagrams";
import { featuredProject, otherProjects } from "@/content/projects";

/**
 * Station 03. One large presentation for the featured system — category, name,
 * status, stack, summary, key highlights and its pipeline — then the remaining
 * projects as two perspective planes. Every fact is imported from
 * content/projects.ts and content/diagrams.ts; nothing is typed as a literal.
 */
export function Work() {
  const featuredDiagram = diagrams[featuredProject.slug];

  return (
    <Station
      index={3}
      id="work"
      eyebrow="Work"
      zone="teal"
      title="Three systems, built end to end."
      lede="Each one is a working system built end to end — the kind that produces evidence rather than a returned questionnaire."
    >
      {/* Featured presentation */}
      <Reveal>
        <Panel raised className="p-6 md:p-8 lg:p-10">
          <p className="t-label text-[var(--text-secondary)]">
            {featuredProject.category}
          </p>
          <h3 className="t-h3 mt-3 text-[1.75rem] md:text-[2.25rem]">
            {featuredProject.name}
          </h3>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Chip>{featuredProject.status}</Chip>
            {featuredProject.stack.map((tech) => (
              <Chip key={tech}>{tech}</Chip>
            ))}
          </div>

          <p className="t-lede mt-6">{featuredProject.summary}</p>

          <p className="t-label mt-10 text-[var(--text-secondary)]">
            Key highlights
          </p>
          <ul className="perspective mt-4 grid gap-4 md:grid-cols-3">
            {featuredProject.outcomes.map((outcome, i) => (
              <Reveal
                as="li"
                key={outcome.label}
                delay={i * 60}
                className="reveal-rotate h-full"
              >
                <Panel className="flex h-full flex-col gap-2 p-5">
                  <p className="t-small font-medium text-[var(--text)]">
                    {outcome.label}
                  </p>
                  <p className="t-small text-[var(--text-secondary)]">
                    {outcome.detail}
                  </p>
                </Panel>
              </Reveal>
            ))}
          </ul>

          {featuredProject.recognition ? (
            <p className="t-small mt-8 text-[var(--text-secondary)]">
              {featuredProject.recognition}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              href={`/projects/${featuredProject.slug}`}
              className="w-full sm:w-auto"
            >
              Read the build
            </Button>
            {featuredProject.repo ? (
              <ExternalLink
                href={featuredProject.repo}
                label={`${featuredProject.name} source on GitHub`}
                className="min-h-[44px]"
              >
                View the repository
              </ExternalLink>
            ) : null}
            {featuredProject.demo ? (
              <ExternalLink
                href={featuredProject.demo}
                label={`${featuredProject.name} live demo`}
                className="min-h-[44px]"
              >
                Open the demo
              </ExternalLink>
            ) : null}
          </div>
        </Panel>
      </Reveal>

      {/* Featured pipeline */}
      {featuredDiagram ? (
        <Reveal className="mt-10 md:mt-12">
          <div className="scroll-x">
            <PipelineDiagram
              stages={featuredDiagram.stages}
              title={featuredDiagram.title}
              description={featuredDiagram.description}
            />
          </div>
        </Reveal>
      ) : null}

      {/* Other projects */}
      <ul className="perspective mt-14 grid gap-4 md:mt-16 md:grid-cols-2">
        {otherProjects.map((project, i) => {
          const shown = project.stack.slice(0, 4);
          const extra = project.stack.length - shown.length;
          const diagram = diagrams[project.slug];
          return (
            <Reveal
              as="li"
              key={project.slug}
              delay={i * 60}
              className="reveal-rotate h-full"
            >
              <Plane
                href={`/projects/${project.slug}`}
                label={project.name}
                className="flex h-full flex-col gap-4 p-6"
              >
                <div className="flex flex-col gap-3">
                  <p className="t-label">{project.category}</p>
                  <h3 className="t-h3">{project.name}</h3>
                  <div>
                    <Chip>{project.status}</Chip>
                  </div>
                  <p className="t-small text-[var(--text-secondary)]">
                    {project.summary}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {shown.map((tech) => (
                    <Chip key={tech}>{tech}</Chip>
                  ))}
                  {extra > 0 ? <Chip>+{extra}</Chip> : null}
                </div>

                {diagram ? (
                  <div className="scroll-x mt-auto">
                    <PipelineDiagram
                      stages={diagram.stages}
                      title={diagram.title}
                      description={diagram.description}
                      compact
                    />
                  </div>
                ) : null}
              </Plane>
            </Reveal>
          );
        })}
      </ul>
    </Station>
  );
}
