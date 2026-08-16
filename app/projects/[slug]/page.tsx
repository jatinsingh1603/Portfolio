import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PipelineDiagram } from "@/components/pipeline-diagram";
import { Chip, Container, ExternalLink } from "@/components/primitives";
import { diagrams } from "@/content/diagrams";
import { projectBySlug, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.name, description: project.summary },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const diagram = diagrams[project.slug];

  return (
    <main id="main" className="py-20">
      <Container width="wide">
        <Link
          href="/#work"
          className="t-small inline-flex items-center gap-2 text-[var(--text-secondary)] transition-colors duration-[var(--dur-micro)] hover:text-[var(--text)]"
        >
          <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
          Selected work
        </Link>

        <p className="t-mono mt-12 text-[var(--text-tertiary)]">
          {project.stack.join(" · ")}
        </p>
        <h1 className="t-h1 mt-4 max-w-[18ch]">{project.name}</h1>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Chip>{project.role}</Chip>
          {project.license ? <Chip>{project.license}</Chip> : null}
        </div>

        <p className="t-intro mt-8">{project.summary}</p>

        {project.repo ? (
          <p className="t-small mt-6">
            <ExternalLink
              href={project.repo}
              label={`${project.name} repository on GitHub`}
            >
              {project.repo.replace("https://github.com/", "github.com/")}
            </ExternalLink>
          </p>
        ) : null}
      </Container>

      <Container width="wide" className="mt-20">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="t-h3">How it works</h2>
            <dl className="mt-6">
              {project.outcomes.map((outcome) => (
                <div
                  key={outcome.label}
                  className="border-t border-[var(--border)] py-6"
                >
                  <dt className="font-medium">{outcome.label}</dt>
                  <dd className="t-body mt-2 text-[var(--text-secondary)]">
                    {outcome.detail}
                  </dd>
                </div>
              ))}
            </dl>

            {project.recognition ? (
              <>
                <h2 className="t-h3 mt-12">Recognition</h2>
                <p className="t-body mt-3 text-[var(--text-secondary)]">
                  {project.recognition}
                </p>
              </>
            ) : null}
          </div>

          {diagram ? (
            <div className="lg:col-span-5">
              <div className="rounded-[var(--radius-surface)] border border-[var(--border)] bg-[var(--bg-subtle)] p-8">
                <PipelineDiagram
                  title={diagram.title}
                  description={diagram.description}
                  stages={diagram.stages}
                />
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </main>
  );
}
