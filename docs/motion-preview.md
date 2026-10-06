# Motion preview

Latest draft routes: `/` and `/motion-study/`.

The cinematic design opens directly at the homepage. The original interactive
labs remain available at `/labs/`.

## Approved direction

Keep the mechanical rolling-letter opening and red/black identity. A case file
opens with native scroll, then reveals the journey, all ten public security
reports, and the swiftPentest showcase. Scene copy is brief; black folders open into white
evidence sheets with formal typography and red annotations. The portrait appears
once in the closing section. An original continuous soundtrack attempts playback
on entry, with a visible play control when browser autoplay policy blocks it.

## Current revision

- The homepage has twelve evidence sheets: the journey, swiftPentest, and ten
  public reports covering Blinkit, Kraken, IRCTC, Google SSO, Google Chrome DevTools MCP, Meesho,
  Meta AI, Mapillary, NorthCap web/ERP, and NorthCap biometric attendance.
  Each sheet preserves the source record's status, outcome, and disclosure limits.
- Spacious desktop layouts show direct report buttons. Mobile and short-window
  layouts provide a native report chooser plus **Open selected report**.
- The systems chapter showcases **swiftPentest only**. Its existing detail page
  remains the destination for the full project record.
- The top **Résumé** button links to `/resume`, matching the original live site's
  observed navigation. The footer retains the PDF download.
- Main reading copy uses 20 px on desktop and 18 px on mobile. Primary report
  and résumé buttons use 16 px labels. Key folder and footer metadata use at
  least 12 px text; footer copy uses dark text against the red background for
  stronger contrast.
- The folder has an explicit red **Open folder** action. A paper-lift hint runs
  for two cycles, stops after opening a folder, and respects reduced motion.

## Implementation

- `components/motion-study.tsx`: scroll camera and folder selection.
- `lib/case-choreography.ts`: navigation stops and interpolation curves.
- `content/motion-study.ts`: all ten public reports and swiftPentest, derived
  from canonical portfolio records.
- `components/evidence-sheet.tsx`: native modal, origin-based paper movement,
  keyboard support, focus and exact scroll restoration.
- `components/case-soundtrack.tsx`: native HTML audio playback and optional
  Web Audio mechanical and paper effects.
- `public/audio/case-notes-score.mp3`: the original continuous music loop.
- `scripts/generate-case-score.py`: deterministic procedural music generation;
  no external recordings or samples.

The scene uses transform/opacity animation with one requestAnimationFrame per
scroll event batch. It keeps native wheel behavior and does no continuous idle
rendering. Reduced-motion preferences and very short viewports (480px or less) use a reading layout.
The manual motion switch preserves the current chapter while changing layouts.

## Sound behavior

The homepage attempts unmuted playback when its soundtrack component mounts,
unless an explicit mute is saved for the current browser session.
The MP3 loops through a regular HTML audio element. **Starting music** is distinct
from **Sound on**, which appears only after playback succeeds. If autoplay is
blocked, **Play music** remains available and a trusted click, Enter, or Space
retries playback. Loading failures and timeouts expose **Retry music**.

Explicit mute persists in `sessionStorage` across reloads and route changes.
Scrolling and ordinary interactions do not override it. If storage is blocked,
the mounted player still respects the visitor's choice. Hiding the tab pauses
playback; returning attempts automatic resume unless explicitly muted. Browser
refusal falls back to the play control and trusted interaction. Navigating away
releases the audio and effects; remounting respects the saved session choice.
Web Audio effects are optional, and their failure does not stop music.

## Verification

Release checks cover the build, TypeScript, content, exported routes, interaction
logic and audio lifecycle. Exact test totals belong in the current run output,
not this design document.

Local browser QA remains unavailable because the Sites control-browser capability
is unavailable. Visual browser testing and physical audio playback remain
unverified. Instagram references were separately inspected in the cloud browser
at the user's explicit request; that is not a browser test of this draft.

## Browser reference review

All seven supplied reels were opened in the cloud browser on 6 October 2026.
We inspected accessible captions and video frames. Footage does not establish
exact easing curves or implementation details.

| Reel                                        | Observed reference                                                                  | Applied direction                                              |
| ------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| https://www.instagram.com/reel/DeI6CrhIkqF/ | Red portfolio with mechanical rolling character columns                             | Rolling-letter case lock                                       |
| https://www.instagram.com/reel/DeHVnwyPQKb/ | Architectural website montage, large spatial anchors, editorial type                | Viewport-scale focal object and controlled depth               |
| https://www.instagram.com/reel/Dd8SU_DArOK/ | WWI PowerPoint presentation with maps, paper layers and angled cards                | Layered document composition and chapter continuity            |
| https://www.instagram.com/reel/DdG3eppyZUB/ | Component-library roundup including scroll-driven cards                             | Continuous folder positioning and restrained reveal motion     |
| https://www.instagram.com/reel/DcjS7H_NHUg/ | Motion library/design setup tutorial and site examples                              | Consistent type, spacing and interaction language              |
| https://www.instagram.com/reel/Ddt2CFBxhH0/ | Advice against generic styling, fake claims and distracting effects                 | Specific introduction, authentic portrait and verified records |
| https://www.instagram.com/reel/DdJ5ynbDxqS/ | Nate Herk design-resource walkthrough with animated controls and dark site examples | A dominant visual subject with subordinate reading controls    |

The WWI reel is a presentation and the architectural reel is a montage, so we
do not claim every observed transition is scroll-linked. No gated prompts,
paid template sources, fictional testimonials or third-party assets were used.

## Latest résumé and device revision

The uploaded October 6 résumé now supplies the downloadable PDF and current records: Blinkit $1,500, Kraken $500, Chrome DevTools MCP contribution, Meesho finding, CGPA 8.31, six credentials and four competition results. The résumé page uses a black dossier frame, white reading surface and red annotations. Only swiftPentest appears in its project showcase; the owner’s original PDF is served unchanged.

Decorative link arrows were removed. The shared logo and favicon use a red evidence lens with a black keyhole. Portrait tablets use a stacked scene; landscape phones use reading mode. Automatic layout changes preserve the current chapter or contact position. Build, content and interaction checks cover the implementation; visual browser playback remains unverified because the supported browser QA capability is unavailable.
