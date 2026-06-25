# Pedagogy redesign blueprint (2026-06-24)

From a 19-agent, web-researched, adversarially-verified workflow. Research base: Schwartz & Bransford
("A Time for Telling"), Kapur (productive failure), Chi & Wylie (ICAP), Bjork (desirable difficulties /
hypercorrection), Mayer (multimedia principles), Ciechanowski & Bret Victor (explorables), Brilliant's
"Mario moment" doctrine, and the working-pro critique that the exposure triangle is a flawed model.

## Thesis — the single biggest shift
Convert our dominant **act-then-confirm** loop into a three-move arc: **SEE → BET → BE WRONG.**
- **SEE** — open each lesson with *contrasting cases* (two truthful states side by side; the engine
  renders these near-free) and an *active* move on the difference.
- **BET** — one committed, *falsifiable* prediction (a draggable ghost tick on the existing slider)
  on the lesson's single most counter-intuitive truth.
- **BE WRONG** — the captured artifact violates (or confirms) the bet; the calm explanatory line is
  *demoted to after* the felt fall.
Every lesson runs the same spine: scaffolded single-lever worked example → contrasting cases → a
**faded** final beat (no pre-named lever, no numeric gate, an open keeper the learner authors). Stop
teaching rules to obey (the equilateral triangle, "center the histogram," "snap to the power point");
teach the learner to SEE and PREDICT, with the photograph as the only reward. Keep the plumbing
(polaroid artifact, calm-gray feedback, isolate-one-lever scaffolding) — the *pedagogy* is what's inverted.

## The six biggest shifts
1. **From act-then-confirm to BET-then-be-wrong** — add a one-tap committed prediction before the
   reveal on each lesson's most counter-intuitive beat. Highest ROI, lowest engineering.
2. **From one drifting slider to CONTRASTING CASES at the front** — move two-states-side-by-side (and
   the under-used `rank` kind) to the opening teaching moment.
3. **From flat gradient-followable beats to a deliberate FADE + a real felt goal** — scaffolded →
   contrast → faded finale; convert "drag to green" into constraint puzzles (our reciprocity beat,
   generalized — currently the exception, should be the norm).
4. **From graded targets to an OPEN SANDBOX keeper** — end each lesson with a true free-play shot, no
   hidden numeric threshold; the learner declares the look and keeps the polaroid.
5. **Fix two TRUTH violations we currently teach:** (a) the equilateral exposure triangle sums ISO as a
   co-equal light corner (`steps.jsx:439`, verified) → reframe as an aperture↔shutter **see-saw** with
   ISO as a side amplifier (keep ISO moving the meter — it does shift stops — just not as a third
   light-*gathering* corner); (b) "center/spread the histogram = correct" (`wellMetered`, `course.js:27`)
   which the lesson's own back half refutes → lead L3 with the contradiction.
6. **Demote the words and numbers; let the ARTIFACT carry it** — make the wrong photo visibly bad the
   instant it develops, signal the proving region on the polaroid, and strip precise EV/Kelvin/f-number
   readouts that sit beside felt targets (Mayer redundancy).

## Cross-cutting build rules (non-negotiable, learned partly from the workflow's own mistakes)
- **One bet per lesson**, not every beat (that bloats). **Verify the bet actually FAILS in-engine before
  building** — a beautifully-argued bet the code *confirms* is worse than no bet (it tells the learner
  their wrong intuition was right).
- **Contrast at the front, active move on the difference** — never a labeled-option tile pick (that's
  multiple-choice in disguise). Every "why" must be a *manipulation that proves the cause*
  (e.g. drag the background until the two panels match), not a tile from `{aperture, distance, luck}`.
- **Fade the scaffolding** — replace every end-of-lesson `RankView` recognition quiz with an open
  authored keeper.
- **Demote the number** — guard `step.format` in `SliderSimView` (it's called UNCONDITIONALLY at
  `steps.jsx:361`; dropping it without a guard CRASHES) so a beat can omit the readout.
- **Don't overcorrect a truth-fix into a new falsehood** — ISO genuinely shifts metered brightness;
  never retune sim constants to force a pedagogy beat to work.
