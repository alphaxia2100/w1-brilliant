# Aperture — Handoff

**Date:** 2026-06-24 (session 2 — ground-up lesson rebuild) · **Stack:** Vite + React + Tailwind + Firebase (Auth + Firestore + Hosting). All visuals geometric SVG / pixel-art, no real photos.
**Read order:** this file → `/Users/sky/.claude/plans/take-a-read-through-validated-platypus.md` (the approved north star) → the memory files (below).

> Everything below was verified against the code on 2026-06-24, not recalled. If you edit a file,
> RE-READ it first — a stale mental model caused a real confabulation this session (see Honest notes).

---

## TL;DR
The course was rebuilt from a reactive 9-lesson sprawl into **6 deep, predict-first topic-lessons with ZERO multiple choice**, each verified by an automatic test gate (`npm test`) and live in the browser. New rendering primitives replaced the disliked DoF calculator. A small **dev-system of skills + memory** now governs the build loop. The remaining big item is **deploying** (needs you).

## Current state — the 6 lessons (verified from `src/content/course.js`)
| # | id | beats | what it teaches |
|---|----|------|-----------------|
| 1 | `exposure-triangle` | **8** | capture light→target · aperture · shutter(motion) · ISO · "stops" · balance puzzle · equivalent-exposures rank |
| 2 | `depth-of-field` | **8** | forward flower bokeh via 4 real levers: aperture · subject-distance · background-distance · focal length · night-lights bloom · rank · 4-slider synthesis keeper |
| 3 | `metering` | **6** | histogram: spread · blow highlights · crush shadows · high-key **snow** (right-piled) · scene rank (no single "correct" shape) |
| 4 | `white-balance` | **5** | warm→cool correct · cool→warm correct · **gray-card** reference · creative-warm (neutral is *wrong*); uses a baked-in cast so neutral is a NON-zero slider |
| 5 | `rule-of-thirds` | **5** | responsive frame: thirds · lead-room (facing subject) · horizon · synthesis keeper — the subject is a figure that MOVES and the frame reacts |
| 6 | `light-direction` | **4** | sphere lit front→side(reveals form)→behind(rim/silhouette) + hard/soft |

All are **predict-first** (do → surprise → confirm), calm-gray feedback (never red on a learner mistake), and a success mints a polaroid "keepsake" saved to the Home "roll".

## What changed this session
**Restructure:** 9 lessons → 6; the six old exposure lessons compressed into the one 8-beat anchor; `PredictView` (multiple choice) removed entirely.

**New rendering primitives (the DoF calculator + box-blur are gone from the lessons):**
- `src/sim/DofBokeh.jsx` + `src/sim/bokehMath.js` — forward flower, layered **CSS blur** (clean bokeh), driven by `effectiveBlur({f, subjectDist, bgDist, focal})`. Renders the lesson AND the keepsake.
- `src/sim/LightDirection.jsx` — directional sphere shading (angle + softness).
- `src/sim/composeEval.js` + responsive `ComposeView`/`ComposeFigure`/`ComposeShot` in `steps.jsx` — the image responds to placement (thirds / leadroom / horizon targets).
- `MotionShot` keepsake renders from `si` (the base64 JPEG that was being written into the Firestore doc is gone — a self-DoS risk).
- `scene.js`: `baseTemp` intrinsic-cast support for white balance + a neutral **gray card** in the `room` scene; a `snow` high-key scene (used by metering).

**Hardening / correctness:**
- React **error boundary** (`src/components/ErrorBoundary.jsx`, wraps the app in `main.jsx`) — no more white-screen on a render throw.
- **Keepers-only** (wrong answers no longer saved; failure count removed from Home).
- Deterministic, seeded **ISO grain** (`scene.js` `hashNoise`/`noiseSeed`; `PixelScene` varies the seed per frame only when live) — saved shots round-trip.
- `prefers-reduced-motion` honored for the JS rAF sims (`src/components/useReducedMotion.js`; gates the car + ISO shimmer). MotionView's rAF now stops on capture.
- `store.jsx`: `recordAttempt` persists immediately; the debounced `saveResume` timer is cleared on `saveShot`/`recordAttempt` (was clobbering fresh keepers).
- `Slider` got `aria-valuetext`; histogram clipping recolored out of the danger-red; sticky feedback panel polished + a one-frame green-flash on step transitions fixed; rank tiles no longer clip at 375px.

