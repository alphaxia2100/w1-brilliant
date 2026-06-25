# App-improvement loop — research → revise → repeat

An autonomous, self-paced loop (peer authority) that keeps improving the app. Each iteration:
**research/pick the highest-leverage item → revise (build it) → verify (real gate + build + live) →
commit → log here → schedule the next.** Self-correcting: every iteration reads this ledger, updates
the backlog from what it learns, and stops scheduling when the backlog runs dry of high-value items.

Verification bar (every shipped change): `npm test` green · `npm run build` clean · walked live in the
browser (the critic's lesson: an automated gate keeps passing prose/pixel divergence — eyeball it).

## Backlog (ranked by leverage × shippability — re-rank each iteration)
1. **iso-and-noise → L8** (factory candidate, close). Fix: confirm ETTR/expose-to-the-right live in the
   browser (shadow grain should drop when you brighten — `scene.js` shadowW weighting suggests it does),
   and replace the ending rank with an **authored keeper**. Distinct topic; engine supports every kind.
2. **silhouettes → L9** (factory candidate, now UNBLOCKED). The `backlit` scene gained a real silhouette
   subject (the tree), which was its main blocker. Rework: open by exposing THAT subject to black; keep
   the labels beat; fix-or-cut the un-renderable rim-glow beat; make the keeper exposure-driven (not a
   reskin of L6's swing-behind).
3. **Cold-start onboarding** — let a visitor play the first lesson with NO account (lazy-load Firebase),
   prompt sign-up only at the first save. The documented highest-leverage onboarding/funnel win; also
   removes the Anonymous-sign-in console dependency for "try it".
4. **shutter-motion → Lx** (factory candidate, needs redesign). Kill the fabricated panning beat the
   engine can't render; promote the handheld-shake floor (1/focal-length) into a real interaction;
   differentiate the keeper. Harder — needs genuinely distinct interactions.
5. **Pedagogy blueprint slice** (see `Redesign/PEDAGOGY-REDESIGN.md`) — add a predict-with-a-commit
   "BET" (a draggable ghost-tick before the reveal) to one lesson's most counter-intuitive beat. Needs a
   small new interaction primitive; high pedagogical leverage.
6. **Free-play Studio** — pick scene/subject/settings, shoot freely, collect to the roll. Locked
   north-star deliverable; larger build.

## Iterations
### #1 — 2026-06-25 — shipped L7 "Long exposure: painting with time"  ✓ (commit dbc6725)
Took the lesson factory's strongest candidate, fixed BEAT 3 (brightness band so overshoot fails),
integrated as L7. Real gate 81/81, build clean, beat-0 glow confirmed live. The factory's correctness
loop guaranteed buildable; its quality loop (critic) caught the prose/pixel bugs the gate is blind to —
exactly why a human-verified last mile matters. Next: iso-and-noise → L8.
