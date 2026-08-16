import { Container, ExternalLink } from "@/components/primitives";
import { credentials, education } from "@/content/career";

/** Plain, no card chrome — a certificate does not need a border to be true. */
export function Credentials() {
  return (
    <section
      id="credentials"
      aria-labelledby="credentials-heading"
      className="py-[var(--section-y)]"
    >
      <Container width="wide">
        <h2 id="credentials-heading" className="sr-only">
          Certifications and education
        </h2>

        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="t-caption">Certification</p>
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

          <div>
            <p className="t-caption">Education</p>
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
