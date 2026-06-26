// Course content lives in the bundle as data — never in Firestore.
// Each lesson is one photography TOPIC, taught as 5–10 small single-step "beats".
// Every check is an ACTIVE interaction (no multiple choice). Lessons are predict-first:
// the learner does something and is surprised BEFORE the rule is stated.
//
// Feedback model (guide without revealing):
//   correct  — the consolidation recap shown on success
//   stages   — escalating hints: name a lever + direction, never a value
import { histogram, meanBrightness } from '../sim/scene.js'

const fmt = (f) => (f % 1 === 0 ? String(f) : f.toFixed(1))
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)

const F_STOPS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16]
// Brightest stop (f/1.4) anchored at 0 and descending ~0.6 stop per step, on a
// headroom scene, so opening up visibly brightens a dim room — never blown out.
const apertureToExposure = (f) => -F_STOPS.indexOf(f) * 0.6

const ISO_STOPS = [100, 200, 400, 800, 1600, 3200, 6400, 12800]
// Spread across the full range so every stop (to 12800) visibly changes the image.
const isoToExposure = (iso) => clamp(Math.log2(iso / 100) * 0.4, 0, 2.8)
const isoToNoise = (iso) => clamp(Math.log2(iso / 100) * 22, 0, 150)

// Well-metered = neither edge clipped AND overall brightness in a mid band, so an
// underexposed start genuinely fails and only a real correction passes.
const CLIP = 0.09
function wellMetered(scene, exposure) {
  const c = histogram({ scene, exposure })
  const total = c.reduce((a, b) => a + b, 0) || 1
  const noClip = c[0] / total <= CLIP && c[c.length - 1] / total <= CLIP
  const mean = meanBrightness({ scene, exposure })
  return noClip && mean >= 0.4 && mean <= 0.62
}

// Highlights blown = a big spike piled against the rightmost (pure-white) bin.
function highlightsBlown(scene, exposure) {
  const c = histogram({ scene, exposure })
  const total = c.reduce((a, b) => a + b, 0) || 1
  return c[c.length - 1] / total > 0.12
}

// Shadows crushed = a big spike piled against the leftmost (pure-black) bin.
function shadowsCrushed(scene, exposure) {
  const c = histogram({ scene, exposure })
  const total = c.reduce((a, b) => a + b, 0) || 1
  return c[0] / total > 0.12
}

// Highlights protected = the bright end is no longer clipped. On a scene wider than
// the sensor can hold, you CAN'T clear both ends — so the rule is to protect the
// highlights (a blown sky is gone for good; shadows can be lifted later).
function highlightsProtected(scene, exposure) {
  const c = histogram({ scene, exposure })
  const total = c.reduce((a, b) => a + b, 0) || 1
  return c[c.length - 1] / total <= 0.05
}

// High-key well-exposed = bright overall AND not clipped — the histogram sits RIGHT.
function highKeyOK(scene, exposure) {
  const c = histogram({ scene, exposure })
  const total = c.reduce((a, b) => a + b, 0) || 1
  const noClip = c[c.length - 1] / total <= 0.12
  const mean = meanBrightness({ scene, exposure })
  return noClip && mean >= 0.7 && mean <= 0.86
}

// White balance: a scene ships with a baked-in cast; the slider is the CORRECTION,
// so neutral lands where cast + slider ≈ 0 (a NON-zero slider), not at slider 0.
const WB_WARM = 0.6
const WB_SHADE = -0.55
const WB_CARD = 0.5
const WB_SUNSET = 0.45
const wbResultK = (cast) => (v) => Math.round(5500 - (cast + v) * 2500) + 'K'
const wbNeutral = (cast) => (v) => Math.abs(cast + v) < 0.12
const wbWarmKept = (cast) => (v) => {
  const e = cast + v
  return e >= 0.22 && e <= 0.55
}
// A WB bet's relationship to where neutral actually sits (-cast). PURE + gate-tested
// (Redesign/checks.mjs) so the success copy can NEVER tell a learner their wrong-direction
// guess was "right" — the pedagogy blueprint's #1 named risk. center=bet the middle;
// wrong=bet the same way as the cast; near=nailed it; short=right way but not far enough;
// over=right way but past neutral.
const wbBetKind = (cast) => (bet) => {
  const vNeutral = -cast
  const band = 0.12
  if (Math.abs(bet) < band) return 'center'
  const towardCast = vNeutral < 0 ? bet > 0 : bet < 0
  if (towardCast) return 'wrong'
  if (Math.abs(bet - vNeutral) <= band) return 'near'
  return Math.abs(bet) < Math.abs(vNeutral) ? 'short' : 'over'
}
// WB_WARM-specific copy (the only bet beat today). The fix for a warm cast is toward blue.
const WB_BET_MSG = {
  center:
    'You bet the middle of the dial — but neutral was a real shove toward blue. You cancel a colour cast by adding its OPPOSITE, and a strong cast needs a strong correction.',
  wrong:
    'You bet toward orange — but the photo was ALREADY too orange; pushing that way only deepens the cast. Neutral lives the other direction: a real shove toward blue.',
  short:
    'Right instinct — toward blue — but neutral sat even FURTHER than you bet. A strong cast takes a bigger correction than it feels like it should.',
  near: 'You called it — neutral really does sit well toward blue, not in the middle. Most people guess the centre; you didn’t.',
  over: 'You went past it — you felt the cast was strong and over-shot into too-cool. Close, but neutral sat a touch back toward the middle.',
}