## The test gate (use it — `npm test`)
`Redesign/checks.mjs` (run via `npm test`, dependency-free Node). Asserts that **every checked beat fails at its start and is reachable in range**, rank solutions are permutations, aperture brightness is monotonic, no scene yields NaN. **Currently 59/59 green.** Extend it whenever you add a checked beat — a retuned scene can't then silently make a lesson unpassable. (`Redesign/gate.mjs` still covers L2 brightness + L7 metering monotonicity.)

## The dev system (skills + memory)
- **Skills** — `.claude/skills/aperture-lesson/` (repo: how to author + verify a lesson), `~/.claude/skills/shimmering-personas/` (10–20 unconventional Opus personas → triangulated synthesis; now hardened against confabulation), `~/.claude/skills/what-would-sky-do/` (model Sky's judgment; predict → self-critique as Sky at max power → revise → test → escalate only if uncertain → learn).
- **Memory** (`.../memory/`): `project-northstar-redesign`, `working-style-high-caliber`, `sky-model` (Sky's values + catalog of his catches + corrections log), plus the older `project-brilliant-photography-clone`, `brilliant-research-findings`, `testing-discipline`. Read for SPIRIT, not letter.

## How to run / verify
- **Dev:** `npm run dev` → :5173 (or Claude_Preview MCP, server "aperture"). **Gate:** `npm test`. **Build:** `npm run build`.
- **Verify a lesson:** walk the FULL beat sequence in the UI (click Continue/Take-the-shot between beats), test wrong paths, at **mobile 375px** and desktop; confirm the keepsake matches what the lesson taught. Don't say "done" on a narrow check.

## Open / next (prioritized)
1. **DEPLOY — P0, needs YOU.** `firebase login` (interactive), then `npm run deploy` (Hosting + rules → `aperture-dac66.web.app`). Enable **Anonymous** sign-in in the Firebase console (else "try without an account" stays disabled). Then walk the graded scenario (signup → lesson → progress → logout → resume) on the **live URL**, mobile + desktop — that is success criterion #1 and is still unverified in its graded form.
2. **Dead code:** delete `DofView` + `Silhouette` + `src/sim/dof.js` and the `dof` entry in `STEP_VIEWS` — no lesson uses `kind: 'dof'` (verify: `grep "kind: 'dof'"` is empty; gate stays green). Deferred this session; benign but should go.
3. **Light & Direction (4 beats)** is the lightest lesson — deepen toward ~6 (light height/position, golden-hour warmth, a flattering-vs-dramatic transfer). `LightDirection.jsx` would need height + warmth params.
4. **Accessibility (real, deferred per "core first"):** every sim is `aria-hidden` — add an `aria-live` text readout of each sim's already-computed state; `ComposeView` is pointer-only — add keyboard (tap-to-place + arrow-nudge, like RankView).
5. **Cold-start (persona insight, not built):** render the first lesson beat with ZERO auth + lazy-load Firebase; ask for an account only at the first save. Highest-leverage onboarding fix.
6. **Optional depth:** metering "meter-fooled" causal spine (watch the reflective meter be confidently wrong on snow, then override it); WB green/magenta tint (engine is a single warm/cool `temp` axis today).

## Honest notes
- **Verify ground truth, including your own memory.** This session I confidently told the user "metering is 3 thin beats / the personas hallucinated it" — wrong; metering is 6 deep beats and the personas were right. Re-read files before asserting or editing. The `sky-model` corrections log records this.
- The build loop is meant to **self-govern** via `what-would-sky-do` (catch what Sky would catch before he has to) + `shimmering-personas` for evaluation — both run at Opus/max effort, web-researched.
- Nothing is committed yet this session — `git status` shows the working tree; commit when ready.
