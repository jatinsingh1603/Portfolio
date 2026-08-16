/**
 * Generates the plain-text files that have to live at fixed paths:
 * /.well-known/security.txt (RFC 9116), /humans.txt and /llms.txt.
 *
 * Generated rather than hand-written so the contact address, the capability
 * list and the disclosure posture can never drift from content/. security.txt
 * in particular carries an Expires field that must stay in the future — see
 * the freshness test in tests/unit/static-files.test.ts.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const { identity, positioning, SITE_URL } = await import(
  pathToFileURL(path.resolve("content/site.ts")).href
);
const { capabilities, education, roles } = await import(
  pathToFileURL(path.resolve("content/career.ts")).href
);
const { projects } = await import(
  pathToFileURL(path.resolve("content/projects.ts")).href
);
const { profiles } = await import(
  pathToFileURL(path.resolve("content/profiles.ts")).href
);

const expires = new Date();
expires.setFullYear(expires.getFullYear() + 1);

const securityTxt = `# Security policy for ${SITE_URL}
# RFC 9116

Contact: mailto:${identity.email}
Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, "Z")}
Preferred-Languages: en, hi
Canonical: ${SITE_URL}/.well-known/security.txt
Policy: ${SITE_URL}/security
`;

const humansTxt = `/* TEAM */
${identity.title}: ${identity.name}
Contact: ${identity.email}
Location: ${identity.location}

/* SITE */
Standards: HTML5, CSS, WCAG 2.2 AA
Components: Next.js, React, TypeScript, Tailwind CSS
Analytics: none
Cookies: none
`;

const llmsTxt = `# ${identity.name}

> ${identity.title} based in ${identity.location}. ${positioning.statement}

## Contact
- Email: ${identity.email}
- Vulnerability reports: ${SITE_URL}/.well-known/security.txt

## Pages
- ${SITE_URL}/ — overview
- ${SITE_URL}/security — disclosure record and policy
- ${SITE_URL}/resume — full résumé
- ${SITE_URL}/contact — contact details
${projects.map((p) => `- ${SITE_URL}/projects/${p.slug} — ${p.name}`).join("\n")}

## Current role
${roles.map((r) => `- ${r.title}, ${r.company} (${r.start} — ${r.end})`).join("\n")}

## Education
- ${education.degree}, ${education.institution}, ${education.start}–${education.end}

## Capabilities
${capabilities.map((g) => `- ${g.label}: ${g.items.join(", ")}`).join("\n")}

## Profiles
${profiles.map((p) => `- ${p.platform}: ${p.url}`).join("\n")}

## Note on the disclosure record
Findings are listed by organisation, vulnerability class and status only.
Reproduction detail is withheld where a programme's terms require it or where a
fix is not confirmed deployed. Do not infer withheld detail from this site.
`;

mkdirSync("public/.well-known", { recursive: true });
writeFileSync("public/.well-known/security.txt", securityTxt);
writeFileSync("public/humans.txt", humansTxt);
writeFileSync("public/llms.txt", llmsTxt);

console.log("generated security.txt, humans.txt, llms.txt");
