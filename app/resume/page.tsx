import type { Metadata } from "next";
import {
  Button,
  Chip,
  Container,
  ExternalLink,
  KeyValue,
  Rule,
} from "@/components/primitives";
import {
  awards,
  capabilities,
  credentials,
  education,
  roles,
} from "@/content/career";
import { publicFindings } from "@/content/findings";
import { projects } from "@/content/projects";
import { identity, positioning } from "@/content/site";

export const metadata: Metadata = {
  title: "Résumé",
  description: positioning.statement,
  alternates: { canonical: "/resume" },
};

/** One register block: a mono heading, the ticked-off hairline, then rows. */
function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 md:mt-20">
      <h2 className="t-label">{title}</h2>
      <Rule className="mt-4" />
      <div className="mt-8">{children}</div>
    </section>
  );
}

/**
 * The full résumé in the register style, with a download for the PDF that
 * carries the details this page deliberately keeps out of the HTML (the phone
 * number lives on the PDF only — never rendered here).
 */
export default function ResumePage() {
  return (
    <main id="main" className="pt-32 pb-24">
      <Container width="default">
        <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-6">
          <div>
            <h1 className="t-h1">{identity.name}</h1>
            <p className="t-lede mt-3">
              {identity.title}
              <span aria-hidden="true"> · </span>
              {identity.location}
            </p>
            <p className="mt-4">
              <a
                href={`mailto:${identity.email}`}
                className="t-data text-[var(--accent)] underline-offset-4 hover:underline"
              >
                {identity.email}
              </a>
            </p>
          </div>
          <Button
            href={identity.resumePdf}
            download
            className="w-full md:w-auto"
          >
            Download PDF
          </Button>
        </header>

        <p className="t-body mt-10">{positioning.statement}</p>

        <Block title="Experience">
          <div className="flex flex-col gap-12">
            {roles.map((role) => (
              <article key={`${role.title}-${role.company}`}>
                <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4">
                  <h3 className="t-h3">
                    {role.title}
                    <span aria-hidden="true"> · </span>
                    {role.company}
                  </h3>
                  <p className="t-data text-tertiary">
                    {role.arrangement}
                    <span aria-hidden="true"> · </span>
                    {role.start}
                    <span aria-hidden="true"> – </span>
                    {role.end}
                  </p>
                </div>
                <KeyValue
                  className="mt-6"
                  rows={role.highlights.map((h) => ({
                    label: h.label,
                    value: h.detail,
                  }))}
                />
              </article>
            ))}
          </div>
        </Block>

        <Block title="Projects">
          <ul className="flex flex-col">
            {projects.map((project, i) => (
              <li
                key={project.slug}
                className={i > 0 ? "border-border mt-10 border-t pt-10" : ""}
              >
                <p className="t-label text-secondary">{project.category}</p>
                <h3 className="t-h3 mt-2">{project.name}</h3>
                <p className="t-data text-tertiary mt-1">{project.role}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <li key={tech}>
                      <Chip>{tech}</Chip>
                    </li>
                  ))}
                </ul>
                <p className="t-body mt-4">{project.summary}</p>
                {project.recognition ? (
                  <p className="t-small text-secondary mt-3">
                    {project.recognition}
                  </p>
                ) : null}
                {project.repo ? (
                  <p className="mt-3">
                    <ExternalLink
                      href={project.repo}
                      label={`${project.name} source repository`}
                    >
                      View repository
                    </ExternalLink>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Security research">
          <ul className="flex flex-col">
            {publicFindings.map((finding, i) => (
              <li
                key={finding.id}
                className={`flex flex-col gap-1 py-4 sm:flex-row sm:gap-6 ${
                  i > 0 ? "border-border border-t" : ""
                }`}
              >
                <span className="t-data text-tertiary sm:w-24 sm:shrink-0">
                  {finding.id}
                </span>
                <div>
                  <p className="t-small">
                    <span className="font-medium text-[var(--text)]">
                      {finding.org}
                    </span>
                    <span aria-hidden="true"> · </span>
                    {finding.class}
                  </p>
                  <p className="t-caption mt-0.5">
                    {finding.status}
                    {finding.bounty ? (
                      <>
                        <span aria-hidden="true"> · </span>
                        {finding.bounty}
                      </>
                    ) : null}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Recognition">
          <ul className="flex flex-col">
            {awards.map((award, i) => (
              <li
                key={`${award.placement}-${award.event}`}
                className={i > 0 ? "mt-6" : ""}
              >
                <p className="t-small">
                  <span className="font-medium text-[var(--text)]">
                    {award.placement}
                  </span>
                  <span aria-hidden="true"> — </span>
                  {award.event}
                </p>
                <p className="t-caption mt-0.5">
                  {award.organiser}
                  {award.venue ? (
                    <>
                      <span aria-hidden="true"> · </span>
                      {award.venue}
                    </>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Certification & education">
          <div className="flex flex-col gap-8">
            {credentials.map((credential) => (
              <div key={credential.name}>
                <h3 className="t-h3">{credential.name}</h3>
                <p className="t-small text-secondary mt-1">
                  {credential.issuer}
                </p>
                {credential.detail ? (
                  <p className="t-small mt-1">{credential.detail}</p>
                ) : null}
              </div>
            ))}
            <div>
              <h3 className="t-h3">{education.degree}</h3>
              <p className="t-small text-secondary mt-1">
                {education.institution}
                <span aria-hidden="true"> · </span>
                {education.start}
                <span aria-hidden="true"> – </span>
                {education.end}
              </p>
              <p className="t-small mt-1">{education.detail}</p>
            </div>
          </div>
        </Block>

        <Block title="Capabilities">
          <div className="flex flex-col gap-8">
            {capabilities.map((group) => (
              <div key={group.label}>
                <h3 className="t-label text-secondary">{group.label}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Chip>{item}</Chip>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Block>
      </Container>
    </main>
  );
}
