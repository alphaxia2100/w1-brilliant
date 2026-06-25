export const meta = {
  name: 'lesson-factory',
  description: 'Autonomous factory: research → design → generate → auto-verify (gate loop) → adversarial critique (quality loop) → new on-style lessons',
  phases: [
    { title: 'Capability+Topics' },
    { title: 'Build' },
    { title: 'Critique' },
    { title: 'Synthesize' },
  ],
}

const REPO = '/Users/sky/Developer/Work/Alpha AI/Week 1 Brilliant'

const DESIGN_LAW = `
DESIGN LAW (the Aperture house style — non-negotiable):
- PREDICT-FIRST: every lesson OPENS by making the learner act; the sim surprises; a short line confirms. Never an intro first.
- One idea per beat; 5–8 beats; each beat a DISTINCT facet (no repetition, no padding). End on an active KEEPER or transfer, never an intro.
- NO multiple choice anywhere. Every check is an active interaction (a slider/place/rank/commit). No 'options', no 'predict' kind.
- FELT goals in a photographer's terms ("freeze it razor sharp", "melt the background"), not millimetre/EV targets.
- Calm, encouraging feedback (feedback.correct + escalating feedback.stages that name a lever+direction, never a value). Never punishing.
- The arc to favour: SEE (contrast / act) → confirm → deepen on distinct facets → a faded keeper the learner authors.
- DISTINCT from the six existing lessons (exposure-triangle, depth-of-field, metering, white-balance, rule-of-thirds, light-direction). A new lesson must teach a genuinely different topic, not re-skin one of those.
`

const ENGINE_CONTRACT = `
ENGINE CONTRACT — you may use ONLY these existing step kinds + scenes (no new sims; new sims are out of scope and won't render):
Read ${REPO}/src/engine/steps.jsx and ${REPO}/src/sim/scene.js and ${REPO}/src/content/course.js for the EXACT shapes — do not guess. Summary:
- kinds: intro, capture, slider-sim, triangle, compose, bokeh, light-direction, motion, rank, eyedropper.
- scenes (for any step.scene / PixelScene): landscape, portrait, night, seascape, room, snow, backlit.
- slider-sim drives a PixelScene effect via control + toParams; effects available in toParams: { exposure, iso, aperture, motion, temp, baseTemp }. Optional: histogram:true, loupe:{cx,cy,cells}, iris:true, ends:[lo,hi].
- bokeh: control is 'aperture'|'subjectDist'|'bgDist'|'focal' (or an array); check receives the combined blur number (use effectiveBlur thresholds, e.g. blur>=10); optional bg:'garden'|'lights'.
- motion: a car drives; check receives the shutter index si (0=fast/frozen .. 7=slow/blurred).
- light-direction: control 'angle'|'soft'|'warmth' (or controls:[...]); check receives {angle,soft,warmth}.
- compose: target.kind 'thirds'|'leadroom'(facing)|'horizon'|'leadinglines'(point); no check fn (composeEval grades it); keeper:true mints a polaroid.
- eyedropper: baseTemp + a click; check receives temp; neutral is check(-baseTemp).
- triangle: three sliders; optional goal:{lever,test,label,unmet} for a reciprocity beat.
- rank: items[{label}], solution (a permutation of indices), scale:[lo,hi].

HARD CONSTRAINT — checks must be SELF-CONTAINED pure functions of the control value plus inline numeric constants. Do NOT call histogram()/meanBrightness() inside a check (use value thresholds instead) — the new lesson must verify and integrate without extra helpers.

THE TEST YOU MUST PASS: ${REPO}/Factory/verify-lesson.mjs — read it; it enforces predict-first, no-MC, valid kinds/scenes, feedback present, and that every checked beat FAILS at its start state and is REACHABLE in range. Your generated file must make it print "PASS".
`

