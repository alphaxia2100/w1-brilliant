I'll produce the final plan directly. The verifier corrections are decisive on a few points, so let me reconcile them before writing: the aperture fix must be re-derived against a real scene (not the spec's `0.6` formula), the tier-3 reveal leaks must be closed, `DoFPlayground` must be trimmed to single-radius blur + FF-only, and the Defect #14 table entry must be corrected to match the body. I have everything I need to write the source of truth.

# Aperture Course — Redesign Source of Truth

**Status:** Implementation-ready. Incorporates verifier corrections. Scaffolding (engine, design system, auth, progress, XP) is retained; this overhaul changes lesson content, interaction depth, and the wrong-answer feedback engine. All code references verified against `/Users/sky/Developer/Work/Alpha AI/Week 1 Brilliant/src/`.

**Key files**
- `src/content/course.js` — lesson data (bulk of the rewrite)
- `src/engine/steps.jsx` — step views + shared `Feedback` panel
- `src/engine/LessonPlayer.jsx` — lesson loop, `handleResult` / `handleActivity`
- `src/sim/scene.js` — pixel engine (`computeGrid`, `apertureToBlurRadius`, `histogram`, `meanBrightness`)
- `src/sim/PixelScene.jsx` — scene renderer
- `src/components/ui.jsx` — `Slider`, `ApertureIris`, `Button`

---

## 1. Executive Summary

**What's wrong today.** The course teaches by telling: every lesson front-loads an `intro` that states the answer, then "tests" it with a predict step whose wrong-answer hint *names the correct option* (verified at L1:67, L2:115, L3:163, L4:210, L6:298, L7:346, L8:393, L9:434). The feedback engine cannot do better even if the text were fixed: `handleResult` never receives *which* option the learner chose, the `Feedback` panel only prints a string, and `handleActivity` wipes the hint the instant a control is touched — so escalation never advances and only the most-revealing hint ever shows. Worse, several sims contradict the lessons they teach: the L2 aperture mapping clamps so f/1.4 and f/2 render pixel-identical ("bigger hole = more light" is disproven by its own sim); L3 models depth of field as aperture-only with a hard blur cliff above f/5.6 (factually wrong — distance, focal length, and sensor size are absent); L7's metering scene never clips shadows and passes Check before the learner moves anything.

**Redesign thesis.** Invert the loop to **predict → manipulate (surprise) → confirm**, and treat a wrong answer as the highest-value moment, not a failure to patch. Replace string hints with a **data-driven, tiered feedback model** that *shows the consequence of the learner's actual wrong choice* before saying anything, then guides without revealing. Make the sims physically honest — especially aperture brightness (L2) and the four-factor depth-of-field model (L3) — so the visuals the new feedback relies on are *true*. The engine, design system, and progression stay; content and interaction depth are rebuilt on top.

---

## 2. Confirmed Defect List (ranked)

Severity-ranked, deduplicated. Critical = teaches something false or blocks the redesign; Major = undermines a concept; Minor = isolated polish.

