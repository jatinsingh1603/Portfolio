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

| Module                    | Holds                                                                |
| ------------------------- | -------------------------------------------------------------------- |
| `content/site.ts`         | identity, positioning, nav, recognitions, disclosure policy          |
| `content/brand.ts`        | tagline, thesis, hero headline, the five system stations, CTAs       |
| `content/about.ts`        | the story in five chapters, each traceable to another module         |
| `content/career.ts`       | roles, awards, capabilities, credentials, education                  |
| `content/projects.ts`     | the three systems (category, status, stack, outcomes, recognition)   |
| `content/diagrams.ts`     | each project's own pipeline, transcribed                             |
| `content/findings.ts`     | the disclosure record — only `publicFindings` may render             |
| `content/labs.ts`         | Cyber Lab stages and AI Automation Lab scenarios (tools ⊆ career.ts) |
| `content/achievements.ts` | derived cards; every metric verbatim or absent                       |
| `content/profiles.ts`     | external profiles; `metric` is verbatim or omitted                   |
| `content/schema.ts`       | zod schemas for all of the above                                     |

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

## Design system — "Deep Field Bench"

A dark volume you fly through, operated like a precision instrument. Nine
home sections are **stations**; a left rail (the depth gauge) counts them and
fills as you scroll. Colour is a law: `--accent` (teal) is the security signal,
`--accent-2` (amber) is machine reasoning. Severity hues appear only on the
ledger, always beside a word and a shape.

Faces: Bricolage Grotesque (display), IBM Plex Sans (reading), IBM Plex Mono
(every register label), self-hosted through `next/font` so `font-src 'self'`
holds. One static weight each — the variable display file sat on the LCP path.

Colour, space, radius and motion tokens live in `app/globals.css` as plain
custom properties, aliased into Tailwind's namespace by `@theme inline`. Dark is
the canonical theme and the default; light is an explicit choice persisted in
`localStorage` and applied pre-paint by `lib/theme-script.ts`.

`lib/tokens.ts` is the source of truth for colour. The two token blocks in
`globals.css` are generated from it, and `tests/unit/contrast.test.ts` audits
every rendered pair in both themes (4.5:1 body, 3:1 large text and UI) and
asserts the files have not drifted. **Adding a colour combination to a
component means adding it to `usedPairs`.** One rule is enforced structurally:
`--text-tertiary` fails on `--surface-raised` in dark, so `.panel--raised`
remaps it to secondary.

`/styleguide` renders the whole system with live contrast ratios. It is
`noindex` and absent from the sitemap.

## The world

The whole page sits over a fixed, full-viewport WebGL scene: as the document
scrolls, a camera flies along a path through gate rings and past the five
solids of the system — USER → SECURITY → AI ENGINE → AUTOMATION → RESULT — an
octahedron, a ring gate you pass through, a gyroscope around an icosahedron,
a hexagonal lattice of lanes and a ruled sheet — inside a hyperspace field of
light streaks that stretch with scroll velocity. Packets travel the path and
stall at the gate. The station labels are real DOM text projected through the
same camera.

It is hand-written WebGL 1 (`lib/gl/`): a two-program glow renderer whose
streak field lives entirely in one static buffer and is positioned in the
vertex shader, so the CPU does almost nothing per frame. About 7 KB gzipped
and code-split: not even its code is fetched until the visitor starts
exploring (first scroll, pointer move, touch or key press), and then it boots
on an idle slice. It refuses software renderers (no GPU → the page stands on
its own) and is never mounted under reduced motion; the hero shows a
server-rendered SVG of the same object until the world takes over. Append
`?world=force` to see the world on a software-rendered browser.

## Evidence

Every card in Recognition links to the public place that substantiates it:
hackathon placements and the CRTP certification to the LinkedIn listing, the
Google report to the Bug Hunters profile, findings to their sheets, the
open-source work to its repository. `content/schema.ts` carries the
`evidence` shape; `tests/unit/labs.test.ts` fails if a card ships without one.

## Motion

One entrance animation, in `components/reveal.tsx`: opacity with a 24px rise
(planes also tip back from 6°), fired once by an IntersectionObserver. Planes
tilt toward a fine pointer (`lib/hooks/use-pointer-tilt.ts`), buttons are
magnetic (`use-magnetic.ts`), the labs are ARIA tablists. Everything animates
only `transform` and `opacity`; no animation library. Reduced motion pins every
`[data-reveal]` to visible, freezes the hero, and disables tilt and magnetism.

## Budgets, enforced in CI

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
actually fetches. Client components never import from `/content`; data reaches
them as props from server components, which is how the home route stays around
112 KB with a WebGL hero and two interactive labs.

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

Set `NEXT_PUBLIC_SITE_URL` in the Vercel project to the real origin. The
fallback in `content/site.ts` is a placeholder, and canonical URLs, the sitemap,
JSON-LD and security.txt all read from it.