const CAP_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['confirmedKinds', 'confirmedScenes', 'topics'],
  properties: {
    confirmedKinds: { type: 'array', items: { type: 'string' }, description: 'step kinds verified to exist in steps.jsx' },
    confirmedScenes: { type: 'array', items: { type: 'string' } },
    topics: {
      type: 'array', minItems: 4, maxItems: 6,
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'title', 'angle', 'kindsUsed', 'distinctFrom', 'predictFirstHook'],
        properties: {
          id: { type: 'string', description: 'kebab-case lesson id, distinct from the 6 existing' },
          title: { type: 'string' },
          angle: { type: 'string', description: 'the one felt idea this lesson teaches' },
          kindsUsed: { type: 'array', items: { type: 'string' }, description: 'which existing kinds/scenes it composes' },
          distinctFrom: { type: 'string', description: 'why this is NOT a re-skin of an existing lesson' },
          predictFirstHook: { type: 'string', description: 'the opening predict-first beat' },
        },
      },
    },
  },
}

const BUILD_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['id', 'title', 'passed', 'tries', 'verifyTail', 'beatsSummary'],
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    passed: { type: 'boolean', description: 'did Factory/verify-lesson.mjs print PASS' },
    tries: { type: 'integer', description: 'how many verify→fix rounds it took' },
    verifyTail: { type: 'string', description: 'the final harness output (PASS line, or remaining ✗ if still failing)' },
    beatsSummary: { type: 'string', description: 'one line per beat: kind — what the learner does' },
  },
}

const CRITIC_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['clean', 'mustFix', 'notes'],
  properties: {
    clean: { type: 'boolean', description: 'true if it meets the Aperture bar (substance, predict-first, distinct facets, no MC, craft-true, calm)' },
    mustFix: { type: 'array', items: { type: 'string' }, description: 'concrete, buildable fixes if not clean (empty if clean)' },
    notes: { type: 'string' },
  },
}

const FINAL_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['delivered', 'rejected', 'factoryNotes'],
  properties: {
    delivered: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'title', 'file', 'oneLine'],
        properties: { id: { type: 'string' }, title: { type: 'string' }, file: { type: 'string' }, oneLine: { type: 'string' } },
      },
    },
    rejected: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'why'],
        properties: { id: { type: 'string' }, why: { type: 'string' } },
      },
    },
    factoryNotes: { type: 'string', description: 'how the factory performed; what the loops caught' },
  },
}

// ── Phase 0 — read the real engine, confirm capabilities, propose distinct topics ──
phase('Capability+Topics')
const cap = await agent(
  `You are the planner for an autonomous "lesson factory" that produces new lessons for the Aperture interactive
photography course, in its exact engine + house style.\n${DESIGN_LAW}\n${ENGINE_CONTRACT}\n
TASK: Read the actual files named above. Confirm the real list of step kinds and scenes. Then propose 4–6 NEW lesson
topics that (a) compose ONLY existing kinds/scenes, (b) are each genuinely DISTINCT from the six existing lessons and
from each other, and (c) can be taught predict-first with felt goals. Favour photography topics the engine can render
truthfully (e.g. ISO & noise, shutter & motion as its own deep lesson, focal length & compression, colour & mood/
golden hour, silhouettes, framing/leading the eye) — but only where the existing sims make it real. Return the
capability sheet + the ranked topic proposals.`,
  { label: 'capability+topics', phase: 'Capability+Topics', schema: CAP_SCHEMA, effort: 'high' },
)
const topics = (cap.topics || []).slice(0, 4)
log(`Capabilities confirmed; building ${topics.length} topics: ${topics.map((t) => t.id).join(', ')}`)

