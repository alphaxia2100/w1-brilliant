# Honest audit ledger

A real end-to-end pass over the whole project (code read + played at desktop AND
mobile 375px). Kept current so issues don't "slip through" again.

## Fixed & browser-verified
- **Aperture brightness bug** — clamp made f/1.4≈f/2; remapped on a headroom `room` scene, gate-tested monotonic. (5dfdaa6)
- **L7 metering always-passed** — start now fails; real winning window. (5dfdaa6)
- **Wrong answers revealed the solution** — replaced with Socratic byOption + escalating stages + show-why widgets (TwoIris, BeforeAfter). (5dfdaa6)
- **DoF was a bad pixel-blur** — rebuilt as a side-view lens diagram, 4 factors, exact optics (validated vs dofsimulator). (4a8487f)
- **Shutter reused the DoF scene, no motion** — rebuilt as an animated car that smears/freezes. (4a8487f)
- **Mobile: DoF readout cards truncated** ("HYPERFOC…", wrapped) → 2×2 grid. (fb2aa77)
- **L6 triangle math** had an inconsistent hidden ISO offset (neutral at index 2 vs 4) → symmetric centering; {4,4,4} truly level. (fb2aa77)
- **L1 predict referenced "aperture"** before it's taught → in-scope distractor. (fb2aa77)
- **L4 intro showed a portrait** before a car demo → dropped. (fb2aa77)

## Open — found, not yet fixed (ranked)
1. **Predict-before-explain (all 9 lessons).** Every lesson still opens with an intro that *states* the concept, then quizzes it. True active learning leads with the attempt. Structural reorder. [MAJOR]
2. **L6 triangle success is arithmetic-only.** With math fixed you still win by any sum-to-level combo; the blur/motion/grain side-effects are cosmetic, not part of the goal. Needs an over-constrained goal (e.g. "freeze motion AND blur the background while staying level") so the trade-off is *felt*. [MAJOR]
3. **L5 frames ISO as a light source.** Reinforces "ISO adds light" rather than "amplifies an existing signal + noise." Needs linked bars: light-collected (flat) vs gain vs noise. [MAJOR]
4. **L8 white balance neutral = zero slider.** Teaches "correct WB = no change." Should bake a fixed cast + opposing correction (neutral at a non-zero position) with a gray-card R≈G≈B target. [MEDIUM]
5. **L9 composition is a pinpoint, non-responsive.** The image doesn't change feel with placement (no lead-room/horizon response); rewards an exact point not a range. Teaches WHERE not WHY. [MEDIUM]
6. **L4 shutter not coupled to brightness.** Slow shutter smears but doesn't brighten, so the exposure cost of freezing isn't felt (weakens the L6 bridge). [MEDIUM]
7. **L4 predict is a waterfall but the demo is a car** (concept transfer, no visual for the predict). [MINOR]
8. **L3 DoF predict has no show-why visual** (byOption references the playground, which is decent). [MINOR]
9. **L1 capture clipping shows only after "Take,"** not live under the hand. [MINOR]
10. **Bundle 637 KB** (Firebase, not code-split). [MINOR perf]
11. **Not deployed** — needs `firebase login` (interactive). [TODO]

## Verified OK this pass
- Auth / resume / persistence / completion / XP / stats; next-lesson transition; the no-reveal feedback model + escalation; aperture & L7 fixes hold; DoF physics exact; DoF + triangle render correctly on mobile (375px).

## My own coverage gaps (honest)
- Mobile checked on DoF + triangle; have NOT yet re-checked Home / Auth / CoursePath / capture / ISO-loupe / compose on 375px.
- Deep pedagogical items (1–6) are identified but not yet built.
