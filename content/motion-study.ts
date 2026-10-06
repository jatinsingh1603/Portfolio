import type { EvidenceRecord } from "@/components/evidence-sheet";
import { credentials, education, roles } from "./career";
import { cinematic } from "./cinematic";
import { publicFindings } from "./findings";
import { projects } from "./projects";
import { profiles } from "./profiles";
import { identity } from "./site";

const kraken = publicFindings.find((finding) => finding.id === "JKS-02");
const swift = projects.find((project) => project.slug === "swiftpentest");
const role = roles[0];
const credential = credentials[0];
const github = profiles.find((profile) => profile.platform === "GitHub");
const linkedin = profiles.find((profile) => profile.platform === "LinkedIn");

if (!kraken?.slug || !swift || !role || !credential || !github || !linkedin) {
  throw new Error(
    "Motion study requires its published portfolio source records.",
  );
}

export const motionIdentity = {
  name: identity.name,
  shortName: identity.shortName,
  title: identity.title,
  email: identity.email,
  location: identity.location,
  educationStart: education.start,
  educationEnd: education.end,
  educationInstitution: education.institution.split(",")[0],
  portrait: cinematic.closing.image,
  portraitAlt: cinematic.closing.imageAlt,
  github: github.url,
  linkedin: linkedin.url,
  krakenBounty: kraken.bounty,
} as const;

export const journeyEvidence: EvidenceRecord = {
  id: "journey",
  kicker: "Profile / Education and experience",
  title: identity.name,
  subtitle: "Cybersecurity, AI and automation",
  status: "Current portfolio record",
  summary:
    "My work brings together application security testing, threat detection, and automation. These are the qualifications and experience behind it.",
  sections: [
    {
      label: "Education",
      body: `${education.degree} at ${education.institution}, ${education.start}-${education.end}. ${education.detail}.`,
    },
    {
      label: "Professional experience",
      body: `${role.title} at ${role.company} since ${role.start}. Work includes application testing, log analysis, compliance assessments, and n8n automation.`,
    },
    {
      label: "Certification",
      body: `CRTP, Certified Red Team Professional, from ${credential.issuer}. Hands-on certification in Active Directory attacks and red team operations.`,
    },
  ],
  annotation: "Learning through authorised security work.",
  link: { href: "/resume", label: "Read the complete résumé" },
};

type FindingEvidence = {
  label: string;
  organization: string;
  previewTitle: string;
  highlight: string;
  note: string;
  evidence: EvidenceRecord;
};

/** Public summaries only, with the recorded outcome preserved verbatim. */
export const findingEvidence: FindingEvidence[] = [
  { id: "JKS-08", label: "Blinkit", title: "Blinkit Android application" },
  { id: "JKS-02", label: "Kraken", title: "Kraken desktop application" },
  {
    id: "JKS-09",
    label: "Google MCP",
    title: "Chrome DevTools MCP access control",
  },
  { id: "JKS-01", label: "IRCTC", title: "IRCTC security finding" },
  {
    id: "JKS-03",
    label: "Google SSO",
    title: "Google SSO session persistence",
  },
  { id: "JKS-04", label: "Meta AI", title: "Meta AI assistant report" },
  { id: "JKS-05", label: "Mapillary", title: "Mapillary access control" },
  {
    id: "JKS-06",
    label: "NorthCap web / ERP",
    title: "NorthCap website and ERP portal",
  },
  {
    id: "JKS-07",
    label: "NorthCap biometric",
    title: "NorthCap biometric attendance system",
  },
  { id: "JKS-10", label: "Meesho", title: "Meesho Android application" },
].map(({ id, label, title }) => {
  const finding = publicFindings.find((record) => record.id === id);
  if (!finding?.slug || !finding.disclosure.public) {
    throw new Error(`Motion study requires the public finding ${id}.`);
  }
  const disclosureNote = finding.disclosure.note;
  if (!disclosureNote) {
    throw new Error(`Motion study requires disclosure context for ${id}.`);
  }
  return {
    label,
    organization: finding.org,
    previewTitle: title,
    highlight: finding.bounty ?? finding.status,
    note: finding.summary,
    evidence: {
      id: finding.id,
      kicker: "Responsible disclosure / Public summary",
      title,
      subtitle: finding.class,
      status: finding.status,
      summary: finding.summary,
      sections: [
        { label: "Vulnerability class", body: finding.class },
        {
          label: "Recorded outcome",
          body: finding.bounty
            ? `${finding.status}. ${finding.bounty}.`
            : finding.status,
        },
        { label: "Disclosure context", body: disclosureNote },
      ],
      annotation: finding.bounty ?? finding.status,
      link: {
        href: `/security/${finding.slug}`,
        label: "Read the public disclosure record",
      },
    },
  };
});

export const swiftEvidence: EvidenceRecord = {
  id: swift.slug,
  kicker: "Open source / Security testing",
  title: swift.name,
  subtitle: "Multi-agent web application security testing",
  status: swift.status,
  summary:
    "An open-source platform of 12+ specialised agents covering reconnaissance, vulnerability hypotheses, validation and reporting for web application security testing.",
  sections: [
    {
      label: "Tool integration",
      body: "Integrates 99 security and reconnaissance tools in a reproducible Docker-based environment, with Python and Shell supporting the testing workflow.",
    },
    {
      label: "Validation engine",
      body: "A hypothesis-driven engine compares control and test results and applies a minimum 3/5 reproduction gate before a finding reaches the final report. Active testing requires explicit scope authorisation.",
    },
    {
      label: "Attack prioritisation",
      body: "Expected-value ranking directs testing toward hypotheses based on probability, impact, exploit-chain potential and testing cost.",
    },
    {
      label: "Coverage and audit controls",
      body: "Coverage tracking, audit logging, SARIF reporting and authorisation controls make the testing process traceable.",
    },
  ],
  annotation: "A reported finding needs reproducible evidence.",
  link: { href: `/projects/${swift.slug}`, label: "Read the project details" },
};

export const motionStudyContent = {
  motionIdentity,
  journeyEvidence,
  findingEvidence,
  swiftEvidence,
};
