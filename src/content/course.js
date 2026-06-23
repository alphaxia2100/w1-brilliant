// Course content lives in the bundle as data — never in Firestore.
// Each lesson is an array of steps the engine knows how to render.

const fmt = (f) => (f % 1 === 0 ? String(f) : f.toFixed(1))
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
const apertureToExposure = (f) => clamp(2 * Math.log2(5.6 / f), -2.5, 2.5)
const F_STOPS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16]
const SHUTTER = ['1/1000', '1/500', '1/250', '1/125', '1/60', '1/30', '1/15', '1/8']

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
          wrong: 'Counterintuitive, but a smaller f-number means a bigger opening. Drag toward f/1.4.',
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
          wrong: 'To blur the background, open the aperture wider — drag toward the low f-numbers.',
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
          wrong: 'To freeze motion you need a fast shutter — drag toward 1/1000s.',
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
]

export const course = {
  id: 'exposure',
  title: 'Exposure',
  subtitle: 'The three controls behind every photo',
  lessons,
}

export function getLesson(id) {
  return lessons.find((l) => l.id === id)
}

export const totalLessons = lessons.length
