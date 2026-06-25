export const meta = {
  name: 'aperture-pedagogy-redesign',
  description: 'Research the best interactive-learning work + learning science, diagnose our 6 lessons, ideate adversarially-verified better ways to teach',
  phases: [
    { title: 'Research' },
    { title: 'Playbook' },
    { title: 'Ideate' },
    { title: 'Verify' },
    { title: 'Synthesize' },
  ],
}

const CONTEXT = `
THE PRODUCT: "Aperture / Photography Foundations" — a Brilliant.org-style interactive photography
course (Vite + React). It is graded SOLELY on the depth and quality of the user EXPERIENCE "in doing
what Brilliant does": the design/interaction IS the product; photography is just the vehicle for
teaching well. The owner (Sky) just said: "a lot of our lessons aren't great — find better inspiration
online, ideate, and come up with better ways to teach people using learning science and proper
pedagogy." So we are RETHINKING HOW WE TEACH, not polishing beats. Be willing to challenge the current
format itself.

THE CURRENT FORMAT (read the actual files for ground truth — do NOT assume):
- src/content/course.js — the 6 lessons as data (every beat, prompt, check, feedback).
- src/engine/steps.jsx — the interaction views: capture, slider-sim, motion, triangle, rank, bokeh,
  compose, light-direction, eyedropper, intro.
- src/sim/scene.js, DofBokeh.jsx, LightDirection.jsx, composeEval.js — the sims.
The dominant pattern today: a short prompt then manipulate ONE slider (or place/rank) then "Take the
shot" then a calm feedback line. Mostly "predict-first": do, then a line confirms. 6 lessons:
L1 Exposure Triangle (9 beats), L2 Depth of Field (8), L3 Metering/histogram (7), L4 White Balance (5),
L5 Composition/rule-of-thirds (6), L6 Light & Direction (7).

THE ENGINE'S REAL CAPABILITIES (what's cheap to build): a low-res pixel-grid canvas scene (exposure,
ISO grain, motion smear, white-balance tint, blinkies overlay, loupe crop, histogram); a layered-CSS
forward bokeh sim (flower over a melting background); a directional-light sphere (angle/softness/warmth);
a drag-to-place composition frame; rank tiles; a balance "triangle"; a click-to-sample eyedropper. New
sims are possible but cost real effort — favour ideas this engine can render truthfully.

SKY'S NON-NEGOTIABLES (judge against these): SUBSTANCE and DEPTH over breadth (every beat must teach
something DISTINCT; no padding/rhyming). BEAUTY IN SIMPLICITY. PREDICT-FIRST (act then surprise then
confirm; never state the rule first). NO multiple choice — every check is an active interaction. Calm
feedback, never punishing. The captured ARTIFACT must prove the rule. FELT, not numeric goals. UP THE
DIALS: difficulty, interactivity, customization. CORE learning experience first (not a11y/perf). TRUTH
— never teach a falsehood; honor the real craft.
`

const RESEARCH_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['angle', 'summary', 'principles', 'exemplars', 'provocations'],
  properties: {
    angle: { type: 'string' },
    summary: { type: 'string' },
    principles: {
      type: 'array', minItems: 3, maxItems: 8,
      items: {
        type: 'object', additionalProperties: false,
        required: ['name', 'whatItIs', 'evidence', 'source', 'howToApplyToUs'],
        properties: {
          name: { type: 'string' },
          whatItIs: { type: 'string' },
          evidence: { type: 'string' },
          source: { type: 'string' },
          howToApplyToUs: { type: 'string' },
        },
      },
    },
    exemplars: {
      type: 'array', minItems: 2, maxItems: 8,
      items: {
        type: 'object', additionalProperties: false,
        required: ['name', 'whatMakesItGreat', 'mechanic', 'source', 'stealThis'],
        properties: {
          name: { type: 'string' },
          whatMakesItGreat: { type: 'string' },
          mechanic: { type: 'string' },
          source: { type: 'string' },
          stealThis: { type: 'string' },
        },
      },
    },
    provocations: { type: 'array', items: { type: 'string' } },
  },
}

