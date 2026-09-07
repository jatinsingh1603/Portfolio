import {
  awards,
  capabilities,
  credentials,
  education,
  roles,
} from "../content/career";
import { sameAs } from "../content/profiles";
import { SITE_URL, identity } from "../content/site";

/**
 * Serialised once and shared by app/layout.tsx (which renders it) and
 * next.config.ts (which hashes it for `script-src`). Imported with relative
 * paths because next.config.ts is loaded outside the tsconfig path aliases.
 */
export const personJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: identity.name,
  jobTitle: identity.title,
  email: `mailto:${identity.email}`,
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    addressLocality: identity.location,
    addressCountry: "IN",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: education.institution,
  },
  worksFor: roles.map((role) => ({
    "@type": "Organization",
    name: role.company,
  })),
  knowsAbout: capabilities.flatMap((group) => group.items),
  hasCredential: credentials.map((credential) => ({
    "@type": "EducationalOccupationalCredential",
    name: credential.name,
    credentialCategory: "certification",
    recognizedBy: { "@type": "Organization", name: credential.issuer },
  })),
  award: awards.map(
    (a) =>
      `${a.placement}, ${a.event} (${a.organiser}${a.venue ? `, ${a.venue}` : ""})`,
  ),
  sameAs,
});
