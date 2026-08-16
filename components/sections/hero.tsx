import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { ArrowDown, Download } from "lucide-react";
import { Button, Chip, Container, ExternalLink } from "@/components/primitives";
import { RotatingWord } from "@/components/rotating-word";
import { awards } from "@/content/career";
import { publicFindings } from "@/content/findings";
import { profiles } from "@/content/profiles";
import { credibilityChips, identity, positioning } from "@/content/site";

/**
 * Evaluated at build time. If the headshot has not been added yet the hero
 * renders as a single full-measure column — a legitimate layout rather than a
 * broken image — and picks up the 7/5 split automatically once the file lands.
 */
const hasHeadshot = existsSync(
  path.join(process.cwd(), "public", identity.headshot.replace(/^\//, "")),
);

/** The three a recruiter actually opens next, in that order. */
const HERO_PROFILE_PLATFORMS = ["GitHub", "LinkedIn", "X"];
const heroProfiles = HERO_PROFILE_PLATFORMS.map((name) =>
  profiles.find((p) => p.platform === name),
).filter((p) => p !== undefined);

/**
 * Derived from the content layer, never typed in — so the hero can never claim
 * a number the rest of the page does not substantiate. If a finding is
 * withheld, this count drops with it.
 */
const stats = [
  { value: publicFindings.length, label: "findings reported" },
  {
    value: new Set(publicFindings.map((f) => f.org)).size,
    label: "organisations",
  },
  { value: awards.length, label: "competition placements" },
];

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      /* 88vh, not 100vh: the fold should promise a next section, not hide it. */
      /* No entrance animation. A fade here costs its own duration in LCP,
         because Chrome will not count text as painted while it is transparent —
         and the hero is the largest contentful paint on every viewport. */
      className="ground-hero flex min-h-[88vh] items-center py-24"
    >
      <Container width="wide">
        <div
          className={
            hasHeadshot
              ? "grid items-center gap-16 lg:grid-cols-12"
              : "grid gap-16"
          }
        >
          {/* With a portrait the 7/5 split is balanced. Without one, the same
              left-aligned column leaves half the viewport empty and the page
              reads as if it is falling off the left edge — so it centres. */}
          <div className={hasHeadshot ? "lg:col-span-7" : "text-center"}>
            <p className="t-caption">
              {identity.title} · {identity.location}
            </p>

            <h1 id="hero-heading" className="t-display mt-5">
              {/* The rotation is decorative repetition of one word, so assistive
                  tech gets the sentence once, statically, and never hears it
                  swap. */}
              <span className="sr-only">Break the control. Prove the fix.</span>
              {/* The rotating word sits inline so the line still reads as the
                  sentence it is: "Break the control." — not as three fragments
                  stacked on top of each other. */}
              <span aria-hidden="true" className="block">
                <span className="block">
                  Break the{" "}
                  <RotatingWord
                    words={positioning.headlineRotating}
                    suffix="."
                  />
                </span>
                <span className="block">Prove the fix.</span>
              </span>
            </h1>

            <p className={`t-intro mt-7 ${hasHeadshot ? "" : "mx-auto"}`}>
              {positioning.intro}
            </p>

            <ul
              className={`mt-9 flex flex-wrap gap-2 ${hasHeadshot ? "" : "justify-center"}`}
            >
              {credibilityChips.map((chip) => (
                <li key={chip}>
                  <Chip>{chip}</Chip>
                </li>
              ))}
            </ul>

            <div
              className={`mt-10 flex flex-wrap gap-3 ${hasHeadshot ? "" : "justify-center"}`}
            >
              <Button href="#research">
                View security research
                <ArrowDown size={18} strokeWidth={1.5} aria-hidden="true" />
              </Button>
              <Button href={identity.resumePdf} variant="secondary" download>
                <Download size={18} strokeWidth={1.5} aria-hidden="true" />
                Download résumé
              </Button>
            </div>

            {/* A recruiter's second click is almost always the GitHub or
                LinkedIn profile. Burying them at the bottom of the page costs a
                scroll for no reason. */}
            <ul
              className={`mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 ${hasHeadshot ? "" : "justify-center"}`}
            >
              {heroProfiles.map((profile) => (
                <li key={profile.url}>
                  <ExternalLink
                    href={profile.url}
                    label={`${profile.platform} profile`}
                    className="t-small !text-[var(--text-secondary)] hover:!text-[var(--text)]"
                  >
                    {profile.platform}
                  </ExternalLink>
                </li>
              ))}
            </ul>

            {/* Fills the lower hero with something verifiable rather than
                decoration. Each figure is counted from the data that renders
                further down the page. */}
            <dl
              className={`mt-16 flex flex-wrap gap-x-12 gap-y-6 ${hasHeadshot ? "" : "justify-center"}`}
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="t-h2 block">{stat.value}</span>
                    <span
                      className="t-caption mt-1 block tracking-[0.08em] uppercase"
                      aria-hidden="true"
                    >
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {hasHeadshot ? (
            <div className="lg:col-span-5">
              {/* The offset plate is the only compositional flourish on the
                  page: a subtle wash rectangle behind the portrait, not a ring,
                  glow or gradient. */}
              <div className="relative mx-auto w-full max-w-[420px]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 translate-x-6 translate-y-6 rounded-[var(--radius-surface)] bg-[var(--bg-subtle)]"
                />
                <Image
                  src={identity.headshot}
                  alt={identity.headshotAlt}
                  width={1254}
                  height={1254}
                  priority
                  sizes="(min-width: 1024px) 420px, (min-width: 640px) 60vw, 90vw"
                  className="relative rounded-[var(--radius-surface)] border border-[var(--border)]"
                />
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
