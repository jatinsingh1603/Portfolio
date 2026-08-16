# jatinsingh.dev — personal site

Personal site for Jatin Kumar Singh, Information Security Analyst. Static
Next.js, no CMS, no runtime data fetching, no analytics, no cookies.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # regenerates security.txt/humans.txt/llms.txt, then builds
```

## The rule that matters most

**No fact reaches the page except through `/content`, and no finding is
rendered unless its `disclosure.public` is `true`.**

Components import from `content/*.ts`. Nothing is hard-coded in JSX — not a
date, not a metric, not a job title. `tests/unit/content.test.ts` enforces this
and will fail the build if it drifts.

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

**Withhold rather than delete.** The reason is part of the disclosure record and
it stops someone re-adding the same item later without the context. Only
`publicFindings` is exported for rendering; `findings` is the full private list.

Two rules that are not negotiable, because this is a security researcher's
public site:

1. **Never publish reproduction detail** — no endpoint, payload, parameter or
   screenshot — for anything not confirmed fixed.
2. **Never publish wording that reads as unauthorised access.** JKS-06 and
   JKS-07 are published only because written authorisation to test is held on
   file. If that cannot be produced, set them back to `public: false`.

## Adding a number

`content/profiles.ts` renders `metric` verbatim or omits it. There is no
fallback and no estimate. If you do not have the verified figure, leave it
`undefined` and the row renders without one.

## Design tokens

Colour, space, radius and motion tokens live in `app/globals.css` as plain
custom properties, aliased into Tailwind's namespace by `@theme inline`. Dark
mode swaps the raw properties under `[data-theme="dark"]`; the theme is applied
pre-paint by the inline script in `lib/theme-script.ts`.

`lib/tokens.ts` mirrors the colour values in TypeScript so
`tests/unit/contrast.test.ts` can audit every rendered pair in both themes
(4.5:1 body, 3:1 large text and UI boundaries) and assert the two files have not
drifted. **Adding a new colour combination to a component means adding it to
`usedPairs`** — an unaudited pair should not pass review.

`/styleguide` renders the whole system with live contrast ratios. It is
`noindex` and absent from the sitemap.

Two deliberate departures from Apple's own palette, both forced by contrast:

- `--text-tertiary` is `#6e6e73`, not Apple's `#86868b`, which measures 3.33:1
  on the `#f5f5f7` wash and fails at the 13px caption size. The grey scale is
  shifted down a step rather than dropped.
- `--accent-on` (text on a filled accent button) is near-black in dark mode.
  The dark accent is deliberately bright so links clear 4.5:1 on black, which
  makes white-on-accent only 3.01:1.

## Motion

One entrance animation, in `components/reveal.tsx`: opacity with a 12px rise,
fired once by an IntersectionObserver. Hand-rolled rather than imported —
`motion` would cost ~34 KB gzipped against a 120 KB budget. Reduced motion is
handled inside that one component and in CSS, so it cannot be forgotten
elsewhere, and a `<noscript>` rule keeps everything visible without JavaScript.

## Budgets, enforced in CI

| Gate               | Command                 | Budget                                  |
| ------------------ | ----------------------- | --------------------------------------- |
| Types              | `npm run typecheck`     | no errors                               |
| Lint               | `npm run lint`          | no warnings                             |
| Content + contrast | `npm test`              | all pass                                |
| JS weight          | `npm run check:budget`  | < 120 KB gz on `/`                      |
| Accessibility      | `npm run test:e2e`      | zero serious/critical axe violations    |
| Lighthouse         | `npx @lhci/cli autorun` | 100/100/100/100, LCP < 1.5s, CLS < 0.02 |

`check-js-budget.mjs` renders the route and measures the scripts the browser
actually fetches, excluding Next's `noModule` polyfill bundle (no ES-module
browser requests it).

Lighthouse runs with `throttlingMethod: devtools`. The default simulated
throttling over-attributes ~1s of LCP to the font swap; real throttled Chrome
measures the same page at ~720ms.

## Security

Headers are declared twice — `next.config.ts` for `next start`, `vercel.json`
for the edge — and `tests/unit/headers.test.ts` fails if they drift apart.

`script-src` carries `'unsafe-inline'`. This was not a shortcut: the App Router
streams its RSC payload through ~46 inline `self.__next_f.push(...)` scripts per
route, CSP ignores `'unsafe-inline'` whenever a hash is present, and a
per-request nonce forces dynamic rendering. Hashing every script was tried and
broke hydration. The concession is bounded — every byte of content here is a
compile-time constant, with no user input, no query reflection and no
authenticated surface — and the directives doing the real work are intact:
`object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, and no
external script host. `'unsafe-eval'` is asserted absent.

`/.well-known/security.txt` is regenerated on every build with a one-year
`Expires`; a test fails if the committed copy has gone stale.

## Deploying

Set `NEXT_PUBLIC_SITE_URL` in the Vercel project to the real origin. The
fallback in `content/site.ts` is a placeholder, and canonical URLs, the sitemap,
JSON-LD and security.txt all read from it.
