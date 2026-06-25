# App-improvement loop — research → revise → repeat

An autonomous, self-paced loop (peer authority) that keeps improving the app. Each iteration:
**research/pick the highest-leverage item → revise (build it) → verify (real gate + build + live) →
commit → log here → schedule the next.** Self-correcting: every iteration reads this ledger, updates
the backlog from what it learns, and stops scheduling when the backlog runs dry of high-value items.

Verification bar (every shipped change): `npm test` green · `npm run build` clean · walked live in the
browser (the critic's lesson: an automated gate keeps passing prose/pixel divergence — eyeball it).

## Backlog (ranked by leverage × shippability — re-rank each iteration)
The cheap factory wins (L7, L8) and the first BET (iter #4) are shipped. What remains is meatier — new
engine work per item. Keep verifying live + run the adversarial critic after building (it caught a truth
blocker on iter #4); stop scheduling when nothing high-value is left.
1. **Second BET — extend the primitive to another lesson's most counter-intuitive beat.** The `bet` kind
   exists + is proven now, so this is cheaper. Best target: L3 metering "brighten the snow and the mass
   piles hard RIGHT, past where you'd center it" (blueprint B5) — needs a histogram-track variant of the
   bet view (the bet is on the histogram, not a temp slider). Alt: L1 "bet where the car freezes"
   (MotionView ghost tick). Highest pedagogical leverage left; **one bet per lesson — don't overuse.**
2. **WB Kelvin reads backwards (truth debt, found by the iter-#4 critic).** `wbResultK` (beats 3 & 5)
   shows warmer→LOWER K, the inverse of every real camera/Lightroom (warmer→higher K). Beat 1 sidesteps
   it (Kelvin dropped). Fix the rest: flip the sign (warmer→higher K) OR demote the number per blueprint
   shift #6. Small + high-truth-value; verify all WB beats read in the real-world direction after.
3. **shutter-motion** (factory candidate, needs redesign — NOT a quick fix). Its panning beat is a
   fabricated interaction the motion sim can't do (it only translates the car). Would need a genuinely
   new sim capability (a panning / world-streak mode) to be true + distinct. Park unless that's built.
4. **Free-play Studio** — pick scene/subject/settings, shoot freely, collect to the roll. Locked
   north-star deliverable; larger build.

## Parked (need new engine capability — don't ship until built)
- **silhouettes** — REJECTED as L9 (iter #3). The `backlit` scene's tree↔sky separation (~2.3 stops) is
  too small for a true silhouette: engine sweep showed NO exposure makes the tree black (<25) while the
  sky stays bright (>150). Needs a dedicated high-contrast scene (bright sky ~250, subject ~10) — then the
  factory's design (expose-for-background + profile rank + rim) becomes shippable and distinct from L3.

## Watch / debt
- **ISO-on-night appears in L1, L7, L8.** Each teaches a distinct facet (ISO-as-brightness-lever /
  ISO-as-impatient-alternative-to-time / ISO-noise-discipline), like exposure recurs across lessons — but
  if it ever reads as repetitive, consolidate or vary the scene. Note before adding a 4th.
- **BET primitive a11y (periphery — do after core).** The phase 1→2 lock transition isn't announced to a
  screen reader (no focus move / aria-live); a blind learner can't perceive the cast they're betting
  against beyond the predict slider's relative valueText. Real exclusion, but core-substance first.
- **`WB_BET_MSG` copy is WB-specific** (hardcodes orange/blue). Generalize the bet primitive's message
  layer when a 2nd bet lands on a non-WB beat.

## Iterations
### #1 — 2026-06-25 — shipped L7 "Long exposure: painting with time"  ✓ (commit dbc6725)
Took the lesson factory's strongest candidate, fixed BEAT 3 (brightness band so overshoot fails),
integrated as L7. Real gate 81/81, build clean, beat-0 glow confirmed live. The factory's correctness
loop guaranteed buildable; its quality loop (critic) caught the prose/pixel bugs the gate is blind to —
exactly why a human-verified last mile matters. Next: iso-and-noise → L8.

### #2 — 2026-06-25 — shipped L8 "ISO & noise: the price of light"  ✓ (commit 7c1f87d)
Took the factory's iso-and-noise candidate. Grounded the truth claims in the engine (node sweep), which
both confirmed ETTR (shadow grain Δ 54→22 as capture exposure rises) AND exposed a real miscalibration:
BEAT 6's keeper copied the night's `>=1600` floor onto the BRIGHTER room, which actually reads at ISO 800
— so the right answer would have been wrongly rejected. Fixed it to 800 (better transfer: the scene sets
the floor) and tightened BEAT 3 to the exact floor (1600). Real gate 90/90, build clean, both claims
confirmed live (grain blizzard at max ISO; shadows lift + de-noise on expose-to-the-right). Course now
8 lessons. Next: silhouettes → L9 (unblocked by the new backlit tree subject).

### #4 — 2026-06-25 — shipped the BET primitive (predict → be-wrong) on WB beat 1  ✓ (commits 614e623, 7ca7722)
The blueprint's #1 highest-ROI shift: a committed, falsifiable prediction before the reveal. New engine
step kind `bet` (SEE → BET → BE WRONG): predict on a frozen photo → lock → the bet pins as a ghost tick
and the live slider reveals how far PAST it neutral really sits. Engine-proved the bet fires first (at the
intuitive center, R/B gain 1.48 → orange; neutral at −0.6). Gate + build + full live walk (both widths).
**Then ran a 4-lens adversarial Sky-critic — it earned its keep**, finding a TRUTH BLOCKER + 4 majors I'd
missed, all fixed in 7ca7722 + re-verified live:
- Kelvin readout ran BACKWARDS from every real camera (warmer→lower K) → dropped the number; the felt
  caption carries it (blueprint shift #6). [logged the systemic beats-3/5 version as backlog #2]
- Success copy validated a WRONG-DIRECTION bet as "right instinct" (the blueprint's #1 named risk) →
  replaced with a pure, **gate-tested** classifier (center/wrong/near/short/over) so it can't regress.
- Scene seascape read teal-grey under the "too orange" cast (a lie) → switched to **snow** (orange under
  cast R-B=63, clean white when corrected R-B=−12 — truthful both ways). Portrait (the critic's pick) was
  rejected in-engine: intrinsic R-B=47, so "neutral" still looked warm. Verify-the-claim paid off again.
- Bet wasn't a real commitment (lock always enabled) → disabled until the marker is dragged.
- Ghost tick mis-tracked the 28px thumb (the gap it shows is the lesson) → inset-track calc.
LESSON (reinforces the meta-rule): the live walk + engine sweep are load-bearing, but the **adversarial
critic catches the truth/pedagogy class the gate and a single builder miss** — run it every build, then
fix-forward. Next: a 2nd BET (L3 snow-histogram) or the WB Kelvin truth-fix.

### #3 — 2026-06-25 — REJECTED silhouettes; shipped cold-start onboarding  ✓ (commit 66d9d59)
Verified silhouettes in-engine before trusting it: no exposure on the `backlit` scene yields a black
tree (<25) against a bright sky (>150) — they never co-occur — so the lesson's central claim is a
prose/pixel divergence; plus its exposure spine overlaps L3. Rejected + parked (needs a dedicated
high-contrast scene). Pivoted to the next backlog item: **cold-start onboarding** — an unguarded /try
route lets a visitor play Lesson 1 with no account (store persistence already no-ops without a user),
asking for the account only at the end. Verified live: logged-out /try renders Lesson 1, guarded routes
still gate. Gate 90/90, build clean. The loops + an engine check kept a plausible-but-false lesson out.
Next: the pedagogy BET slice (a predict-with-a-commit ghost-tick) — the highest-leverage item left.
