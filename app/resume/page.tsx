import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button, Chip, Container } from "@/components/primitives";
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

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--border)] py-10">
      <h2 className="t-caption mb-6">{title}</h2>
      {children}
    </section>
  );
}

export default function ResumePage() {
  return (
    <main id="main" className="py-20">
      <Container width="wide">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="t-h1">{identity.name}</h1>
            <p className="t-intro mt-3">
              {identity.title} · {identity.location}
            </p>
            <p className="t-small mt-2">
              <a
                href={`mailto:${identity.email}`}
                className="text-[var(--accent)] underline-offset-4 hover:underline"
              >
                {identity.email}
              </a>
            </p>
          </div>
          <Button href={identity.resumePdf} download>
            <Download size={18} strokeWidth={1.5} aria-hidden="true" />
            Download PDF
          </Button>
        </div>

        <p className="t-body mt-10 text-[var(--text-secondary)]">
          {positioning.statement}
        </p>

        <div className="mt-12">
          <Block title="Experience">
            {roles.map((role) => (
              <div key={role.company}>
                <h3 className="t-h3">
                  {role.title} · {role.company}
                </h3>
                <p className="t-mono mt-1 text-[var(--text-tertiary)]">
                  {role.arrangement} · {role.start} — {role.end}
                </p>
                <dl className="mt-6">
                  {role.highlights.map((item) => (
                    <div key={item.label} className="mb-5">
                      <dt className="font-medium">{item.label}</dt>
                      <dd className="t-body mt-1 text-[var(--text-secondary)]">
                        {item.detail}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </Block>

          <Block title="Projects">
            {projects.map((project) => (
              <div key={project.slug} className="mb-8">
                <h3 className="t-h3">{project.name}</h3>
                <p className="t-mono mt-1 text-[var(--text-tertiary)]">
                  {project.role} · {project.stack.join(" · ")}
                </p>
                <p className="t-body mt-2 text-[var(--text-secondary)]">
                  {project.summary}
                </p>
                {project.recognition ? (
                  <p className="t-small mt-2">{project.recognition}</p>
                ) : null}
              </div>
            ))}
          </Block>

          <Block title="Security research">
            <ul className="flex flex-col gap-3">
              {publicFindings.map((finding) => (
                <li key={finding.id} className="flex flex-wrap gap-x-3">
                  <span className="t-mono text-[var(--text-tertiary)]">
                    {finding.id}
                  </span>
                  <span className="font-medium">{finding.org}</span>
                  <span className="t-small text-[var(--text-secondary)]">
                    {finding.class} — {finding.status}
                    {finding.bounty ? ` · ${finding.bounty}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Recognition">
            <ul className="flex flex-col gap-3">
              {awards.map((award) => (
                <li key={award.event}>
                  <span className="font-medium">{award.placement}</span> —{" "}
                  {award.event}
                  <span className="t-small text-[var(--text-secondary)]">
                    {" "}
                    · {award.organiser}
                    {award.venue ? `, ${award.venue}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Certification & education">
            {credentials.map((credential) => (
              <p key={credential.name} className="mb-3">
                <span className="font-medium">{credential.name}</span>
                <span className="t-small text-[var(--text-secondary)]">
                  {" "}
                  · {credential.issuer}
                </span>
              </p>
            ))}
            <p>
              <span className="font-medium">{education.degree}</span>
              <span className="t-small text-[var(--text-secondary)]">
                {" "}
                · {education.institution} · {education.start}–{education.end} ·{" "}
                {education.detail}
              </span>
            </p>
          </Block>

          <Block title="Capabilities">
            <div className="flex flex-col gap-6">
              {capabilities.map((group) => (
                <div key={group.label}>
                  <p className="t-caption mb-3">{group.label}</p>
                  <ul className="flex flex-wrap gap-2">
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
        </div>
      </Container>
    </main>
  );
}
