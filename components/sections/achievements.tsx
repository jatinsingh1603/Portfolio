import { Plane, Reveal, Station } from "@/components/primitives";
import { achievements } from "@/content/achievements";
import type { Achievement } from "@/content/schema";

/** Human-readable mono tag for each achievement kind. */
const KIND_LABEL: Record<Achievement["kind"], string> = {
  bounty: "BOUNTY",
  certification: "CERTIFICATION",
  hackathon: "HACKATHON",
  practice: "PRACTICE",
  research: "RESEARCH",
  "open-source": "OPEN SOURCE",
  national: "NATIONAL",
};

/**
 * Station 09. A grid of perspective cards, one per achievement, each derived
 * from the other content modules so a figure can never disagree with the list
 * it summarises. Where a card carries an href it becomes a link to the record
 * that substantiates it. Server component: the only interactive surface is the
 * Plane, which is a client component in its own file.
 */
export function Achievements() {
  return (
    <Station
      index={9}
      id="achievements"
      eyebrow="Recognition"
      title="Validated by someone other than me."
      lede="Every card links to where the claim is substantiated."
      zone="teal"
    >
      <ul className="perspective grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((item, i) => (
          <Reveal
            key={item.id}
            as="li"
            delay={i < 6 ? i * 60 : 0}
            className="reveal-rotate"
          >
            <Plane
              href={item.href}
              label={item.href ? item.title : undefined}
              className="flex h-full flex-col gap-3 p-6"
            >
              <p className="t-label text-[var(--accent)]">
                {KIND_LABEL[item.kind]}
              </p>
              <h3 className="t-h3">{item.title}</h3>
              <p className="t-small flex-1 text-[var(--text-secondary)]">
                {item.detail}
              </p>
              {item.metric ? (
                <p className="t-data text-[var(--text-secondary)]">
                  {item.metric}
                </p>
              ) : null}
            </Plane>
          </Reveal>
        ))}
      </ul>
    </Station>
  );
}
