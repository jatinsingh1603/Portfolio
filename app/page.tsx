/**
 * Phase 0 holding page. Replaced wholesale in Phase 4 by the real home page
 * sections; it exists so the scaffold, tokens and theme script are verifiable
 * on localhost at CHECKPOINT 1.
 */
export default function Home() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-[88vh] max-w-[var(--container)] flex-col justify-center px-[var(--gutter)]"
    >
      <p className="t-caption">Phase 0 · scaffold</p>
      <h1 className="t-display mt-4">Jatin Kumar Singh</h1>
      <p className="t-intro mt-6">
        Information Security Analyst. This is the build scaffold — design
        tokens, theme switching and security headers are live; content and
        sections land in later phases.
      </p>
      <div className="mt-10 flex flex-wrap gap-2">
        {[
          "CRTP",
          "CERT-In Recognized",
          "Google Bug Hunter",
          "Kraken Bounty",
        ].map((chip) => (
          <span
            key={chip}
            className="t-caption rounded-[var(--radius-chip)] border border-[var(--border)] px-3 py-1.5"
          >
            {chip}
          </span>
        ))}
      </div>
      <p className="t-mono mt-16 text-[var(--text-tertiary)]">
        /styleguide · /security · /resume · /contact
      </p>
    </main>
  );
}
