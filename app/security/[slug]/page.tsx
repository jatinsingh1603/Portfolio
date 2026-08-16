import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Chip, Container } from "@/components/primitives";
import { publicFindings } from "@/content/findings";
import { disclosurePolicy, identity } from "@/content/site";

/**
 * Only findings cleared for publication get a page. `publicFindings` is the
 * filtered list, so a withheld entry cannot be reached by guessing its slug —
 * generateStaticParams never emits it and dynamicParams is off.
 */
export function generateStaticParams() {
  return publicFindings
    .filter((f) => f.slug)
    .map((f) => ({ slug: f.slug as string }));
}

export const dynamicParams = false;

function findBySlug(slug: string) {
  return publicFindings.find((f) => f.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const finding = findBySlug(slug);
  if (!finding) return {};
  return {
    title: `${finding.org} — ${finding.class}`,
    description: finding.summary,
    alternates: { canonical: `/security/${finding.slug}` },
  };
}

export default async function FindingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const finding = findBySlug(slug);
  if (!finding) notFound();

  const facts = [
    { label: "Organisation", value: finding.org },
    { label: "Class", value: finding.class },
    { label: "Severity", value: finding.severity },
    { label: "Status", value: finding.status },
    ...(finding.bounty ? [{ label: "Bounty", value: finding.bounty }] : []),
  ];

  return (
    <main id="main" className="ground-page py-20">
      <Container width="wide">
        <Link
          href="/security"
          className="t-small inline-flex items-center gap-2 text-[var(--text-secondary)] transition-colors duration-[var(--dur-micro)] hover:text-[var(--text)]"
        >
          <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
          Disclosure record
        </Link>
      </Container>

      <Container width="text" className="mt-12">
        <p className="t-mono text-[var(--text-tertiary)]">{finding.id}</p>
        <h1 className="t-h1 mt-4">{finding.org}</h1>
        <p className="t-intro mt-6">{finding.summary}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          <Chip tone={finding.severity}>{finding.severity} severity</Chip>
          <Chip>{finding.status}</Chip>
          {finding.bounty ? <Chip>{finding.bounty}</Chip> : null}
        </div>
      </Container>

      <Container width="text" className="mt-16">
        <dl className="material rounded-[var(--radius-surface)] p-8">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="flex flex-wrap justify-between gap-4 border-t border-[var(--border)] py-4 first:border-t-0 first:pt-0 last:pb-0"
            >
              <dt className="t-caption tracking-[0.08em] uppercase">
                {fact.label}
              </dt>
              <dd className="t-small text-right font-medium">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <h2 className="t-h3 mt-16">What is published, and what is not</h2>
        <p className="t-body mt-3 text-[var(--text-secondary)]">
          {finding.disclosure.public && finding.disclosure.note
            ? finding.disclosure.note
            : disclosurePolicy}
        </p>

        {/* The reason this page exists is to be a credible record, so it has to
            be explicit that the omissions are deliberate rather than an
            oversight — otherwise a thin page reads as a thin finding. */}
        <p className="t-body mt-4 text-[var(--text-secondary)]">
          There is no proof-of-concept, payload, endpoint or screenshot on this
          page, and that is deliberate. Publishing reproduction detail for an
          issue that may still be live in production would put users of{" "}
          {finding.org} at risk and, in most programmes, breach the terms the
          report was submitted under.
        </p>

        <h2 className="t-h3 mt-16">Basis for publishing this at all</h2>
        <p className="t-body mt-3 text-[var(--text-secondary)]">
          {finding.disclosure.public
            ? {
                "program-permitted":
                  "The programme's own rules permit acknowledging that a report was made. Only the organisation, the vulnerability class and the current status appear here.",
                "vendor-approved":
                  "Tested under written authorisation, held on file, which also covers naming the organisation.",
                "publicly-acknowledged":
                  "The recognition is already public, issued by the organisation itself.",
              }[finding.disclosure.basis]
            : null}
        </p>

        <p className="t-body mt-16 text-[var(--text-secondary)]">
          If you run this programme and want this entry corrected or removed,
          email{" "}
          <a
            href={`mailto:${identity.email}`}
            className="text-[var(--accent)] underline-offset-4 hover:underline"
          >
            {identity.email}
          </a>
          .
        </p>
      </Container>
    </main>
  );
}
