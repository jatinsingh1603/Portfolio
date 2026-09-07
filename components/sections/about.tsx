import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Panel, Reveal, Station } from "@/components/primitives";
import { about } from "@/content/about";
import { brand } from "@/content/brand";
import { positioning, recognitions } from "@/content/site";

/**
 * Station 02. The argument first — the three-beat thesis, each claim linking to
 * the place on the page that evidences it — then the record itself as a
 * two-column register of chapters, what the work is pointed at now, and the
 * four organisations that have accepted a report. No photo exists; none is
 * designed around.
 */
export function About() {
  return (
    <Station
      index={2}
      id="about"
      eyebrow="About"
      title="I don't just use the tools. I build the systems."
      lede={positioning.intro}
      zone="teal"
    >
      {/* The three-beat thesis: each pair is one claim, linked to its proof. */}
      <ul className="grid gap-8 md:grid-cols-3">
        {brand.thesis.map((beat, i) => (
          <Reveal
            key={beat.anchor}
            as="li"
            delay={i * 60}
            className="reveal-rotate flex flex-col"
          >
            <p className="t-body text-[var(--text-tertiary)]">{beat.dont}</p>
            <p className="mt-2 flex items-baseline gap-3">
              <span
                aria-hidden="true"
                className="t-data shrink-0 text-[var(--accent)]"
              >
                &rarr;
              </span>
              <span className="t-h3">{beat.do}</span>
            </p>
            <Link
              href={beat.anchor}
              className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 self-start text-[var(--accent)] transition-colors duration-[var(--dur-micro)] hover:text-[var(--accent-hover)]"
            >
              <span className="t-label !text-[var(--accent)]">
                See the proof
              </span>
              <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </Reveal>
        ))}
      </ul>

      {/* The record: chapters as a two-column register that reveals in sequence. */}
      <dl className="mt-16 md:mt-20">
        {about.chapters.map((chapter, i) => (
          <Reveal
            key={chapter.id}
            as="div"
            delay={Math.min(i, 5) * 60}
            className="grid gap-2 border-t border-[var(--border)] py-6 first:border-t-0 first:pt-0 md:grid-cols-[10rem_1fr] md:gap-10"
          >
            <dt className="t-label pt-1">{chapter.label}</dt>
            <dd className="t-body">{chapter.text}</dd>
          </Reveal>
        ))}
      </dl>

      <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-2 md:gap-12">
        {/* Current focus. */}
        <Reveal>
          <Panel className="p-6 md:p-8">
            <h3 className="t-label">Current focus</h3>
            <ul className="mt-5 flex flex-col gap-3">
              {about.focus.map((item) => (
                <li key={item} className="flex items-baseline gap-3">
                  <span
                    aria-hidden="true"
                    className="t-data shrink-0 text-[var(--accent)]"
                  >
                    &rarr;
                  </span>
                  <span className="t-mono">{item}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>

        {/* Recognition strip — text only, never logos. */}
        <Reveal delay={60}>
          <h3 className="t-label">Recognition</h3>
          <ul className="mt-5">
            {recognitions.map((entry) => (
              <li
                key={entry.org}
                className="grid gap-1 border-t border-[var(--border)] py-5 first:border-t-0 first:pt-0 sm:grid-cols-[8rem_1fr] sm:gap-6"
              >
                <p className="t-h3">{entry.org}</p>
                <p className="t-small text-[var(--text-secondary)]">
                  {entry.detail}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Station>
  );
}
