import type { Metadata } from "next";
import { Chip, Container } from "@/components/primitives";
import { publicFindings, withheldCount } from "@/content/findings";
import { disclosurePolicy, identity } from "@/content/site";

export const metadata: Metadata = {
  title: "Security research",
  description:
    "Disclosure record: findings reported through vendor programmes and a national CERT, with technical detail withheld where programme terms require it.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <main id="main" className="py-20">
      <Container width="wide">
        <p className="t-caption">Security research</p>
        <h1 className="t-h1 mt-3 max-w-[20ch]">Disclosure record</h1>
        <p className="t-intro mt-6">
          Every finding below went to the vendor&rsquo;s own channel or to a
          national CERT. What is published here is the organisation, the
          vulnerability class and the current status — nothing that would help
          someone reproduce an issue that may still be live.
        </p>
      </Container>

      <Container width="wide" className="mt-16">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Disclosure record: reference, organisation, vulnerability class,
              severity and status.
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
                  Finding
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
                  className="border-b border-[var(--border)] transition-colors duration-[var(--dur-micro)] hover:bg-[color-mix(in_oklab,var(--text)_3%,transparent)]"
                >
                  <th
                    scope="row"
                    className="t-mono py-6 pr-6 align-top font-normal whitespace-nowrap text-[var(--text-tertiary)]"
                  >
                    {finding.id}
                  </th>
                  <td className="py-6 pr-6 align-top font-medium whitespace-nowrap">
                    {finding.org}
                  </td>
                  <td className="max-w-[46ch] py-6 pr-6 align-top">
                    <p className="t-small">{finding.summary}</p>
                    <p className="t-caption mt-2">{finding.class}</p>
                    {finding.disclosure.public && finding.disclosure.note ? (
                      <p className="t-caption mt-2 text-[var(--text-secondary)]">
                        {finding.disclosure.note}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-6 pr-6 align-top">
                    <Chip tone={finding.severity}>{finding.severity}</Chip>
                  </td>
                  <td className="t-small py-6 align-top">
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
      </Container>

      <Container width="text" className="mt-20">
        <h2 className="t-h3">Disclosure policy</h2>
        <p className="t-body mt-3 text-[var(--text-secondary)]">
          {disclosurePolicy}
        </p>
        {withheldCount > 0 ? (
          <p className="t-body mt-4 text-[var(--text-secondary)]">
            {withheldCount} further{" "}
            {withheldCount === 1 ? "finding is" : "findings are"} not listed
            here. They are held back because the testing authorisation or the
            programme&rsquo;s disclosure approval has not been confirmed in
            writing — not because the reports do not exist.
          </p>
        ) : null}
        <p className="t-body mt-4 text-[var(--text-secondary)]">
          If you are running a programme and want a report resent, or you want
          something on this page corrected or removed, email{" "}
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