- **Run the sim math + `checks.mjs` before trusting any new threshold** — verify reachability AND that
  lazy/cop-out solutions actually fail.
- **Budget the genuinely-new views explicitly** — don't let them ship as "reuse RankView/BeforeAfter":
  `RankView` is text-only + strict ordering; `BeforeAfter` is display-only (no `onResult`); `ComposeView`
  treats horizon as a *mode* replacing the subject (not two handles); `buildSeascape` has **no** anchor
  (the dark tree lives in `buildSnow`, `scene.js:232`).

## Per-lesson plan (priority order)

### 1. L1 Exposure Triangle — REBUILD (flagship, build first)
Stop teaching three equal levers + a meter to chase; teach ONE see-saw the learner bets on and trades:
aperture↔shutter in tension, ISO the side amplifier of last resort. Carries the worst TRUTH violation
AND exercises all four moves.
- **B1** contrast: two `MotionShot` canvases side by side (bright-smeared vs frozen) — tap "the one that
  gathered light over a longer slice." (NOT BeforeAfter — the car is a separate canvas, not a PixelScene.)
- **B2** bet-the-shutter: ghost tick on `MotionView`'s slider — predict where the car freezes; fire;
  the smear confirms/violates; Feedback contrasts predicted-vs-actual (fast/frozen = LESS light).
- **B3** see-saw (truth fix): restage `TriangleView` with only aperture+shutter live on the balance SVG;
  drive `ApertureIris` *beside* the PixelScene (iris grows as the room brightens); ISO row hidden. Comment
  at `:439` so it isn't reverted.
- **B4** ISO-by-contrast: two exposure-matched PixelScenes (ISO100 clean vs ISO3200 grainy via
  `isoToNoise`), loupe crop, tap "the one that collected more actual light."
- **B5** reciprocity keeper (KEEP existing goal path); grain visibly appears when the learner reaches for
  ISO — the felt cost.
- **B6** faded keeper: `goal=null`, accept any `|sum|<~1.0`, strip hints + numeric labels, mint a keeper.
- **New code:** ghost-tick state, a small two-canvas tap view, restage TriangleView, guard `step.format`.
  **No new sim.**

### 2. L4 White Balance — REBUILD
The most purely FELT lever, yet today we green-hunt a slider and read Kelvin.
- **B1** contrast: two `portrait` panels (tungsten vs shade, `temp=0`), tap the household-bulb one.
  *(Needs a small NEW image-pick view — RankView is text-only, BeforeAfter has no `onResult`.)*
- **B2** place-your-bet: on the warm portrait, ghost tick — "where must the slider sit to make this
  neutral?" Reveal: neutral lands ~−0.6 toward blue (verified: `WB_WARM=0.6`). New stateful pre-commit gate.
- **B3** kill-the-number: the blue-shade cast with NO Kelvin readout (guard `step.format`); judge by eye.
- **B4** eyedropper (KEEP verbatim).
- **B5** open keeper: sunset, all WB live, NO gate — "set the warmth to the mood; gold is yours." Drop
  `wbWarmKept`.

### 3. L3 Metering — REBUILD (re-sequence + truth-fix + bet, not from scratch)
The one true lesson is "there is no correct histogram"; b1 currently teaches the opposite and the back
half demolishes it.
- **B1** rule-that-breaks: two live Histograms (snow + night) under ONE shared slider — find one exposure
  that keeps both clean; you can't (one wall always clips). Tap-tag the clipped photo. *(Asymmetry note:
  reframe to "keep BOTH clean," not "center both" — centering night is merely dim, undramatic.)*
- **B2** briefest telling: hover a marker across the histogram, matching pixels light up (reuse clip
  threshold). 10-second rote telling.
- **B3/B4** blow-the-highlights + crush-the-shadows (KEEP) + `blinkies:true` (free, prop already threads).
- **B5** bet-on-the-snow: ghost tick on the histogram track before exposing — most place center; brighten
  and the mass piles hard RIGHT past their tick.
