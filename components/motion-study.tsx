"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { BrandMark } from "@/components/brand-mark";
import type { EvidenceRecord } from "@/components/evidence-sheet";
import type { motionStudyContent } from "@/content/motion-study";
import { caseMusic } from "@/content/music";

const EvidenceSheet = dynamic(
  () =>
    import("@/components/evidence-sheet").then(
      (module) => module.EvidenceSheet,
    ),
  { ssr: false },
);
const CaseSoundtrack = dynamic(
  () =>
    import("@/components/case-soundtrack").then(
      (module) => module.CaseSoundtrack,
    ),
  {
    ssr: false,
    loading: () => (
      <button className="ms-sound-button" disabled>
        Sound off
      </button>
    ),
  },
);

import {
  chapterAt,
  chapterStops,
  clamp,
  exposure,
  segment,
  smooth,
} from "@/lib/case-choreography";

const words = ["SECURITY", "RESEARCH", "AUTOMATE", "CASEFILE"];
const chapters = ["The lock", "The journey", "The evidence", "The systems"];
type ReadingPosition = number | "contact";
const cue = (type: string) =>
  window.dispatchEvent(new CustomEvent("case:cue", { detail: { type } }));

export function MotionStudy({
  content,
}: {
  content: typeof motionStudyContent;
}) {
  const { motionIdentity, journeyEvidence, findingEvidence, swiftEvidence } =
    content;
  const sequence = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [compact, setCompact] = useState(false);
  const [still, setStill] = useState(false);
  const [finding, setFinding] = useState(0);
  const [hasOpenedFolder, setHasOpenedFolder] = useState(false);
  const [opened, setOpened] = useState<{
    evidence: EvidenceRecord;
    origin: DOMRect;
  } | null>(null);
  const staticMode = reduced || still || compact;
  const nextModeChapter = useRef<ReadingPosition | null>(null);
  const readingPosition = useRef<ReadingPosition>(0);
  const latestMode = useRef({ staticMode, still });
  const initialHashApplied = useRef(false);
  const activeRecord =
    chapter === 1
      ? journeyEvidence
      : chapter === 2
        ? findingEvidence[finding]!.evidence
        : swiftEvidence;
  const selectedFinding = findingEvidence[finding]!;

  useEffect(() => {
    latestMode.current = { staticMode, still };
  }, [staticMode, still]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shortViewport = window.matchMedia("(max-height: 480px)");
    const update = () => {
      setReduced(media.matches);
      setCompact(shortViewport.matches);
    };
    const onMediaChange = () => {
      const nextStaticMode =
        media.matches || shortViewport.matches || latestMode.current.still;
      if (
        initialHashApplied.current &&
        nextStaticMode !== latestMode.current.staticMode
      ) {
        // Remember the last reading position before the viewport changes its
        // layout. Recomputing it here would use the new viewport's geometry.
        nextModeChapter.current = readingPosition.current;
      }
      update();
    };
    update();
    media.addEventListener("change", onMediaChange);
    shortViewport.addEventListener("change", onMediaChange);
    return () => {
      media.removeEventListener("change", onMediaChange);
      shortViewport.removeEventListener("change", onMediaChange);
    };
  }, []);

  useEffect(() => {
    if (opened) return;
    const element = sequence.current;
    const screen = stage.current;
    if (!element || !screen) return;
    let frame = 0;
    let previousChapter = -1;
    let lastTick = -1;
    let unlocked = false;
    let start = 0;
    let length = 1;
    const property = (name: string, value: string | number) =>
      screen.style.setProperty(name, String(value));
    const render = () => {
      frame = 0;
      const progress = clamp((window.scrollY - start) / length);
      let nextChapter = chapterAt(progress);
      if (staticMode) {
        nextChapter = 0;
        [1, 2, 3].forEach((index) => {
          const section = document.getElementById(`ms-static-${index}`);
          if (
            section &&
            section.getBoundingClientRect().top < window.innerHeight * 0.45
          )
            nextChapter = index;
        });
      }
      const contact = document
        .getElementById("ms-contact")
        ?.getBoundingClientRect();
      readingPosition.current =
        contact && contact.top < window.innerHeight * 0.5 && contact.bottom > 0
          ? "contact"
          : nextChapter;
      if (nextChapter !== previousChapter) {
        if (previousChapter >= 0 && nextChapter > 0) cue("transition");
        previousChapter = nextChapter;
        setChapter(nextChapter);
      }
      property("--progress", progress);
      if (staticMode) return;
      const unfold = smooth(segment(progress, 0.13, 0.28));
      const move = smooth(segment(progress, 0.23, 0.4));
      property("--darkness", smooth(segment(progress, 0.16, 0.31)));
      property("--intro-opacity", 1 - smooth(segment(progress, 0.11, 0.2)));
      property("--intro-y", `${-segment(progress, 0, 0.22) * 45}px`);
      property("--case-scale", 1 - unfold * 0.16 - move * 0.12);
      property("--case-x", `${-move * 8}vw`);
      property("--case-y", `${-unfold * 15}vh`);
      property("--case-angle", `${-unfold * 9}deg`);
      property("--case-tilt", `${unfold * 32}deg`);
      property("--cover-angle", `${-unfold * 118}deg`);
      property("--case-opacity", 1 - smooth(segment(progress, 0.27, 0.38)));
      property("--unlock", smooth(segment(progress, 0.105, 0.14)));
      property("--folder-opacity", smooth(segment(progress, 0.27, 0.35)));
      property("--folder-scale", 0.6 + move * 0.4);
      property("--folder-x", `${move * 24}vw`);
      property(
        "--folder-y",
        `${(1 - move) * 15 + Math.sin(progress * Math.PI * 4) * 1.6}vh`,
      );
      property(
        "--folder-rotate",
        `${-19 + move * 15 + Math.sin(progress * Math.PI * 5) * 4}deg`,
      );
      property("--folder-tilt", `${(1 - move) * 24}deg`);
      property("--thread-draw", smooth(segment(progress, 0.32, 0.95)));
      const spans = [
        [0.28, 0.55],
        [0.53, 0.79],
        [0.77, 1.08],
      ];
      spans.forEach(([a, b], i) => {
        const alpha = exposure(progress, a!, b!);
        property(`--copy-${i + 1}`, alpha);
        property(
          `--copy-y-${i + 1}`,
          `${(1 - smooth(segment(progress, a!, a! + 0.1))) * 70 - smooth(segment(progress, b! - 0.07, b!)) * 50}px`,
        );
      });
      screen
        .querySelectorAll<HTMLElement>(".ms-reel-track")
        .forEach((reel, i) => {
          const rolled = smooth(
            segment(progress, 0.012 + i * 0.006, 0.1 + i * 0.006),
          );
          reel.style.transform = `translateY(${-rolled * 75}%)`;
        });
      const tick = Math.floor(segment(progress, 0.02, 0.14) * 14);
      if (
        tick !== lastTick &&
        lastTick >= 0 &&
        progress > 0.02 &&
        progress < 0.14
      )
        cue("tick");
      lastTick = tick;
      if (progress > 0.14 && progress < 0.28 && !unlocked) {
        cue("unlock");
        unlocked = true;
      }
      if (progress < 0.08) unlocked = false;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const measure = () => {
      start = element.getBoundingClientRect().top + window.scrollY;
      length = Math.max(1, element.offsetHeight - window.innerHeight);
      schedule();
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
    };
  }, [staticMode, opened]);

  useEffect(() => {
    const requested = nextModeChapter.current;
    if (requested === null) return;
    nextModeChapter.current = null;
    const element = sequence.current;
    if (!element) return;
    const frame = requestAnimationFrame(() => {
      if (requested === "contact") {
        document
          .getElementById("ms-contact")
          ?.scrollIntoView({ behavior: "instant", block: "start" });
        return;
      }
      if (staticMode)
        document
          .getElementById(`ms-static-${requested}`)
          ?.scrollIntoView({ behavior: "instant", block: "start" });
      else
        window.scrollTo({
          top:
            element.getBoundingClientRect().top +
            window.scrollY +
            (element.offsetHeight - window.innerHeight) *
              chapterStops[requested]!,
          behavior: "instant",
        });
    });
    return () => cancelAnimationFrame(frame);
  }, [staticMode]);

  function goTo(index: number) {
    if (staticMode) {
      document
        .getElementById(`ms-static-${index}`)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }
    const element = sequence.current;
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top:
        top +
        (element.offsetHeight - window.innerHeight) * chapterStops[index]!,
      behavior: "smooth",
    });
  }
  useEffect(() => {
    let frame = 0;
    const chapterHashes: Record<string, number> = {
      "#about": 1,
      "#story": 1,
      "#ms-static-1": 1,
      "#research": 2,
      "#ms-static-2": 2,
      "#work": 3,
      "#ms-static-3": 3,
      "#hero-scroll": 0,
      "#main": 0,
    };
    const restoreChapter = () => {
      const hash = window.location.hash;
      if (hash === "#cyber-lab" || hash === "#ai-lab") {
        window.location.replace(`/labs/${hash}`);
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        initialHashApplied.current = true;
        if (hash === "#contact") {
          document
            .getElementById("ms-contact")
            ?.scrollIntoView({ behavior: "instant" });
          return;
        }
        const index = chapterHashes[hash];
        if (index === undefined) return;
        const element = sequence.current;
        if (!element) return;
        if (staticMode)
          document
            .getElementById(`ms-static-${index}`)
            ?.scrollIntoView({ behavior: "instant", block: "start" });
        else
          window.scrollTo({
            top:
              element.getBoundingClientRect().top +
              window.scrollY +
              (element.offsetHeight - window.innerHeight) *
                chapterStops[index]!,
            behavior: "instant",
          });
      });
    };
    if (!initialHashApplied.current) restoreChapter();
    window.addEventListener("hashchange", restoreChapter);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", restoreChapter);
    };
  }, [staticMode]);

  function openEvidence(
    event: MouseEvent<HTMLElement>,
    evidence: EvidenceRecord,
  ) {
    setHasOpenedFolder(true);
    setOpened({
      evidence,
      origin: event.currentTarget.getBoundingClientRect(),
    });
  }
  const closeEvidence = useCallback(() => setOpened(null), []);

  return (
    <main id="main" className={`motion-study ${staticMode ? "ms-static" : ""}`}>
      <header className="ms-header">
        <a
          href="#main"
          className="ms-wordmark"
          aria-label={`${motionIdentity.shortName}, back to opening`}
        >
          <BrandMark className="ms-brand-mark" />
          {motionIdentity.shortName.toUpperCase()}
        </a>
        <span className="ms-header-note">SECURITY. RESEARCH. AUTOMATION.</span>
        <nav className="ms-header-actions" aria-label="Quick links">
          <a href="/resume" className="ms-resume-link">
            Resume
          </a>
          <a href="#ms-contact" className="ms-contact-link">
            Let’s talk
          </a>
        </nav>
      </header>

      <div className="ms-sequence" ref={sequence}>
        <div className="ms-stage" ref={stage} data-chapter={chapter}>
          <div className="ms-dark-field" aria-hidden="true" />
          <div className="ms-vignette" aria-hidden="true" />
          <div className="ms-stage-progress" aria-hidden="true" />
          <svg
            className="ms-evidence-thread"
            viewBox="0 0 1440 900"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              pathLength="1"
              d="M -50 680 C 240 790, 130 330, 480 510 S 900 940, 970 370 S 1230 230, 1500 440"
            />
            <circle cx="970" cy="370" r="6" />
          </svg>

          <section className="ms-intro" aria-label="Opening" id="ms-static-0">
            <p className="ms-overline">SECURITY RESEARCH. AI & AUTOMATION.</p>
            <h1>{motionIdentity.shortName}.</h1>
            <p className="ms-intro-byline">{motionIdentity.title}</p>
          </section>

          <div className="ms-case-anchor" aria-hidden="true">
            <div className="ms-case">
              <div className="ms-case-interior">
                <div className="ms-case-insert">
                  <span>PERSONNEL FILE</span>
                  <strong>JKS</strong>
                  <p>SECURITY RESEARCH & AUTOMATION</p>
                  <div className="ms-document-lines" />
                </div>
              </div>
              <div className="ms-case-cover">
                <span className="ms-case-bolt ms-bolt-a" />
                <span className="ms-case-bolt ms-bolt-b" />
                <span className="ms-case-bolt ms-bolt-c" />
                <span className="ms-case-bolt ms-bolt-d" />
                <div className="ms-case-topline">
                  <span>JKS / PRIVATE COLLECTION</span>
                  <span>01 / 03</span>
                </div>
                <div className="ms-lock">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div className="ms-reel" key={i}>
                      <div className="ms-reel-track">
                        {words.map((word) => (
                          <span key={word}>{word[i]}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="ms-lock-glint" />
                </div>
                <div className="ms-case-caption">
                  <span>A CAREER IN FOLLOWING THE EVIDENCE</span>
                  <span className="ms-lock-status">
                    <i /> SCROLL TO UNLOCK
                  </span>
                </div>
                <div className="ms-case-latch">
                  <span />
                </div>
              </div>
            </div>
          </div>

          <section
            className="ms-scene-copy ms-copy-1"
            aria-hidden={!staticMode && chapter !== 1}
            inert={!staticMode && chapter !== 1}
            id="ms-static-1"
          >
            <p className="ms-overline">
              <span>01</span> THE JOURNEY
            </p>
            <h2>
              It started with
              <br />
              <em>why.</em>
            </h2>
            <p>
              Curiosity became a discipline.
              <br />
              Then it became my work.
            </p>
            <button
              className="ms-text-action"
              aria-haspopup="dialog"
              onClick={(e) => openEvidence(e, journeyEvidence)}
            >
              Open my story
            </button>
            <div className="ms-margin-note">
              <span>{motionIdentity.educationStart}</span>
              <i />{" "}
              <span>{motionIdentity.educationInstitution?.toUpperCase()}</span>
            </div>
          </section>
          <section
            className="ms-scene-copy ms-copy-2"
            aria-hidden={!staticMode && chapter !== 2}
            inert={!staticMode && chapter !== 2}
            id="ms-static-2"
          >
            <p className="ms-overline">
              <span>02</span> THE EVIDENCE
            </p>
            <h2>
              Look closer.
              <br />
              <em>Prove it.</em>
            </h2>
            <p className="ms-report-intro">
              {findingEvidence.length} public reports. Open a file to read.
            </p>
            <div className="ms-report-index" aria-label="Open a public finding">
              {findingEvidence.map((report, i) => (
                <button
                  key={report.evidence.id}
                  aria-haspopup="dialog"
                  aria-label={`Open report: ${report.previewTitle}`}
                  onClick={(e) => {
                    setFinding(i);
                    openEvidence(e, report.evidence);
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 1h18" />
                  </svg>
                  <span>{report.label}</span>
                </button>
              ))}
            </div>
            <label className="ms-report-picker">
              Choose a report
              <select
                value={finding}
                onChange={(e) => setFinding(Number(e.target.value))}
              >
                {findingEvidence.map((report, i) => (
                  <option key={report.evidence.id} value={i}>
                    {report.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="ms-text-action ms-open-report"
              aria-haspopup="dialog"
              onClick={(e) => openEvidence(e, selectedFinding.evidence)}
            >
              Open selected report
            </button>
          </section>
          <section
            className="ms-scene-copy ms-copy-3"
            aria-hidden={!staticMode && chapter !== 3}
            inert={!staticMode && chapter !== 3}
            id="ms-static-3"
          >
            <p className="ms-overline">
              <span>03</span> THE SYSTEMS
            </p>
            <h2>
              Find the gap.
              <br />
              <em>Build better.</em>
            </h2>
            <p>
              swiftPentest. Open-source security testing, built around
              reproducible evidence.
            </p>
            <button
              className="ms-text-action"
              aria-haspopup="dialog"
              onClick={(e) => openEvidence(e, swiftEvidence)}
            >
              Explore swiftPentest
            </button>
          </section>

          <div
            className="ms-folder-anchor"
            data-invite={!hasOpenedFolder}
            aria-hidden={chapter === 0 || staticMode}
            inert={chapter === 0 || staticMode}
          >
            <button
              className="ms-folder"
              aria-haspopup="dialog"
              onClick={(e) => openEvidence(e, activeRecord)}
              aria-label={`Open evidence folder: ${activeRecord.title}`}
            >
              <span className="ms-folder-shadow" />
              <span className="ms-folder-back">
                <span className="ms-folder-tab">
                  JKS / {String(chapter).padStart(2, "0")}
                </span>
              </span>
              <span className="ms-paper ms-paper-under" />
              <span className="ms-paper ms-paper-main">
                <span className="ms-paper-top">
                  <span>{motionIdentity.name.toUpperCase()}</span>
                  <span>CASE NOTES</span>
                </span>
                <span className="ms-paper-rule" />
                <span className="ms-preview-title">
                  {chapter === 1
                    ? "The making of\nan investigator."
                    : chapter === 2
                      ? selectedFinding.previewTitle
                      : "Testing,\nwith evidence."}
                </span>
                {chapter === 1 ? (
                  <span className="ms-paper-year">
                    {motionIdentity.educationStart}
                    <span>{motionIdentity.educationEnd}</span>
                  </span>
                ) : chapter === 2 ? (
                  <span className="ms-paper-stat ms-finding-status">
                    {selectedFinding.highlight}
                    <span className="ms-red-underline" />
                  </span>
                ) : (
                  <span className="ms-system-diagram">
                    <i />
                    <span />
                    <i />
                    <span />
                    <i />
                  </span>
                )}
                <span className="ms-paper-small">
                  {chapter === 1
                    ? "Computer Science & Engineering"
                    : chapter === 2
                      ? selectedFinding.evidence.id
                      : "Open-source contribution"}
                </span>
                <span className="ms-document-lines" />
              </span>
              <span className="ms-folder-front">
                <span className="ms-folder-front-meta">
                  <span>FILE {String(chapter).padStart(2, "0")}</span>
                  <span className="ms-folder-seal">
                    {chapter === 1
                      ? "FIELD NOTES"
                      : chapter === 2
                        ? "EVIDENCE"
                        : "SYSTEMS"}
                  </span>
                </span>
                <span className="ms-folder-front-title">
                  {chapter === 1
                    ? "The journey"
                    : chapter === 2
                      ? selectedFinding.label
                      : "swiftPentest"}
                </span>
                <span className="ms-folder-open">Open folder</span>
              </span>
            </button>
            <span className="ms-folder-hint">
              <i /> Click or tap to read the full file
            </span>
          </div>

          <div className="ms-scroll-cue" aria-hidden="true">
            <span /> SCROLL TO FOLLOW THE TRAIL
          </div>
          <div className="ms-stage-bottom">
            <span>{String(chapter).padStart(2, "0")} / 03</span>
            <span>{chapters[chapter]}</span>
            <button
              onClick={() =>
                chapter < 3
                  ? goTo(chapter + 1)
                  : document.getElementById("ms-contact")?.scrollIntoView({
                      behavior: staticMode ? "instant" : "smooth",
                    })
              }
            >
              {chapter < 3 ? "Next chapter" : "Meet the person"}{" "}
            </button>
          </div>
        </div>
      </div>

      <section
        className="ms-epilogue"
        id="ms-contact"
        aria-labelledby="ms-contact-title"
      >
        <div className="ms-epilogue-top">
          <p className="ms-overline">
            <span>04</span> THE PERSON BEHIND THE WORK
          </p>
          <a href="#main">Replay the opening</a>
        </div>
        <div className="ms-epilogue-main">
          <div className="ms-epilogue-copy">
            <h2 id="ms-contact-title">
              Let’s find
              <br />
              what’s next.
            </h2>
            <p>
              I’m Jatin. I investigate how systems break
              <br className="ms-desktop-break" /> and build ways to make them
              better.
            </p>
            <a className="ms-email" href={`mailto:${motionIdentity.email}`}>
              Start a conversation
            </a>
            <a
              className="ms-email-small"
              href={`mailto:${motionIdentity.email}`}
            >
              {motionIdentity.email}
            </a>
          </div>
          <figure className="ms-portrait">
            <Image
              src={motionIdentity.portrait}
              alt={motionIdentity.portraitAlt}
              width={1254}
              height={1254}
              sizes="(max-width: 700px) 80vw, 36vw"
            />
            <figcaption>
              <span>{motionIdentity.name.toUpperCase()}</span>
              <span>{motionIdentity.location.toUpperCase()}</span>
            </figcaption>
          </figure>
        </div>
        <div className="ms-footer-line">
          <span>{motionIdentity.title.toUpperCase()}</span>
          <nav aria-label="Professional profiles and portfolio pages">
            <Link href="/security">Research</Link>
            <Link href="/labs">Labs</Link>
            <a
              href={motionIdentity.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href={motionIdentity.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="/resume/Jatin-Kumar-Singh-Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Résumé
            </a>
          </nav>
        </div>
        <p className="ms-music-credit">
          Music:{" "}
          <a href={caseMusic.source}>
            {caseMusic.title} by {caseMusic.artist} ({caseMusic.artistSite})
          </a>
          . <a href={caseMusic.licenseUrl}>{caseMusic.license}</a>.{" "}
          {caseMusic.processingNote}
        </p>
      </section>

      <div className="ms-controls">
        <CaseSoundtrack />
        <span className="ms-control-divider" />
        <button
          className="ms-motion-button"
          aria-pressed={staticMode}
          onClick={() => {
            nextModeChapter.current = chapter;
            setStill((value) => !value);
          }}
          disabled={reduced || compact}
        >
          {compact
            ? "Reading view"
            : reduced
              ? "Reduced motion"
              : still
                ? "Enable motion"
                : "Pause motion"}
        </button>
      </div>
      <nav className="ms-chapter-nav" aria-label="Story chapters">
        {chapters.map((label, i) => (
          <button
            key={label}
            aria-label={label}
            aria-current={chapter === i ? "step" : undefined}
            onClick={() => goTo(i)}
          >
            <span />
            <b>{label}</b>
          </button>
        ))}
      </nav>
      <noscript>
        <style>{`.ms-sequence{height:auto!important}.ms-stage{height:auto!important;position:relative!important;padding:130px 24px 70px!important}.ms-intro,.ms-scene-copy{position:relative!important;opacity:1!important;transform:none!important;inset:auto!important;max-width:700px!important;margin:0 auto 70px!important}.ms-case-anchor,.ms-folder-anchor,.ms-controls,.ms-chapter-nav,.ms-stage-bottom,.ms-scroll-cue{display:none!important}.ms-scene-copy{pointer-events:auto!important;visibility:visible!important}.ms-stage{background:#111!important}.ms-intro{color:#faf9f6!important}`}</style>
        <p className="ms-noscript">
          Explore the <Link href="/resume">résumé</Link>,{" "}
          <Link href="/security">security research</Link> and{" "}
          <Link href="/projects/swiftpentest">swiftPentest project</Link>.
        </p>
      </noscript>
      {opened && (
        <EvidenceSheet
          evidence={opened.evidence}
          origin={opened.origin}
          onClose={closeEvidence}
        />
      )}
    </main>
  );
}
