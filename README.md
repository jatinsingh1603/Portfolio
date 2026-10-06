# Jatin Kumar Singh — personal site

Personal site for Jatin Kumar Singh, Information Security Analyst. Static
Next.js 15 (App Router), no CMS, no analytics, no cookies, no third-party
scripts. Positioning: **Cybersecurity × AI × Automation**.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # regenerates security.txt/humans.txt/llms.txt, then builds
npm start
```

## The rule that matters most

**No fact reaches the page except through `/content`, and no finding is
rendered unless its `disclosure.public` is `true`.**

Components import from `content/*.ts`. Nothing about the person is hard-coded
in JSX — not a date, not a metric, not a job title. `tests/unit/content.test.ts`
and `tests/unit/labs.test.ts` enforce this and fail the build if it drifts.

| Module                    | Holds                                                                      |
| ------------------------- | -------------------------------------------------------------------------- |
| `content/site.ts`         | identity, positioning, nav, recognitions, disclosure policy                |
| `content/brand.ts`        | tagline, thesis, hero headline, the five system stations, CTAs             |
| `content/about.ts`        | the earlier story, each chapter traceable to another module                |
| `content/cinematic.ts`    | retained narrative copy and the closing portrait reference                 |
| `content/motion-study.ts` | homepage identity and twelve evidence records derived from portfolio facts |
| `content/career.ts`       | roles, awards, capabilities, credentials, education                        |
| `content/projects.ts`     | the three systems (category, status, stack, outcomes, recognition)         |
| `content/diagrams.ts`     | each project's own pipeline, transcribed                                   |
| `content/findings.ts`     | the disclosure record — only `publicFindings` may render                   |
| `content/labs.ts`         | Cyber Lab stages and AI Automation Lab scenarios (tools ⊆ career.ts)       |
| `content/achievements.ts` | derived cards; every metric verbatim or absent                             |
| `content/profiles.ts`     | external profiles; `metric` is verbatim or omitted                         |
| `content/schema.ts`       | shared Zod schemas for structured portfolio records                        |

## Adding a security finding

Add an entry to `content/findings.ts`. Every field is required by
`content/schema.ts`, and the shape of `disclosure` is the gate:

```ts
{
  id: "JKS-08",                                  // ^[A-Z]{2,4}-\d{2}$
  org: "Example Corp",
  summary: "One line. No reproduction detail, ever.",
  class: "Server-side request forgery",
  severity: "high",                              // critical|high|medium|low|info
  status: "Reported",
  bounty: "$250 awarded",                        // only if actually awarded
  disclosure: {
    public: true,
    basis: "program-permitted",                  // or vendor-approved
                                                 // or publicly-acknowledged
    note: "What is withheld, and why.",
  },
}
```

To withhold one instead:

```ts
disclosure: { public: false, reason: "Why. This is a record, not a TODO." }
```

**Withhold rather than delete.** Two rules that are not negotiable:

1. **Never publish reproduction detail** — no endpoint, payload, parameter or
   screenshot — for anything not confirmed fixed.
2. **Never publish wording that reads as unauthorised access.** JKS-06 and
   JKS-07 are published only because written authorisation to test is held on
   file. If that cannot be produced, set them back to `public: false`.

## Adding a number

`content/profiles.ts` renders `metric` verbatim or omits it. There is no
fallback and no estimate. The GitHub repository count is the one exception:
`lib/github.ts` fetches it from the public API **at build time only** (set
`GITHUB_TOKEN` to raise the rate limit, `PORTFOLIO_SKIP_GITHUB=1` to skip) and
falls back to the verified static metric on any failure. Nothing is fetched in
the browser — `connect-src 'self'` would block it anyway.

## Design — the cinematic case file

The cinematic design is the homepage at `/`. `/motion-study/` renders the
same experience as an alternate entry, not a separate preview. A red mechanical
rolling-letter opening unlocks a black case file, followed by three chapters:
**the journey, the findings, and the systems**. Short scene copy introduces
education and experience, public security findings, and swiftPentest.

The case and folders move with native scrolling through CSS 3D transforms.
The page does not intercept the wheel or run WebGL. Twelve evidence records open
as white sheets with formal typography and red annotations: one journey
record, ten public findings, and swiftPentest. `components/evidence-sheet.tsx`
uses a native modal dialog with keyboard handling, opener focus restoration,
and scroll restoration. Links lead to the complete résumé, disclosure records,
and project pages.

The original portrait from Jatin's GitHub profile README is stored at
`public/images/jatin-portrait.png`. It appears once in the homepage's closing
section. `components/route-chrome.tsx` suppresses the ordinary header, rail,
and shared footer on `/` and `/motion-study/`, where the scene supplies its
own navigation and ending. Detail pages retain their normal framing.

`content/motion-study.ts` derives the twelve evidence records from canonical
portfolio content. `components/motion-study.tsx` composes the scenes and folder
selection; `lib/case-choreography.ts` defines navigation stops and interpolation.
`app/motion-study.css` and `app/evidence-sheet.css` style the experience.
The investigative presentation adds no claims about access or finding outcomes.

The interactive Cyber Lab and AI Automation Lab remain available at `/labs/`.
The earlier cinematic components and WebGL code remain in the repository but
do not power the current homepage. See `docs/motion-preview.md` for the design
reference notes and implementation overview.

## Shared type and colour

The homepage and detail pages share a red-and-black visual identity. The scene
uses its own CSS palette, white reading text, and white evidence sheets.
Existing project, research, résumé, and lab pages retain their content layouts
and shared semantic tokens. Severity uses red and neutral tones, always beside
a word and a shape. Previously saved light and dark preferences both resolve
to the same shared palette.

The homepage uses a system sans-serif face and formal evidence-sheet typography.
Detail pages retain Bricolage Grotesque for display, IBM Plex Sans for reading,
and IBM Plex Mono for register labels, self-hosted through `next/font`.

`lib/tokens.ts` is the source of truth for shared colours in `app/globals.css`,
with Tailwind aliases in `@theme inline`. The labs use warmer surface overrides,
recorded in `filmLabPalette` and checked against the stylesheet.
`tests/unit/contrast.test.ts` audits the shared text combinations, inherited
lab colours, and retained cinematic card bindings at WCAG AA thresholds.
**Add new shared colour combinations to `usedPairs` and keep bindings in sync.**
The new scene and evidence-sheet styles also need browser accessibility review.

`/styleguide` displays the shared tokens with live contrast ratios. It is
`noindex` and absent from the sitemap. Token checks do not replace browser
checks for layout, focus, and interactive states.

## Evidence

Achievement cards link to their source: a disclosure sheet, a repository,
a supplied profile, or the owner's downloadable résumé. The latest résumé
supplies the current career, education, competition and certification records.
`content/schema.ts` carries the evidence shape; `tests/unit/labs.test.ts`
requires an evidence link for each achievement.

## Motion, sound, and fallbacks

Native scroll updates the CSS 3D scene through one requestAnimationFrame per
scroll-event batch. Transform and opacity changes move the case, folders, and
chapter copy. The scene does no continuous idle rendering. Chapter navigation
jumps to defined stops; opening an evidence sheet preserves its scroll position.

The **Pause motion / Enable motion** control switches to a reading layout while
preserving the current chapter. Portrait tablets stack the scene vertically.
Reduced-motion preferences and viewports 480 px high or less automatically use
the reading layout; automatic layout changes preserve the chapter or closing
section position. Without JavaScript, the
scene presents a static reading sequence and links to the underlying detail
pages. Interactive evidence dialogs, labs, and sound controls require JavaScript.

`components/case-soundtrack.tsx` plays a locally hosted copy of
["Darkest Child" by Kevin MacLeod](https://www.incompetech.com/music/royalty-free/index.html?isrc=USUAN1100783)
at `/audio/darkest-child.mp3` through a looping HTML audio element. It attempts
**unmuted playback on entry** unless the visitor has explicitly muted it during
the current browser session, following the requested default-on experience.
Browser autoplay policy may block that attempt. The control then shows
**Play music** and retries after a trusted click, Enter, or Space. It only shows
**Sound on** after playback succeeds; errors expose a **Retry music** action.

The sound button can cancel loading or mute playback. Explicit mute persists
in `sessionStorage` across reloads and route changes. Scrolling, ordinary
gestures, and visibility changes do not override that choice. If storage is
unavailable, the current mounted player still respects mute.

Hiding the tab pauses playback. Returning attempts to resume automatically
when the visitor has not muted it; browser refusal leaves the play control
and trusted-gesture fallback available. Leaving the homepage releases the audio
and effects. Returning creates a new player and respects the session mute choice.

The soundtrack is licensed under
[Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
The closing section visibly credits Kevin MacLeod (incompetech.com) and links
to the source and license. Playback uses the local asset without a third-party
player or streaming service. The complete 238.68-second recording is preserved,
compressed for web as an 80 kbps stereo MP3, with its level reduced by 3 dB.
`public/audio/ATTRIBUTION.txt` records the source, license and modifications.
`scripts/generate-case-score.py` and `public/audio/case-notes-score.mp3` are
retained as the previous procedural score's generator and output; neither
supplies the current soundtrack.
Web Audio supplies optional mechanical and paper effects after interaction.
Effects failures do not prevent the HTML audio soundtrack from playing.
Motion and sound use separate controls. There is no autoplay video.

Detail-page reveals, pointer tilt, and magnetic buttons retain their
reduced-motion fallbacks. The labs retain ARIA tablists and keyboard controls.

## Budgets, enforced in CI

Run the gates below for each release. Local browser QA is unavailable in this
workspace, and the updated end-to-end tests have not been run locally.
Accessibility, visual playback, responsive layout and Lighthouse targets remain
browser verification work; they are not claimed as measured results here.

| Gate               | Command                 | Budget                                 |
| ------------------ | ----------------------- | -------------------------------------- |
| Types              | `npm run typecheck`     | no errors                              |
| Lint               | `npm run lint`          | no warnings                            |
| Format             | `npm run format:check`  | prettier clean                         |
| Content + contrast | `npm test`              | all pass                               |
| JS weight          | `npm run check:budget`  | < 120 KB gz on `/`                     |
| Accessibility      | `npm run test:e2e`      | zero serious/critical axe violations   |
| Lighthouse         | `npx @lhci/cli autorun` | 98/100/100/100, LCP < 1.5s, CLS < 0.02 |

`check-js-budget.mjs` renders the route and measures the scripts the browser
actually fetches. Portfolio datasets reach client components as props from
server components. Only the small shared soundtrack metadata record is
imported directly by the player and footer. Recheck the route budget after changing the cinematic
interactions or either interactive lab.

## Security

Headers are declared twice — `next.config.ts` for `next start`, `vercel.json`
for the edge — and `tests/unit/headers.test.ts` fails if they drift apart.

`script-src` carries `'unsafe-inline'` because the App Router streams its RSC
payload through inline scripts and a per-request nonce would force dynamic
rendering. The concession is bounded — every byte of content is a compile-time
constant, with no user input, no query reflection and no authenticated
surface — and the directives doing the real work are intact: `object-src
'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, no external script host,
`'unsafe-eval'` asserted absent.

`/.well-known/security.txt` is regenerated on every build with a one-year
`Expires`; a test fails if the committed copy has gone stale.

## Deploying

The production origin defaults to `https://jatin.swiftsane.com` in
`content/site.ts`. Set `NEXT_PUBLIC_SITE_URL` in the hosting project only when
overriding that origin. Canonical URLs, the sitemap, JSON-LD, and security.txt
all read the same value.