const lessons = [
  // ───────────────────────────────────────────────────────────────────────────
  // L1 — THE EXPOSURE TRIANGLE (the anchor: the whole exposure system in one lesson)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'exposure-triangle',
    title: 'The exposure triangle',
    blurb: 'Three controls, one job: gather the right light.',
    steps: [
      {
        kind: 'capture',
        scene: 'landscape',
        prompt: 'A photo is light gathered over time. This shot started dark — open the shutter to gather light and land the marker in the green, then take the photo.',
        start: -2,
        targetExp: { min: -0.5, max: 0.6 },
        feedback: {
          correct:
            'That’s a good exposure — not the brightest possible, the one that lands on target. Photographers call that “correctly exposed.”',
        },
      },
      {
        kind: 'intro',
        scene: 'landscape',
        title: 'Exposure is a target, not a maximum',
        body: [
          'Too little light and the photo is dark; too much and it washes out. “Correct” means landing on the target.',
          'Each doubling (or halving) of light is one stop. Every control below is just a different way to add or remove stops.',
        ],
      },
      {
        kind: 'slider-sim',
        scene: 'room',
        prompt: 'Control one — the aperture, a hole inside the lens. Open it all the way up and watch this dim room brighten.',
        control: { stops: F_STOPS, start: 7 },
        toParams: (f) => ({ exposure: apertureToExposure(f) }),
        format: (f) => 'f/' + fmt(f),
        label: 'Aperture',
        ends: ['f/1.4 · wide open', 'f/16 · narrow'],
        iris: true,
        ariaLabel: 'Aperture f-stop',
        check: (f) => f <= 2,
        feedback: {
          correct:
            'A wider aperture (a lower f-number) is a bigger hole — more light. The numbers run backwards: f/1.4 is wide, f/16 is a pinhole.',
          stages: [
            'Which way opens the hole wider — lower f-numbers, or higher?',
            'Wider means a smaller f-number. Head all the way to the wide end, then take the shot.',
          ],
        },
      },
      {
        kind: 'motion',
        prompt: 'Control two — the shutter, a curtain open for a slice of time. A car is speeding past. Set a shutter speed and take the shot — freeze it razor-sharp.',
        start: 5,
        check: (si) => si <= 1,
        feedback: {
          correct:
            'A fast shutter opens for the tiniest slice of time — too short for the car to move — so it freezes (and gathers less light). A slow one blurs motion and gathers more.',
          stages: [
            'The car is smearing across the frame. Which way makes the shutter faster?',
            'Freezing needs a tiny slice of time — head toward the fast end, then take the shot.',
          ],
        },
      },
      {
        kind: 'slider-sim',
        scene: 'night',
        prompt: 'Control three — ISO. It’s too dark to see. Turn the ISO up until you can clearly make out the scene.',
        control: { stops: ISO_STOPS, start: 0 },
        toParams: (iso) => ({ exposure: isoToExposure(iso), iso: isoToNoise(iso) }),
        format: (iso) => 'ISO ' + iso,
        label: 'ISO',
        ends: ['ISO 100 · clean', 'ISO 12800 · noisy'],
        ariaLabel: 'ISO sensitivity',
        loupe: { cx: 4, cy: 25, cells: 6 },
        check: (iso) => iso >= 1600,
        feedback: {
          correct:
            'ISO amplifies the signal you’ve gathered rather than collecting more light — brighter, but the loupe shows the cost: grain. It’s the lever of last resort.',
          stages: [
            'Can you make out the scene yet? Which way turns the ISO up?',
            'Higher ISO amplifies brighter. Keep raising it until the scene is readable, then take the shot.',
          ],
        },
      },
      {
        kind: 'intro',
        scene: 'portrait',
        title: 'Three levers, one currency: light',
        body: [
          'Aperture, shutter, and ISO each change brightness — all measured in the same stops.',
          'Each also leaves a mark: aperture → background blur, shutter → motion, ISO → grain. The craft is balancing the three to keep the light right while choosing the look you want.',
        ],
      },
      {
        kind: 'triangle',
        scene: 'portrait',
        prompt: 'This shot is overexposed — the ISO is cranked too high. Balance the three controls until the exposure meter sits level.',
        start: { aperture: 4, shutter: 4, iso: 6 },
        feedback: {
          correct:
            'Balanced. And here’s the magic: you can hit this same brightness many ways — a wide aperture with a fast shutter, or a narrow one with high ISO. Those are equivalent exposures, each with its own look.',
        },
      },
      {
        kind: 'triangle',
        scene: 'portrait',
        goal: {
          lever: 'aperture',
          test: (ai) => ai <= 2,
          label: 'a soft, melted background',
          unmet:
            'Your exposure is level — but the background is still sharp. Open the aperture WIDE for that soft look, then trade the extra light away on the shutter or ISO to bring the meter back to level.',
        },
        prompt: 'Now make a creative call. You want a dreamy, soft background — that takes a wide aperture. But opening up floods the sensor with light. Open it wide for the blur, then trade that light away elsewhere to keep the meter level.',
        start: { aperture: 4, shutter: 4, iso: 4 },
        feedback: {
          correct:
            'That’s reciprocity — the engine of the whole triangle. You opened up for the soft background, then paid the light back with a faster shutter or lower ISO. Same exposure, the look you chose. Every creative decision is a trade.',
        },
      },
      {
        kind: 'rank',
        prompt: 'These three settings all give the SAME brightness — equivalent exposures. Order them by background blur, most blur first.',
        scale: ['most blur', 'all sharp'],
        items: [{ label: 'f/2.8 · 1/500' }, { label: 'f/5.6 · 1/125' }, { label: 'f/11 · 1/30' }],
        solution: [0, 1, 2], // f/2.8 (widest, most blur) → f/5.6 → f/11 (narrowest)
        feedback: {
          correct:
            'Same brightness, different look: the wide aperture (f/2.8) blurs the background most. Choosing among equivalent exposures is choosing the look you want — that’s the whole game.',
          stages: [
            'A wider aperture (smaller f-number) blurs the background more. Which f-number is smallest?',
            'Order by aperture width: f/2.8 (widest, most blur), then f/5.6, then f/11.',
          ],
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // L2 — DEPTH OF FIELD (forward flower-bokeh; aperture's creative second job)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'depth-of-field',
    title: 'Depth of field',
    blurb: 'Make your subject pop off a soft background.',
    steps: [
      // BEAT 1 — predict by doing: aperture melts the background
      {
        kind: 'bokeh',
        control: 'aperture',
        lock: { subjectDist: 0.5, bgDist: 0.4, focal: 0.3 },
        start: { f: 8 },
        check: (blur) => blur >= 9,
        feedback: {
          correct:
            'That soft wash is called bokeh — and you made it by opening the aperture WIDE (a low f-number). Aperture has a second job beyond brightness.',
          stages: [
            'Watch the background as you drag — which end softens it, the wide end or the narrow?',
            'Wider apertures (low f-numbers, toward f/1.4) blur the background most. Open it up, then take the shot.',
          ],
        },
      },
      // BEAT 2 — confirm: aperture is one of four levers
      {
        kind: 'intro',
        title: 'Aperture is only the first lever',
        body: [
          'A wide aperture throws the background out of focus. But it is one of FOUR levers: how close you stand, how far the background sits, and how long your lens is each change the blur too.',
          'Next you will feel each one on its own — with the aperture held fixed, so you know it is not doing the work.',
        ],
      },
      // BEAT 3 — subject distance (aperture FIXED)
      {
        kind: 'bokeh',
        control: 'subjectDist',
        lock: { f: 4 },
        start: { subjectDist: 1 },
        check: (blur) => blur >= 9,
        feedback: {
          correct:
            'Same aperture the whole time — but stepping CLOSER to your subject shrinks the sharp slice, so the background melts. Distance is the lever beginners forget.',
          stages: [
            'The aperture is locked this time. Which way moves you closer to the flower?',
            'Move all the way up close, then take the shot.',
          ],
        },
      },
      // BEAT 4 — background distance (aperture + subject FIXED)
      {
        kind: 'bokeh',
        control: 'bgDist',
        lock: { f: 4, subjectDist: 0.5 },
        start: { bgDist: 0 },
        check: (blur) => blur >= 9.5,
        feedback: {
          correct:
            'The farther the background sits behind your subject, the more it melts — which is why a portrait against a distant field blurs far more than one against a near wall.',
          stages: [
            'Aperture and your distance are both fixed now. Push the BACKGROUND farther away.',
            'Send the background to the far end, then take the shot.',
          ],
        },
      },
      // BEAT 5 — focal length / compression
      {
        kind: 'bokeh',
        control: 'focal',
        lock: { f: 4, subjectDist: 0.5, bgDist: 0.4 },
        start: { focal: 0 },
        check: (blur) => blur >= 10,
        feedback: {
          correct:
            'A longer lens magnifies the background AND blurs it more. That compression is why portrait photographers reach for an 85mm, not a wide-angle.',
          stages: [
            'Zoom from wide-angle toward telephoto and watch the background swell and soften.',
            'Go to the long (telephoto) end, then take the shot.',
          ],
        },
      },
      // BEAT 6 — night-lights bokeh (the aesthetic)
      {
        kind: 'bokeh',
        control: 'aperture',
        bg: 'lights',
        lock: { subjectDist: 0.5, bgDist: 0.6, focal: 0.4 },
        start: { f: 8 },
        check: (blur) => blur >= 10,
        feedback: {
          correct:
            'Out-of-focus point lights bloom into glowing orbs — bokeh at its most magical. The wider the aperture, the bigger and rounder the balls.',
          stages: [
            'Those little lights want to become glowing balls. What opens the aperture wide?',
            'Open all the way up to bloom the lights, then take the shot.',
          ],
        },
      },
      // BEAT 7 — transfer: rank whole setups by blur
      {
        kind: 'rank',
        prompt: 'Order these portrait setups by how soft the background will be — softest first.',
        scale: ['softest background', 'all sharp'],
        items: [
          { label: 'f/1.8 · up close · 85mm' },
          { label: 'f/4 · a few steps back · 50mm' },
          { label: 'f/11 · far back · wide lens' },
        ],
        solution: [0, 1, 2],
        feedback: {
          correct:
            'Right — the levers stack. Wide aperture + close + long lens gives the creamiest background; narrow + far + wide-angle keeps everything sharp.',
          stages: [
            'Every lever adds up: wide aperture, close subject, and a long lens each blur MORE.',
            'The setup with all three working together blurs most; the one with all three against blurs least.',
          ],
        },
      },
      // BEAT 8 — synthesis keeper: all four levers at once
      {
        kind: 'bokeh',
        control: ['aperture', 'subjectDist', 'bgDist', 'focal'],
        start: { f: 5.6, subjectDist: 0.5, bgDist: 0.4, focal: 0.3 },
        check: (blur) => blur >= 16,
        feedback: {
          correct:
            'A creamy, shallow portrait built from all four levers together. That is the whole of depth of field — and the shot is yours to keep.',
          stages: [
            'No single lever has to do it alone — stack them: open up, step closer, push the background back, zoom in.',
            'Lean every lever toward shallow at once, then take the shot.',
          ],
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // SHUTTER SPEED & MOTION — the shutter as a CREATIVE axis (freeze vs blur).
  // Distinct from L1's single freeze beat (shutter-as-light-lever) and L7 long-exposure
  // (gathering light over time): this lesson is about motion-blur as a creative choice.
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'shutter-motion',
    title: 'Shutter speed & motion',
    blurb: 'Freeze the action — or blur it on purpose.',
    steps: [
      // BEAT 1 — predict by doing: lead with the SURPRISING half (blur conveys speed)
      {
        kind: 'motion',
        prompt:
          'This car is flying past — but frozen, it looks parked. A photo can SHOW the speed your eyes feel: slow the shutter down, hold it open longer, until the car streaks across the frame.',
        start: 0, // frozen — looks parked → fails until they slow it down
        check: (si) => si >= 5,
        feedback: {
          correct:
            'That streak IS the speed. With the shutter open longer, the car kept moving while the photo was taken, so it smears across the frame — and a still photo suddenly feels fast. Blur isn’t always a mistake; sometimes it’s the whole point.',
          stages: [
            'A frozen car looks parked. To show motion the shutter must stay open LONGER — which way is that?',
            'Drag toward the slow end (1/8) so the car moves while the shutter is open, then take the shot.',
          ],
        },
      },
      // BEAT 2 — confirm: the shutter is a slice of time; fast freezes, slow blurs
      {
        kind: 'intro',
        title: 'A slice of time',
        body: [
          'The shutter is a curtain that opens for a slice of time. A LONG slice — and anything moving travels across the frame while it’s open, so it blurs. A SHORT slice is over before the subject can move, so it freezes.',
          'Same control, two creative ends: freeze to catch a moment crisp, or blur to show motion and energy.',
        ],
      },
      // BEAT 3 — the opposite pole: freeze it razor-sharp
      {
        kind: 'motion',
        prompt:
          'Now the opposite call: you want this car caught crisp — every detail sharp, no smear. Pick a shutter fast enough to freeze it, then take the shot.',
        start: 6, // slow/blurred → fails until they speed it up
        check: (si) => si <= 1,
        feedback: {
          correct:
            'Frozen solid. A slice of time too short for the car to travel — so it’s pinned sharp. Fast shutter to catch action crisp; slow shutter to let it flow. You’re choosing between them now, not just turning a dial.',
          stages: [
            'It’s still smearing — the shutter’s open too long. Which way is faster?',
            'Push toward the fast end (1/1000) — the shortest slice of time — then take the shot.',
          ],
        },
      },
      // BEAT 4 — transfer: rank real subjects by the shutter speed they demand (tray is shuffled)
      {
        kind: 'rank',
        prompt:
          'Different subjects move at different speeds — and each needs a different shutter. Order these by the shutter speed they demand, FASTEST first.',
        scale: ['fastest shutter', 'slowest shutter'],
        items: [
          { label: 'A person walking the street' }, // 0
          { label: 'A hummingbird’s beating wings' }, // 1
          { label: 'A waterfall blurred to silk' }, // 2
          { label: 'A sprinter crossing the line' }, // 3
        ],
        solution: [1, 3, 0, 2], // hummingbird → sprinter → walker → silky waterfall (slowest)
        feedback: {
          correct:
            'Match the shutter to the motion. Blink-fast wings need the fastest shutter of all to freeze; a sprinter nearly as fast; a walker far less. And the silky waterfall wants the OPPOSITE — a slow shutter, so the water blurs into a smooth ribbon. The subject decides.',
          stages: [
            'The faster it moves (and the sharper you want it), the faster the shutter. The silky waterfall is the odd one — it WANTS blur, so it needs the slowest.',
            'Fastest → slowest: hummingbird wings, sprinter, walker, then the silky waterfall last.',
          ],
        },
      },
      // BEAT 5 — keeper: commit to a look (crisp OR streaked — not the muddy middle)
      {
        kind: 'motion',
        prompt:
          'Your call now — but COMMIT. A crisp freeze says “caught it.” A bold streak says “speed.” A half-blur in between just looks like a mistake. Pick a clear look and take a shot you’d keep.',
        start: 4, // the muddy middle → fails until they commit one way or the other
        check: (si) => si <= 1 || si >= 6,
        feedback: {
          correct:
            'That’s a decision, not an accident. You committed — pin-sharp or boldly streaked — instead of leaving it in the mushy middle where it reads as a missed shot. Owning the shutter is owning whether a moment is held still or set in motion.',
          stages: [
            'A little blur looks like a mistake. Go one way or the other: all the way fast for crisp, or well into the slow end for a bold streak.',
            'Pick a clear look — 1/1000 to freeze, or 1/15–1/8 to streak — not the middle.',
          ],
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // METERING (read the light with the histogram)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'metering',
    title: 'Metering: read the light',
    blurb: 'The histogram tells you if your exposure is right.',
    steps: [
      // 1 — discovery (predict-first): read the graph, spread the tones
      {
        kind: 'slider-sim',
        scene: 'landscape',
        prompt: 'This shot is underexposed. Read the histogram, not the photo — slide the exposure until the tones spread across the whole graph.',
        control: { min: -2.5, max: 2.5, step: 0.1, start: -1.7 },
        toParams: (v) => ({ exposure: v }),
        format: (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + ' EV',
        label: 'Exposure',
        ends: ['darker', 'brighter'],
        ariaLabel: 'Exposure compensation',
        histogram: true,
        check: (v) => wellMetered('landscape', v),
        feedback: {
          correct: 'Balanced — the tones spread across the histogram without piling against either edge. The graph reads the light more honestly than your eyes on a bright screen.',
          stages: [
            'Watch the histogram, not the photo. Are the bars bunched against one edge?',
            'The mass is still shoved to one side — move the exposure the other way to spread it.',
            'Spread the tones toward the middle: brighten if piled left, darken if piled right. Then take the shot.',
          ],
        },
      },
      // 2 — confirm: what the axes mean
      {
        kind: 'intro',
        scene: 'landscape',
        title: 'Left is shadows, right is highlights',
        body: [
          'The histogram counts how many pixels are dark (left), mid (middle), and bright (right).',
          'Piled against the left wall, detail is lost to pure black. Piled against the right, it is blown to pure white. Next, feel both walls.',
        ],
      },
      // 3 — clip the highlights (right wall = a mistake)
      {
        kind: 'slider-sim',
        scene: 'landscape',
        prompt: 'Push the exposure UP until the highlights blow — watch a spike slam against the RIGHT wall.',
        control: { min: -2.5, max: 2.5, step: 0.1, start: 0 },
        toParams: (v) => ({ exposure: v }),
        format: (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + ' EV',
        label: 'Exposure',
        ends: ['darker', 'brighter'],
        ariaLabel: 'Exposure compensation',
        histogram: true,
        check: (v) => highlightsBlown('landscape', v),
        feedback: {
          correct: 'Those pixels jammed at the right edge are pure white with nothing to recover — blown highlights. You would back off the exposure to save them.',
          stages: [
            'The right edge is the brightest possible tone. Which way pushes the bars toward it?',
            'Keep brightening until a tall spike piles against the right wall, then take the shot.',
          ],
        },
      },
      // 4 — clip the shadows (left wall = a mistake), on a night scene with real blacks
      {
        kind: 'slider-sim',
        scene: 'night',
        prompt: 'The other wall now: drag this night shot too DARK until the shadows crush against the LEFT edge.',
        control: { min: -2.5, max: 1.5, step: 0.1, start: 0.4 },
        toParams: (v) => ({ exposure: v }),
        format: (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + ' EV',
        label: 'Exposure',
        ends: ['darker', 'brighter'],
        ariaLabel: 'Exposure compensation',
        histogram: true,
        check: (v) => shadowsCrushed('night', v),
        feedback: {
          correct: 'A spike against the LEFT edge means shadows crushed to pure black — detail gone there too. Both walls cost you information.',
          stages: [
            'The left edge is pure black. Which way pushes the bars toward it?',
            'Keep darkening until a tall spike piles against the left wall, then take the shot.',
          ],
        },
      },
      // 5 — blinkies: clipping is spatial, and one exposure can't hold a high-DR scene
      {
        kind: 'slider-sim',
        scene: 'backlit',
        blinkies: true,
        prompt: 'Your camera flashes blown highlights right on the photo — “blinkies” (crushed shadows show in blue here too). This sky is clipping. Pull the exposure back until the red clears — and watch what it costs the land.',
        control: { min: -2, max: 2, step: 0.1, start: 0.6 },
        toParams: (v) => ({ exposure: v }),
        format: (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + ' EV',
        label: 'Exposure',
        ends: ['darker', 'brighter'],
        ariaLabel: 'Exposure compensation',
        histogram: true,
        check: (v) => highlightsProtected('backlit', v),
        feedback: {
          correct:
            'You protected the highlights — the right call, because a blown sky is gone for good while shadows can be lifted later. But notice the cost: holding the sky pushed the land into the blue. This scene is wider than one exposure can hold — that gap is dynamic range.',
          stages: [
            'The red flashing is the sky blowing out. Which way pulls the exposure back from it?',
            'Bring the exposure down until the red blinkies clear — the sky returns, even as the land sinks into shadow.',
          ],
        },
      },
      // 6 — high-key: the "correct" histogram is NOT always centered
      {
        kind: 'slider-sim',
        scene: 'snow',
        prompt: 'Snow fools the meter into muddy grey. Brighten it until the snow reads WHITE — its tones SHOULD pile toward the right, just short of clipping.',
        control: { min: -2, max: 1.5, step: 0.1, start: -1 },
        toParams: (v) => ({ exposure: v }),
        format: (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + ' EV',
        label: 'Exposure',
        ends: ['darker', 'brighter'],
        ariaLabel: 'Exposure compensation',
        histogram: true,
        check: (v) => highKeyOK('snow', v),
        feedback: {
          correct: 'For a bright, high-key scene the right histogram is piled to the RIGHT, not centered — that is how you keep snow white instead of grey. There is no one correct shape.',
          stages: [
            'Centering the tones leaves snow grey. Which way makes it truly white?',
            'Brighten until the mass sits high and right without slamming the wall, then take the shot.',
          ],
        },
      },
      // 7 — transfer: histograms are scene-dependent
      {
        kind: 'rank',
        prompt: 'Order these scenes by where their tones naturally sit — most to the LEFT (darkest) first.',
        scale: ['piled left · dark', 'piled right · bright'],
        items: [{ label: 'Night street' }, { label: 'Forest at noon' }, { label: 'Snowfield' }],
        solution: [0, 1, 2],
        feedback: {
          correct: 'There is no single "correct" histogram — it depends on the scene. Night sits left, a midday forest centers, snow sits right. Read the scene, not a rule.',
          stages: [
            'Which scene is mostly dark? Which is mostly bright?',
            'Darkest (night) to the left, brightest (snow) to the right; the forest sits between.',
          ],
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // L4 — WHITE BALANCE (the color of light)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'white-balance',
    title: 'White balance: the color of light',
    blurb: 'Make the colors read true — or warm on purpose.',
    steps: [
      // BEAT 1 — BET then be wrong: predict where neutral is, FEEL it's a hard shove to blue.
      // Scene = snow: white is the purest cast indicator (why pros judge WB on white/grey). Verified
      // in-engine: snow reads strongly orange under the cast (R-B≈63) AND clean/neutral when corrected
      // (intrinsic R-B≈-12) — so "the orange lifts → clean white" is truthful both ways. No Kelvin
      // readout — the felt cast carries it (blueprint shift #6: demote the number, judge by eye), and
      // the displayed K ran backwards from real cameras anyway.
      {
        kind: 'bet',
        scene: 'snow',
        bet: {
          start: 0, // the intuitive guess — the middle of the dial; the engine proves it wrong (eff 0.6, visibly orange)
          prompt:
            'This snow came out orange — the camera was left on the indoor (tungsten) white-balance preset. Before you fix it — place your bet: where must the White Balance slider sit to cancel the cast so the snow reads clean WHITE? Drag the marker, then lock it in.',
        },
        prompt:
          'Your bet is the dashed mark. Now slide for real until the orange lifts and the snow reads white — and watch how far PAST your bet neutral actually sits.',
        control: { min: -1, max: 1, step: 0.05, start: 0 },
        toParams: (v) => ({ temp: v, baseTemp: WB_WARM }),
        ends: ['cooler · blue', 'warmer · orange'],
        ariaLabel: 'White balance',
        check: wbNeutral(WB_WARM),
        betKind: wbBetKind(WB_WARM), // gate-tested classifier
        betMessages: WB_BET_MSG, // bet-vs-actual success copy, keyed by classifier
        feedback: {
          // Fallback only — success copy comes from betMessages[betKind(bet)] at runtime.
          correct:
            'Neutral — and the slider did NOT end in the middle. You cancel a cast by adding its OPPOSITE, and a strong orange cast needs a real shove toward blue.',
          stages: [
            'Still orange? What colour is the opposite of orange?',
            'Orange is cancelled by blue — push toward the cool end until the cast lifts.',
          ],
        },
      },
      // BEAT 2 — confirm
      {
        kind: 'intro',
        scene: 'seascape',
        title: 'Cancel a cast with its opposite',
        body: [
          'Every light has a colour: tungsten bulbs and sunsets run warm/orange; open shade and overcast skies run cool/blue. White balance adds the OPPOSITE colour to cancel it.',
          'So “correct” is rarely the middle of the dial — it depends on the light you are in. And sometimes you do not want neutral at all.',
        ],
      },
      // BEAT 3 — the OTHER direction: a cool cast, warm it up
      {
        kind: 'slider-sim',
        scene: 'seascape',
        prompt: 'Now you are shooting in open shade and everything has gone too BLUE. Warm it back to natural.',
        control: { min: -1, max: 1, step: 0.05, start: 0 },
        toParams: (v) => ({ temp: v, baseTemp: WB_SHADE }),
        format: wbResultK(WB_SHADE),
        label: 'White balance',
        ends: ['cooler · blue', 'warmer · orange'],
        ariaLabel: 'White balance',
        check: wbNeutral(WB_SHADE),
        feedback: {
          correct: 'A blue cast is cancelled by warming toward orange — the exact opposite move from the indoor shot. Same idea, opposite direction.',
          stages: [
            'This cast is blue, not orange. What cancels blue?',
            'Blue is cancelled by warmth — push toward the warm end.',
          ],
        },
      },
      // BEAT 4 — gray-card reference via a click-white-balance eyedropper
      {
        kind: 'eyedropper',
        scene: 'room',
        baseTemp: WB_CARD,
        start: { temp: 0 },
        hint: { x: '21%', y: '61%' }, // the gray card's location — pulses until first sample

        prompt: 'Pros don’t eyeball it — they use the eyedropper. Tap the gray card on the wall, and the camera solves the white balance to make that card read a true, colourless gray.',
        check: wbNeutral(WB_CARD),
        feedback: {
          correct:
            'That’s click-white-balance: you tell the camera “this should be gray,” and it solves the exact temperature to neutralise the whole scene. The fastest, surest white balance there is — as long as you tap something truly neutral.',
          stages: [
            'That surface wasn’t neutral, so the camera tinted the whole image the wrong way to compensate. Find the flat gray card.',
            'Tap the plain gray reference card on the left wall — not the warmer wall or the floor around it.',
          ],
        },
      },
      // BEAT 5 — creative warmth: neutral is WRONG here (keeper)
      {
        kind: 'slider-sim',
        scene: 'seascape',
        prompt: 'Someone “corrected” this sunset to neutral and killed the mood. Warm it back — keep the golden glow, don’t bleach it gray.',
        control: { min: -1, max: 1, step: 0.05, start: -0.45 },
        toParams: (v) => ({ temp: v, baseTemp: WB_SUNSET }),
        format: wbResultK(WB_SUNSET),
        label: 'White balance',
        ends: ['cooler · blue', 'warmer · orange'],
        ariaLabel: 'White balance',
        check: wbWarmKept(WB_SUNSET),
        feedback: {
          correct:
            'Right — neutral is not always the goal. A sunset SHOULD feel warm; “correct” white balance is a creative choice, and here the choice is to keep the gold.',
          stages: [
            'Neutral looks flat and cold for a sunset. Which way brings the warmth back?',
            'Warm it up — but stop at a golden glow, not a heavy orange.',
          ],
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // L5 — COMPOSITION (rule of thirds)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'rule-of-thirds',
    title: 'Composition: framing the shot',
    blurb: 'Where you place things changes how the photo feels.',
    steps: [
      // BEAT 1 — discovery: place the subject; the frame responds
      {
        kind: 'compose',
        scene: 'seascape',
        target: { kind: 'thirds' },
        start: { x: 50, y: 50 },
        prompt: 'Drag your subject around the frame and find the spot where the photo feels most alive — not flat.',
        feedback: {
          correct:
            'Dead-center feels static; a subject a third of the way in feels balanced and alive. The four points where the lines cross are the strongest places to put a subject.',
          stages: [
            'Centered feels flat. Drift the subject off to one side and watch the frame open up.',
            'Aim for a point where the gridlines cross — about a third of the way in.',
          ],
        },
      },
      // BEAT 2 — confirm
      {
        kind: 'intro',
        scene: 'seascape',
        title: 'Why off-center works',
        body: [
          'Split the frame into thirds and you get four strong points. Placing your subject on one leaves negative space for it to breathe — and the eye loves that tension.',
          'But thirds are only the start. Where a subject LOOKS, and where the horizon sits, matter just as much.',
        ],
      },
      // BEAT 3 — lead room
      {
        kind: 'compose',
        scene: 'seascape',
        target: { kind: 'leadroom', facing: 'right' },
        start: { x: 80, y: 50 },
        prompt: 'This subject is looking to the right (the gold dot is their gaze). Place them so they have room to look INTO — not boxed against the edge.',
        feedback: {
          correct:
            'That space ahead of a subject is called lead room. Give someone who is looking or moving room to go, and the photo feels right; crowd them against the edge and it feels trapped.',
          stages: [
            'They are looking right but jammed against the right edge — no room ahead of the gaze.',
            'Move them toward the LEFT third so the space opens up in front of them.',
          ],
        },
      },
      // BEAT 4 — leading lines: place the subject where the lines lead the eye
      {
        kind: 'compose',
        scene: 'seascape',
        target: { kind: 'leadinglines', point: { x: 66.66, y: 38 } },
        start: { x: 50, y: 50 },
        prompt: 'A path, a shoreline, a row of posts — lines like these pull the eye along the frame. Place your subject where these lines lead.',
        feedback: {
          correct:
            'Leading lines carry the eye straight to wherever they converge. Park your subject on that spot and the whole frame points at it — a powerful, almost invisible trick.',
          stages: [
            'The lines all rush toward one meeting point. Your subject is sitting off it, so the eye slides past them.',
            'Trace the lines to where they converge and drop the subject right there, then take the shot.',
          ],
        },
      },
      // BEAT 5 — horizon
      {
        kind: 'compose',
        scene: 'seascape',
        target: { kind: 'horizon' },
        start: { x: 50, y: 50 },
        prompt: 'Drag the horizon line. Cutting the frame exactly in half feels static — give either the sky or the sea the bigger share.',
        feedback: {
          correct:
            'A horizon on a third — low for a sky-heavy shot, high for a sea-heavy one — almost always beats slicing the frame down the middle.',
          stages: [
            'Dead-center splits the frame in two and feels static. Slide the horizon up or down.',
            'Settle the horizon about a third from the top or the bottom.',
          ],
        },
      },
      // BEAT 6 — synthesis keeper
      {
        kind: 'compose',
        scene: 'seascape',
        target: { kind: 'thirds' },
        keeper: true,
        start: { x: 50, y: 50 },
        prompt: 'Frame your keeper: put the subject on a third, with room to breathe — then take the shot.',
        feedback: {
          correct:
            'A balanced, dynamic frame — subject off-center, space to breathe. That is composition: not a rule to obey, but a feel you can now see.',
          stages: [
            'Off-center, on a crossing point — let the negative space work for you.',
            'Settle the subject onto one of the four power points, then take the shot.',
          ],
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // COMPOSITION II — balance & negative space (beyond the grid: weigh the whole frame).
  // Distinct from rule-of-thirds (placing ONE subject on a power point): this is about the
  // RELATIONSHIP of weights across the frame, and using emptiness as a tool. New compose
  // targets `balance` / `negativespace` / `composefree` (src/sim/composeEval.js).
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'composition-balance',
    title: 'Composition: balance & negative space',
    blurb: 'Weigh the whole frame — counterbalance, or leave it open on purpose.',
    steps: [
      // BEAT 1 — predict by doing: counterbalance a heavy element (visual weight)
      {
        kind: 'compose',
        scene: 'seascape',
        target: { kind: 'balance', anchor: { x: 24, y: 36 } },
        start: { x: 50, y: 50 },
        prompt:
          'There’s already a heavy element in this frame — the dark mass, upper-left. Drop your subject so the photo feels BALANCED, not lopsided.',
        feedback: {
          correct:
            'Balanced. One heavy element alone drags the eye and tips the frame; a second weight across from it settles everything. Composition isn’t only WHERE one subject goes — it’s how the weights across the whole frame balance.',
          stages: [
            'It still leans to one side — the weight’s all up there. Where would a counterweight go?',
            'Put your subject OPPOSITE the heavy element, across the centre, so the two balance.',
          ],
        },
      },
      // BEAT 2 — confirm: visual weight (and the opposite move)
      {
        kind: 'intro',
        scene: 'seascape',
        title: 'Every element has weight',
        body: [
          'The eye feels visual “weight” — a dark mass, a face, a bright spot all tug at the frame. One weight alone tips the photo; a second, placed across from it, brings balance.',
          'But balance isn’t the only choice. Sometimes you do the opposite — leave the frame almost empty on purpose.',
        ],
      },
      // BEAT 3 — negative space: isolate by leaving emptiness (the opposite of filling)
      {
        kind: 'compose',
        scene: 'seascape',
        target: { kind: 'negativespace' },
        start: { x: 50, y: 50 },
        prompt:
          'Now the opposite move: don’t fill the frame. Push your subject far to one side and let the rest fall away to empty — isolate it.',
        feedback: {
          correct:
            'That emptiness is doing work. A small subject in a sea of negative space reads as alone, quiet, important — the open space points right at it. Empty isn’t wasted; it’s a tool.',
          stages: [
            'Too central — there’s no “empty” to speak of. Push the subject hard toward one edge.',
            'Slide it far to one side so most of the frame is open space around it.',
          ],
        },
      },
      // BEAT 4 — transfer: balance a different heavy element (a new configuration)
      {
        kind: 'compose',
        scene: 'landscape',
        target: { kind: 'balance', anchor: { x: 74, y: 64 } },
        start: { x: 50, y: 50 },
        prompt:
          'New frame, new weight — the heavy element now sits low-right. Counterbalance it again, wherever that has to be this time.',
        feedback: {
          correct:
            'Same instinct, new spot: the counterweight goes across the centre from the heavy element — so this time it lands high-left. You’re reading the frame, not memorising a position.',
          stages: [
            'The heavy element moved — so the counterweight moves too. Across the centre from it.',
            'It’s low-right now, so balance it from the upper-left.',
          ],
        },
      },
      // BEAT 5 — keeper: your call — balance the weight OR isolate with empty space
      {
        kind: 'compose',
        scene: 'seascape',
        target: { kind: 'composefree', anchor: { x: 30, y: 30 } },
        start: { x: 50, y: 50 },
        keeper: true,
        prompt:
          'Your frame, your call. A heavy element sits upper-left — either counterbalance it, or push your subject out into empty space and let it stand alone. Make a shot worth keeping.',
        feedback: {
          correct:
            'Yours. You didn’t snap a subject to a dot — you weighed the whole frame and chose how it should feel: settled by balance, or charged by emptiness. That’s composition.',
          stages: [
            'Two good options: counterweight the heavy element across the centre, OR push your subject far to one side into open space.',
            'Either balance it (opposite the heavy mass) or isolate it (hard to one edge), then take the shot.',
          ],
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // L6 — LIGHT & DIRECTION (where the light comes from shapes the subject)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'light-direction',
    title: 'Light & direction',
    blurb: 'Where light comes from — and its color — shapes everything.',
    steps: [
      // BEAT 1 — predict by doing: move the light to reveal form
      {
        kind: 'light-direction',
        control: 'angle',
        prompt: 'This subject looks flat and lifeless. Move the light around it until you can clearly see its three-dimensional shape, then take the shot.',
        start: { angle: 0 },
        check: ({ angle }) => angle >= 55 && angle <= 120,
        feedback: {
          correct:
            'Side light rakes across the surface, casting shadows that reveal shape and texture. Front light — flat-on from the camera — flattens everything out.',
          stages: [
            'Front-on light fills every shadow, so the form looks flat. Where could the light go to cast revealing shadows?',
            'Swing the light around toward the side, then take the shot.',
          ],
        },
      },
      // BEAT 2 — confirm
      {
        kind: 'intro',
        title: 'Direction shapes form',
        body: [
          'Front light flattens. Side light reveals shape and texture. Light from behind rims the edges and can drop the subject into silhouette.',
          'Where the light comes from is often a bigger creative choice than how much of it there is.',
        ],
      },
      // BEAT 3 — backlight → rim / silhouette
      {
        kind: 'light-direction',
        control: 'angle',
        prompt: 'Now go for drama: move the light behind the subject to rim its edge and turn it toward silhouette.',
        start: { angle: 80 },
        check: ({ angle }) => angle >= 150,
        feedback: {
          correct:
            'Backlight catches the edge in a bright rim and drops the face into shadow — the recipe for a silhouette and that glowing outline.',
          stages: [
            'The face is still lit from the side. Keep moving the light further around — past the side, toward directly behind.',
            'All the way behind the subject, then take the shot.',
          ],
        },
      },
      // BEAT 4 — hard vs soft (the SIZE of the source)
      {
        kind: 'light-direction',
        control: 'soft',
        fixed: { angle: 70 },
        prompt: 'Same side light — now soften it. Spread the source until the shadow edge turns gentle, for a flattering portrait look.',
        start: { soft: 0 },
        check: ({ soft }) => soft >= 0.6,
        feedback: {
          correct:
            'A big, soft source — an overcast sky, a window, a diffuser — wraps light gently and flatters skin. Hard light (a bare bulb, midday sun) carves sharp, dramatic shadows.',
          stages: [
            'Hard light gives a crisp, abrupt shadow edge. Which way makes the source larger and softer?',
            'Push toward the soft end until the shadow edge turns gradual, then take the shot.',
          ],
        },
      },
      // BEAT 5 — warmth / golden hour (light has a COLOR, not just a direction)
      {
        kind: 'light-direction',
        control: 'warmth',
        fixed: { angle: 68, soft: 0.55 },
        prompt: 'Midday sun is white and harsh. The “golden hour” after sunrise and before sunset is warm and low — the light photographers chase. Warm this light until it glows golden.',
        start: { warmth: -0.2 },
        check: ({ warmth }) => warmth >= 0.5,
        feedback: {
          correct:
            'Golden-hour light is warm AND directional — it wraps the subject in a flattering glow. The colour of the light is a creative tool in its own right, not only its direction.',
          stages: [
            'The light still reads cold and flat. Which way pushes it toward a warm, golden colour?',
            'Warm it up toward the golden end, then take the shot.',
          ],
        },
      },
      // BEAT 6 — transfer: combine direction + softness + warmth into a recipe
      {
        kind: 'light-direction',
        controls: ['angle', 'soft', 'warmth'],
        prompt: 'A portrait client wants soft, flattering, golden-hour light. Set all three — direction, softness, and warmth — to give it to them.',
        start: { angle: 12, soft: 0.18, warmth: -0.2 },
        check: ({ angle, soft, warmth }) => angle >= 45 && angle <= 120 && soft >= 0.55 && warmth >= 0.25,
        feedback: {
          correct:
            'That is the flattering-portrait recipe: light from the side so the face keeps its form, softened so the shadows stay gentle, and warmed so the skin glows. Three dials, one look.',
          stages: [
            'Flattering means side-on (not flat front, not full silhouette), softened, and warm. One of the three is still off.',
            'Aim the light to the side, spread it soft, and warm it toward golden — then take the shot.',
          ],
        },
      },
      // BEAT 7 — keeper: the OPPOSITE pole — a hard, dramatic, near-backlit look
      {
        kind: 'light-direction',
        controls: ['angle', 'soft', 'warmth'],
        prompt: 'Last one — the opposite mood. Forget flattering: make it DRAMATIC. Harden the light and swing it around behind the subject for crisp-edged shadows and a rim of light. Then take the shot to keep it.',
        start: { angle: 40, soft: 0.7, warmth: 0.3 },
        check: ({ angle, soft }) => angle >= 110 && soft <= 0.3,
        feedback: {
          correct:
            'Hard, raking, near-backlit — the same subject now reads moody and powerful instead of soft and warm. Flattering and dramatic are just two settings of the same three dials; you can dial in either, on purpose.',
          stages: [
            'Dramatic is the opposite of the soft, frontal recipe: HARD light (crisp shadow edges) coming from well around the side or behind.',
            'Harden the light and swing it back toward behind the subject, then take the shot.',
          ],
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // L7 — LONG EXPOSURE (painting with time). Produced by the lesson factory,
  // then fixed (BEAT 3 gates on a brightness BAND so overshoot fails) + verified
  // against the real gate and a live playthrough. Uses only existing primitives.
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'long-exposure-night',
    title: 'Long exposure: painting with time',
    blurb: 'When the light runs out, let time do the gathering.',
    steps: [
      // BEAT 1 — predict by doing: a fast shutter can't drink enough light here
      {
        kind: 'capture',
        scene: 'night',
        prompt:
          'It’s nearly black out here, and the shutter’s at its fastest — take the shot and you get almost nothing. A quick snap can’t drink enough light from a night this dark. So stop snapping and start GATHERING: drag the shutter time open, hold it longer and longer, and watch the dead-black scene fill until it glows in the green.',
        start: -3,
        targetExp: { min: 1.2, max: 1.8 },
        feedback: {
          correct:
            'There it is. A fast shutter could never drink enough light from a scene this dark — you had to hold it open and let the light PILE UP over time. Time is the lever tonight.',
        },
      },
      // BEAT 2 — confirm: light is cumulative; on a dark scene, time replaces brightness
      {
        kind: 'intro',
        scene: 'night',
        title: 'Light piles up over time',
        body: [
          'A photo is light gathered over time. In daylight a sliver of a second is plenty. In the dark, that same sliver gathers almost nothing — so you keep the shutter open for whole seconds and let the light accumulate.',
          'That is a long exposure: trading TIME for the light the scene is too dark to give you all at once.',
        ],
      },
      // BEAT 3 — match the SAME night glow the impatient way (ISO) and feel the cost
      {
        kind: 'slider-sim',
        scene: 'night',
        prompt:
          'You already lit this same night cleanly with a long shutter. Now reach that SAME brightness the impatient way — no waiting, just ISO. Crank it up to match that glow, then look hard at the loupe and compare what you got.',
        control: { stops: ISO_STOPS, start: 0 },
        toParams: (iso) => ({ exposure: isoToExposure(iso), iso: isoToNoise(iso) }),
        format: (iso) => 'ISO ' + iso,
        label: 'ISO',
        ends: ['ISO 100 · clean', 'ISO 12800 · noisy'],
        ariaLabel: 'ISO sensitivity',
        loupe: { cx: 4, cy: 25, cells: 6 },
        // Gate on the brightness MATCH (the long-exposure glow band), not just on noise:
        // overshoot blows past the glow, undershoot never reaches it — both fail with a hint.
        check: (iso) => {
          const exp = isoToExposure(iso)
          return exp >= 1.2 && exp <= 1.8
        },
        feedback: {
          correct:
            'Same brightness as the long exposure — but look at the difference. The shutter version was clean; this one is crawling with grain. Identical glow, two prices: the long shutter gathered MORE real light; ISO only amplified the little you had, noise and all. When you can afford the time, time wins.',
          stages: [
            'The goal is to MATCH the brightness of the long exposure you already shot — not just to brighten the scene. Nudge the ISO toward that exact glow, no brighter.',
            'Watch the brightness, not only the dial: too dim and you haven’t reached the glow — push ISO UP; too bright and you blew past it — ease ISO DOWN. Land it ON the glow, then study the grain.',
          ],
        },
      },
      // BEAT 4 — confirm the contrast, and name the catch (everything must hold still)
      {
        kind: 'intro',
        scene: 'night',
        title: 'Real light beats amplified light',
        body: [
          'Same brightness, two very different images: a long exposure collects MORE real light, so it stays clean. High ISO just turns up the volume on the faint signal you already have — and the grain comes up with it.',
          'But holding the shutter open for whole seconds has a price: anything that moves during those seconds smears — including the CAMERA, so a long exposure always rides on a tripod, locked dead still. And if the SUBJECT moves, the trick is off — which is the next shot.',
        ],
      },
      // BEAT 5 — the catch: a moving subject forces a fast shutter + ISO instead
      {
        kind: 'motion',
        prompt:
          'A car is racing through your night scene — so the long-exposure trick is off the table. With the SUBJECT moving, you can’t pay for light with time. Make the call: set the shutter for a sharp car, then take the shot.',
        start: 6,
        check: (si) => si <= 1,
        feedback: {
          correct:
            'That was the decision, not just the dial. A long exposure needs EVERYTHING still — the camera AND the subject. The moment the subject moves, you flip the trade: a fast shutter to freeze it, and ISO to buy back the lost light. Static scene → long exposure. Moving subject → fast shutter + ISO.',
          stages: [
            'You can’t hold the shutter open for a moving subject — so which lever instead? Push toward less time.',
            'A moving subject forces the fast end: pick the tiniest slice of time, then take the shot.',
          ],
        },
      },
      // BEAT 6 — transfer: rank night scenes by how long you'd hold the shutter
      {
        kind: 'rank',
        prompt: 'Order these night shots by how LONG you should hold the shutter — the one that wants the longest exposure first.',
        scale: ['hold it open for minutes', 'freeze in an instant'],
        items: [
          { label: 'Star trails — sky wheeling over a still ridge' },
          { label: 'A calm, empty city skyline' },
          { label: 'A dog sprinting across a dark yard' },
        ],
        solution: [0, 1, 2],
        feedback: {
          correct:
            'Right. Nothing moving but the slow-turning stars? Hold it open for minutes. A still skyline? Seconds. But the sprinting dog won’t sit still for any of it — that one demands a fast shutter, and ISO to pay for the light. Match the shutter to what’s moving.',
          stages: [
            'The stiller the scene, the longer you can keep the shutter open to gather light.',
            'Stars and a still skyline can soak up time; a sprinting dog cannot — order longest-hold to instant.',
          ],
        },
      },
      // BEAT 7 — keeper: author the clean long-exposure night shot yourself
      {
        kind: 'capture',
        scene: 'night',
        prompt:
          'Your keeper. Camera locked on its tripod, nothing moving in the frame — dead still all around, and dark. No shortcuts: drag the shutter time out until the night drinks in enough light to glow cleanly in the green, then take the shot.',
        start: -2.5,
        targetExp: { min: 1.2, max: 1.8 },
        feedback: {
          correct:
            'A clean, glowing night — built from time, not noise. That is painting with time: when the light runs out, you stop cranking ISO and let the shutter gather it, second by second. The shot is yours to keep.',
        },
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // L8 — ISO & NOISE (the price of light). Factory candidate, fixed (BEAT 3 floor =
  // exactly 1600; BEAT 6 keeper recalibrated to the brighter room's real floor, 800)
  // and verified in-engine (ETTR shadow-grain confirmed to drop with capture light).
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'iso-and-noise',
    title: 'ISO & noise: the price of light',
    blurb: 'ISO buys brightness with grain. Spend it only when the dark forces you.',
    steps: [
      // BEAT 1 — predict-first: hit the panic button (max ISO) and meet the grain
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
      // BEAT 2 — confirm: noise is random per-pixel error; more real light drowns it out
      {
        kind: 'intro',
        scene: 'night',
        title: 'Noise is random — light is not',
        body: [
          'That speckle isn’t one flaw you can dial out; it’s thousands of tiny random errors, a different wrong guess at every single pixel. The fewer photons a pixel actually caught, the more its guess is just noise.',
          'So the cure was never “less ISO” by itself — it’s a better ratio of real light to random error. Feed the sensor more genuine light and the signal swamps the speckle. The rest of this lesson is two ways to win that ratio.',
        ],
      },
      // BEAT 3 — distinct facet: find the FLOOR — the lowest ISO that still reads
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
        // The floor: ISO 1600 is the LOWEST that reads this night cleanly (mean ~0.42);
        // 800 falls into the murk, 3200+ is a stop of needless grain. "Never a stop higher."
        check: (iso) => iso === 1600,
        feedback: {
          correct:
            'There it is — the floor. You can’t drop to clean ISO 100 here: go lower than this and the scene falls back into the dark. The darkness itself sets a minimum, and your job is to sit right on it — high enough to read, never a stop higher. That’s the discipline: not “avoid grain,” but “let the dark, and only the dark, decide how much you spend.”',
          stages: [
            'Maxed out it’s readable but drowning in grain. Bring it DOWN toward clean, a stop at a time.',
            'Keep lowering until you’re right at the edge: still clearly readable, but as clean as you can get. Drop too far and the scene falls back into the dark.',
          ],
        },
      },
      // BEAT 4 — distinct facet: expose-to-the-right AT CAPTURE — more photons up front
      // = stronger signal before amplification (grain param scales DOWN as exposure rises).
      {
        kind: 'slider-sim',
        scene: 'night',
        prompt: 'Same ISO either way — but this time you choose how much light to give the sensor up front. The frame was left underexposed and the shadows are crawling with grain. Open the exposure at capture to feed the sensor more light, until those shadows lift up clean.',
        control: { min: -1.6, max: 1.4, step: 0.1, start: -1.6 },
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
      // BEAT 5 — transfer: rank scenes by how much ISO the available light forces
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
      // BEAT 6 — authored keeper: a dim ROOM (brighter than the night) — apply the
      // discipline and feel that its floor is LOWER (the scene decides, not a number).
      {
        kind: 'slider-sim',
        scene: 'room',
        prompt: 'Last shot, and it’s yours to keep: a dim room, no lamp to switch on. Dial in the LOWEST ISO that reads this scene clean — the disciplined exposure you’d actually shoot — then take it.',
        control: { stops: ISO_STOPS, start: 0 },
        toParams: (iso) => ({ exposure: isoToExposure(iso) - 1.4, iso: isoToNoise(iso) }),
        format: (iso) => 'ISO ' + iso,
        label: 'ISO',
        ends: ['ISO 100 · too dark', 'ISO 12800 · noisy'],
        ariaLabel: 'ISO sensitivity',
        loupe: { cx: 3, cy: 25, cells: 6 },
        // This room is dim but NOT pitch-dark like the night — so its floor is LOWER:
        // ISO 800 reads it cleanly (mean ~0.46). The transfer: the scene sets the floor.
        check: (iso) => iso === 800,
        feedback: {
          correct:
            'That one’s yours. You spent exactly the ISO the dark forced and not a stop more — and notice it took LESS than the pitch-dark night did, because this room isn’t as dark. The scene sets the floor; you just listen. ISO is the lever of last resort, and you used it like one. Your shot’s in the gallery.',
          stages: [
            'At ISO 100 the room is lost in the dark — it needs more gain than that. Bring the ISO up until the scene reads.',
            'Now stop the moment it reads clean — don’t keep climbing into needless grain. Lowest ISO that reads, no higher.',
          ],
        },
      },
    ],
  },
]

// Lesson numbers are derived from position, so inserting/reordering a lesson never
// requires hand-renumbering (the course grows often). Display only: progress is keyed by id.
lessons.forEach((l, i) => {
  l.number = i + 1
})

export const course = {
  id: 'exposure',
  title: 'Photography Foundations',
  subtitle: 'Exposure, light, and composition — by doing',
  lessons,
}

export function getLesson(id) {
  return lessons.find((l) => l.id === id)
}

export const totalLessons = lessons.length
