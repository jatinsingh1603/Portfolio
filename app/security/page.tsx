import type { Metadata } from "next";
import Link from "next/link";
import {
  Container,
  Panel,
  Reveal,
  Rule,
  SeverityTag,
} from "@/components/primitives";
import { publicFindings, withheldCount } from "@/content/findings";
import type { Finding } from "@/content/schema";
import { disclosurePolicy, identity } from "@/content/site";

export const metadata: Metadata = {
  title: "Security research",
  description:
    "The disclosure record: every finding reported through a vendor channel or a national CERT, with the basis on which it is published and the detail that is withheld.",
  alternates: { canonical: "/security" },
};

/** UI label for the disclosure basis — a heading, never a fact about a person. */
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

/** A bounty value when one was awarded; otherwise an em dash read as "none". */
function Bounty({ bounty }: { bounty?: string }) {
  if (bounty) return <>{bounty}</>;
  return (
    <>
      <span aria-hidden="true">—</span>
      <span className="sr-only">none</span>
    </>
  );
}

/** The reference cell links to the finding sheet when a cleared writeup exists. */
function RefCell({ id, slug }: { id: string; slug?: string }) {
  if (slug) {
    return (
      <Link
        href={`/security/${slug}`}
        className="t-data text-[var(--accent)] underline-offset-4 hover:underline"
      >
        {id}
      </Link>
    );
  }
  return <span className="t-data">{id}</span>;
}

/**
 * /security — the full disclosure record and the policy behind it. Only
 * publicFindings ever render, and only organisation / class / severity /
 * status / basis / bounty: never an endpoint, payload or reproduction step.
 */
export default function SecurityRecordPage() {
  return (
    <main id="main" className="pt-32 pb-24">
      <Container width="wide">
        <Reveal>
          <p className="t-label">Disclosure record</p>
          <h1 className="t-h1 mt-5 max-w-[20ch]">The disclosure ledger.</h1>
          <p className="t-lede mt-5">{disclosurePolicy}</p>
          <Rule ticked className="mt-8" />
        </Reveal>

        <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-[var(--border-strong)] pb-4">
          <p className="t-label">Details withheld per programme terms</p>
          <p className="t-data text-[var(--text-tertiary)]">
            {publicFindings.length} records <span aria-hidden="true">·</span>{" "}
            {withheldCount} withheld
          </p>
        </div>

        {/* Desktop: the ledger table, scrolling within itself on narrow desktops. */}
        <div className="scroll-x mt-6 hidden md:block">
          <table className="ledger w-full">
            <caption className="sr-only">
              Public security disclosure records
            </caption>
            <thead>
              <tr>
                <th scope="col">Ref</th>
                <th scope="col">Organisation</th>
                <th scope="col">Class</th>
                <th scope="col">Severity</th>
                <th scope="col">Status</th>
                <th scope="col">Basis</th>
                <th scope="col">Bounty</th>
              </tr>
            </thead>
            <tbody>
              {publicFindings.map((f, i) => (
                <Reveal as="tr" key={f.id} delay={Math.min(i, 5) * 60}>
                  <td>
                    <RefCell id={f.id} slug={f.slug} />
                  </td>
                  <td className="t-small">{f.org}</td>
                  <td className="t-small text-secondary">{f.class}</td>
                  <td>
                    <SeverityTag severity={f.severity} />
                  </td>
                  <td className="t-small">{f.status}</td>
                  <td className="t-small">{basisLabel(f.disclosure)}</td>
                  <td className="t-data">
                    <Bounty bounty={f.bounty} />
                  </td>
                </Reveal>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: the same fields as stacked cards. */}
        <ul className="perspective mt-6 grid gap-4 md:hidden">
          {publicFindings.map((f, i) => (
            <Reveal
              as="li"
              key={f.id}
              delay={Math.min(i, 5) * 60}
              className="reveal-rotate"
            >
              <Panel className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <RefCell id={f.id} slug={f.slug} />
                  <SeverityTag severity={f.severity} />
                </div>
                <p className="t-h3 mt-3">{f.org}</p>
                <p className="t-small text-secondary mt-1">{f.class}</p>
                <dl className="register mt-4">
                  <div>
                    <dt className="t-label pt-0.5">Status</dt>
                    <dd className="t-small">{f.status}</dd>
                  </div>
                  <div>
                    <dt className="t-label pt-0.5">Basis</dt>
                    <dd className="t-small">{basisLabel(f.disclosure)}</dd>
                  </div>
                  {f.bounty ? (
                    <div>
                      <dt className="t-label pt-0.5">Bounty</dt>
                      <dd className="t-small">{f.bounty}</dd>
                    </div>
                  ) : null}
                </dl>
              </Panel>
            </Reveal>
          ))}
        </ul>
      </Container>

      <Container width="text" className="mt-20">
        <Reveal>
          <h2 className="t-h3">What is published</h2>
          <p className="t-body text-secondary mt-4">
            Each record names six things and no more: the organisation, the
            vulnerability class in vendor-neutral language, the severity, the
            current status, the basis on which it may be disclosed, and a bounty
            where one was actually awarded. That is enough to verify the work
            without handing anyone a recipe.
          </p>
        </Reveal>

        <Reveal>
          <h2 className="t-h3 mt-14">What is withheld, and why</h2>
          <p className="t-body text-secondary mt-4">
            No endpoint, payload, parameter, screenshot or reproduction step is
            published for anything that is not confirmed fixed. Where a
            programme&rsquo;s terms restrict disclosure, the impact wording is
            withheld until that programme approves it in writing. The point of a
            responsible disclosure is that it is not weaponised on the way to
            being resolved.
          </p>
        </Reveal>

        <Reveal>
          <h2 className="t-h3 mt-14">Basis for publishing</h2>
          <p className="t-body text-secondary mt-4">
            Nothing appears here without a reason it may. There are three:{" "}
            <strong className="font-medium text-[var(--text)]">
              Programme permits
            </strong>{" "}
            — the organisation runs a coordinated disclosure or bug bounty
            programme whose terms allow the existence of a report to be stated;{" "}
            <strong className="font-medium text-[var(--text)]">
              Vendor approved
            </strong>{" "}
            — testing was carried out under written authorisation and the owner
            has confirmed the finding may be listed; and{" "}
            <strong className="font-medium text-[var(--text)]">
              Publicly acknowledged
            </strong>{" "}
            — a national CERT or the vendor has already issued a public
            acknowledgement, so the finding&rsquo;s existence is a matter of
            record. Technical detail stays withheld under all three.
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
