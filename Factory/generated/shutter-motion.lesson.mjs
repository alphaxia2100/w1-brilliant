// L7 — SHUTTER SPEED: FREEZE IT OR FEEL IT
// A dedicated lesson on the shutter as a MOTION-rendering creative decision — NOT as
// part of the exposure balance (that stays L1's job). Deliberately opens on the facet
// L1 never touches: the INTENTIONAL-blur pole. L1's shutter beat asks you to freeze a
// car; a learner who did L1 has already made that prediction. So the cold-open here is
// the OPPOSITE surprise — drag the shutter slow ON PURPOSE and watch a smear become a
// tool. From there: a quick freeze callback (same axis, the confirm), then two distinct
// reasoning facets the pole-slider can't carry — subject-speed scaling, and the
// handheld-shake FLOOR (a different blur SOURCE, keyed to focal length) — and a keeper
// that accepts EITHER creative call. Leans on the engine's `motion` kind, which passes
// the shutter index si (0=fast/frozen .. 7=slow/blurred) to each check.
//
// NOTE ON HONESTY: the `motion` sim (MotionView / drawRoad in src/engine/steps.jsx) can
// ONLY render subject-motion blur scaled from si — there is no camera-tracking/panning
// mode and no handheld-shake source. A "panning" beat (subject sharp, background streaks)
// would have the sim smear the car and stamp "the car moved" — the exact opposite of the
// claim. So panning is NOT taught here. The shake floor is taught via `rank` (pure
// reasoning, nothing on screen to contradict), keyed to focal length where it actually
// lives — not faked in the car sim.

