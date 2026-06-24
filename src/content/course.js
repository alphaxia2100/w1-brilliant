// Course content lives in the bundle as data — never in Firestore.
// Each lesson is an array of steps the engine knows how to render.
//
// Feedback model (guide without revealing):
//   correct  — the consolidation recap shown on success
//   byOption — first-miss Socratic nudge keyed by the chosen wrong option index
//   stages   — escalating hints (tier 2+): name a lever + direction, never a value
//   showWhy  — a widget that SHOWS the consequence of the learner's wrong choice
import { histogram, meanBrightness } from '../sim/scene.js'

const fmt = (f) => (f % 1 === 0 ? String(f) : f.toFixed(1))
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)

const F_STOPS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16]
// Brightest stop (f/1.4) anchored at 0 and descending ~0.6 stop per step, on a
// headroom scene, so "wide open = as bright as it gets" — never blown out.
const apertureToExposure = (f) => -F_STOPS.indexOf(f) * 0.6

const SHUTTER = ['1/1000', '1/500', '1/250', '1/125', '1/60', '1/30', '1/15', '1/8']
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
        options: ['Use a shorter shutter time', 'Use a longer shutter time', 'Use a narrower aperture'],
        answer: 1,
        feedback: {
          correct: 'A longer shutter keeps light pouring in, so the photo brightens.',
          byOption: {
            0: 'Picture the bucket in the rain — to catch MORE water, do you hold it out for longer, or take it away sooner?',
            2: 'A narrower opening lets in LESS light. Would that brighten a too-dark photo, or darken it further?',
          },
          stages: [
            'Which change lets light keep pouring in for longer?',
            'It’s about time, not the hole — think about how long the shutter stays open.',
          ],
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
        scene: 'room',
        title: 'Aperture: the size of the hole',
        body: [
          'Inside the lens is a hole that light passes through. Open it wide and light floods in; make it small and less gets through.',
          'Its size is written as an f-number — and that’s where the twist is.',
        ],
      },
      {
        kind: 'slider-sim',
        scene: 'room',
        prompt: 'This room is dimly lit. Make the photo as bright as you can — using only the aperture.',
        control: { stops: F_STOPS, start: 4 },
        toParams: (f) => ({ exposure: apertureToExposure(f) }),
        format: (f) => 'f/' + fmt(f),
        label: 'Aperture',
        ends: ['f/1.4 · wide open', 'f/16 · narrow'],
        iris: true,
        ariaLabel: 'Aperture f-stop',
        check: (f) => f === 1.4,
        feedback: {
          correct: 'Wide open (f/1.4) is the biggest hole, so it gathers the most light.',
          stages: [
            'Is the photo as bright as it can get? Which way opens the hole wider?',
            'Wider means a smaller f-number. Keep heading toward the wide end.',
            'The widest opening gathers the most light — go all the way to the wide end, then Check.',
          ],
        },
      },
      {
        kind: 'predict',
        prompt: 'Which aperture lets in more light: f/2 or f/16?',
        options: ['f/16', 'f/2'],
        answer: 1,
        feedback: {
          correct: 'f-numbers are fractions: f/2 is a much bigger opening than f/16, so it lets in far more light.',
          byOption: {
            0: 'An f-number is a fraction — the focal length ÷ the opening. Which is the bigger slice of pie: 1/16, or 1/2?',
          },
          stages: [
            'Think of f as a fraction. A bigger number on the bottom makes a bigger slice, or a smaller one?',
            'The smaller f-number is the bigger opening. Which of these two numbers is smaller?',
          ],
          showWhy: {
            widget: 'TwoIris',
            params: { a: 2, b: 16 },
            caption: 'f/2 vs f/16 — the bar shows how much light each opening lets through.',
          },
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
          'Aperture has a second job. A wide opening can throw the background out of focus; a narrow one tends to keep the whole scene sharp.',
          'It’s how photographers make a subject pop off the background — though distance and lens length matter too, as you’ll see later.',
        ],
      },
      {
        kind: 'dof',
        prompt:
          'Shoot a portrait with a soft, blurred background. Shrink the green “in-focus” band to under 1 foot — using any of the three controls.',
        start: { focal: 85, fnum: 8, distM: 3, sensor: 'Full frame' },
        check: ({ total }) => total <= 305, // ~1 ft, in mm
        feedback: {
          correct:
            'Shallow depth of field — only your subject stays sharp, the rest falls away. And notice: you got there by opening the aperture, moving closer, OR using a longer lens. All three control depth of field — it was never just the aperture.',
          stages: [
            'The green band is what comes out sharp. How do you make that band narrower?',
            'A wider aperture, a longer lens, or a closer subject each shrink the band — try one and watch the readout.',
            'Open the aperture wide, zoom the lens in, and step closer — then Check.',
          ],
        },
      },
      {
        kind: 'predict',
        prompt:
          'You’re at f/2.8 and the background is too blurry — the client wants more of the scene in focus. Which change makes the depth of field DEEPER?',
        options: ['Move closer to your subject', 'Use a narrower aperture (higher f-number)', 'Use a longer lens'],
        answer: 1,
        feedback: {
          correct:
            'A narrower aperture deepens the depth of field. Moving closer or zooming in would do the opposite — they make it shallower.',
          byOption: {
            0: 'In the playground, when you moved the subject CLOSER, did the green band grow or shrink? You want it to grow.',
            2: 'A longer lens — did that widen the sharp band, or narrow it? You need the opposite.',
          },
          stages: [
            'Two of these make depth of field SHALLOWER. Which one is left?',
            'Closer and longer-lens both shrink the band. The third control deepens it — which is it?',
          ],
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
        kind: 'motion',
        prompt: 'The car is speeding past, smeared into a blur. Freeze it razor-sharp.',
        start: 5,
        check: (si) => si <= 1,
        feedback: {
          correct: 'A fast shutter opens for the tiniest slice of time — too short for the car to move — so it freezes sharp.',
          stages: [
            'The car is smearing across the frame. Which way makes the shutter faster?',
            'Freezing motion needs a tiny slice of time — head toward the fast end.',
            'Go all the way to the fastest shutter, then Check.',
          ],
        },
      },
      {
        kind: 'predict',
        prompt: 'You want a waterfall to look silky and smooth. Which shutter speed?',
        options: ['1/1000s', '1/8s'],
        answer: 1,
        feedback: {
          correct: 'A slow shutter lets the water keep moving while it’s open — that’s the silky blur.',
          byOption: {
            0: 'Silky water is water that MOVED while the shutter was open. Does a tiny slice of time let it move, or freeze it still?',
          },
          stages: [
            'Silky means the water blurred as it flowed — does that need a long exposure, or a short one?',
            'Motion blur comes from a slow shutter. Which option is the slower one?',
          ],
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
          correct: 'ISO brightened the shot — but the loupe shows the cost: grain creeping into the shadows.',
          stages: [
            'Can you make out the scene yet? Which way turns the ISO up?',
            'Higher ISO amplifies the signal brighter. Keep raising it.',
            'Raise the ISO higher until the scene is readable, then Check.',
          ],
        },
      },
      {
        kind: 'predict',
        prompt:
          'Indoors, your photo is too dark. You’ve already opened the aperture wide and slowed the shutter as far as you safely can. What’s left?',
        options: ['Raise the ISO, accepting some grain', 'Nothing — the photo has to stay dark'],
        answer: 0,
        feedback: {
          correct: 'ISO is your third lever — it brightens when aperture and shutter can’t, at the cost of some grain.',
          byOption: {
            1: 'You’ve maxed two of the three controls — but there’s a third. What does turning ISO up do to a dark photo?',
          },
          stages: [
            'Aperture and shutter are maxed — is there a third control you haven’t reached for yet?',
            'ISO is the third lever. What does raising it do to brightness?',
          ],
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
            'Same brightness, different look: f/2.8 is far wider than f/8, so its background is more blurred — an equivalent exposure.',
          byOption: {
            1: 'You already said they’re equally bright — so brightness isn’t the difference. Look again at the apertures.',
            2: 'Same brightness, yes — but the SETTINGS differ. From lesson 3, what does a much wider aperture change?',
          },
          stages: [
            'They’re equally bright. So what ELSE differs between f/8 and f/2.8?',
            'Recall lesson 3: a wider aperture changes the depth of field. f/2.8 is much wider than f/8.',
          ],
          showWhy: {
            widget: 'BeforeAfter',
            scene: 'portrait',
            params: {
              left: { aperture: 8, exposure: 0 },
              right: { aperture: 2.8, exposure: 0 },
              leftLabel: 'f/8',
              rightLabel: 'f/2.8',
            },
            caption: 'Same brightness — but watch the background.',
          },
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
        prompt: 'This shot is underexposed. Adjust the exposure until the tones spread across the histogram.',
        control: { min: -2.5, max: 2.5, step: 0.1, start: -1.7 },
        toParams: (v) => ({ exposure: v }),
        format: (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + ' EV',
        label: 'Exposure',
        ends: ['darker', 'brighter'],
        ariaLabel: 'Exposure compensation',
        histogram: true,
        check: (v) => wellMetered('landscape', v),
        feedback: {
          correct: 'Balanced — the tones spread across the histogram without piling up at either edge.',
          stages: [
            'Watch the histogram, not just the photo. Are the bars bunched against one edge?',
            'The mass is still pushed to one side — move the exposure the other way to spread it out.',
            'Spread the tones toward the middle: brighten if they’re piled left, darken if piled right. Then Check.',
          ],
        },
      },
      {
        kind: 'predict',
        prompt: 'A histogram with a tall spike jammed against the far right edge means…',
        options: ['The highlights are blown — detail is lost', 'The photo is perfectly exposed', 'The photo is too dark'],
        answer: 0,
        feedback: {
          correct: 'Pixels piled at the right edge are pure white with no detail — blown highlights. You’d lower exposure to recover them.',
          byOption: {
            1: 'A good exposure spreads the tones out. A tall SPIKE jammed against one wall isn’t a spread — what’s happened there?',
            2: 'The right edge is the BRIGHTEST tones. Would a too-dark photo pile its pixels on the bright side?',
          },
          stages: [
            'The right edge is the brightest possible tone — pure white. What happens to detail piled against that wall?',
            'Pixels stuck at maximum white have nothing left to recover. What do photographers call that?',
          ],
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
          correct: 'Neutral — the cast is gone and the colors read true.',
          stages: [
            'Does the image still have a tint? Which direction cancels orange?',
            'Orange is cancelled by its opposite. Nudge toward the cool end.',
            'Ease it toward the middle, where the light is neutral, then Check.',
          ],
        },
      },
      {
        kind: 'predict',
        prompt: 'You shoot indoors under warm orange bulbs and everything looks too orange. To fix it, you set white balance to…',
        options: ['Cooler (more blue)', 'Warmer (more orange)'],
        answer: 0,
        feedback: {
          correct: 'You cancel a cast by adding its opposite — cooling (blue) neutralizes a warm orange cast.',
          byOption: {
            1: 'Adding MORE orange to an already-orange photo — does that cancel the cast, or deepen it?',
          },
          stages: [
            'A cast is cancelled by adding its opposite colour. What’s the opposite of orange?',
            'Orange’s opposite is blue. Which setting adds blue — cooler, or warmer?',
          ],
          showWhy: {
            widget: 'PixelScene',
            scene: 'seascape',
            params: { temp: 0.95 },
            caption: 'Going warmer just deepens the orange cast.',
          },
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
          correct: 'On a power point. Off-center placement usually feels more dynamic and balanced than dead-center.',
          stages: [
            'Where do the gridlines cross? Try moving the subject onto one of those points.',
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
          correct: 'It’s about feel — off-center often reads as more dynamic and balanced. A guideline, not a law.',
          byOption: {
            1: 'Does WHERE you place a subject change the exposure? Placement and brightness are unrelated.',
            2: 'Plenty of great photos put the subject dead-center — it’s a guideline, not a law. So that option overstates it.',
          },
          stages: [
            'Two of these are factually off — placement doesn’t change brightness, and the rule isn’t absolute. That leaves one.',
            'Composition is about how the frame FEELS. Which option is about feel?',
          ],
          showWhy: { widget: 'none' },
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
