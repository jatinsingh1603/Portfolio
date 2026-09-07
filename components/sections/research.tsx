import Link from "next/link";
import {
  Button,
  Panel,
  Reveal,
  SeverityTag,
  Station,
} from "@/components/primitives";
import { publicFindings, withheldCount } from "@/content/findings";
import type { Finding } from "@/content/schema";
import { disclosurePolicy } from "@/content/site";

/** UI labels for the disclosure basis — never a fact about the person. */
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
 * Station 04. The disclosure ledger: only publicFindings ever render, and only
 * organisation / class / severity / status / basis / bounty — never an
 * endpoint, payload or reproduction step. A table on desktop, stacked cards on
 * phones, both driven off the same governance-gated list.
 */
export function Research() {
  return (
    <Station
      index={4}
      id="research"
      eyebrow="Security research"
      title="The disclosure ledger."
      lede={disclosurePolicy}
      zone="teal"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-[var(--border-strong)] pb-4">
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
                <td className="t-small">
                  {basisLabel(f.disclosure)}
                  {f.evidence ? (
                    <>
                      {" "}
                      <a
                        href={f.evidence.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${f.evidence.label} (opens in a new tab)`}
                        className="t-label whitespace-nowrap text-[var(--accent)] underline-offset-4 hover:underline"
                      >
                        Evidence ↗
                      </a>
                    </>
                  ) : null}
                </td>
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
              <h3 className="t-h3 mt-3">{f.org}</h3>
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

      <div className="mt-10">
        <Button href="/security" variant="ghost">
          Full record and policy
        </Button>
      </div>
    </Station>
  );
}
