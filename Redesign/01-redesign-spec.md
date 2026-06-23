I now have full ground truth on the engine, the data shape, the feedback flow, and every defect's exact location. I have everything needed to write the spec.

# Ground-Up Redesign Spec — "Aperture" Photography Course

**Status:** implementation-ready. Scaffolding (engine, design system, auth, progress, XP) stays. This spec changes lesson *content*, *interaction depth*, and the *wrong-answer feedback engine*. All code references are verified against the live tree at `/Users/sky/Developer/Work/Alpha AI/Week 1 Brilliant/src/`.

Key files:
- `src/content/course.js` — lesson data (the bulk of the rewrite)
- `src/engine/steps.jsx` — step views + shared `Feedback` panel
- `src/engine/LessonPlayer.jsx` — the lesson loop, `handleResult`/`handleActivity`
- `src/sim/scene.js` — pixel engine (`computeGrid`, `apertureToBlurRadius`, `histogram`, `meanBrightness`)
- `src/components/ui.jsx` — `Slider`, `ApertureIris`, `Button`

---

## 1. The Wrong-Answer Feedback Model

### 1.1 Principle (non-negotiable)

A wrong answer is the highest-value moment in a lesson, not a failure to patch. We **guide without revealing** and, where the concept is renderable, we **show the consequence before we say anything**. We ban every current pattern that names the correct option in a wrong-hint (verified offenders: `course.js` L1:67, L2:115, L3:163, L4:210, L6:298, L7:346, L8:393).

### 1.2 The 3-tier ladder (+ tier 0 + consolidation)

Escalation is gated on **genuine attempts** (a real Check after re-engaging the control), not raw clicks, to defeat hint-harvesting.

| Tier | Trigger | What the learner gets | Hard rule |
|---|---|---|---|
| **0 — Consequence** | Every miss, immediately, when renderable | The sim re-renders **their wrong choice** so they watch it fail (blown-out, frozen-not-silky, cast-worsens). One short orienting line. | No "Incorrect" stamp as primary signal. Never print the target value/option. |
| **1 — Orient** (1st miss) | After consequence | A single **Socratic question** that re-applies the mental model and points at the relevant variable. | Don't name the correct option or its direction. |
| **2 — Nudge** (2nd miss) | Same concept missed again | Pointed next-step: name the right **lever + direction**, leave the **magnitude** to them. | Don't give the exact f-stop / EV / option. |
| **3 — Guided sub-step** (3rd+ or "show me") | Persistent miss | Work one sub-step **with** them; the learner still performs the final move. Answer, if stated, is framed as the *model* ("a fraction with a bigger denominator is smaller") never as the *letter*. | Don't auto-fill. Require an active re-attempt. |
| **Consolidation** | On reaching correct | Crisp "here's *why* that works" recap tying their path to the principle. | Never skip — productive failure only pays off with strong consolidation. |

Decision rule for tier 1 form: **visual consequence** if renderable (exposure, DoF, motion, WB, histogram); **Socratic question** if the error is relational (trade-offs, equivalent exposure); **direct statement** only for a pure vocabulary/fact error (rare here — e.g. "the right edge of a histogram is the brightest tone" is fair scaffolding, not a reveal).

### 1.3 Data/API shape (data-driven, fits the engine)

Today `feedback.wrong` is `string | string[]` and `handleResult` (LessonPlayer.jsx:26–41) has no idea **which** option was chosen. We change the schema and thread the choice through.

