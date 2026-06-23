// Course content lives in the bundle as data — never in Firestore.
// Each lesson is an array of steps the engine knows how to render.
import { histogram } from '../sim/scene.js'

const fmt = (f) => (f % 1 === 0 ? String(f) : f.toFixed(1))

// True when neither the shadows nor the highlights are clipped — matches the
// histogram the learner sees in the metering lesson.
const CLIP = 0.09
function wellMetered(scene, exposure) {
  const c = histogram({ scene, exposure })
  const total = c.reduce((a, b) => a + b, 0) || 1
  return c[0] / total <= CLIP && c[c.length - 1] / total <= CLIP
}
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
const apertureToExposure = (f) => clamp(2 * Math.log2(5.6 / f), -2.5, 2.5)
const F_STOPS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16]
const SHUTTER = ['1/1000', '1/500', '1/250', '1/125', '1/60', '1/30', '1/15', '1/8']
const ISO_STOPS = [100, 200, 400, 800, 1600, 3200, 6400, 12800]
const isoToExposure = (iso) => clamp(Math.log2(iso / 100) * 0.5, 0, 2.3)
const isoToNoise = (iso) => clamp(Math.log2(iso / 100) * 22, 0, 150)

const lessons = [
  {
    id: 'collected-light',
    number: 1,
    title: 'A photo is collected light',
    blurb: 'What a photo really is, and what "correct exposure" means.',
    steps: [
      {
        kind: 'intro',
        scene: 'landscape',
        title: 'A photo is collected light',
        body: [
          "Your camera doesn't see brightness the way your eyes do. It collects light over time — like rain filling a bucket.",
          'Too little light and the photo comes out dark. Too much and it washes out. Let’s collect some.',
        ],
      },
      {
        kind: 'capture',
        scene: 'landscape',
        prompt: 'Open the shutter to gather light — land the marker in the green, then take the photo.',
        start: -2,
        targetExp: { min: -0.5, max: 0.6 },
        feedback: {
          correct:
            "That's a good exposure — not the brightest possible, but the one that lands on target. Photographers call that “correctly exposed.”",
        },
      },
      {
        kind: 'intro',
        scene: 'landscape',
        title: 'One “stop” = double the light',
        body: [
          'Each step of light you add or remove is called a stop.',
          'Leave the shutter open twice as long and you gather one stop more — twice as much light.',
          'Every camera control, as you’ll see next, is just a different way to add or remove stops.',
        ],
      },
      {
        kind: 'predict',
        prompt: 'Your photo came out too dark. Which change gathers more light?',
        options: ['Use a shorter shutter time', 'Use a longer shutter time', 'Press the shutter button harder'],
        answer: 1,
        feedback: {
          correct: 'A longer shutter time keeps light pouring in for longer, so the photo gets brighter.',
          wrong: 'Think of the bucket — to collect more light, leave the shutter open for longer.',
        },
      },
    ],
  },

  {
    id: 'aperture-hole',
    number: 2,
    title: 'Aperture: the size of the hole',
    blurb: 'The f-number trick that fools every beginner.',
    steps: [
      {
        kind: 'intro',
        scene: 'landscape',
        title: 'Aperture: the size of the hole',
        body: [
          'Inside the lens is a hole that light passes through. Open it wide and light floods in; make it small and less gets through.',
          'Its size is written as an f-number — and that’s where the twist is.',
        ],
      },
      {
        kind: 'slider-sim',
        scene: 'landscape',
        prompt: 'Make the photo as bright as you can — using only the aperture.',
        control: { stops: F_STOPS, start: 4 },
        toParams: (f) => ({ exposure: apertureToExposure(f) }),
        format: (f) => 'f/' + fmt(f),
        label: 'Aperture',
        ends: ['f/1.4 · wide open', 'f/16 · narrow'],
        iris: true,
        ariaLabel: 'Aperture f-stop',
        check: (f) => f <= 2,
        feedback: {
          correct: 'f/1.4 is the widest opening — small f-number, big hole, most light.',
          wrong: [
            'Counterintuitive, but a smaller f-number means a bigger opening. Drag toward the low numbers.',
            'Keep going — the brightest is f/1.4, the widest opening of all. Slide all the way left.',
          ],
        },
      },
      {
        kind: 'predict',
        prompt: 'Which aperture lets in more light: f/2 or f/16?',
        options: ['f/16 — bigger number, bigger hole', 'f/2 — smaller number, bigger hole'],
        answer: 1,
        feedback: {
          correct: 'f-numbers are fractions, so f/2 is a far bigger opening than f/16.',
          wrong: 'f-numbers are fractions — 1/2 is bigger than 1/16. So f/2 is the bigger opening.',
        },
      },
    ],
  },

  {
    id: 'depth-of-field',
    number: 3,
    title: 'Aperture’s secret job: depth of field',
    blurb: 'Why a wide aperture makes your subject pop.',
    steps: [
      {
        kind: 'intro',
        scene: 'portrait',
        title: 'The same hole changes focus',
        body: [
          'Aperture does a second, almost magical thing. A wide opening blurs everything except your subject. A narrow one keeps the whole scene sharp.',
          'This is how photographers make a subject pop off the background.',
        ],
      },
      {
        kind: 'slider-sim',
        scene: 'portrait',
        prompt: 'Make the portrait pop — blur the background behind the subject.',
        control: { stops: F_STOPS, start: 5 },
        toParams: (f) => ({ aperture: f, exposure: 0 }),
        format: (f) => 'f/' + fmt(f),
        label: 'Aperture',
        ends: ['f/1.4 · blurry bg', 'f/16 · all sharp'],
        iris: true,
        ariaLabel: 'Aperture f-stop',
        check: (f) => f <= 2.8,
        feedback: {
          correct: 'A wide aperture (low f-number) throws the background out of focus — a shallow depth of field.',
          wrong: [
            'To blur the background, open the aperture wider — drag toward the low f-numbers.',
            'Go wider still — f/2.8 or below gives that soft, melted background.',
          ],
        },
      },
      {
        kind: 'predict',
        prompt: 'You want a landscape where the far mountains AND the flowers up front are sharp. Which aperture?',
        options: ['f/2.8 — wide open', 'f/11 — narrow'],
        answer: 1,
        feedback: {
          correct: 'A narrow aperture (high f-number) gives a deep depth of field — sharp front to back.',
          wrong: 'Wide apertures blur. For everything sharp front-to-back, pick a narrow aperture like f/11.',
        },
      },
    ],
  },

  {
    id: 'shutter-speed',
    number: 4,
    title: 'Shutter speed: freeze or blur time',
    blurb: 'Freeze a moment, or let it smear.',
    steps: [
      {
        kind: 'intro',
        scene: 'portrait',
        title: 'Shutter speed: a slice of time',
        body: [
          'The shutter is a curtain that opens for a slice of time. A fast shutter freezes motion into a crisp instant. A slow one lets moving things smear across the frame.',
          'Neither is right or wrong — it’s a creative choice.',
        ],
      },
      {
        kind: 'slider-sim',
        scene: 'portrait',
        prompt: 'Freeze the subject — make them razor sharp.',
        control: { stops: [0, 1, 2, 3, 4, 5, 6, 7], start: 4 },
        toParams: (v) => ({ motion: Math.round(v * 0.85), exposure: 0 }),
        format: (v) => SHUTTER[v] + 's',
        label: 'Shutter speed',
        ends: ['1/1000 · freeze', '1/8 · blur'],
        ariaLabel: 'Shutter speed',
        check: (v) => v <= 1,
        feedback: {
          correct: 'A fast shutter (1/1000s) freezes the action into a sharp instant.',
          wrong: [
            'To freeze motion you need a fast shutter — drag toward 1/1000s.',
            'Faster still — 1/1000s is the leftmost, sharpest setting.',
          ],
        },
      },
      {
        kind: 'predict',
        prompt: 'You want a waterfall to look silky and smooth. Which shutter speed?',
        options: ['1/1000s — fast', '1/8s — slow'],
        answer: 1,
        feedback: {
          correct: 'A slow shutter lets the water keep moving while it’s open, blurring it silky.',
          wrong: 'Silky water needs motion blur — that comes from a slow shutter like 1/8s.',
        },
      },
    ],
  },

  {
    id: 'iso-noise',
    number: 5,
    title: 'ISO: brightness at a cost',
    blurb: 'Brighten the dark — but watch the grain.',
    steps: [
      {
        kind: 'intro',
        scene: 'night',
        title: 'ISO: the volume knob',
        body: [
          'When there isn’t enough light — indoors, at night — you can turn up the ISO. It amplifies the signal and brightens the photo.',
          'But amplifying the signal also amplifies the noise. Keep an eye on the shadows.',
        ],
      },
      {
        kind: 'slider-sim',
        scene: 'night',
        prompt: 'Turn up the ISO until you can clearly make out the scene.',
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
            'Now you can see it — but check the loupe: the shadows are full of grain. That’s the price of ISO.',
          wrong: 'Still too dark to make out. Raise the ISO further to amplify the light.',
        },
      },
      {
        kind: 'predict',
        prompt:
          'Indoors, your photo is too dark. You’ve already opened the aperture wide and slowed the shutter as far as you safely can. What’s left?',
        options: ['Raise the ISO, accepting some grain', 'Nothing — the photo has to stay dark'],
        answer: 0,
        feedback: {
          correct: 'Right — ISO is your third lever. Use it once aperture and shutter run out, and accept a little grain.',
          wrong: 'There’s a third control: ISO. It brightens the image (with some grain) when aperture and shutter can’t.',
        },
      },
    ],
  },

  {
    id: 'the-triangle',
    number: 6,
    title: 'The triangle: balance the three',
    blurb: 'Trade one control for another and keep the light.',
    steps: [
      {
        kind: 'intro',
        scene: 'portrait',
        title: 'Three controls, one job',
        body: [
          'Aperture, shutter, and ISO each change the brightness — and each brings a side effect: blur, motion, grain.',
          'The craft is balancing them: open up here, speed up there, and keep the exposure just right.',
        ],
      },
      {
        kind: 'triangle',
        scene: 'portrait',
        prompt: 'This shot is overexposed. Balance the three controls until the exposure meter sits level.',
        start: { aperture: 4, shutter: 4, iso: 4 },
        feedback: {
          correct:
            'Balanced. And notice — you could hit this same brightness many ways: a wide aperture with a fast shutter, or a narrow one with high ISO. Those are equivalent exposures, each with its own look.',
        },
      },
      {
        kind: 'predict',
        prompt:
          'You balance a shot at f/8, 1/125s, ISO 200. A friend shoots the same scene at f/2.8, 1/1000s, ISO 200 — equally bright. What’s different about their photo?',
        options: ['Their background is more blurred', 'Their photo is brighter', 'Nothing — they’re identical'],
        answer: 0,
        feedback: {
          correct:
            'Exactly. Same brightness, but f/2.8 is much wider than f/8 — so their background is more blurred. Equivalent exposure, different look.',
          wrong:
            'They’re equally bright (an equivalent exposure), but f/2.8 is far wider than f/8 — so their background is more blurred.',
        },
      },
    ],
  },

  {
    id: 'metering',
    number: 7,
    title: 'Metering: read the light',
    blurb: 'The histogram tells you if your exposure is right.',
    steps: [
      {
        kind: 'intro',
        scene: 'landscape',
        title: 'The histogram is a light meter',
        body: [
          'How do you know an exposure is right without trusting your eyes? You read the histogram — a graph of how many pixels are dark (left), mid (middle), and bright (right).',
          'If it’s crammed against the left, you’ve lost the shadows. Crammed right, you’ve blown the highlights.',
        ],
      },
      {
        kind: 'slider-sim',
        scene: 'landscape',
        prompt: 'This shot is underexposed. Adjust the exposure so the histogram isn’t clipped against either edge.',
        control: { min: -2.5, max: 2.5, step: 0.1, start: -1.7 },
        toParams: (v) => ({ exposure: v }),
        format: (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + ' EV',
        label: 'Exposure',
        ends: ['darker', 'brighter'],
        ariaLabel: 'Exposure compensation',
        histogram: true,
        check: (v) => wellMetered('landscape', v),
        feedback: {
          correct: 'Balanced — the tones spread across the histogram without piling up at either edge. That’s a well-metered exposure.',
          wrong: [
            'Watch the histogram, not just the photo. Nudge the exposure to pull the bars away from the edge.',
            'It’s still bunched against one side. Aim to spread the tones toward the middle.',
          ],
        },
      },
      {
        kind: 'predict',
        prompt: 'A histogram with a tall spike jammed against the far right edge means…',
        options: ['The highlights are blown — detail is lost', 'The photo is perfectly exposed', 'The photo is too dark'],
        answer: 0,
        feedback: {
          correct: 'Right — pixels piled at the right edge are pure white with no detail. You’d lower the exposure to recover them.',
          wrong: 'The right edge is the brightest tones. A spike there means those areas are pure white — blown highlights.',
        },
      },
    ],
  },

  {
    id: 'white-balance',
    number: 8,
    title: 'White balance: the color of light',
    blurb: 'Make the whites actually look white.',
    steps: [
      {
        kind: 'intro',
        scene: 'seascape',
        title: 'Light has a color',
        body: [
          'Light isn’t always neutral. Indoor bulbs are warm and orange; shade is cool and blue. Your camera’s white balance corrects for it so whites look white.',
          'Get it wrong and the whole photo takes on a color cast.',
        ],
      },
      {
        kind: 'slider-sim',
        scene: 'seascape',
        prompt: 'This photo has an orange cast. Cool it down until the colors look natural again.',
        control: { min: -1, max: 1, step: 0.05, start: 0.62 },
        toParams: (v) => ({ temp: v }),
        format: (v) => Math.round(5500 - v * 2500) + 'K',
        label: 'White balance',
        ends: ['cooler', 'warmer'],
        ariaLabel: 'White balance',
        check: (v) => Math.abs(v) < 0.15,
        feedback: {
          correct: 'Neutral. The cast is gone and the colors read true — that’s correct white balance.',
          wrong: [
            'Still got a tint. Slide toward the cooler end to cancel the orange.',
            'Close — ease it to the middle, where the light is neutral (around 5500K).',
          ],
        },
      },
      {
        kind: 'predict',
        prompt: 'You shoot indoors under warm orange bulbs and everything looks too orange. To fix it, you set white balance to…',
        options: ['Cooler (more blue)', 'Warmer (more orange)'],
        answer: 0,
        feedback: {
          correct: 'Right — you add the opposite color (cool/blue) to cancel the warm cast.',
          wrong: 'To cancel an orange cast you add its opposite — cool it down toward blue.',
        },
      },
    ],
  },

  {
    id: 'rule-of-thirds',
    number: 9,
    title: 'Composition: the rule of thirds',
    blurb: 'Where you place the subject changes everything.',
    steps: [
      {
        kind: 'intro',
        scene: 'seascape',
        title: 'Get off-center',
        body: [
          'Split the frame into thirds, like a tic-tac-toe board. The four points where the lines cross are the strongest places to put your subject.',
          'Dead-center can feel static. A subject on a third feels balanced and alive.',
        ],
      },
      {
        kind: 'compose',
        scene: 'seascape',
        prompt: 'Drag your subject onto one of the four power points — a third of the way in.',
        start: { x: 50, y: 50 },
        feedback: {
          correct: 'On a power point. Off-center placement feels more dynamic and balanced than dead-center.',
          wrong: [
            'Drag your subject onto one of the four points where the gridlines cross.',
            'Aim for an intersection a third of the way in — not the middle of the frame.',
          ],
        },
      },
      {
        kind: 'predict',
        prompt: 'Why place a subject on a third instead of dead-center?',
        options: ['It feels more dynamic and balanced', 'It makes the photo brighter', 'It’s the only correct way to compose'],
        answer: 0,
        feedback: {
          correct: 'Exactly — it’s a guideline, not a law, but off-center usually feels more alive and intentional.',
          wrong: 'It’s about feel: off-center composition reads as more dynamic and balanced. (It’s a guideline, not a rule.)',
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