| # | Sev | Lesson | Defect | Fix |
|---|---|---|---|---|
| 1 | **Critical** | L2 sim | **The aperture bug.** `apertureToExposure = clamp(2*log2(5.6/f), ±2.5)` clamps the *output*: f/1.4 and f/2 render pixel-identical, f/2.8 near-max; the `2*log2` also doubles the per-stop rate, contradicting L1. The sim disproves its own "bigger hole = more light." | Re-derive mapping against a **headroom-having scene**, anchoring the **brightest stop at exposure ≈ 0 and descending** (f/1.4 ≈ 0, f/16 ≈ −4.2). See §4 L2 and the corrected formula. **Gate on measured `meanBrightness` per stop, not an eyeballed coefficient.** |
| 2 | **Critical** | L2 predict | Wrong-hint names the answer (*"So f/2 is the bigger opening"*, L2:115). | `byOption` pie-fraction question + `TwoIris` show-why. |
| 3 | **Critical** | L3 | DoF modeled aperture-only (`apertureToBlurRadius` pure fn of f, **hard-zero above f/5.6 at scene.js:222**); distance / focal length / sensor absent; intro states a falsehood as fact. | `DoFPlayground` four-factor rig + `same framing` anti-myth toggle; remove the f>5.6 hard-zero everywhere; intro hedge. |
| 4 | **Critical** | L3 predict | Wrong-hint names the answer (*"pick a narrow aperture like f/11"*, L3:163). | `byOption` recall-the-slider question + `LensDiagram` show-why. |
| 5 | **Critical** | L4 predict | Wrong-hint names the answer (*"a slow shutter like 1/8s"*, L4:210). | Mechanism question + frozen-water show-why. |
| 6 | **Critical** | L6 predict | Wrong-hint is the verbatim answer (*"their background is more blurred"*, L6:298). | `byOption` list-the-differences question + `BeforeAfter`. |
| 7 | **Critical** | L7 sim | Scene never clips shadows; `start=-1.7` already passes `wellMetered` (entire −2.5..+0.1 range passes) → Check passes without moving. Premise ("underexposed") is false. | New shadow-clipping scene + tighter pass window (both clip fractions ≤ 0.09 **AND** mid-band mean). |
| 8 | **Critical** | L7 predict | Wrong-hint states the conclusion (*"those areas are pure white — blown highlights"*, L7:346). | Axis-meaning question + blow-the-highlights show-why. |
| 9 | **Critical** | L8 predict | Wrong-hint names the answer (*"cool it down toward blue"*, L8:393). | Color-wheel-opposite question + cast-worsens show-why. |
| 10 | **Critical** | L9 predict | Wrong-hint restates the answer (*"reads as more dynamic and balanced"*, L9:434). | Socratic elimination (the least-revealing option for a subjective item — see §3 honesty note). |
| 11 | **Critical** | Global engine | `Feedback` only prints text; `handleResult` has no `chosen`; hints default to restating truth; `handleActivity` clears the hint on re-pick so escalation never advances. | New tiered/per-option schema (§3) + thread `chosen` + stop clearing on re-pick + mount show-why in panel. |
| 12 | **Major** | L6 triangle | False equivalence (1-stop-per-notch on all controls), side effects cosmetic, `{4,4,4}` start reads ~2 stops over via hidden offset, arithmetic-only success. | Centered transparent math + over-constrained trade-off goal. |
| 13 | **Major** | L4 | Smear keyed to subject regardless of motion (conflates shake with subject motion); `exposure:0` decouples shutter from brightness, undercutting L6. | Couple brightness; add shake-vs-motion toggle; two-goal task. |
| 14 | **Major** | L3 | `toParams` sets `exposure:0` — aperture changes blur but not brightness. | **Corrected (was "couple aperture→brightness"): keep `exposure:0` for deliberate variable isolation; add an explicit "brightness: locked" chip with rationale.** Coupling here would reintroduce the brightness variable and muddy the DoF lesson. |
| 15 | **Major** | L5 | Frames ISO as a third *light source* (reinforces "ISO adds light"). | Linked light-collected / amplified / noise bars; reframe as amplification. |
| 16 | **Major** | L2 interaction | One-knob-to-brightness; f-as-fraction asserted, never experienced; iris not tied to `/f`. | Iris as teaching instrument (live fraction) + rank task. |
| 17 | **Minor** | L2 check | `check: f<=2` accepts both f/1.4 and f/2 yet feedback singles out f/1.4. | Require `f===1.4` (or rank task). |
| 18 | **Minor** | L5 slider | `isoToExposure` clamps +2.3 by ISO 3200 → 3200/6400/12800 identical (dead-zone). | Extend clamp to 12800 (recommended) or cap slider at 3200. |
| 19 | **Minor** | L8 slider | Slider value *is* the tint; neutral = zero adjustment, teaching "correct WB = no change." | Fixed scene cast + opposing correction; gray-card R≈G≈B target. |
| 20 | **Minor** | L1 predict | "Press the shutter button harder" answerable by absurdity-elimination. | Replace with "Use a narrower aperture." |
| 21 | **Minor** | L1 capture | Clipping consequence only shown after Take, not under the hand. | Live blow-out/black before capture. |
| 22 | **Minor** | L3 intro | Absolute "blurs everything except your subject." | Hedge + distance/focal-length note. |
| 23 | **Minor** | L7 | Tests only underexposed→spread; "centered histogram" over-generalized. | Two-sided task + scene-dependent caveat. |
| 24 | **Minor** | L9 compose | `near<11` pinpoint target with no compositional content; teaches WHERE not WHY. | Image responds (lead room / horizon); reward a range. |
| 25 | **Minor** | L3 diagram | Authoritative optics diagram risks hardening the aperture-only misconception. | One-line caption hedge. |