export default {
  id: 'shutter-motion',
  number: 0,
  title: 'Shutter speed: freeze it or feel it',
  blurb: 'Freeze the action sharp — or let it blur for energy.',
  steps: [
    // BEAT 1 — predict by doing: the pole L1 never touches. Make the car FEEL fast.
    // Surprise = a "mistake" smear is actually the goal. Genuinely new vs L1's freeze.
    {
      kind: 'motion',
      prompt: 'A car is speeding past — but a frozen car can look parked. Don’t freeze it. Make a photo that FEELS fast: drag the shutter until the car streaks across the frame.',
      start: 1,
      check: (si) => si >= 5,
      feedback: {
        correct:
          'That streak isn’t a mistake — it’s motion blur used as a tool. The shutter is a curtain that opens for a slice of time; hold it open LONGER and the car travels across the frame while it’s open, painting its own speed into the picture. A slow shutter speed, full of energy.',
        stages: [
          'A streak needs the curtain held open long enough for the car to travel while it’s open. Which way holds it open LONGER?',
          'Drag toward the slow end so the car smears across the frame, then take the shot.',
        ],
      },
    },
    // BEAT 2 — confirm the rule, both poles (telling, kept short)
    {
      kind: 'intro',
      title: 'The shutter renders motion',
      body: [
        'Your eyes always see the car sharp — but the camera records every instant the shutter is open. A long exposure paints the car’s whole journey across the frame as a blur; a short one catches a single frozen instant.',
        'So the shutter has two poles, both creative: let motion flow, or stop it dead. You just felt the flow side — now pin it.',
      ],
    },
    // BEAT 3 — the freeze pole, now a quick callback (NOT the cold-open). Same axis as
    // BEAT 1 seen from the other end: this is the "confirm" half of the SEE→confirm pair,
    // not a new facet — that's intentional. The new facets come in BEATs 5–7.
    {
      kind: 'motion',
      prompt: 'Now the other pole. Same speeding car — this time pin it dead-still, razor-sharp, like it’s parked mid-road.',
      start: 5,
      check: (si) => si <= 1,
      feedback: {
        correct:
          'Frozen solid. Open the curtain for the tiniest slice of time and the car can’t travel far enough to smear. That’s a fast shutter speed — the same dial, the opposite choice.',
        stages: [
          'It came back smeared — the curtain stayed open while the car kept moving. Which way makes the shutter open for a SHORTER slice of time?',
          'Freezing needs the briefest possible exposure — head toward the fast end, then take the shot.',
        ],
      },
    },
    // BEAT 4 — confirm scaling (telling, short). ONE idea: faster subject → faster
    // shutter. The handheld-shake floor used to be jammed in here too; it's now its own
    // interactive beat (BEAT 6), since it's a distinct, fresh facet.
    {
      kind: 'intro',
      title: 'How fast you need depends on the subject',
      body: [
        'There is no single “right” shutter speed for freezing. The faster your subject crosses the frame, the faster the shutter must be to stop it — a strolling person needs far less than a racing car.',
        'So before you freeze anything, you size up one thing: how fast is it actually moving?',
      ],
    },
    // BEAT 5 — transfer (rank): order subjects by the shutter speed needed to freeze them.
    // First distinct reasoning facet — subject SPEED, not the pole slider.
    {
      kind: 'rank',
      prompt: 'To FREEZE each of these, order them by the shutter speed you’d need — fastest shutter first.',
      scale: ['needs fastest shutter', 'slowest is fine'],
      items: [
        { label: 'hummingbird wings' },
        { label: 'a sprinting dog' },
        { label: 'a slow walker' },
      ],
      solution: [0, 1, 2], // wings (blazing) → dog → walker (gentle)
      feedback: {
        correct:
          'Right — it scales with the subject’s speed. Blurring wings need an extreme shutter, a sprinting dog less, a slow walker least of all. Match the shutter to how fast the subject actually moves.',
        stages: [
          'Which subject moves the fastest across the frame? That one needs the fastest shutter to freeze.',
          'Order by raw speed: hummingbird wings (blazing), then the sprinting dog, then the slow walker.',
        ],
      },
    },
    // BEAT 6 — the SHAKE FLOOR: a genuinely fresh facet. So far blur has always come from
    // the SUBJECT moving. Here the blur comes from YOUR HANDS — and the threshold isn't
    // set by the subject at all, it's set by the LENS. The longer the focal length, the
    // more it magnifies your own micro-shake, so the faster the shutter must be just to
    // stay sharp handheld (rule of thumb: ≥ 1 / focal length). Taught as `rank` because
    // the car sim can't render hand-shake without lying. Distinct axis from BEAT 5.
    {
      kind: 'rank',
      prompt: 'Now a DIFFERENT blur — not the subject moving, but your own hands. Shooting a still subject HANDHELD, order these lenses by the shutter speed each needs just to stay sharp — fastest shutter first.',
      scale: ['needs fastest shutter', 'slowest is fine'],
      items: [
        { label: '400mm telephoto' },
        { label: '50mm normal' },
        { label: '16mm wide-angle' },
      ],
      solution: [0, 1, 2], // longer lens magnifies shake more → needs faster shutter
      feedback: {
        correct:
          'Exactly — a long lens magnifies your own tiny hand-tremor along with the subject, so it needs a faster shutter just to come out sharp; a wide lens forgives slow speeds. Rule of thumb: keep the shutter at least as fast as one over the focal length (≈1/400s for the 400mm, ≈1/50s for the 50mm). Below that floor, brace hard or use a tripod — which is exactly how those silky-water and light-trail long exposures are shot.',
        stages: [
          'This blur scales with the lens, not the subject. Which lens magnifies the most — and so magnifies your hand-shake the most?',
          'The longer the focal length, the more it magnifies shake: 400mm needs the fastest shutter, then 50mm, then 16mm.',
        ],
      },
    },
    // BEAT 7 — KEEPER: a fresh creative BRIEF, not a blank canvas. Earlier beats forced
    // ONE answer each (BEAT 1 must blur, BEAT 3 must freeze). The keeper is the synthesis:
    // you weigh a real shot and COMMIT to a reading. Either pole is valid — the band is
    // si<=1 || si>=5 by necessity (those ARE the two looks) — but it's a new scenario the
    // poles never used, and the half-smeared middle is explicitly the wrong answer here.
    {
      kind: 'motion',
      prompt: 'Keeper. A friend drives past and asks you for ONE shot of their car. Decide the story: a crisp, deliberate portrait of the car — or a streak of pure speed. Either is right. What’s NOT right is a half-smear that looks like you missed. Set the shutter and commit.',
      start: 3,
      check: (si) => si <= 1 || si >= 5,
      feedback: {
        correct:
          'Committed — and whichever way you went, you chose it on purpose. A frozen frame reads as crisp and deliberate; a streak reads as motion and energy. The only miss would’ve been the muddy middle. You can now look at any moving subject and decide which story to tell — and what shutter tells it. Yours to keep.',
        stages: [
          'That middle setting is neither story — it leaves a half-smear that reads as an accident. Pick a side: drag toward the fast end to freeze, or the slow end to streak.',
          'Choose a look and own it — head to the fast end for a sharp portrait, or the slow end for a deliberate streak, then take the shot.',
        ],
      },
    },
  ],
}