- **B6** protect-the-highlights / dynamic range (KEEP nearly intact — the verified-unsolvable climax).
- **B7** cold-read finale: unfamiliar scene whose correct exposure is NOT centered (VERIFY in-engine —
  pure snow centered does NOT clip), no green zone, no readout; grade a PROPERTY (no important wall clipped).
- **DELETE** the `wellMetered`/"spread the tones" framing.

### 4. L5 Composition — REBUILD (most new build)
Teach composition as SEEING visual balance, not snapping a dot to a hidden bullseye (`composeEval` grades
distance to ONE point — backwards for a multi-answer perceptual skill).
- **B1** which-breathes: two seascape panels (subject center vs third-in), tap the alive one, then
  drag-to-match the difference.
- **B2** bet-where-it-dies: drag the subject to the spot you predict feels deadest; the cramped vignette
  slams in.
- **B3** balance-the-weight (the core fix): a fixed heavy anchor + drag a second subject to counterbalance;
  ANY balancing placement passes. **BUILD NOTE: `buildSeascape` has no anchor — add `anchorX` first, then a
  `balance` kind in `composeEval` + checks.mjs asserts.**
- **B4** name-the-tool: the grid finally overlays THEIR balanced shot — "thirds is a fast guess, not a law."
- **B5** lead-room (KEEP) + a ghost contrast cue.
- **B6** leading-lines (KEEP, faded).
- **B7** ungraded keeper: subject AND horizon both draggable, no gate. **BUILD NOTE: a true two-handle
  ComposeView is real work (ComposeView treats horizon as a mode replacing the subject).**

### 5. L2 Depth of Field — REFINE (lowest priority — strongest lesson today)
Re-sequence + ONE new view, NOT a rewrite. *(The JSON's two novel beats were dead on arrival: the "f/1.4
can't soften a near wall" bet is FALSE (12.90 > 11.50 reference), and the "blur a petal" trap is
unbuildable — `DofBokeh` renders the flower as a sharp layer with no per-element depth.)*
- **B1** contrast (verified perceptible: near-wall 5.37 vs distant-field 11.50 at f/4) — make the "why" an
  active drag-the-background-until-it-matches.
- **B2** corrected bet (optional): INVERT it — lock the background close, bet how wide you must open;
  reveal that pushing the wall back reaches the same melt at a modest f/4 (distance rivals aperture).
- **B3–B5** keep the variable-isolation spine; strip numeric `valueText`; move the four-lever NAMING to
  AFTER the felt beats.
- **B6** diagnose-which-lever (PROMOTE to centerpiece — the one new beat both true and buildable): a NEW
  ~30-line tap-to-tag view (two DofBokeh panels + a chip each). Does NOT reuse RankView.
- **B7** "shallow is not a maximum" — featureless-mush vs tasteful contrast (runs on the existing layer).
- **B8** open studio keeper: all four levers + bg toggle, no threshold; drop the `blur>=16` gate.

## Top risks (and mitigations)
- **Bets that don't fire** → run the engine on every bet's premise; only ship bets the code visibly violates.
- **Overcorrecting a truth-fix into a new falsehood** → keep ISO moving the meter; never retune sim
  constants to make a beat work.
- **Buildability claims that conflate primitives** → budget the genuinely-new views (image-pick, tap-to-tag,
  two-handle compose, balance anchor) explicitly.
- **"Why" tiles smuggling in multiple choice** → every why is an active manipulation.
- **Format-guard crash** → ship the `step.format` guard first.
- **Scope creep into new sims** → do NOT scope subject-depth this pass.

## Open questions for Sky (genuine forks)
1. **Open keeper = truly no gate, or a soft floor?** Any state develops (max customization), or reject only
   a broken shot (wildly clipped/blown) so the keepsake stays something to be proud of?
2. **How far to demote rule-of-thirds?** Genuinely a footnote under visual-weight balance, or kept as a
   named co-equal tool? Affects how much of L5 is rebuilt vs re-sequenced.
3. **Build all five now, or prove L1 first and gate the rest on review?** (Sequenced L1 → L4 → L3 → L5 → L2.)