const ANGLES = [
  { key: 'brilliant', title: 'How Brilliant ACTUALLY teaches (and its critics)',
    seed: 'Research Brilliant.org real instructional design: their learn-by-doing active-problem-first approach, scaffolding, immediate feedback, intuition-before-formalism, how a lesson is structured (sequence of interactive problems, not video). Read their about/blog, founder talks, and BOTH praise AND criticism from learners (Reddit, reviews, HN) — where Brilliant lessons fall flat or feel shallow, and what the genuinely great ones do. What specifically should we copy and what should we avoid?' },
  { key: 'explorables', title: 'Explorable explanations and interactive articles (the gold standard)',
    seed: 'Research the explorable-explanations tradition: Bret Victor (Explorable Explanations, Up and Down the Ladder of Abstraction), Nicky Case (explorabl.es, Parable of the Polygons), Bartosz Ciechanowski (bartosz.ciechanowski.me — Light and Shadow, Gears, Cameras/Exposure, Mechanical Watch — the gold standard of playable intuition), 3Blue1Brown, Distill.pub, The Pudding. What DESIGN PRINCIPLES make an interactive actually build intuition (direct manipulation, reification, see-the-system-respond, progressive disclosure, multiple linked representations)? Find Ciechanowski writing on light/optics/cameras specifically — directly relevant to a photography course.' },
  { key: 'learning-science', title: 'Core learning science / cognitive psychology of instruction',
    seed: 'Research the evidence base: productive failure (Manu Kapur), desirable difficulties (Robert Bjork), cognitive load theory (Sweller — worked-example effect, expertise reversal), retrieval practice and spacing (Roediger/Karpicke), the generation effect, contrasting cases and A Time For Telling (Schwartz and Bransford — why two contrasting cases BEFORE telling beats telling first), ICAP framework (Chi — passive < active < constructive < interactive), Mayer multimedia learning principles, constructivism, mastery learning (Bloom 2-sigma). For each: the finding, and CONCRETELY how it changes how a photography concept should be taught in our engine.' },
  { key: 'best-in-class', title: 'Other best-in-class learning and sim products',
    seed: 'Research what drives BOTH engagement and real learning in: Duolingo (bite-size, mastery loops, immediate feedback, motivation design — and its limits), Khan Academy (mastery learning, hints, worked examples), Desmos (math activities — Marbleslides, challenge-creator, social), PhET Interactive Simulations (Colorado — research-based sim design for science intuition), Quick Draw / Teachable Machine. What MECHANICS create deep engagement WITHOUT being shallow gamification? What would a photography equivalent of a PhET sim or a Desmos challenge look like?' },
  { key: 'photo-pedagogy', title: 'How masters teach photography for INTUITION',
    seed: 'Research how the best teach exposure, light, and composition for FELT intuition (not numbers): the critique that the exposure triangle is a flawed/misleading mental model (many pros argue this — find the debate and better models), expose-to-the-right, teaching light by seeing-the-light exercises, composition as learning to SEE (not rules to obey), common BEGINNER MISCONCEPTIONS in each area and how great teachers surface and fix them. What misconception-first or contrasting-case exercises would teach each of our 6 topics better?' },
]

const PLAYBOOK_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['principles', 'patterns', 'biggestShifts'],
  properties: {
    principles: {
      type: 'array', minItems: 5, maxItems: 12,
      items: {
        type: 'object', additionalProperties: false,
        required: ['name', 'science', 'ourApplication'],
        properties: { name: { type: 'string' }, science: { type: 'string' }, ourApplication: { type: 'string' } },
      },
    },
    patterns: {
      type: 'array', minItems: 5, maxItems: 12,
      items: {
        type: 'object', additionalProperties: false,
        required: ['name', 'whatItIs', 'scienceBasis', 'inOurEngine', 'exampleBeat'],
        properties: {
          name: { type: 'string' },
          whatItIs: { type: 'string' },
          scienceBasis: { type: 'string' },
          inOurEngine: { type: 'string' },
          exampleBeat: { type: 'string' },
        },
      },
    },
    biggestShifts: { type: 'array', items: { type: 'string' } },
  },
}