```js
// New feedback shape on any predict / slider-sim / triangle / compose step:
feedback: {
  correct: 'string — the consolidation recap',

  // Per-distractor Socratic tier-1 (keyed by the chosen wrong option index,
  // or by a coarse bucket for sliders: 'tooHigh' | 'tooLow').
  byOption: {
    0: 'You picked the bigger NUMBER. An f-number is a fraction — which slice is bigger, 1/2 of a pie or 1/16?',
  },

  // Escalation ladder used when byOption has no entry, or for tiers >= 2.
  // stages[0] = tier 1 fallback, stages[1] = tier 2 nudge, stages[2] = tier 3 sub-step.
  stages: [
    'Look at the result — what changed versus what you wanted?',
    'Right idea, wrong lever. It is the aperture, not the shutter — try the other direction.',
    'Each step toward f/1.4 doubles the light. You are about two stops short — make the move and check.',
  ],

  // Declarative "show-why" demo. The Feedback panel mounts a PixelScene (or other
  // widget) parameterized by the LEARNER'S wrong choice. Pure data, no imperative code.
  showWhy: {
    widget: 'PixelScene',        // 'PixelScene' | 'TwoIris' | 'LensDiagram' | 'BeforeAfter' | 'none'
    scene: 'portrait',
    // params can be a literal object, OR 'fromChoice' to reuse the learner's value:
    params: 'fromChoice',        // engine passes step.toParams(chosenValue)
    caption: 'Your f/16 — watch the scene go dark.',
    animate: 'pulse'             // 'pulse' | 'sweepFromCurrent' | 'none' — optional motion
  }
}
```

**Author ergonomics:** a lesson author declares Socratic hints as `byOption`/`stages` text and a `showWhy` block. Authors never write feedback logic. The simplest lesson can still ship `feedback: { correct, stages: [oneQuestion] }`. `showWhy.widget: 'none'` opts a subjective step (L9) out of forced visuals.

### 1.4 Engine changes to support it (small, contained)

1. **Thread the choice.** `PredictView` calls `onResult(sel === step.answer, { chosen: sel })`. `SliderSimView` passes `{ chosen: value, bucket: value > target ? 'tooHigh' : 'tooLow' }`. `handleResult(correct, meta)` selects the hint:
   - tier 1: `byOption[meta.chosen]` ?? `byOption[meta.bucket]` ?? `stages[0]`
   - tier ≥ 2: `stages[min(tries, last)]`
2. **Stop clearing the hint on re-pick.** `handleActivity` (LessonPlayer.jsx:44–49) currently wipes the hint the instant the learner touches a control, so escalation never advances and only the most-revealing `stages[0]` ever shows. **Fix:** keep the hint visible until the next Check; only `tries` increments drive the tier.
3. **Mount the show-why demo in the Feedback panel.** Extend `Feedback` (steps.jsx:7–23) to accept an optional `showWhy` + `chosen` and render the declared widget under the text. One render path, reused by L1/L2/L3/L4/L6/L7/L8.

This single engine change is what makes every per-lesson "show why" below renderable.

---

## 2. Per-Lesson Redesign

Cross-cutting reorder for all 9: **predict → manipulate (surprise) → confirm.** Today every lesson front-loads an `intro` that spoils the answer, then post-tests it. Demote `intro` prose to a post-manipulation confirmation; promote a (re-tuned) `predict` to the front so a beginner's wrong intuition collides with the sim. Keep the calm-gray feedback, XP-only, single 432px column.

### L1 — A photo is collected light (`collected-light`)
- **Keep** `capture`. **Add** live clipping *before* Take: as the slider passes the band edges, the live `PixelScene` blows out / goes black under the learner's hand (foreshadows L7). Add a real-time histogram building during the accumulation animation (re-uses `histogram`).
- **Predict fix (minor reveal, L1:67):** replace distractor "Press the shutter button harder" with a plausible wrong one — **"Use a narrower aperture."** Tier-1 `byOption`: *"Think of the bucket in the rain — to catch MORE rain, do you hold it out for a longer or a shorter time?"* `showWhy`: render the chosen "shorter shutter" consequence — bucket fills less, photo darker (opposite of goal).
- **Add** a "+1 stop / −1 stop" toggle on the stops intro that visibly doubles/halves the fill bar, so the doubling rule is operated, not read.

