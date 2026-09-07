import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Chip,
  Container,
  KeyValue,
  Reveal,
  Rule,
  SeverityTag,
} from "@/components/primitives";
import { publicFindings } from "@/content/findings";
import type { Finding } from "@/content/schema";
import { disclosurePolicy, identity } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicFindings
    .filter((f) => f.slug)
    .map((f) => ({ slug: f.slug as string }));
}

function findBySlug(slug: string): Finding | undefined {
  return publicFindings.find((f) => f.slug === slug);
}

/** UI label for the disclosure basis. */
function basisLabel(disclosure: Finding["disclosure"]): string {
  if (!disclosure.public) return "";
  switch (disclosure.basis) {
    case "program-permitted":
      return "Programme permits";
    case "vendor-approved":
      return "Vendor approved";
    case "publicly-acknowledged":
      return "Publicly acknowledged";
  }
}

/** Per-basis explanation of why this finding may be published at all. */
function basisExplanation(disclosure: Finding["disclosure"]): string {
  if (!disclosure.public) return "";
  switch (disclosure.basis) {
    case "program-permitted":
      return "The organisation runs a coordinated disclosure or bug bounty programme whose terms allow the existence of a report to be stated. Organisation, class and outcome are named; impact detail and reproduction steps stay withheld until the programme approves them in writing.";
    case "vendor-approved":
      return "Testing was carried out under written authorisation from the owner, and the owner has confirmed the finding may be listed. No endpoint or reproduction detail is published.";
    case "publicly-acknowledged":
      return "A national CERT or the vendor has already issued a public acknowledgement of the finding, so its existence is a matter of record. Technical detail remains withheld.";
  }
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

/**
 * /security/[slug] — a single disclosure sheet. Only the governance-gated
 * fields ever appear: never an endpoint, payload or reproduction step.
 */
export default async function FindingSheetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const finding = findBySlug(slug);
  if (!finding) notFound();

  const note = finding.disclosure.public ? finding.disclosure.note : undefined;

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Organisation", value: finding.org },
    { label: "Class", value: finding.class },
    { label: "Severity", value: <SeverityTag severity={finding.severity} /> },
    { label: "Status", value: finding.status },
  ];
  if (finding.bounty) {
    rows.push({ label: "Bounty", value: finding.bounty });
  }
  rows.push({ label: "Basis", value: basisLabel(finding.disclosure) });

  return (
    <main id="main" className="pt-32 pb-24">
      <Container width="text">
        <Reveal>
          <Link
            href="/security"
            className="t-label inline-flex items-center gap-2 text-[var(--text-tertiary)] transition-colors duration-[var(--dur-micro)] hover:text-[var(--text)]"
          >
            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
            Disclosure record
          </Link>

          <p className="t-data mt-8 text-[var(--text-tertiary)]">
            {finding.id}
          </p>
          <h1 className="t-h1 mt-3">{finding.org}</h1>
          <p className="t-lede mt-5">{finding.summary}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <SeverityTag severity={finding.severity} />
            <Chip>{finding.status}</Chip>
            {finding.bounty ? <Chip>{finding.bounty}</Chip> : null}
          </div>

          <Rule ticked className="mt-8" />
        </Reveal>

        <Reveal>
          <KeyValue rows={rows} className="mt-12" />
        </Reveal>

        <Reveal>
          <h2 className="t-h3 mt-14">What is published, and what is not</h2>
          <p className="t-body text-secondary mt-4">
            {note ?? disclosurePolicy}
          </p>
        </Reveal>

        <Reveal>
          <h2 className="t-h3 mt-14">Basis for publishing this at all</h2>
          <p className="t-body text-secondary mt-4">
            <strong className="font-medium text-[var(--text)]">
              {basisLabel(finding.disclosure)}.
            </strong>{" "}
            {basisExplanation(finding.disclosure)}
          </p>
        </Reveal>

        <Rule className="mt-14" />
        <p className="t-small text-secondary mt-6">
          Something on this record wrong or out of date? Write to{" "}
          <a href={`mailto:${identity.email}`}>{identity.email}</a> and it will
          be corrected.
        </p>
      </Container>
    </main>
  );
}