const LESSONS = [
  { id: 'exposure-triangle', title: 'The Exposure Triangle' },
  { id: 'depth-of-field', title: 'Depth of Field' },
  { id: 'metering', title: 'Metering / the histogram' },
  { id: 'white-balance', title: 'White Balance' },
  { id: 'rule-of-thirds', title: 'Composition' },
  { id: 'light-direction', title: 'Light & Direction' },
]

const IDEA_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['lesson', 'currentAssessment', 'weaknesses', 'keep', 'redesign', 'leverage'],
  properties: {
    lesson: { type: 'string' },
    currentAssessment: { type: 'string' },
    weaknesses: { type: 'array', items: { type: 'string' } },
    keep: { type: 'array', items: { type: 'string' } },
    redesign: {
      type: 'object', additionalProperties: false,
      required: ['thesis', 'beats', 'craftTrue'],
      properties: {
        thesis: { type: 'string' },
        beats: {
          type: 'array', minItems: 3, maxItems: 9,
          items: {
            type: 'object', additionalProperties: false,
            required: ['name', 'whatLearnerDoes', 'principleOrPattern', 'whyBetter', 'buildable'],
            properties: {
              name: { type: 'string' },
              whatLearnerDoes: { type: 'string' },
              principleOrPattern: { type: 'string' },
              whyBetter: { type: 'string' },
              buildable: { type: 'string' },
            },
          },
        },
        craftTrue: { type: 'string' },
      },
    },
    leverage: { type: 'integer', minimum: 1, maximum: 5 },
  },
}

const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['lesson', 'genuinelyBetter', 'buildable', 'craftTrue', 'fitsSkyBar', 'notGimmick', 'keep', 'critique', 'refinements'],
  properties: {
    lesson: { type: 'string' },
    genuinelyBetter: { type: 'boolean' },
    buildable: { type: 'boolean' },
    craftTrue: { type: 'boolean' },
    fitsSkyBar: { type: 'boolean' },
    notGimmick: { type: 'boolean' },
    keep: { type: 'boolean' },
    critique: { type: 'string' },
    refinements: { type: 'string' },
  },
}

const FINAL_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['thesis', 'crossCuttingPrinciples', 'perLesson', 'buildFirst', 'risks', 'openQuestionsForSky'],
  properties: {
    thesis: { type: 'string' },
    crossCuttingPrinciples: { type: 'array', items: { type: 'string' } },
    perLesson: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['lesson', 'priority', 'verdict', 'redesignThesis', 'concreteBeats', 'newSimWork'],
        properties: {
          lesson: { type: 'string' },
          priority: { type: 'integer' },
          verdict: { type: 'string' },
          redesignThesis: { type: 'string' },
          concreteBeats: { type: 'string' },
          newSimWork: { type: 'string' },
        },
      },
    },
    buildFirst: { type: 'string' },
    risks: { type: 'array', items: { type: 'string' } },
    openQuestionsForSky: { type: 'array', items: { type: 'string' } },
  },
}

phase('Research')
const researchRaw = await parallel(ANGLES.map((a) => () =>
  agent(
    CONTEXT + '\n\n=== YOUR RESEARCH ANGLE: ' + a.title + ' ===\n' + a.seed + '\n\nResearch ONLINE deeply (WebSearch/WebFetch real sources — cite them). Go past generic advice to specific mechanics and named examples. Find at least one thing that genuinely CHALLENGES our current slider-and-shoot format. Return your structured findings.',
    { label: 'research:' + a.key, phase: 'Research', schema: RESEARCH_SCHEMA }
  )
))
const research = researchRaw.filter(Boolean)
log(research.length + '/' + ANGLES.length + ' research angles complete')