// ── Phase 1+2 — per topic: build with the CORRECTNESS LOOP, then the QUALITY LOOP ──
phase('Build')
const results = await pipeline(
  topics,
  // STAGE 1 — design + generate + run the gate harness in a fix-until-green loop (the agent owns the loop)
  (topic) =>
    agent(
      `You are a lesson builder in the Aperture lesson factory. Build ONE complete, verified lesson for this topic, then
prove it with the harness — looping until it passes.\n${DESIGN_LAW}\n${ENGINE_CONTRACT}\n
YOUR TOPIC (id: ${topic.id}): "${topic.title}". Angle: ${topic.angle}. Distinct because: ${topic.distinctFrom}.
Opening predict-first beat idea: ${topic.predictFirstHook}.\n
STEPS:
1. Read ${REPO}/src/content/course.js (copy its beat conventions EXACTLY), ${REPO}/src/engine/steps.jsx (kind signatures),
   ${REPO}/src/sim/scene.js (scenes/effects), and ${REPO}/Factory/verify-lesson.mjs (the contract).
2. Design a predict-first, no-MC, distinct-facet lesson (5–8 beats) on your topic. Felt goals, calm staged feedback,
   self-contained value-threshold checks, ends on an active keeper/transfer.
3. Write it to ${REPO}/Factory/generated/${topic.id}.lesson.mjs as: export default { id: '${topic.id}', number: 0,
   title: '...', blurb: '...', steps: [ ... ] }  — matching course.js conventions so it drops into the engine.
4. Run:  cd "${REPO}" && node Factory/verify-lesson.mjs Factory/generated/${topic.id}.lesson.mjs
   If it prints FAIL, read each ✗, FIX the file, and re-run. LOOP until it prints "PASS". Do not stop until PASS,
   or until 6 rounds have failed (then report the remaining ✗ honestly).
Return the structured result (passed = did it print PASS).`,
      { label: `build:${topic.id}`, phase: 'Build', schema: BUILD_SCHEMA, effort: 'high' },
    ),
  // STAGE 2 — quality loop: adversarial Sky-critic; if not clean, fix + re-verify (bounded)
  async (build, topic) => {
    if (!build || !build.passed) return build ? { ...build, clean: false } : null
    const file = `Factory/generated/${topic.id}.lesson.mjs`
    let clean = false
    let lastCritic = null
    for (let round = 0; round < 2 && !clean; round++) {
      const critic = await agent(
        `You are SKY reviewing a factory-built Aperture lesson at the highest bar. Read ${REPO}/${file} and judge it
against the house style: SUBSTANCE & depth (every beat a DISTINCT facet, no padding/rhyming), PREDICT-FIRST, NO multiple
choice, FELT-not-numeric goals, calm feedback, ends on an authored keeper, and genuinely DISTINCT from the six existing
lessons (read ${REPO}/src/content/course.js). Also: is the photography TRUE? Be merciless but concrete. If anything
falls short, list concrete must-fixes. ${DESIGN_LAW}`,
        { label: `critique:${topic.id}:${round}`, phase: 'Critique', schema: CRITIC_SCHEMA, effort: 'high' },
      )
      lastCritic = critic
      if (critic.clean) { clean = true; break }
      // fix + re-verify (must stay green on the harness)
      await agent(
        `You are a lesson fixer. Apply these must-fixes to ${REPO}/${file}, then re-run
\`cd "${REPO}" && node Factory/verify-lesson.mjs ${file}\` and keep fixing until it prints PASS again (the lesson must
stay buildable). Must-fixes:\n- ${critic.mustFix.join('\n- ')}\nReturn nothing special; just leave the file green.`,
        { label: `fix:${topic.id}:${round}`, phase: 'Critique', effort: 'high' },
      )
    }
    return { ...build, clean, criticNotes: lastCritic ? lastCritic.notes : '', file }
  },
)
const good = results.filter(Boolean).filter((r) => r.passed)
log(`${good.length}/${topics.length} lessons passed the gate harness; ${good.filter((r) => r.clean).length} also passed the critic`)

// ── Phase 3 — synthesize the factory run ──
phase('Synthesize')
const final = await agent(
  `Summarize this lesson-factory run for the operator, who will integrate the delivered lessons into the course and
verify them against the real gate + live browser. Inputs (JSON): the per-topic build+critique results. List the
DELIVERED lessons (passed the gate harness AND the critic) with their file path and a one-line description, the
REJECTED ones with why, and brief notes on how the factory's two loops (gate-correctness + adversarial-quality)
performed and what they caught.\n\nRESULTS:\n${JSON.stringify(results.filter(Boolean), null, 1)}`,
  { label: 'synthesize', phase: 'Synthesize', schema: FINAL_SCHEMA, effort: 'high' },
)

return { final, builtCount: good.length, cleanCount: good.filter((r) => r.clean).length, topics: topics.map((t) => t.id) }
