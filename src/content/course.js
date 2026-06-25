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

const lessons = [
  // ───────────────────────────────────────────────────────────────────────────
  // L1 — THE EXPOSURE TRIANGLE (the anchor: the whole exposure system in one lesson)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'exposure-triangle',
    number: 1,
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
            'ISO amplifies the SIGNAL you’ve gathered, not the light itself — brighter, but the loupe shows the cost: grain creeps in. It doesn’t collect more light, it just turns up the volume, so it’s the lever of last resort.',
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
    number: 2,
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
  // L3 — METERING (read the light with the histogram)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'metering',
    number: 3,
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
      // 5 — high-key: the "correct" histogram is NOT always centered
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
      // 6 — transfer: histograms are scene-dependent
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
    number: 4,
    title: 'White balance: the color of light',
    blurb: 'Make the colors read true — or warm on purpose.',
    steps: [
      // BEAT 1 — predict by doing: cool a warm cast; neutral is NOT at zero
      {
        kind: 'slider-sim',
        scene: 'seascape',
        prompt: 'Indoor bulbs left this photo too orange. Cool it down until the colors read natural again.',
        control: { min: -1, max: 1, step: 0.05, start: 0 },
        toParams: (v) => ({ temp: v, baseTemp: WB_WARM }),
        format: wbResultK(WB_WARM),
        label: 'White balance',
        ends: ['cooler · blue', 'warmer · orange'],
        ariaLabel: 'White balance',
        check: wbNeutral(WB_WARM),
        feedback: {
          correct:
            'Neutral. Notice the slider did NOT end in the middle — you cancel a cast by adding its OPPOSITE, and a strong orange cast needs a real shove toward blue.',
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
    number: 5,
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
  // L6 — LIGHT & DIRECTION (where the light comes from shapes the subject)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'light-direction',
    number: 6,
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
      // BEAT 7 — keeper: your signature lit portrait, your call
      {
        kind: 'light-direction',
        controls: ['angle', 'soft', 'warmth'],
        prompt: 'Your shot to keep: light this portrait however you like — flattering and warm, or dramatic and hard. Just don’t leave it flat. Then take the shot.',
        start: { angle: 8, soft: 0.4, warmth: 0 },
        check: ({ angle }) => angle >= 35,
        feedback: {
          correct:
            'A portrait lit with intent — you chose where the light falls, how hard it is, and what colour it carries. That is lighting: not a rule to obey, but a look you can now author.',
          stages: [
            'Flat, front-on light is the one lifeless choice. Move the light somewhere with shape — side, back, anywhere off dead-center.',
            'Swing the light off dead-center into any direction with form, then take the shot.',
          ],
        },
      },
    ],
  },
]

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
