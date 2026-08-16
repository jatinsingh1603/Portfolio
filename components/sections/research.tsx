import Link from "next/link";
import { Chip, Container, SectionHeader } from "@/components/primitives";
import { publicFindings, withheldCount } from "@/content/findings";
import { disclosurePolicy } from "@/content/site";

/**
 * A real table, not a div grid — the data is genuinely tabular and a screen
 * reader user should be able to navigate it by column. Density is the point:
 * this is the section that has to read as substantive.
 */
export function Research() {
  return (
    <section
      id="research"
      aria-labelledby="research-heading"
      className="ground-raised py-[var(--section-y)]"
    >
      <Container width="wide">
        <SectionHeader
          id="research-heading"
          eyebrow="Security research"
          title={
            <>
              Reported through the vendor&rsquo;s channel, or a national CERT.
            </>
          }
          intro="Organisation, class and status. Reproduction detail is withheld wherever a programme requires it or a fix is not confirmed deployed."
        />

        <div className="mt-20 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Disclosure record: organisation, vulnerability class, severity and
              current status for each publicly listed finding.
            </caption>
            <thead>
              <tr className="border-b border-[var(--border-strong)]">
                <th scope="col" className="t-caption py-3 pr-6 font-medium">
                  Ref
                </th>
                <th scope="col" className="t-caption py-3 pr-6 font-medium">
                  Organisation
                </th>
                <th scope="col" className="t-caption py-3 pr-6 font-medium">
                  Class
                </th>
                <th scope="col" className="t-caption py-3 pr-6 font-medium">
                  Severity
                </th>
                <th scope="col" className="t-caption py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {publicFindings.map((finding) => (
                <tr
                  key={finding.id}
                  className="relative border-b border-[var(--border)] transition-colors duration-[var(--dur-micro)] hover:bg-[color-mix(in_oklab,var(--text)_4%,transparent)]"
                >
                  <th
                    scope="row"
                    className="t-mono py-5 pr-6 align-top font-normal whitespace-nowrap text-[var(--text-tertiary)]"
                  >
                    {finding.id}
                  </th>
                  <td className="py-5 pr-6 align-top font-medium whitespace-nowrap">
                    {finding.slug ? (
                      <Link
                        href={`/security/${finding.slug}`}
                        /* The anchor covers the row via ::after, so the whole
                           row is the target while the accessible name stays
                           just the organisation. */
                        className="after:absolute after:inset-0 after:content-['']"
                      >
                        {finding.org}
                      </Link>
                    ) : (
                      finding.org
                    )}
                  </td>
                  <td className="t-small max-w-[36ch] py-5 pr-6 align-top text-[var(--text-secondary)]">
                    {finding.class}
                  </td>
                  <td className="py-5 pr-6 align-top">
                    <Chip tone={finding.severity}>{finding.severity}</Chip>
                  </td>
                  <td className="t-small py-5 align-top">
                    {finding.status}
                    {finding.bounty ? (
                      <span className="mt-1 block font-medium">
                        {finding.bounty}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Body type, not a warning box. The restraint is the credibility. */}
        <div className="mx-auto mt-16 max-w-[var(--container-text)] text-center">
          <h3 className="t-h3">Disclosure policy</h3>
          <p className="t-body mt-3 text-[var(--text-secondary)]">
            {disclosurePolicy}
          </p>
          {withheldCount > 0 ? (
            <p className="t-small mt-4 text-[var(--text-tertiary)]">
              {withheldCount} further{" "}
              {withheldCount === 1 ? "finding is" : "findings are"} held back
              from this list pending authorisation or disclosure approval.
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
