# App-improvement loop — research → revise → repeat

An autonomous, self-paced loop (peer authority) that keeps improving the app. Each iteration:
**research/pick the highest-leverage item → revise (build it) → verify (real gate + build + live) →
commit → log here → schedule the next.** Self-correcting: every iteration reads this ledger, updates
the backlog from what it learns, and stops scheduling when the backlog runs dry of high-value items.

Verification bar (every shipped change): `npm test` green · `npm run build` clean · walked live in the
browser (the critic's lesson: an automated gate keeps passing prose/pixel divergence — eyeball it).

## Backlog (ranked by leverage × shippability — re-rank each iteration)
1. **silhouettes → L9** (factory candidate, now UNBLOCKED). The `backlit` scene gained a real silhouette
   subject (the tree), which was its main blocker. Rework: open by exposing THAT subject to black; keep
   the labels beat; fix-or-cut the un-renderable rim-glow beat; make the keeper exposure-driven (not a
   reskin of L6's swing-behind).
2. **Cold-start onboarding** — let a visitor play the first lesson with NO account (lazy-load Firebase),
   prompt sign-up only at the first save. The documented highest-leverage onboarding/funnel win; also
   removes the Anonymous-sign-in console dependency for "try it".
3. **shutter-motion → Lx** (factory candidate, needs redesign). Kill the fabricated panning beat the
   engine can't render; promote the handheld-shake floor (1/focal-length) into a real interaction;
   differentiate the keeper. Harder — needs genuinely distinct interactions.
4. **Pedagogy blueprint slice** (see `Redesign/PEDAGOGY-REDESIGN.md`) — add a predict-with-a-commit
   "BET" (a draggable ghost-tick before the reveal) to one lesson's most counter-intuitive beat. Needs a
   small new interaction primitive; high pedagogical leverage.
5. **Free-play Studio** — pick scene/subject/settings, shoot freely, collect to the roll. Locked
   north-star deliverable; larger build.

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
