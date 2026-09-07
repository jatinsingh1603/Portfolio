import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PipelineDiagram } from "@/components/pipeline-diagram";
import {
  Chip,
  Container,
  ExternalLink,
  Panel,
  Plane,
  Reveal,
} from "@/components/primitives";
import { diagrams } from "@/content/diagrams";
import { projectBySlug, projects } from "@/content/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  const canonical = `/projects/${project.slug}`;
  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: project.name,
      description: project.summary,
      url: canonical,
    },
  };
}

/**
 * A project sheet. Category, name, status/role/licence chips and the summary
 * head the page; below, a two-column layout puts the outcomes register beside
 * a raised panel carrying the project's own pipeline diagram and its stack.
 * Every fact is imported from content/projects and content/diagrams — nothing
 * about the work is typed here. Unknown slugs 404.
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const diagram = diagrams[project.slug];
  const moreSystems = projects.filter((p) => p.slug !== project.slug);

  return (
    <main id="main" className="pt-32 pb-24">
      <Container width="default">
        <Reveal>
          <Link
            href="/#work"
            className="t-label inline-flex min-h-[44px] items-center gap-2 text-[var(--text-secondary)] transition-colors duration-[var(--dur-micro)] hover:text-[var(--text)]"
          >
            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
            Work
          </Link>

          <p className="t-label mt-8 text-[var(--text-secondary)]">
            {project.category}
          </p>
          <h1 className="t-h1 mt-4 max-w-[24ch]">{project.name}</h1>

          <ul
            className="mt-6 flex flex-wrap gap-2"
            aria-label="Status, role and licence"
          >
            <li>
              <Chip>{project.status}</Chip>
            </li>
            {project.role !== project.status ? (
              <li>
                <Chip>{project.role}</Chip>
              </li>
            ) : null}
            {project.license ? (
              <li>
                <Chip>{project.license}</Chip>
              </li>
            ) : null}
          </ul>

          <p className="t-lede mt-7">{project.summary}</p>

          {project.repo || project.demo ? (
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              {project.repo ? (
                <ExternalLink
                  href={project.repo}
                  label={`${project.name} source repository on GitHub`}
                >
                  Repository
                </ExternalLink>
              ) : null}
              {project.demo ? (
                <ExternalLink
                  href={project.demo}
                  label={`${project.name} live demo`}
                >
                  Live demo
                </ExternalLink>
              ) : null}
            </div>
          ) : null}
        </Reveal>

        <div className="mt-16 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="t-h3">How it works</h2>
              <dl className="register mt-6">
                {project.outcomes.map((outcome) => (
                  <div key={outcome.label}>
                    <dt className="t-small font-medium text-[var(--text)]">
                      {outcome.label}
                    </dt>
                    <dd className="t-body text-[var(--text-secondary)]">
                      {outcome.detail}
                    </dd>
                  </div>
                ))}
              </dl>

              {project.recognition ? (
                <div className="mt-12">
                  <h3 className="t-label">Recognition</h3>
                  <p className="t-body mt-3 text-[var(--text-secondary)]">
                    {project.recognition}
                  </p>
                </div>
              ) : null}
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={80}>
              <Panel className="p-6 md:p-7">
                {diagram ? (
                  <div className="scroll-x">
                    <PipelineDiagram
                      stages={diagram.stages}
                      title={diagram.title}
                      description={diagram.description}
                      compact
                    />
                  </div>
                ) : null}

                <h3 className={`t-label ${diagram ? "mt-8" : ""}`}>Stack</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <li key={tech}>
                      <Chip>{tech}</Chip>
                    </li>
                  ))}
                </ul>
              </Panel>
            </Reveal>
          </div>
        </div>

        {moreSystems.length > 0 ? (
          <div className="mt-24">
            <Reveal>
              <h2 className="t-h3">More systems</h2>
            </Reveal>
            <ul className="perspective mt-8 grid gap-4 md:grid-cols-2">
              {moreSystems.map((other, i) => (
                <Reveal
                  key={other.slug}
                  as="li"
                  delay={i * 60}
                  className="reveal-rotate"
                >
                  <Plane
                    href={`/projects/${other.slug}`}
                    label={other.name}
                    className="h-full p-6"
                  >
                    <p className="t-label text-[var(--text-secondary)]">
                      {other.category}
                    </p>
                    <h3 className="t-h3 mt-3">{other.name}</h3>
                    <p className="t-small mt-3 text-[var(--text-secondary)]">
                      {other.status}
                    </p>
                  </Plane>
                </Reveal>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
    </main>
  );
}