---

## 3. Wrong-Answer Feedback Model

### 3.1 Principle (non-negotiable)
A wrong answer is the highest-value moment. We **guide without revealing**, and where the concept is renderable we **show the consequence before we say anything**. No wrong-hint may name the correct option, its direction *and* magnitude, or a specific target value.

### 3.2 The tiered ladder
Escalation is gated on **genuine attempts** (a real Check after re-engaging the control), not raw clicks, to defeat hint-harvesting.

| Tier | Trigger | What the learner gets | Hard rule |
|---|---|---|---|
| **0 — Consequence** | Every miss, immediately, when renderable | The sim re-renders **their wrong choice** so they watch it fail. One short orienting line. | No "Incorrect" stamp as the primary signal. Never print the target value/option. |
| **1 — Orient** (1st miss) | After consequence | A single **Socratic question** re-applying the mental model, pointing at the relevant variable. | Don't name the correct option or its direction. |
| **2 — Nudge** (2nd miss) | Same concept missed again | Name the right **lever + direction**; leave **magnitude** to the learner. | Don't give the exact f-stop / EV / option. |
| **3 — Guided sub-step** (3rd+ or "show me") | Persistent miss | Work one sub-step *with* them; learner still performs the final move. Answer, if stated, is the **model** ("a fraction with a bigger denominator is smaller"), never the **letter or a named target**. | Don't auto-fill. Require an active re-attempt. **Never name a specific f-stop or a stop-count** (see correction below). |
| **Consolidation** | On reaching correct | Crisp "here's *why* that works," tying their path to the principle. | Never skip — productive failure only pays off with strong consolidation. |

**Tier-1 form decision rule:** *visual consequence* if renderable (exposure, DoF, motion, WB, histogram); *Socratic question* if relational (trade-offs, equivalent exposure); *direct statement* only for a pure vocabulary/fact error (rare — e.g. "the right edge of a histogram is the brightest tone").

**Verifier correction — close the tier-3 reveal leaks.** The draft tier-3 text *"Each step toward f/1.4 doubles the light. You are about two stops short"* uniquely determines the answer and violates the non-negotiable. Tier-3 text must name **no specific f-stop and no stop-count**. Corrected canonical example:
> "Each step toward the wide end doubles the light — make a move and Check."

**Honesty note on L9.** Socratic elimination (*"two of these are factually false — that leaves one"*) is *revealing by deduction*, not "guiding without revealing." We ship it for the pure-subjective item because it is the *least-bad* option there — but we do not claim it is non-revealing. Every other lesson uses true non-revealing guidance.

### 3.3 Lesson-author data shape
Authors declare hints as data; they never write feedback logic.

```js
feedback: {
  correct: 'string — the consolidation recap',

  // Per-distractor Socratic tier-1, keyed by chosen wrong option index,
  // or by a coarse slider bucket: 'tooHigh' | 'tooLow'.
  byOption: {
    0: 'You picked the bigger NUMBER. An f-number is a fraction — which is the bigger slice, 1/2 of a pie or 1/16?',
  },

  // Escalation ladder, used when byOption has no entry or for tiers >= 2.
  // stages[0] = tier-1 fallback, stages[1] = tier-2 nudge, stages[2] = tier-3 sub-step.
  stages: [
    'Look at the result — what changed versus what you wanted?',
    'Right idea, wrong lever — it is the aperture, not the shutter. Try the other direction.',
    'Each step toward the wide end doubles the light — make a move and Check.', // no named f-stop, no stop-count
  ],

  // Declarative "show-why" demo. The Feedback panel mounts a widget
  // parameterized by the LEARNER'S wrong choice. Pure data, no imperative code.
  showWhy: {
    widget: 'PixelScene',   // 'PixelScene' | 'TwoIris' | 'LensDiagram' | 'BeforeAfter' | 'none'
    scene: 'portrait',
    params: 'fromChoice',   // literal object OR 'fromChoice' (engine calls step.toParams(chosenValue))
    caption: 'Your f/16 — watch the scene go dark.',
    animate: 'pulse'        // 'pulse' | 'none'  (sweepFromCurrent deferred — see §5/§6)
  }
}
```

