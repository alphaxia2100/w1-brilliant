// L7 — ISO & NOISE (the price of light)
// ISO does not gather light — it AMPLIFIES what little you caught, and the bill
// comes due as grain that lives in the shadows. You push it only as far as the
// dark forces you. Distinct from L1 (ISO as a third brightness lever) and L3
// (metering / histogram): this lesson is dedicated to the NOISE consequence.

const ISO_STOPS = [100, 200, 400, 800, 1600, 3200, 6400, 12800]
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)

// Brightness from ISO amplification (same shape L1 uses), spread so every stop reads.
const isoToExposure = (iso) => clamp(Math.log2(iso / 100) * 0.4, 0, 2.8)
// Grain rises with ISO — this is the "iso" effect param that computeGrid turns into
// per-cell noise (and which the loupe magnifies, worst in the shadows).
const isoToNoise = (iso) => clamp(Math.log2(iso / 100) * 22, 0, 150)

// The keeper (Beat 6) shoots a dim interior: a -1.4-EV ambient pedestal under the
// usual ISO brightness curve, so ISO 100 is too dark to read and the lowest ISO that
// reads cleanly lands mid-range — the disciplined shot the learner commits and keeps.
const DIM = -1.4

export default {
  id: 'iso-and-noise',
  number: 7,
  title: 'ISO & noise: the price of light',
  blurb: 'ISO buys brightness with grain. Spend it only when the dark forces you.',
  steps: [
    // BEAT 1 — PREDICT-FIRST: it's dark, so the impulse is to bury the slider at the
    // top. Push the loupe all the way up and the FIRST surprise isn't "it got bright" —
    // it's that the shadows have turned to a blizzard of grain. The win is the
    // over-cranked extreme on purpose, so the cost is undeniable before we fix it.
    {
      kind: 'slider-sim',
      scene: 'night',
      prompt: 'It’s dark, so do what the panic button says: crank the ISO all the way up to be safe. Watch the loupe as you go.',
      control: { stops: ISO_STOPS, start: 0 },
      toParams: (iso) => ({ exposure: isoToExposure(iso), iso: isoToNoise(iso) }),
      format: (iso) => 'ISO ' + iso,
      label: 'ISO',
      ends: ['ISO 100 · clean', 'ISO 12800 · noisy'],
      ariaLabel: 'ISO sensitivity',
      loupe: { cx: 3, cy: 25, cells: 6 },
      check: (iso) => iso >= 6400,
      feedback: {
        correct:
          'Bright — but look at the loupe. That brightness didn’t come from more light; ISO AMPLIFIED the little you had, and amplified the grain right along with it. Maxed out, the shadows are pure speckle. That’s the price, and you just overpaid it.',
        stages: [
          'Which way turns the ISO up? Take it toward the top.',
          'Keep going to the very top of the range — and keep your eye on the loupe as the grain builds.',
        ],
      },
    },

    // BEAT 2 — CONFIRM: name what the speckle actually IS. New facet vs Beat 1's recap:
    // not "ISO amplifies" again, but that noise is RANDOM per-pixel error, and the way
    // to drown it out is more real light — signal-to-noise, the engine of the whole lesson.
    {
      kind: 'intro',
      scene: 'night',
      title: 'Noise is random — light is not',
      body: [
        'That speckle isn’t one flaw you can dial out; it’s thousands of tiny random errors, a different wrong guess at every single pixel. The fewer photons a pixel actually caught, the more its guess is just noise.',
        'So the cure was never "less ISO" by itself — it’s a better ratio of real light to random error. Feed the sensor more genuine light and the signal swamps the speckle. The rest of this lesson is two ways to win that ratio.',
      ],
    },

    // BEAT 3 — DISTINCT FACET: don't over-amplify. Find the LOWEST ISO that still
    // reads — push it only as far as the dark forces you, no further.
    {
      kind: 'slider-sim',
      scene: 'night',
      prompt: 'You maxed it out — overkill. Now back off: find the LOWEST ISO that still lets you read the scene — clean enough to keep, bright enough to see.',
      control: { stops: ISO_STOPS, start: 7 },
      toParams: (iso) => ({ exposure: isoToExposure(iso), iso: isoToNoise(iso) }),
      format: (iso) => 'ISO ' + iso,
      label: 'ISO',
      ends: ['ISO 100 · clean', 'ISO 12800 · noisy'],
      ariaLabel: 'ISO sensitivity',
      loupe: { cx: 3, cy: 25, cells: 6 },
      check: (iso) => iso >= 1600 && iso <= 3200,
      feedback: {
        correct:
          'There it is — the floor. You can’t drop to clean ISO 100 here: go lower than this and the scene falls back into the dark. The darkness itself sets a minimum, and your job is to sit right on it — high enough to read, never a stop higher. That’s the discipline: not "avoid grain," but "let the dark, and only the dark, decide how much you spend."',
        stages: [
          'Maxed out it’s readable but drowning in grain. Bring it DOWN toward clean, a stop at a time.',
          'Keep lowering until you’re right at the edge: still clearly readable, but as clean as you can get. Drop too far and the scene falls back into the dark.',
        ],
      },
    },

    // BEAT 4 — DISTINCT FACET: expose-to-the-right AT CAPTURE. The honest model:
    // a brighter in-camera exposure means MORE PHOTONS hit the sensor, so the signal
    // is stronger BEFORE any amplification — better signal-to-noise. We model that by
    // tying the grain param to capture brightness (captureNoise): as the shot is
    // exposed brighter up front, the relative grain genuinely falls. This is NOT the
    // "lift a dark frame later" move (that would brighten signal AND baked-in noise
    // together); here more light up front means less noise to begin with, so the loupe
    // visibly cleans up — and the copy below is literally true.
    {
      kind: 'slider-sim',
      scene: 'night',
      prompt: 'Same ISO either way — but this time you choose how much light to give the sensor up front. The frame was left underexposed and the shadows are crawling with grain. Open the exposure at capture to feed the sensor more light, until those shadows lift up clean.',
      control: { min: -1.6, max: 1.4, step: 0.1, start: -1.6 },
      // More light at capture = stronger signal before amplification = less relative
      // grain. The grain param scales DOWN as exposure rises (capture-brightness model),
      // so this is genuinely "more photons up front," not a post-capture lift.
      toParams: (v) => ({ exposure: v, iso: isoToNoise(3200) * Math.pow(2, -0.5 * (v + 1.6)) }),
      format: (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + ' EV',
      label: 'Exposure',
      ends: ['dark · grain in shadows', 'bright · shadows lifted'],
      ariaLabel: 'Exposure',
      loupe: { cx: 3, cy: 25, cells: 6 },
      check: (v) => v >= 0.6,
      feedback: {
        correct:
          'Grain hides in the dark — and more light up front starves it. Exposing brighter at capture floods the sensor with real photons, so the signal stands tall over the noise before any amplification kicks in. That’s why a bright shot taken in-camera always beats a dark one you lift later: lifting later multiplies the grain right along with the picture. Give the sensor more light up front whenever you can.',
        stages: [
          'The loupe is sitting on a shadow — that’s where grain screams loudest. Which way feeds the sensor more light?',
          'Open the exposure at capture until the shadow patch climbs clear of the speckle, then take the shot.',
        ],
      },
    },

    // BEAT 5 — TRANSFER KEEPER: rank shooting situations by how much ISO they force.
    {
      kind: 'rank',
      prompt: 'You can’t change the light — so the scene decides how much ISO you’re forced into. Order these by the ISO they demand, LEAST first.',
      scale: ['needs least ISO', 'needs most ISO'],
      items: [
        { label: 'Beach at noon' },
        { label: 'Indoors by a window' },
        { label: 'Dim restaurant' },
        { label: 'Concert in the dark' },
      ],
      solution: [0, 1, 2, 3],
      feedback: {
        correct:
          'That’s the whole lesson in one ladder: the darker the scene, the more gain it forces, and the more grain you accept to get the shot. ISO is the lever of last resort — and now you know exactly when the dark forces your hand.',
        stages: [
          'More available light means less ISO needed. Which scene is brightest? Which is darkest?',
          'Brightest scene needs the least ISO (left); the dark concert forces the most (right).',
        ],
      },
    },

    // BEAT 6 — AUTHORED KEEPER: a real shot to commit. A dim interior you can't add
    // light to. Apply the whole lesson: set the LOWEST ISO that reads cleanly — not the
    // panic-button max (Beat 1), not so low it falls into the dark (Beat 3) — and take
    // the shot. New scene (room, not night) so it's a genuine transfer-and-commit, and
    // the learner leaves with a frame that is theirs: exposed by their own judgment.
    {
      kind: 'slider-sim',
      scene: 'room',
      prompt: 'Last shot, and it’s yours to keep: a dim room, no lamp to switch on. Dial in the LOWEST ISO that reads this scene clean — the disciplined exposure you’d actually shoot — then take it.',
      control: { stops: ISO_STOPS, start: 0 },
      toParams: (iso) => ({ exposure: isoToExposure(iso) + DIM, iso: isoToNoise(iso) }),
      format: (iso) => 'ISO ' + iso,
      label: 'ISO',
      ends: ['ISO 100 · too dark', 'ISO 12800 · noisy'],
      ariaLabel: 'ISO sensitivity',
      loupe: { cx: 3, cy: 25, cells: 6 },
      check: (iso) => iso >= 1600 && iso <= 3200,
      feedback: {
        correct:
          'That one’s yours. You spent exactly the ISO the dark forced and not a stop more — bright enough to read, clean enough to keep. That’s the whole discipline: ISO is the lever of last resort, and you just used it like one. Your shot’s in the gallery.',
        stages: [
          'At ISO 100 the room is lost in the dark — it needs more gain than that. Bring the ISO up until the scene reads.',
          'Now stop the moment it reads clean — don’t keep climbing into needless grain. Lowest ISO that reads, no higher.',
        ],
      },
    },
  ],
}
