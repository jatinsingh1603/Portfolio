import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import {
  awards,
  capabilities,
  credentials,
  education,
  roles,
  secondaryEducation,
} from "@/content/career";
import { publicFindings } from "@/content/findings";
import { projects } from "@/content/projects";
import { identity, positioning } from "@/content/site";
import "./resume.css";

export const metadata: Metadata = {
  title: "Résumé",
  description: positioning.statement,
  alternates: { canonical: "/resume" },
};

const sections = [
  { id: "experience", title: "Experience" },
  { id: "projects", title: "Projects" },
  { id: "research", title: "Security research" },
  { id: "recognition", title: "Recognition" },
  { id: "education", title: "Certification & education" },
  { id: "capabilities", title: "Capabilities" },
] as const;

const visibleProjects = projects.filter(
  (project) => project.slug === "swiftpentest",
);

/** Keep the source facts while using the document's plain punctuation. */
function documentText(text: string) {
  return text
    .replace(/\s*[\u2013\u2014]\s*/g, ", ")
    .replace(/\s*\u2192\s*/g, " / ");
}

function ResumeSection({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  const section = sections[index]!;
  return (
    <section
      className="resume-section"
      id={`resume-${section.id}`}
      aria-labelledby={`resume-${section.id}-title`}
    >
      <div className="resume-section-heading">
        <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <h2 id={`resume-${section.id}-title`}>{section.title}</h2>
      </div>
      <div className="resume-section-content">{children}</div>
    </section>
  );
}

export default function ResumePage() {
  return (
    <div className="resume-page">
      <header className="resume-header">
        <Link
          className="resume-brand"
          href="/"
          aria-label={`${identity.name}, home`}
        >
          <BrandMark className="resume-brand-mark" />
          <span>{identity.shortName}</span>
        </Link>
        <nav aria-label="Main navigation" className="resume-navigation">
          <Link href="/">Home</Link>
          <Link href="/security">Research</Link>
          <Link href="/#ms-contact">Contact</Link>
        </nav>
        <a className="resume-download" href={identity.resumePdf} download>
          Download PDF
        </a>
      </header>

      <main id="main" className="resume-main">
        <header className="resume-masthead">
          <div>
            <p className="resume-eyebrow">Résumé / Professional record</p>
            <h1>{identity.name}</h1>
            <p className="resume-role">{identity.title}</p>
          </div>
          <address className="resume-contact">
            <span>{identity.location}</span>
            <a href={`mailto:${identity.email}`}>{identity.email}</a>
          </address>
        </header>

        <article className="resume-paper" aria-label="Professional résumé">
          <div className="resume-document-heading">
            <p>Cybersecurity, AI & automation</p>
            <span>Public profile</span>
          </div>
          <p className="resume-summary">
            {documentText(positioning.statement)}
          </p>

          <nav className="resume-index" aria-label="Résumé sections">
            {sections.map((section, index) => (
              <a href={`#resume-${section.id}`} key={section.id}>
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {section.title}
              </a>
            ))}
          </nav>

          <ResumeSection index={0}>
            {roles.map((role) => (
              <article className="resume-role-record" key={role.company}>
                <div className="resume-record-heading">
                  <div>
                    <h3>{role.title}</h3>
                    <p>{role.company}</p>
                  </div>
                  <p className="resume-record-meta">
                    <span>
                      {role.start} to {role.end}
                    </span>
                    <span>{role.arrangement}</span>
                  </p>
                </div>
                <dl className="resume-highlights">
                  {role.highlights.map((highlight) => (
                    <div key={highlight.label}>
                      <dt>{documentText(highlight.label)}</dt>
                      <dd>{documentText(highlight.detail)}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </ResumeSection>

          <ResumeSection index={1}>
            {visibleProjects.map((project) => (
              <article className="resume-project" key={project.slug}>
                <p className="resume-detail">{project.category}</p>
                <div className="resume-record-heading">
                  <h3>
                    <Link href={`/projects/${project.slug}`}>
                      {project.name}
                    </Link>
                  </h3>
                  <p className="resume-record-meta">{project.role}</p>
                </div>
                <p>{documentText(project.summary)}</p>
                <dl className="resume-highlights">
                  {project.outcomes.map((outcome) => (
                    <div key={outcome.label}>
                      <dt>{documentText(outcome.label)}</dt>
                      <dd>{documentText(outcome.detail)}</dd>
                    </div>
                  ))}
                </dl>
                <p className="resume-project-stack">
                  <strong>Tools and technologies</strong>
                  {project.stack.join(" / ")}
                </p>
                {project.recognition ? (
                  <p className="resume-annotation">
                    {documentText(project.recognition)}
                  </p>
                ) : null}
                {project.repo ? (
                  <a
                    className="resume-text-link"
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.name} source repository, opens in a new tab`}
                  >
                    View source repository
                  </a>
                ) : null}
              </article>
            ))}
          </ResumeSection>

          <ResumeSection index={2}>
            <ul className="resume-findings">
              {publicFindings.map((finding) => (
                <li key={finding.id}>
                  <p className="resume-finding-id">{finding.id}</p>
                  <div>
                    <h3>
                      {finding.slug ? (
                        <Link href={`/security/${finding.slug}`}>
                          {finding.org}
                        </Link>
                      ) : (
                        finding.org
                      )}
                    </h3>
                    <p className="resume-finding-class">
                      {documentText(finding.class)}
                    </p>
                    <p>{documentText(finding.summary)}</p>
                    <p className="resume-finding-status">
                      <span>Status</span>
                      {finding.status}
                      {finding.bounty ? (
                        <strong>{finding.bounty}</strong>
                      ) : null}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </ResumeSection>

          <ResumeSection index={3}>
            <ul className="resume-awards">
              {awards.map((award) => (
                <li key={award.event}>
                  <p className="resume-award-placement">{award.placement}</p>
                  <div>
                    <h3>{award.event}</h3>
                    <p>{documentText(award.organiser)}</p>
                    {award.venue ? (
                      <p className="resume-detail">{award.venue}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </ResumeSection>

          <ResumeSection index={4}>
            <div className="resume-qualifications">
              <div className="resume-certifications">
                <p className="resume-detail">Certifications</p>
                {credentials.map((credential) => (
                  <article key={credential.name}>
                    <h3>{documentText(credential.name)}</h3>
                    <p>{credential.issuer}</p>
                    {credential.detail ? (
                      <p>{documentText(credential.detail)}</p>
                    ) : null}
                  </article>
                ))}
              </div>
              <div className="resume-education">
                <p className="resume-detail">Education</p>
                <article>
                  <h3>{education.degree}</h3>
                  <p>{education.institution}</p>
                  <p>Specialization: {education.specialization}</p>
                  <p className="resume-education-dates">
                    {education.start} to {education.end}
                    {education.expected ? " (Expected)" : ""}
                  </p>
                  <p className="resume-annotation">{education.detail}</p>
                </article>
                {secondaryEducation.map((record) => (
                  <article key={record.degree}>
                    <h3>{record.degree}</h3>
                    <p>{record.institution}</p>
                    <p className="resume-education-dates">{record.year}</p>
                    <p className="resume-annotation">{record.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </ResumeSection>

          <ResumeSection index={5}>
            <div className="resume-capabilities">
              {capabilities.map((group) => (
                <section key={group.label}>
                  <h3>{group.label}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </ResumeSection>

          <div className="resume-document-end">
            <p>{identity.name}</p>
            <a href={identity.resumePdf} download>
              Download the résumé PDF
            </a>
          </div>
        </article>
      </main>

      <footer className="resume-footer">
        <div className="resume-footer-name">
          <BrandMark className="resume-footer-mark" />
          <div>
            <p>{identity.name}</p>
            <span>{identity.title}</span>
          </div>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/">Home</Link>
          <Link href="/security">Research</Link>
          <a href={`mailto:${identity.email}`}>Contact</a>
          <a href={identity.resumePdf} download>
            Download PDF
          </a>
        </nav>
      </footer>
    </div>
  );
}