**Author ergonomics.** The simplest lesson ships `feedback: { correct, stages: [oneQuestion] }`. `showWhy.widget: 'none'` opts a subjective step (L9) out of forced visuals.

### 3.4 Engine changes (small, contained — Phase 0)
1. **Thread the choice.** `PredictView` → `onResult(sel === step.answer, { chosen: sel })`. `SliderSimView` → `{ chosen: value, bucket: value > target ? 'tooHigh' : 'tooLow' }`. `handleResult(correct, meta)` selects the hint:
   - tier 1: `byOption[meta.chosen]` ?? `byOption[meta.bucket]` ?? `stages[0]`
   - tier ≥ 2: `stages[min(tries, last)]`
2. **Stop clearing the hint on re-pick.** `handleActivity` (LessonPlayer.jsx:44–49) currently wipes the hint the instant a control is touched, so escalation never advances. Keep the hint visible until the next Check; only `tries` increments drive the tier.
3. **Mount show-why in the panel.** Extend `Feedback` (steps.jsx:7–23) to accept optional `showWhy` + `chosen` and render the declared widget under the text. One render path, reused by L1/L2/L3/L4/L6/L7/L8.

---

## 4. Per-Lesson Redesign

Cross-cutting reorder for all 9: **predict → manipulate (surprise) → confirm.** Demote spoiler `intro` prose to post-manipulation confirmation; promote a re-tuned `predict` to the front. Keep calm-gray feedback, XP-only, single 432px column.

