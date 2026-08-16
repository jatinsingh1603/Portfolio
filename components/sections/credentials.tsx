import {
  Container,
  ExternalLink,
  SectionHeader,
} from "@/components/primitives";
import { credentials, education } from "@/content/career";

/** Plain, no card chrome — a certificate does not need a border to be true. */
export function Credentials() {
  return (
    <section
      id="credentials"
      aria-labelledby="credentials-heading"
      className="ground-page py-[var(--section-y)]"
    >
      <Container width="wide">
        <SectionHeader
          id="credentials-heading"
          eyebrow="Background"
          title="Certified, and still studying."
        />

        <div className="mt-20 grid gap-6 md:grid-cols-2">
          <div className="material rounded-[var(--radius-surface)] p-8">
            <p className="t-caption tracking-[0.08em] uppercase">
              Certification
            </p>
            {credentials.map((credential) => (
              <div key={credential.name} className="mt-4">
                <h3 className="t-h3">{credential.name}</h3>
                <p className="t-body mt-2 text-[var(--text-secondary)]">
                  {credential.issuer}
                </p>
                {credential.detail ? (
                  <p className="t-small mt-2 text-[var(--text-secondary)]">
                    {credential.detail}
                  </p>
                ) : null}
                {credential.verifyUrl ? (
                  <p className="t-small mt-3">
                    <ExternalLink
                      href={credential.verifyUrl}
                      label={`${credential.name} credential verification`}
                    >
                      Verify credential
                    </ExternalLink>
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="material rounded-[var(--radius-surface)] p-8">
            <p className="t-caption tracking-[0.08em] uppercase">Education</p>
            <div className="mt-4">
              <h3 className="t-h3">{education.degree}</h3>
              <p className="t-body mt-2 text-[var(--text-secondary)]">
                {education.institution}
              </p>
              <p className="t-mono mt-2 text-[var(--text-tertiary)]">
                {education.start}–{education.end} · {education.detail}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
