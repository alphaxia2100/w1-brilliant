This confirms a critical flaw in the proposed fix. At the proposed f/1.4 exposure, 95% of the landscape pixels clip to pure white — the image is a near-white rectangle, and f/1.4 vs f/2 vs f/2.8 are NOT visually distinguishable at the bright end (they're all mostly blown out). The spec's "verify each visibly brighter" claim is false against the real scene. (The f/4=1.000 anomaly is the rounding of the proposed formula producing odd interaction, but the headline is the wide-end clipping.)

I have enough ground truth. Let me write the adversarial review.

---

# Adversarial Review — "Aperture" Redesign Spec

I verified every code reference, ran the aperture math, the proposed replacement math, and the L7 metering scene against the live engine. Summary: the audit is accurate, the feedback model is sound, but **the headline "aperture bug fix" is itself broken**, two physics claims are wrong or self-contradictory, and several widgets are over-scoped for a pixel-grid engine.

## (b) Does the aperture fix actually work? NO — it reintroduces the bug.

This is the most important finding. The spec's proposed replacement:

```js
const apertureToExposure = (f) => (3.5 - F_STOPS.indexOf(f)) * 0.6
```

I ran this against the actual `landscape` scene (`scene.js` clamps to 255 only at draw time, so over-1.0 means blown white):

| f-stop | proposed exposure | mean luminance (1.0 = white) | fraction of pixels fully clipped to 255 |
|---|---|---|---|
| f/1.4 | +2.10 | **2.63** | **95%** |
| f/2 | +1.50 | **1.73** | 64% |
| f/2.8 | +0.90 | **1.14** | 32% |
| f/4 | +0.30 | 0.75 | — |

- The spec asserts "anchored mid-scale so **nothing saturates**" and "Verify f/1.4 > f/2 > f/2.8 **each visibly brighter**." Both are **false** on the real scene. At f/1.4 the frame is 95% pure white; f/1.4, f/2, f/2.8 are all mostly blown and visually near-indistinguishable at the top end — **the exact perceptual failure of the original `clamp(...,±2.5)` bug**, just relocated. The fix does not fix Defect #1; it re-skins it.
- **Root cause the spec missed:** the `landscape` scene already has a bright sky/sun (`row0 ≈ [93,168,231]`, sun cells `[255,244,205]`). Any positive exposure pushes it to clip. The original L2 used the landscape scene; the fix keeps it and then *adds* up to +2.1 EV. To make wide apertures readably brighter without blowing out, you must either (a) use a darker base scene for L2's brightness task (e.g. an interior/night-ish scene with headroom), or (b) anchor the brightest stop at roughly exposure 0 and go *down* from there (f/1.4 ≈ 0, f/16 ≈ −4.2), so "wide = as bright as it gets, not blown." Option (b) is cleaner and matches the "make it as bright as you can" prompt.

**Internal contradiction in the same fix.** The prose says "1 stop per stop, consistent with L1 (kill the `2*log2` double-rate)," but the formula uses `* 0.6` = **0.6 stops per step**, not 1. So it does *not* deliver one-visible-step-per-stop and it is *not* consistent with L1's true stop. Either the prose or the coefficient is wrong; given the clipping problem, the coefficient needs to be re-derived against a headroom-having scene, not hand-set to 0.6.

This must be fixed in Phase 2 with an actual brightness measurement on the chosen scene, not an eyeballed linear formula. The spec's own acceptance test ("verify each visibly brighter") would have caught it had it been run.

## (a) Photographic / physics correctness

**The DoF four-factor formulas are essentially correct** (standard thin-lens DoF):
- `H = f²/(N·c) + f` ✓ (hyperfocal)
- `uNear = f²·u / (f² + c·N·(u−f))` and `uFar = f²·u / (f² − c·N·(u−f))` ✓ — these are the correct algebraic rearrangements; `uFar → ∞` when the denominator ≤ 0 ✓ (matches the hyperfocal crossover). The "asymmetric, more behind" band is correct real optics. Good.
- `c = sensorDiagonal/1500` is a reasonable CoC convention (the usual divisor is ~1442–1500). Fine.
- The "same framing" magnification hold `m = f/(u−f)` and the claim that **DoF barely changes with focal length at constant framing/subject distance** is the correct, anti-myth truth. Pedagogically excellent and rare to see done right. ✓

**But three physics problems:**

1. **The background-blur formula is dimensionally/again-self-contradictory.** Spec gives:
   ```
   blur = (f²/(N·(u−f))) · |s−u|/s
   ```
   The first factor `f²/(N(u−f))` has units of length (mm of blur disc on the sensor); `|s−u|/s` is dimensionless. That yields a sensor-plane disc diameter in mm, which then must be mapped to **grid cells** for `blurRadius`. The spec never specifies that mm→cells scaling, and it must be tuned per `sensorDiagonal` or the format dropdown will produce nonsense (a phone sensor's mm blur is tiny but its *relative* blur isn't). This is under-specified and will not "just work" by passing the formula into `apertureToBlurRadius`. It needs an explicit normalization (blur disc ÷ CoC, then ×cells) — otherwise the result image won't track the LensDiagram.

2. **`LensDiagram` claim "near/far discs blow past the CoC segment as aperture widens" is right, but the existing `apertureToBlurRadius` hard-zeros above f/5.6** (`scene.js:222 if (f > 5.6) return 0`). The spec correctly flags this for L3 but the *new* `blurRadius(N,f,u,s)` must replace it everywhere it's used or L2/L6 will silently keep the cliff. The spec lists the extension but doesn't note that the f>5.6 hard-zero is a *second* place DoF is faked (separate from the formula swap). Minor, but it's a real second edit site.

3. **CoC tie to `sensorDiagonal/1500` with a phone option is physically a trap.** A phone's tiny sensor genuinely has near-infinite DoF for the same framing — which is the truth you want — but the `blur` formula with a phone `c` and phone-appropriate `f` (a few mm) will produce essentially zero background blur, making Panel 2 look broken/identical to deep DoF. That's *correct physics* but will read as "the sim is broken" to a beginner unless the caption explicitly says "this is why phone photos have everything in focus." The spec mentions format→c but never warns that the phone case produces a near-static result image that needs framing as the lesson, not a bug.

## (c) Buildable on 2D pixel-grid + SVG? Mostly yes, two concerns.

- **`TwoIris`, `LensDiagram`, `BeforeAfter`, `StopToggle`, `LinkedBars`** — all pure SVG/DOM or two `PixelScene` instances. Genuinely buildable, no 3D/photos needed. ✓ `LensDiagram` is a flat side-view schematic (cones, lens, sensor, shaded band) — standard SVG. ✓
- **`DoFPlayground` result image (Panel 2):** buildable *only if* the mm→cell blur normalization (above) is solved. The `boxBlur` in `scene.js` already blurs background-only by integer radius; the four-factor `blurRadius` just needs to feed it an integer. Buildable, but the spec hand-waves the hardest 20% (the scaling), and `boxBlur` only does a single uniform radius for *all* background cells — it cannot render **per-object** blur that varies with each object's distance `s`. The spec explicitly wants "each background object's blur radius comes from `blur(s)`" — that is **not** supported by `boxBlur`, which takes one `radius` for the whole background mask. Delivering distance-varying bokeh requires either multiple distance-banded masks or a real per-cell variable blur. This is a meaningful engine change the spec underestimates as "extend `apertureToBlurRadius`."
- **`animate: 'sweepFromCurrent'`** in `showWhy` implies animating a `PixelScene` through a parameter range. `PixelScene`'s effect chain (especially `boxBlur` at radius 3 over 32×32 = fine, but a smooth sweep re-runs `computeGrid` every frame). Performant enough at N=32, but the spec should cap animation, not leave it open-ended.

Nothing secretly needs 3D or real photos. Good. The over-reach is the **per-object distance-varying blur**, not the dimensionality.

## (d) Does the feedback model avoid revealing while still guiding? Mostly yes — with leaks.

The tiered ladder is well-designed and the engine changes are correctly diagnosed:
- **`handleActivity` clearing the hint (LessonPlayer.jsx:44–49) is real** and the spec's fix (keep hint until next Check, only `tries` drives tier) is correct. ✓
- **`handleResult` has no `chosen`** — confirmed (LessonPlayer.jsx:26–41); threading `{chosen, bucket}` is the right minimal change. ✓
- **All 7 named reveal offenders are real** — I verified L1:67, L2:115, L3:163, L4:210, L6:298, L7:346, L8:393 (note: L9 reveal is at **L434**, not L434 in one table cell vs "L9:434" — consistent; but the §1.1 list cites "L9" implicitly and the defect table says L9:434, fine).

**Leaks that still reveal:**
- **Tier-2 nudge example "It is the aperture, not the shutter — try the other direction"** combined with **tier-3 "Each step toward f/1.4 doubles the light. You are about two stops short"** — naming the target value `f/1.4` and the exact distance ("two stops short") *is* effectively revealing the answer, contradicting the tier-2 rule "Don't give the exact f-stop" and tier-3 "never as the letter." "Two stops short of f/1.4" uniquely determines the answer. This violates the spec's own non-negotiable. Tier 3 should say "each step toward the wide end doubles light — make a move and check," with no named f-stop and no stop-count.
- **L2 `byOption` "which is the bigger slice, 1/2 of a pie or 1/16?"** is excellent and does not reveal. ✓ But the **L2 `correct` consolidation still must not pre-empt** — fine as written.
- **L9 Socratic elimination "Two of these are factually false… that leaves one"** is logically a reveal-by-elimination (it hands the answer via process of elimination just as surely as naming it). It's defensible for a pure-subjective item, but it's not "guiding without revealing" — it's "revealing by deduction." Acceptable given the constraint, but the spec shouldn't claim it's non-revealing; it's the *least bad* option, which is a different claim.

The decision rule (visual consequence vs Socratic vs direct fact) is sound. The "show-why renders the learner's wrong choice" is the strongest idea in the spec and is buildable once `chosen` is threaded.

## Over-scoped items to cut or defer

1. **`DoFPlayground` per-object distance-varying blur** — cut to a single-radius background blur driven by the dominant background distance. The full per-object variable blur is a real engine rewrite (`boxBlur` doesn't support it) for marginal pedagogical gain over "background gets blurrier as you open up." Keep the four-factor *readouts* and LensDiagram; simplify the result image.
2. **Format dropdown (FF/APS-C/m43/phone) in the main playground** — the spec already buries hyperfocal/diffraction behind "Advanced." Put **format** there too. For a beginner course, four sensor sizes in the primary control surface is cognitive overload and the phone case produces a confusing near-static result image (above). Ship FF-only in the main rig; format in Advanced.
3. **`shutter-two-goal` as a new step-kind** — the two sequential goals can be two consecutive `slider-sim` steps with the existing engine. A new step-kind for sequencing is unnecessary surface area. Cut the new kind; author two steps.
4. **`animate: 'sweepFromCurrent'`** — defer. `pulse`/`none` cover the pedagogy; animated parameter sweeps are polish and a perf/again-complexity sink. Cut from Phase 0.
5. **L6 "stop-currency meter" (`LinkedBars` as a master + three tributaries with live re-leveling)** — nice but it duplicates what the existing triangle's balance SVG already communicates once the math is fixed. The *math fix* (Defect #12) is essential; the tributary-meter visualization is gold-plating. Defer to Phase 5.

## Corrections to the spec's own claims

- **§2 L2 / Defect #1 fix is wrong** (clips at wide end on the real scene) — re-derive against a scene with highlight headroom, or anchor brightest = exposure 0 and descend. Run `meanBrightness` per stop as the acceptance gate.
- **"0.6" vs "1 stop per stop"** — internal contradiction; pick one and justify it numerically.
- **DoF `blur` formula** — add the explicit mm→cells normalization (e.g. `cells = round((blurDisc / c) * k)`), or it won't track the diagram.
- **Tier-3 nudge text** — remove the named f-stop and the exact stop-count; both reveal.
- **L3 second fake-DoF site** — note `scene.js:222` hard-zero above f/5.6 must also be removed, not just the per-lesson formula.
- **Defect #14 "couple aperture→brightness in L3"** conflicts with L3's deliberate variable-isolation (`exposure:0`). The spec already hedges this ("keep it for isolation, make it explicit with a chip") — good, but the defect table lists "couple aperture→brightness" as the fix, which would *reintroduce* the brightness variable into the DoF lesson and muddy it. Resolve the table to match the (correct) body: **keep exposure locked, add the chip.**

## What's correct and should ship as-is

- The defect audit is accurate: I confirmed Defect #1 (f/1.4=f/2 pixel-identical at +2.5), Defect #7 (landscape never clips shadows, start=-1.7 and the whole −2.5..+0.1 range pass `wellMetered`), Defect #11 (no `chosen`, hint cleared on re-pick), Defect #18 (ISO clamp +2.3 dead-zone), Defect #19 (`temp` slider value *is* the tint, neutral=0). All real.
- The feedback schema (`byOption`/`stages`/`showWhy`), the engine threading, and the phase order (0→2 first) are well-reasoned and low-risk.
- The DoF lesson's core optics (DoF limit equations, hyperfocal, constant-framing anti-myth) are physically correct — the best part of the spec.

**Bottom line:** ship Phases 0–1 (feedback engine + reveal removal) — they're correct and high-value. **Block Phase 2 until the L2 aperture mapping is re-derived against a real scene** (the current proposal blows out the wide end and fails its own acceptance test). Trim `DoFPlayground` to single-radius background blur + FF-only main controls before Phase 3, and fix the two tier-3/named-value reveal leaks.

Files reviewed: `/Users/sky/Developer/Work/Alpha AI/Week 1 Brilliant/src/sim/scene.js`, `/Users/sky/Developer/Work/Alpha AI/Week 1 Brilliant/src/engine/LessonPlayer.jsx`, `/Users/sky/Developer/Work/Alpha AI/Week 1 Brilliant/src/engine/steps.jsx`, `/Users/sky/Developer/Work/Alpha AI/Week 1 Brilliant/src/content/course.js`, `/Users/sky/Developer/Work/Alpha AI/Week 1 Brilliant/src/components/ui.jsx`, `/Users/sky/Developer/Work/Alpha AI/Week 1 Brilliant/src/sim/PixelScene.jsx`.