### L1 — A photo is collected light (`collected-light`)
- **Keep** `capture`. **Add** live clipping *before* Take: as the slider passes band edges the live `PixelScene` blows out / goes black under the learner's hand (foreshadows L7). Build a real-time histogram during the accumulation animation (reuse `histogram`).
- **Predict fix (#20):** replace "Press the shutter button harder" with **"Use a narrower aperture."** Tier-1 `byOption`: *"Think of the bucket in the rain — to catch MORE rain, do you hold it out for a longer or a shorter time?"* `showWhy`: render the chosen "shorter shutter" consequence — bucket fills less, photo darker.
- **Add** a "+1 stop / −1 stop" `StopToggle` that visibly doubles/halves the fill bar.

### L2 — Aperture: the size of the hole (`aperture-hole`) — DEEP REWORK
**Fix the brightness bug first (Defect #1) — corrected mapping.** The verifier proved the draft `(3.5 - i) * 0.6` mapping blows out the wide end on the real `landscape` scene (f/1.4 → 95% pixels clipped to white; f/1.4, f/2, f/2.8 visually indistinguishable — the original bug relocated). The mapping was also internally contradictory ("1 stop per stop" prose vs `0.6` coefficient). **Two coupled fixes are required:**

1. **Use a scene with highlight headroom for L2's brightness task** (interior/shade scene, not `landscape` with its bright sky + clipping sun). The brightness lesson cannot live on a scene whose default already sits near white.
2. **Anchor the brightest stop at exposure ≈ 0 and descend** (true one stop per step), so "wide open = as bright as it gets," never blown:
   ```js
   const F_STOPS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16]
   const apertureToExposure = (f) => -(F_STOPS.indexOf(f))  // f/1.4 -> 0, f/2 -> -1, ... f/16 -> -7
   ```
   *(Final coefficient/anchor to be set against the chosen scene — see acceptance gate.)*

**Acceptance gate (mandatory, replaces "eyeball it"):** run `meanBrightness` on the chosen L2 scene at every stop; require **strictly monotonic** brightness f/1.4 > f/2 > f/2.8 > … > f/16, **with no stop ≥ 99% clipped and no two adjacent stops within a just-noticeable-difference threshold.** Phase 2 is blocked until this passes.

**Make the iris the teaching instrument.** Render the f-number as a literal fraction: fixed focal-length bar + live diameter readout + `f = focal ÷ diameter`, so the learner watches the **denominator grow as the hole shrinks**. Add a pizza-slice/fraction overlay driven by the same slider (f/2 = half pie, f/16 = sliver).

**Better success condition (#17):** ship `f===1.4` immediately (matches the "as bright as you can" prompt); upgrade to the **rank task** (drag three unlabeled apertures into most→least light order) once the widget lands.

**Predict fix (#2):** `byOption[0]`: *"You picked the bigger number. An f-number is a fraction — which is the bigger slice, 1/2 of a pie or 1/16?"* `showWhy` = **`TwoIris`** (f/2 vs f/16 side-by-side with proportional light cones). No text names the winner.
**Kill the spoiler** in the intro ("that's where the twist is") — demote to post-confirmation.

### L3 — Depth of field (`depth-of-field`) — DEEPEST REWORK
The worst factual error (aperture-only DoF) plus the new optics widgets. The DoF equations below were verified physically correct.

**New widget A — `LensDiagram` (SVG side-view optics):** optical axis with subject point (left) → light cone filling the aperture → lens with focal points F → sensor (right) with a fixed **circle-of-confusion (CoC) reference segment** → a **shaded DoF band** between `uNear`/`uFar`, drawn **asymmetric (more behind)**. As aperture widens, the cone fattens and the near/far discs blow past the CoC segment → the sharp band visibly shrinks. **Caption hedge (#25):** *"Aperture is the lever you reach for first — distance and lens length matter too, later."*

**New widget B — `DoFPlayground` (four-factor coupled rig).** Shared state `{N, u, f, sensorDiagonal}`, one `recompute()`:
```js
const c     = sensorDiagonal / 1500;            // circle of confusion (verified standard)
const H     = (f*f)/(N*c) + f;                  // hyperfocal
const uNear = (f*f*u) / (f*f + c*N*(u - f));
const uFar  = (f*f*u) / (f*f - c*N*(u - f));    // -> ∞ when denom <= 0 (hyperfocal crossover)
const dof   = uFar - uNear;
```
- **Verifier correction — background blur normalization.** The raw blur disc `(f²/(N·(u−f)))·|s−u|/s` is a **sensor-plane length in mm** and must be explicitly converted to integer grid cells, or the result image won't track the diagram:
  ```js
  const blurDiscMm = (f*f/(N*(u - f))) * Math.abs(s - u)/s;
  const blurCells  = Math.round((blurDiscMm / c) * K);  // K tuned once so deep-DoF -> 0..1 cell
  ```
- **Verifier correction — trim to single-radius background blur.** `boxBlur` in `scene.js` takes **one radius for the whole background mask**; per-object distance-varying bokeh is a real engine rewrite for marginal gain. **Ship a single background-blur radius driven by the dominant background distance.** Keep the full four-factor *readouts* and the `LensDiagram` (which *can* show near/far discs); simplify only the result image.
- **Verifier correction — FF-only in the main rig.** Put the **format dropdown (FF / APS-C / m43 / phone) behind the "Advanced" expander**, alongside hyperfocal and diffraction. Four sensor sizes on the primary surface is overload, and the phone case produces a near-static (correct but "looks broken") result image. If/when format is exposed, the caption must say *"this is why phone photos have everything in focus"* so deep DoF reads as the lesson, not a bug.
- **The anti-myth toggle (core pedagogy):** radio `fixed spot` vs `same framing`. In `same framing`, changing `f` auto-adjusts `u` to hold magnification (`m = f/(u−f)`), so the learner *sees* DoF barely move with focal length under constant framing — teaching the truth, not the myth.
- **Second fake-DoF site (#3):** the new `blurRadius(N,f,u,s)` must replace `apertureToBlurRadius` **everywhere**, and the **`scene.js:222` hard-zero (`if (f > 5.6) return 0`)** must be removed — it is a *separate* place DoF is faked from the formula swap.
- **Brightness-locked chip (#14, corrected):** keep `toParams` `exposure:0` for deliberate variable isolation; surface a small **"brightness: locked"** chip so the learner registers aperture has two jobs and we froze one. **Do not couple aperture→brightness here** (would muddy the DoF lesson).
- **Predict fix (#4):** `byOption`: *"In the slider above, which end kept the WHOLE scene sharp — wide open, or stopped down? You need near and far both in focus."* `showWhy` = **`LensDiagram`** parameterized by the chosen wide aperture: the sharp band fails to cover both flowers and mountains.
- **Intro fix (#22):** reword the absolute to *"A wide opening can throw the background out of focus; a narrow one tends to keep the scene sharp — distance and lens matter too."*

### L4 — Shutter speed (`shutter-speed`)
- **Couple shutter to brightness (#13):** slow shutter brightens as well as smears, so the exposure cost of freezing is felt — bridge to L5/L6.
- **Shake vs subject-motion toggle:** tripod (subject-only smear) vs handheld (whole-frame smear). Requires `computeGrid` to apply `horizontalSmear` to the **whole grid** when handheld. Same shutter, different blur — teaches "blur scales with relative motion," fixing the conflation.
- **Two-goal task:** "freeze it" then "make it silky" on the same scene. **Verifier correction:** implement as **two consecutive `slider-sim` steps with the existing engine — do NOT add a `shutter-two-goal` step-kind.** Add a shutter-open timeline bar + subject travel arrow.
- **Predict fix (#5):** `byOption`: *"Silky water is water that moved while the shutter was open. Does the curtain need to stay open a long slice of time, or a tiny one?"* `showWhy`: render the chosen 1/1000 — water snaps to frozen droplets, visibly not silky.

### L5 — ISO: brightness at a cost (`iso-noise`)
- **Reframe: ISO amplifies, it does not collect.** Add a `LinkedBars` trio: **light collected** (flat as ISO climbs), **signal amplified** (rises), **noise** (rises). The flat collected-light bar is the visceral proof ISO ≠ light. Pair the loupe with a clean-vs-amplified comparison.
- **Dead-zone fix (#18):** extend `isoToExposure` so every reachable stop (to 12800) changes the image (or cap the slider at 3200; extending is recommended).
- **Predict:** keep, reframe Socratically. `byOption`: *"You're in a dark room — does turning ISO up collect more light, or amplify what's already there?"* `showWhy`: collected-light bar stays flat while noise climbs.

### L6 — The triangle (`the-triangle`) — hero
- **Fix the math (#12):** centered transparent model — all three indices centered, `sum=0` at center, `{4,4,4}` neutral. Replace `sum = 4 - ai + (si-4) + (ii-2)` with `sum = (4-ai) + (4-si) + (4-ii)` (or genuinely centering per-control offsets).
- **Side effects in the success criteria, not decoration:** new over-constrained goal — *"Freeze this motion AND keep the background blurred while staying level."* The learner must trade ISO grain and *feel* the cost. Add constraint puzzles (*"dim sports, shutter pinned at 1/1000 — fix the darkness"*).
- **Verifier correction — defer the stop-currency meter.** The `LinkedBars` master+tributaries visualization duplicates the existing triangle balance SVG once the math is fixed. The **math fix is essential and ships in Phase 4; the tributary meter is gold-plating, deferred to Phase 5.**
- **Predict fix (#6):** `byOption`: *"Same brightness, agreed. List what's different: f/2.8 vs f/8. From lesson 3, what does a much wider aperture do to the background?"* `showWhy` = **`BeforeAfter`**: two shots at equal luminance — f/8 sharp bg vs f/2.8 blurred bg.

### L7 — Metering (`metering`)
- **Fix the broken scene/check (#7):** use a scene that genuinely clips shadows (left-edge fraction > 0.09 at start) and tighten the pass window: require **both** clip fractions ≤ 0.09 **AND** mean brightness in a mid band, so the start fails and only a correction passes.
- **Link histogram to scene:** blown highlights *blink* in the `PixelScene` the moment the histogram piles against an edge.
- **Two-sided task + scene caveat (#23):** add "now push it too far and watch the highlights blow" (produces the right-edge spike the predict asks about); add a line that the ideal histogram is scene-dependent (snow sits right, night sits left).
- **Predict fix (#8):** `byOption`: *"The right edge is the brightest possible tone — pure white. If pixels are piled AT that wall, what's happened to the detail there?"* `showWhy`: push exposure until the bright region goes flat white, right-edge bar slamming in sync.

### L8 — White balance (`white-balance`)
- **Model a fixed cast + opposing correction (#19):** bake a fixed orange cast into the scene; the slider applies the **opposite (cooling)** correction; neutral occurs when cooling cancels the warm cast, **not at zero**. Add a known-neutral gray card + RGB readout: success = "make the gray read gray (R≈G≈B)."
- **Show the cancellation:** a two-headed warm-cool arrow (cast in orange, correction in blue, opposing toward neutral). Allow over-correction into blue. Label warm light = low Kelvin so direction isn't learned inverted.
- **Predict fix (#9):** `byOption`: *"A cast is cancelled by adding its opposite. Orange's opposite on the color wheel is…?"* `showWhy`: on a "warmer" pick, the scene slides *more* orange (cast worsens).

### L9 — Composition: rule of thirds (`rule-of-thirds`)
- **Make the image respond (#24):** give the subject a facing direction so on-third placement creates lead room and centered feels cramped; tie the sea/sky split to a third. Reward a **range** near the line (`< 11` units), not a pinpoint — embody "guideline, not law."
- **Contrasting cases:** before/after of dead-center vs on-third — *"which feels more dynamic, why?"*
- **Predict fix (#10):** subjective "why," so Socratic **elimination** (the *least-bad* option, acknowledged as reveal-by-deduction in §3.2). `byOption`: *"Two of these are factually false — placement doesn't change brightness, and pros break this rule constantly. That leaves one."* `showWhy: { widget: 'none' }` (optional A/B toggle, no text).

---

## 5. New Widgets / Step-Types

**Reuse as-is:** `PixelScene`, `Slider`, `Button`, `ProgressBar`, `Histogram`, `ApertureIris`, `compose` drag, `predict`, `capture`, `triangle`, loupe crop.

**Extend:**
- `Feedback` (steps.jsx) → mounts a declarative `showWhy` widget under the text, parameterized by the learner's wrong choice.
- `apertureToBlurRadius` → distance-aware `blurRadius(N, f, u, s)` with explicit mm→cells normalization; **replace at every call site** and **remove the `scene.js:222` f>5.6 hard-zero**.
- `computeGrid` → whole-frame `shake` smear (vs subject-only) for L4; fixed-scene-cast option for L8.

**New widgets to build (no 3D, no real photos — all SVG/DOM or `PixelScene` instances):**
1. **`TwoIris`** — two side-by-side irises with proportional light cones (L2 show-why). Cheapest; build first.
2. **`LensDiagram`** — SVG side-view optics (subject, cones, lens+F, sensor, CoC segment, asymmetric DoF band). Used in L3 body *and* L3 show-why.
3. **`DoFPlayground`** — coupled rig (controls + `LensDiagram` + live result image with **single-radius** background blur, **FF-only** main controls, format/hyperfocal/diffraction behind "Advanced"). The L3 hero. New step-kind `dof-playground`.
4. **`BeforeAfter`** — two `PixelScene`s side-by-side at declared params (L6 show-why; reusable in L7/L9).
5. **`StopToggle`** — +1/−1 stop button driving a doubling bar (L1).
6. **`LinkedBars`** — light-collected / amplified / noise trio (L5). *(Triangle stop-currency variant deferred to Phase 5.)*

**Cut / deferred (verifier):**
- **`shutter-two-goal` step-kind** — cut; use two consecutive `slider-sim` steps.
- **Per-object distance-varying bokeh** — cut; single-radius background blur.
- **`animate: 'sweepFromCurrent'`** — defer; `pulse`/`none` cover the pedagogy. Cap any animation.
- **Triangle stop-currency meter** — defer to Phase 5; the math fix carries Phase 4.

---

## 6. Phased Build Order

Each phase ships independently and keeps the app working.

**Phase 0 — Feedback engine (unblocks everything).**
Implement §3.3 schema + §3.4 engine changes: thread `chosen`/`bucket` into `handleResult`, stop clearing the hint on re-pick, extend `Feedback` to mount `showWhy`. Build `TwoIris` and `BeforeAfter`.
*DoD:* a wrong predict shows tier-0 consequence + tier-1 `byOption` text; a second miss escalates to `stages[1]` without the hint being wiped on control re-touch; `showWhy` renders the chosen value; no lesson behaves worse than today.

**Phase 1 — Kill every answer-reveal (Defects #2,4,5,6,8,9,10,20).**
Rewrite all `feedback.wrong` strings into `byOption`/`stages`/`showWhy` data in `course.js`. Pure content edits.
*DoD:* no wrong-hint names the correct option, its direction+magnitude, or a target value; tier-3 text contains **no specific f-stop and no stop-count** (verifier leak closed); L9 uses elimination with `widget:'none'`.

**Phase 2 — Fix the broken sims (Defects #1,7,17,18). BLOCKED until L2 mapping passes its gate.**
L2 brightness remap on a headroom scene (anchor brightest ≈ 0, descend), L7 clipping scene + tighter window, L5 dead-zone, L2 check → `f===1.4`.
*DoD:* `meanBrightness` per L2 stop is **strictly monotonic, no stop ≥ 99% clipped, adjacent stops above JND** (the draft's `0.6`/blown-wide-end fix is rejected); L7 start *fails* `wellMetered` and only a correction passes; ISO 3200→12800 each visibly changes.

**Phase 3 — L2 & L3 deep rework (Defects #3,14,16).**
Build `LensDiagram` + `DoFPlayground` (single-radius blur, FF-only main, format in Advanced) + distance-aware `blurRadius` with mm→cells normalization + remove `scene.js:222` hard-zero; iris-as-fraction + rank task; L3 brightness-locked chip.
*DoD:* `same framing` toggle visibly holds DoF near-constant across focal length; result image tracks the `LensDiagram`; no call site still uses the old aperture-only blur or the f>5.6 cliff. The headline of the overhaul.

**Phase 4 — Couplings & triangle (Defects #12,13,15).**
L4 brightness+shake toggle + two-goal (two `slider-sim` steps), L6 transparent centered math + over-constrained trade-off goal, L5 `LinkedBars`.
*DoD:* `{4,4,4}` reads neutral; the L6 goal is genuinely over-constrained so the learner must trade and feel grain; L4 handheld smears the whole frame; L5 collected-light bar stays flat as ISO climbs.

**Phase 5 — Polish (Defects #19,21,22,23,24,25 + predict→manipulate reorder + deferred items).**
L8 cast model + gray card, L1 live clipping + `StopToggle`, L7 two-sided + caveat, L9 responsive composition, intro hedges, beat reorder, **triangle stop-currency meter** (deferred from Phase 4).
*DoD:* each lesson opens on `predict` before any spoiler intro; L8 neutral occurs at non-zero slider; L9 rewards a range near the line.

**Sequencing rule:** ship Phases 0–1 first (correct, high-value, low-risk). **Block Phase 2 until the L2 mapping passes its measured acceptance gate.** Phases 3–4 are the depth investment; Phase 5 is incremental polish.

---

## 7. Open Questions (human decisions only)

1. **L2 scene choice.** Which headroom-having scene replaces `landscape` for the brightness task (interior / shade / dim-room)? This sets the final `apertureToExposure` anchor — needed before Phase 2.
2. **L2 success condition rollout.** Ship `f===1.4` now and upgrade to the three-aperture **rank task** later, or hold L2 until the rank widget is ready?
3. **L5 ISO ceiling.** Extend the brightness mapping to ISO 12800, or cap the slider at 3200? (Affects how "noise as last resort" lands.)
4. **L3 format dropdown.** Include the phone sensor in the Advanced expander (powerful anti-myth, but the near-static result image needs careful captioning), or limit Advanced to FF/APS-C/m43?
5. **L6 trade-off goal exact constraints.** Confirm the over-constrained scenario (motion freeze + background blur + level exposure) and the acceptable ISO-grain tolerance for "pass."
6. **Tone ceiling for tier-3.** Confirm tier-3 may name a **lever + direction** but never a value/stop-count — i.e. the corrected wording in §3.2 is the floor of how much help we ever give.