### L2 — Aperture: the size of the hole (`aperture-hole`) — DEEP REWORK
- **Fix the brightness bug first (critical, see Defect #1).** Replace `apertureToExposure` so each f-stop is a visible, monotonic 1-stop step across f/1.4..f/16 with no wide-end clamp:
  ```js
  // index-based, 1 stop per stop, anchored mid-scale so nothing saturates
  const F_STOPS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16]
  const apertureToExposure = (f) => {
    const i = F_STOPS.indexOf(f)          // 0..7, f/1.4 -> 0
    return (3.5 - i) * 0.6                 // f/1.4 ≈ +2.1, f/5.6 ≈ +0.3, f/16 ≈ -2.1
  }
  ```
  Verify f/1.4 > f/2 > f/2.8 each visibly brighter. One stop = one visible step, consistent with L1 (kill the `2*log2` double-rate).
- **Make the iris the teaching instrument.** Render the f-number as a **literal fraction**: a fixed focal-length bar + a live diameter readout + `f = focal ÷ diameter` shown so the learner watches the **denominator grow as the hole shrinks**. Add a pizza-slice/fraction overlay driven by the same slider (f/2 = half pie, f/16 = sliver).
- **Better success condition:** replace `check: f<=2` with either (a) require the single brightest `f===1.4` so the check matches the "as bright as you can" prompt, or (b) the stronger **rank task**: drag three unlabeled apertures into most-light → least-light order. Recommend (b) once the new widget lands; ship (a) immediately to fix the defect.
- **Predict fix (critical reveal, L2:115):** `byOption[0]`: *"You picked the bigger number. An f-number is a fraction — which is the bigger slice, 1/2 of a pie or 1/16?"* `showWhy` widget **`TwoIris`**: f/2 and f/16 side-by-side with proportional light cones (flood vs trickle). No text names the winner.
- **Kill the spoiler** in the intro ("that's where the twist is") — demote to post-confirmation.

### L3 — Depth of field (`depth-of-field`) — DEEPEST REWORK
This is the lesson with the worst factual error (aperture-only DoF) and needs the new optics widgets.

**New widget A — `LensDiagram` (side-view optics, SVG):** the canonical side view along the optical axis: subject point (left) → light cone filling the aperture → lens with focal points F → sensor (right) with a fixed **circle-of-confusion** reference segment → a **shaded DoF band** between `uNear` and `uFar`, drawn **asymmetric** (more behind). Draw three cones (subject converges to a point; near/far points land as discs). As aperture widens, the cone fattens and the near/far discs blow past the CoC segment → the sharp band visibly shrinks. Caption hedge (Defect, minor): *"Aperture is the lever you reach for first — distance and lens length matter too, later."*

**New widget B — `DoFPlayground` (the four-factor coupled trio):** three panels sharing one state `{N, u, f, sensorDiagonal, bgDistance}` and one `recompute()`:
```js
const c = sensorDiagonal / 1500;              // circle of confusion
const H = (f*f)/(N*c) + f;                    // hyperfocal
const uNear = (f*f*u) / (f*f + c*N*(u - f));
const uFar  = (f*f*u) / (f*f - c*N*(u - f));  // ∞ when denom <= 0
const dof   = uFar - uNear;
// per-object background blur disc on sensor -> drives result-image blur radius:
const blur = (f*f/(N*(u - f))) * Math.abs(s - u)/s;
```
- **Controls:** stepped f-stop slider (real stops), draggable subject (distance `u`), focal-length slider, format dropdown (FF / APS-C / m43 / phone → sets `sensorDiagonal` → `c`).
- **Panel 1:** the `LensDiagram` above. **Panel 2:** result image — the existing `PixelScene` portrait, but each background object's blur radius comes from `blur(s)` (extend `apertureToBlurRadius` into a distance-aware `blurRadius(N,f,u,s)`). **Readouts** sit *next to* their geometry (CoC on the sensor, near/far on the limit lines).
- **The myth-proofing toggle (critical pedagogy):** radio `fixed spot` vs `same framing`. In `same framing`, changing `f` or format auto-adjusts `u` to hold magnification (`m = f/(u−f)`), so the learner *sees* DoF barely moves with focal length under constant framing — teaching the truth, not the myth. Put format/hyperfocal/diffraction behind an "Advanced" expander.
- **Decouple-from-L2 chip:** show a small "brightness: locked" chip so the learner registers aperture has *two* jobs and we froze one. (Defect: L3 `toParams` sets `exposure:0` — keep it for variable isolation, but make it explicit.)
- **Predict fix (critical reveal, L3:163):** `byOption`: *"In the slider above, which end kept the WHOLE scene sharp — wide open, or stopped down? You need near and far both in focus."* `showWhy` widget **`LensDiagram`** parameterized by the chosen wide aperture: the sharp band fails to cover both flowers and mountains.
- **Intro fix (minor):** reword the absolute "blurs everything except your subject / keeps the whole scene sharp" to *"A wide opening can throw the background out of focus; a narrow one tends to keep the scene sharp — distance and lens matter too."*

### L4 — Shutter speed (`shutter-speed`)
- **Couple shutter to brightness** (`toParams` currently `exposure:0` — Defect): let slow shutter brighten as well as smear, so the exposure cost of freezing is felt — the bridge to L5/L6.
- **Camera-shake vs subject-motion toggle:** tripod (only subject smears) vs handheld (whole frame smears). Requires a `shake` effect: apply `horizontalSmear` to the **whole grid** when handheld, vs subject-only today. Two cases, same shutter, different blur — teaches "blur scales with relative motion," fixing the conflation defect.
- **Two-goal task:** "freeze it" then "make it silky" on the same scene, so both directions of the relationship are operated. Add a shutter-open timeline bar + subject travel arrow (linked representation).
- **Predict fix (critical reveal, L4:210):** `byOption`: *"Silky water is water that moved while the shutter was open. Does the curtain need to stay open a long slice of time, or a tiny one?"* `showWhy`: render the chosen 1/1000 — water snaps to frozen droplets, visibly NOT silky.

### L5 — ISO: brightness at a cost (`iso-noise`)
- **Reframe: ISO amplifies, it does not collect.** Add three linked bars: **light collected** (flat as ISO climbs), **signal amplified** (rises), **noise** (rises). The flat collected-light bar is the visceral proof ISO ≠ light. Pair the loupe with a clean-vs-amplified comparison so the learner discovers "ISO is the lever of last resort."
- **Brightness dead-zone fix (minor, Defect #?):** `isoToExposure` clamps at +2.3 by ISO 3200, so 3200/6400/12800 are identical brightness. Either extend the clamp so each stop adds visible brightness to 12800, or cap the slider at 3200. Recommend extending so every reachable stop changes the image.
- **Predict:** keep (it's sound), but reframe `wrong` Socratically. `byOption`: *"You're in a dark room — does turning ISO up collect more light, or amplify what's already there?"* `showWhy`: collected-light bar stays flat while noise climbs.

### L6 — The triangle (`the-triangle`) — hero
- **Fix the math (Defect):** transparent centered model — all three indices centered, `sum=0` at center, `{4,4,4}` neutral. Current `sum = 4 - ai + (si-4) + (ii-2)` makes `{4,4,4}` read 2 stops over via hidden asymmetry. Replace with `sum = (4-ai) + (4-si) + (4-ii)` (or per-control offsets that genuinely center).
- **Make side effects part of success, not decoration.** New goal with a real trade-off: *"Freeze this motion AND keep the background blurred while staying level."* Over-constrained, so the learner must trade ISO grain and *feel* the cost. Add constraint puzzles ("dim sports, shutter pinned at 1/1000 — fix the darkness").
- **One shared currency made literal:** a single "total light" meter fed by three tributary stop-gauges; moving any control one stop moves the master one stop; a compensating control must give one back to re-level.
- **Predict fix (critical reveal, L6:298):** `byOption`: *"Same brightness, agreed. List what's different: f/2.8 vs f/8. From lesson 3, what does a much wider aperture do to the background?"* `showWhy` widget **`BeforeAfter`**: two shots at equal luminance — f/8 sharp bg vs f/2.8 blurred bg.

### L7 — Metering (`metering`)
- **Fix the broken scene/check (critical, Defect):** the current landscape never clips shadows (left fraction stays 0.000), and `start=-1.7` already passes `wellMetered`, so the learner can press Check without moving. Use a scene/start that genuinely clips shadows (left-edge fraction > 0.09 at start), and tighten the pass window: require **both** clip fractions ≤ 0.09 **AND** mean brightness in a mid band, so the start fails and only a correction passes.
- **Link the histogram to the scene:** blown highlights *blink* in the `PixelScene` at the moment the histogram piles against an edge — "spike at the edge" and "that white sky has no detail" become one event.
- **Two-sided task + scene caveat:** add "now push it too far and watch the highlights blow" so the learner produces the right-edge spike the predict asks about; add a line that the ideal histogram depends on the scene (snow sits right, night sits left) so "spread to the middle" isn't over-generalized.
- **Predict fix (critical reveal, L7:346):** `byOption`: *"The right edge is the brightest possible tone — pure white. If pixels are piled AT that wall, what's happened to the detail there?"* `showWhy`: push exposure until the bright region goes flat white and loses texture, right-edge bar slamming in sync.

### L8 — White balance (`white-balance`)
- **Model a fixed cast + opposing correction (Defect):** today the slider value *is* the tint (`toParams: v=>({temp:v})`) and neutral = slider at zero, teaching "correct WB = no adjustment." Instead bake a fixed orange cast into the scene and have the slider apply the **opposite** (cooling) correction; neutral occurs when cooling cancels the fixed warm cast, not at zero. Add a known-neutral object (gray card) + RGB readout so success = "make the gray read gray (R≈G≈B)," an objective anchor.
- **Show the cancellation:** a two-headed warm-cool arrow indicator — cast (orange) and correction (blue) opposing toward neutral. Let them over-correct into blue to feel WB is a balance you can push past neutral. Add a label: warm light = low Kelvin (so direction isn't learned inverted).
- **Predict fix (critical reveal, L8:393):** `byOption`: *"A cast is cancelled by adding its opposite. Orange's opposite on the color wheel is…?"* `showWhy`: on a "warmer" pick, the scene slides MORE orange (cast worsens).

### L9 — Composition: rule of thirds (`rule-of-thirds`)
- **Make the image respond.** Give the subject a facing direction so on-third placement creates lead room and centered feels cramped; tie the sea/sky split to a third. Reward a **range** near the line, not a pinpoint (`< 11` units) — embody "guideline, not law."
- **Contrasting cases:** before/after of dead-center vs on-third, *"which feels more dynamic — why?"*
- **Predict fix (critical reveal, L9:434):** subjective "why," so Socratic **elimination** not a forced visual. `byOption`: *"Two of these are factually false — placement doesn't change brightness, and pros break this rule constantly. That leaves one."* `showWhy: { widget: 'none' }` (optional A/B toggle, no text). This honors "don't force a visual where it doesn't fit."

---

## 3. Widgets / Step-Types

**Reuse as-is:** `PixelScene`, `Slider`, `Button`, `ProgressBar`, `Histogram`, `ApertureIris`, `compose` drag, `predict`, `capture`, `triangle`, the loupe crop.

**Extend:**
- `Feedback` (steps.jsx) → mounts a declarative `showWhy` widget under the text, parameterized by the learner's wrong choice.
- `apertureToBlurRadius` → distance-aware `blurRadius(N, f, u, s)` for the DoF result image.
- `computeGrid` → add whole-frame `shake` smear (vs subject-only) for L4; add a fixed-scene-cast option for L8.

**New widgets/step-types to build:**
1. **`TwoIris`** — two side-by-side irises with proportional light cones (L2 show-why). Cheapest; build first.
2. **`LensDiagram`** — side-view optics (subject, cones, lens+F, sensor, CoC segment, asymmetric DoF band). Used in L3 lesson body *and* L3 show-why.
3. **`DoFPlayground`** — three-panel coupled rig (controls + LensDiagram + live result image) with `fixed spot`/`same framing` toggle. The L3 hero. New step-kind `dof-playground`.
4. **`BeforeAfter`** — two `PixelScene`s side-by-side at declared params (L6 show-why; reusable in L9, L7).
5. **`StopToggle`** — +1/−1 stop button driving a doubling bar (L1).
6. **`LinkedBars`** — light-collected / amplified / noise trio (L5) and the triangle's stop-currency meter (L6).
7. **`shutter-two-goal`** — slider-sim variant accepting an array of sequential goals (L4).

---

## 4. Confirmed, Deduplicated Defect List (ranked)

| # | Sev | Lesson | Defect | Fix |
|---|---|---|---|---|
| 1 | **Critical** | L2 slider | `apertureToExposure=clamp(2*log2(5.6/f),±2.5)` clamps the OUTPUT: f/1.4 and f/2 render **pixel-identical** brightness, f/2.8 near-max; `2*log2` also doubles the per-stop rate, contradicting L1. The sim disproves its own "bigger hole = more light." | Index-based 1-stop-per-stop mapping, no wide-end clamp (§2 L2). Verify f/1.4>f/2>f/2.8 each visibly brighter. |
| 2 | **Critical** | L2 predict | Wrong-hint names the answer: *"So f/2 is the bigger opening"* (L2:115). | `byOption` pie-fraction question + `TwoIris` show-why. |
| 3 | **Critical** | L3 | DoF modeled aperture-only (`apertureToBlurRadius` pure fn of f, hard-zero above f/5.6); distance/focal-length/sensor absent; intro states falsehood as fact. | `DoFPlayground` four-factor rig + `same framing` toggle; intro hedge. |
| 4 | **Critical** | L3 predict | Wrong-hint names answer: *"pick a narrow aperture like f/11"* (L3:163). | `byOption` recall-the-slider question + `LensDiagram` show-why. |
| 5 | **Critical** | L4 predict | Wrong-hint names answer: *"a slow shutter like 1/8s"* (L4:210). | Mechanism question + frozen-water show-why. |
| 6 | **Critical** | L6 predict | Wrong-hint verbatim answer: *"their background is more blurred"* (L6:298). | `byOption` list-the-differences question + `BeforeAfter`. |
| 7 | **Critical** | L7 slider | Scene never clips shadows; `start=-1.7` already passes `wellMetered` (whole range −2.5..+0.1 passes) → Check passes without moving. Premise ("underexposed") false. | New clipping scene + tighter pass window (both clips ≤0.09 AND mid-band mean). |
| 8 | **Critical** | L7 predict | Wrong-hint states conclusion: *"those areas are pure white — blown highlights"* (L7:346). | Axis-meaning question + blow-the-highlights show-why. |
| 9 | **Critical** | L8 predict | Wrong-hint names answer: *"cool it down toward blue"* (L8:393). | Color-wheel-opposite question + cast-worsens show-why. |
| 10 | **Critical** | L9 predict | Wrong-hint restates answer: *"reads as more dynamic and balanced"* (L9:434). | Socratic elimination, no forced visual. |
| 11 | **Critical** | Global | `Feedback` only prints text; `handleResult` has no `chosen`; hints default to globally restating truth; `handleActivity` clears hint on re-pick so escalation never advances (only most-revealing tier shows). | New tiered/per-option schema (§1.3) + thread `chosen` + stop clearing on re-pick + mount show-why in panel. |
| 12 | **Major** | L6 triangle | False equivalence (1-stop-per-notch all controls), side effects cosmetic, `{4,4,4}` start non-neutral via hidden offset, arithmetic-only success. | Centered transparent math + over-constrained trade-off goal + side effects in success criteria. |
| 13 | **Major** | L4 | Smear keyed to subject regardless of motion; conflates shake with subject motion; `exposure:0` decouples shutter from brightness (undercuts L6). | Couple brightness; add shake-vs-motion toggle; two-goal task. |
| 14 | **Major** | L3 | `toParams` sets `exposure:0` — aperture changes blur but not brightness, contradicting L2 and undermining L6's equivalent-exposure premise. | Couple aperture→brightness (or explicit "brightness locked" chip with rationale). |
| 15 | **Major** | L5 | Frames ISO as a third *light source* (reinforces "ISO adds light" misconception). | Linked light-collected/amplified/noise bars; reframe as amplification. |
| 16 | **Major** | L2 interaction | One-knob-to-brightness; f-as-fraction asserted, never experienced; iris not connected to "/f". | Iris as teaching instrument (live fraction) + rank task. |
| 17 | **Minor** | L2 check | `check: f<=2` accepts both f/1.4 and f/2 yet feedback singles out f/1.4. | Require `f===1.4` (or rank task). |
| 18 | **Minor** | L5 slider | `isoToExposure` clamps +2.3 by ISO 3200 → 3200/6400/12800 identical brightness (dead-zone). | Extend clamp to 12800 or cap slider at 3200. |
| 19 | **Minor** | L8 slider | Slider value *is* the tint; neutral = zero adjustment, teaching "correct WB = no change." | Fixed scene cast + opposing correction; gray-card R≈G≈B target. |
| 20 | **Minor** | L1 predict | "Press the shutter button harder" answerable by absurdity-elimination. | Replace with "Use a narrower aperture." |
| 21 | **Minor** | L1 capture | Clipping consequence only shown after Take, not under the hand. | Live blow-out/black before capture. |
| 22 | **Minor** | L3 intro | Absolute "blurs everything except your subject." | Hedge + distance/focal-length note. |
| 23 | **Minor** | L7 | Tests only the underexposed→spread direction; "centered histogram" over-generalized as always-correct. | Two-sided task + scene-dependent caveat. |
| 24 | **Minor** | L9 compose | `near<11` pinpoint target with no compositional content; teaches WHERE not WHY, contradicts "guideline not law." | Image responds (lead room/horizon); reward a range. |
| 25 | **Minor** | L3 diagram | Authoritative optics diagram risks hardening aperture-only misconception. | One-line caption hedge on the diagram. |

---

## 5. Phased Build Order

Each phase ships independently and keeps the app working.

**Phase 0 — Feedback engine (unblocks everything).** Implement §1.3 schema + §1.4 engine changes: thread `chosen`/`bucket` into `handleResult`, stop clearing the hint on re-pick, extend `Feedback` to mount `showWhy`. Build `TwoIris` and `BeforeAfter` (cheap, reused widely). *High value, low risk.* No lesson behaves worse; show-why simply renders where declared.

**Phase 1 — Kill every answer-reveal (Defects #2,4,5,6,8,9,10,20).** Rewrite all `feedback.wrong` strings into `byOption`/`stages`/`showWhy` data. Pure content edits in `course.js`. This is the user's #1 complaint and is fixable in a day once Phase 0 lands. *Highest value-per-effort.*

**Phase 2 — Fix the broken sims (Defects #1,7,17,18).** L2 brightness remap + check, L7 scene+check, L5 dead-zone. These are correctness bugs where the sim currently contradicts the lesson; fix before adding depth so the new show-why visuals have visual truth. *Critical correctness.*

**Phase 3 — L2 & L3 deep rework (Defects #3,14,16).** Build `LensDiagram` + `DoFPlayground` + distance-aware blur; iris-as-fraction + rank task. The biggest pedagogical payoff and the most engineering. *High value, high effort — the headline of the overhaul.*

**Phase 4 — Couplings & triangle (Defects #12,13,15).** L4 brightness+shake, L6 transparent math + trade-off goal + stop-currency meter, L5 linked bars. Makes the exposure triangle honest. *High value.*

**Phase 5 — Polish & nice-to-have (Defects #19,21,22,23,24,25 + predict→manipulate reorder).** L8 cast model, L1 live clipping + stop toggle, L7 two-sided, L9 responsive composition, intro hedges, beat reorder. *Nice-to-have; each is a small isolated edit.*

Ship Phases 0–2 first: they remove the critical reveals and the self-contradicting sims with minimal new code. Phases 3–4 are the depth investment. Phase 5 is incremental polish.