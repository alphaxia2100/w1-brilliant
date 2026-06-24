---
name: aperture-lesson
description: Author or rebuild a lesson in the Aperture / Photography Foundations course (this repo), and verify it the way the project demands. Use whenever editing src/content/course.js, adding a lesson "beat", building a new step-view in src/engine/steps.jsx, or touching the pixel-scene / DofBokeh sims. Encodes the locked design + pedagogy conventions so work stays consistent and never re-loops.
---

# Authoring & verifying an Aperture lesson

This is a Brilliant.org-style interactive photography course, graded on **UX/interaction quality
"in doing what Brilliant does."** Design + interaction are the product. Standing value: **beauty in
simplicity; depth over breadth.** North star: `/Users/sky/.claude/plans/take-a-read-through-validated-platypus.md`.

## Structure (locked)
- The course = **4–7 topic-lessons** (`src/content/course.js`). Currently: Exposure Triangle,
  Depth of Field, Metering, White Balance, Composition (+ Light & Direction to come).
- A **lesson = one topic**, built from **5–10 single-step "beats"**; ~30–45 min total.
- **The exposure triangle is ONE lesson** (aperture/shutter/ISO/balance as beats) — never split it
  back into six. DoF is its own creative lesson.

## The six non-negotiables (every lesson must pass)
1. **Predict-first.** Open by making the learner *do/predict*; let the sim *surprise* them; THEN a
   short line confirms why. Never state the rule before the attempt. (Demote any `intro` to a
   post-attempt confirmation beat.)
2. **No multiple choice.** Every check is an *active* interaction. Match the form to the concept:
   ordinal → `rank` (tap tiles into order); continuous → `slider-sim`/`bokeh`/`capture`/`triangle`
   (adjust + "take the shot"); motion → `motion`; spatial → `compose`. Do NOT add `predict`.
3. **The artifact proves the rule.** A "take the shot" beat saves a keepsake (polaroid + Home roll)
   that MUST render through the *same* model as the lesson (e.g. DoF uses `DofBokeh` for both). No
   representation mismatch.
4. **Felt, not numeric.** Goals in photographer's terms ("melt the background", "freeze it razor
   sharp", "blow the highlights"). Never a millimetre / EV / hyperfocal target shown to the learner.
5. **Calm, never punishing.** Wrong = calm gray (`Feedback`), encouraging, re-tryable via `stages`
   hints that name a lever + direction, never a value. No danger-red on a learner mistake.
6. **Keepers only.** Wrong attempts are not collected; no failure count.

## Step kinds (registry in `src/engine/steps.jsx` STEP_VIEWS)
`intro` (text, post-attempt confirm) · `capture` (gather light to a target band) ·
`slider-sim` (one slider → PixelScene effect; opts: `iris`, `histogram`, `loupe`) ·
`bokeh` (forward flower DoF via `DofBokeh`, aperture slider) · `motion` (animated car, shutter) ·
`triangle` (3 sliders + level meter; `{4,4,4}` is level) · `rank` (tap to order; ordinal only) ·
`compose` (drag subject onto thirds). Shootable steps pass `meta.shot` → keepsake.

Lesson/beat data shape: `{ kind, prompt, ...controls, check:(v)=>bool, feedback:{ correct, stages:[...] } }`.
Helpers in course.js: `F_STOPS`, `ISO_STOPS`, `apertureToExposure`, `isoToExposure`, `isoToNoise`,
`wellMetered`, `highlightsBlown`.

## Design tokens (keep the style; see `tailwind.config.js` + `src/index.css`)
White/charcoal canvas, ONE **pear `#D8E82E`** accent, single `max-w-col` (432px), chunky tactile
widgets with hard offset shadow, mono for f-numbers/shutter values. Polaroid keepsake stays (2nd tap
skips). Pixel-scene aesthetic for exposure/ISO/motion; layered CSS blur (`DofBokeh`) for DoF — the
pixel grid CANNOT render smooth bokeh, do not box-blur DoF.

## Verify EVERY lesson before claiming done (testing-discipline)
1. `mcp__Claude_Preview__preview_start` name `aperture` (port 5173).
2. **Walk the full beat sequence** in the UI — click "Continue"/"Take the shot" between beats, not
   URL jumps. Confirm correct + wrong paths, the completion card (+XP, N correct / M missed), and
   "Next: <lesson>" points to the right lesson.
3. **Mobile 375px** (`preview_resize` preset mobile) AND desktop.
4. **Artifact check:** the captured keepsake on Home matches what the lesson taught.
5. Sims: `node Redesign/gate.mjs` for brightness monotonicity / metering window (extend it for new sims).
6. No console/server errors (`preview_console_logs` / `preview_logs`), no danger-red on a mistake,
   no white-screen on a forced render error.

Don't say "done" after a narrow check — do the genuine end-to-end pass.
