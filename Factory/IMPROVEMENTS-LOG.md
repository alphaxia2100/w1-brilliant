# App-improvement loop — research → revise → repeat

An autonomous, self-paced loop (peer authority) that keeps improving the app. Each iteration:
**research/pick the highest-leverage item → revise (build it) → verify (real gate + build + live) →
commit → log here → schedule the next.** Self-correcting: every iteration reads this ledger, updates
the backlog from what it learns, and stops scheduling when the backlog runs dry of high-value items.

Verification bar (every shipped change): `npm test` green · `npm run build` clean · walked live in the
browser (the critic's lesson: an automated gate keeps passing prose/pixel divergence — eyeball it).

## Backlog (ranked by leverage × shippability — re-rank each iteration)
The cheap, high-confidence factory wins are shipped (L7, L8). What remains is meatier — new engine work
per item, so higher risk/iteration. Keep verifying live; stop scheduling when nothing high-value is left.
1. **Pedagogy BET slice** (see `Redesign/PEDAGOGY-REDESIGN.md`) — add a predict-with-a-commit "BET" (a
   draggable ghost-tick before the reveal) to one lesson's most counter-intuitive beat (e.g. WB "where is
   neutral?", or the snow histogram piling right). Needs a small new interaction primitive; the highest
   pedagogical leverage left, and the approved direction.
2. **shutter-motion** (factory candidate, needs redesign — NOT a quick fix). Its panning beat is a
   fabricated interaction the motion sim can't do (it only translates the car). Would need a genuinely
   new sim capability (a panning / world-streak mode) to be true + distinct. Park unless that's built.
3. **Free-play Studio** — pick scene/subject/settings, shoot freely, collect to the roll. Locked
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

### #3 — 2026-06-25 — REJECTED silhouettes; shipped cold-start onboarding  ✓ (commit 66d9d59)
Verified silhouettes in-engine before trusting it: no exposure on the `backlit` scene yields a black
tree (<25) against a bright sky (>150) — they never co-occur — so the lesson's central claim is a
prose/pixel divergence; plus its exposure spine overlaps L3. Rejected + parked (needs a dedicated
high-contrast scene). Pivoted to the next backlog item: **cold-start onboarding** — an unguarded /try
route lets a visitor play Lesson 1 with no account (store persistence already no-ops without a user),
asking for the account only at the end. Verified live: logged-out /try renders Lesson 1, guarded routes
still gate. Gate 90/90, build clean. The loops + an engine check kept a plausible-but-false lesson out.
Next: the pedagogy BET slice (a predict-with-a-commit ghost-tick) — the highest-leverage item left.