phase('Playbook')
const playbook = await agent(
  CONTEXT + '\n\n=== DISTILL THE PLAYBOOK ===\nHere is the full multi-angle research (JSON). Distill it into (1) the cross-cutting LEARNING-DESIGN PRINCIPLES we should adopt course-wide, each tied to its science, and (2) a menu of concrete TEACHING/INTERACTION PATTERNS we can build in our engine (e.g. contrasting cases side-by-side, productive-failure-then-reveal, predict-with-a-commit, build-the-system reification, worked-example-then-fade, misconception-confrontation, spaced retrieval, free-exploration-with-a-goal, linked multiple representations). For each pattern: the science, how it renders in OUR engine, and a concrete example beat. End with the 3-6 biggest shifts in how we teach. Be specific and buildable.\n\nRESEARCH:\n' + JSON.stringify(research, null, 1),
  { label: 'playbook', phase: 'Playbook', schema: PLAYBOOK_SCHEMA, effort: 'high' }
)
log('Playbook: ' + playbook.principles.length + ' principles, ' + playbook.patterns.length + ' patterns')

phase('Ideate')
const ideas = await pipeline(
  LESSONS,
  (lesson) =>
    agent(
      CONTEXT + '\n\n=== IDEATE A BETTER WAY TO TEACH: ' + lesson.title + ' (id: ' + lesson.id + ') ===\nFirst READ this lesson actual beats in src/content/course.js and its view(s) in src/engine/steps.jsx (ground truth — do not assume). Then, using the PLAYBOOK below (our researched principles + patterns), honestly assess its current pedagogy, name its weaknesses, say what to KEEP, and design a genuinely BETTER way to teach it — predict-first, active, felt, no multiple choice, buildable in our engine, and photographically TRUE. Lead with a one-line thesis. Each proposed beat must name the learning-science principle/pattern it uses and why it beats the current beat. Be willing to rebuild, not just tweak.\n\nPLAYBOOK:\n' + JSON.stringify(playbook, null, 1),
      { label: 'ideate:' + lesson.id, phase: 'Ideate', schema: IDEA_SCHEMA, effort: 'high' }
    ),
  (idea, lesson) =>
    idea
      ? agent(
          CONTEXT + '\n\n=== ADVERSARIALLY VERIFY this redesign of "' + lesson.title + '" ===\nBe a skeptic. For the proposed redesign (JSON): is it GENUINELY better pedagogy (name the principle — or is it just novelty/engagement theater)? Is it realistically BUILDABLE in our engine without art that would flop or a sim we cannot make truthful? Is it photographically TRUE? Does it fit Sky bar (substance, simplicity, predict-first, NO multiple choice, beauty, felt-not-numeric)? Default to keep:false if it is a gimmick, unbuildable, untrue, or no better than what exists. If you keep it, sharpen it into something a developer could build.\n\nREDESIGN:\n' + JSON.stringify(idea, null, 1),
          { label: 'verify:' + lesson.id, phase: 'Verify', schema: VERDICT_SCHEMA }
        ).then((v) => ({ idea, verdict: v }))
      : null
)
const kept = ideas.filter(Boolean).filter((x) => x.verdict && x.verdict.keep)
log(kept.length + '/' + LESSONS.length + ' lesson redesigns survived verification')

phase('Synthesize')
const final = await agent(
  CONTEXT + '\n\n=== SYNTHESIZE THE REDESIGN DIRECTION ===\nYou are writing the decisive, concrete plan the owner will read and then BUILD from. Inputs: the learning-design PLAYBOOK and the VERIFIED per-lesson redesigns (JSON). Produce: the single biggest THESIS shift in how we teach; the cross-cutting principles we adopt; a per-lesson plan (priority, keep/refine/rebuild, concrete new beat sequence, any new sim work); the ONE flagship lesson to rebuild first to prove the approach (and why); the risks; and only the genuine open questions worth asking Sky (taste/scope forks — keep these few). Be specific and buildable; favour truth and substance over novelty.\n\nPLAYBOOK:\n' + JSON.stringify(playbook, null, 1) + '\n\nVERIFIED REDESIGNS:\n' + JSON.stringify(kept.map((k) => ({ idea: k.idea, verdict: k.verdict })), null, 1),
  { label: 'synthesize', phase: 'Synthesize', schema: FINAL_SCHEMA, effort: 'high' }
)

return { final: final, playbook: playbook, researchAngles: research.length, lessonsKept: kept.length }
