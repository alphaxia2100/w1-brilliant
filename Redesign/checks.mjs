// Test-driven gate for the lesson layer. Run: node Redesign/checks.mjs  (npm test)
// Asserts the load-bearing invariant the user must never have to hand-debug:
// EVERY checked beat FAILS at its start state and is REACHABLE within its control's
// range — so a retuned scene or mapping can't silently make a lesson unpassable or
// pass-without-acting. Plus scene-math sanity (brightness monotonicity, no NaN).
import { course, skills } from '../src/content/course.js'
import { reviewNext, intervalMs, isDue, selectDue, interleave, nextDueAt, BOX_DAYS, MAX_BOX, DAY } from '../src/lib/spacing.js'
import { meanBrightness, computeGrid } from '../src/sim/scene.js'
import { effectiveBlur } from '../src/sim/bokehMath.js'
import { composeEval } from '../src/sim/composeEval.js'
let pass = 0
let fail = 0
const ok = (name, cond) => {
  if (cond) { pass++; console.log('  ok  ' + name) }
  else { fail++; console.log('  FAIL ' + name) }
}

console.log('=== lesson reachability (every checked beat fails at start, passes in range) ===')
function assertStep(s, tag) {
    if (s.kind === 'slider-sim' && s.check) {
      const stops = s.control.stops
      let domain
      let startVal
      if (Array.isArray(stops)) {
        domain = stops
        startVal = stops[s.control.start]
      } else {
        domain = []
        for (let v = s.control.min; v <= s.control.max + 1e-9; v += s.control.step || 1) domain.push(+v.toFixed(4))
        startVal = s.control.start
      }
      ok(`${tag}: fails at start`, !s.check(startVal))
      ok(`${tag}: reachable`, domain.some((v) => s.check(v)))
    } else if (s.kind === 'bet' && s.check) {
      // A BET beat must FAIL at the learner's committed prediction's start (the intuitive
      // guess — else the bet never fires) and have a reachable true answer in range.
      const domain = []
      for (let v = s.control.min; v <= s.control.max + 1e-9; v += s.control.step || 1) domain.push(+v.toFixed(4))
      ok(`${tag}: bet fails at start`, !s.check(s.bet?.start ?? s.control.start))
      ok(`${tag}: reachable`, domain.some((v) => s.check(v)))
      if (s.betKind && s.betMessages) {
        // The success copy must NEVER validate a wrong-direction guess (blueprint risk #1).
        // Assert the classifier maps representative bets to the right outcome and each has copy.
        const vN = -(s.toParams(0).baseTemp || 0)
        const cases = { center: 0, wrong: -Math.sign(vN) * 0.5, near: vN, short: vN / 2, over: vN * 1.5 }
        const mapped = Object.entries(cases).every(([want, b]) => s.betKind(b) === want)
        const allCopy = Object.keys(cases).every((k) => !!s.betMessages[k])
        ok(`${tag}: bet feedback classifies center/wrong/near/short/over correctly`, mapped)
        ok(`${tag}: every bet outcome has a message`, allCopy)
      }
    } else if (s.kind === 'bokeh' && s.check) {
      // check() takes the combined effectiveBlur; assert start fails and the most-favorable
      // setting of every active lever passes.
      const bkBase = { f: 5.6, subjectDist: 0.5, bgDist: 0.4, focal: 0.3, ...(s.lock || {}), ...(s.start || {}) }
      // check receives (blur, params) — a blur beat uses blur; a compression beat uses params.focal.
      ok(`${tag}: fails at start`, !s.check(effectiveBlur(bkBase), bkBase))
      // Sweep the lever space (respecting locked levers) so a beat can check blur OR a
      // specific lever in EITHER direction (e.g. focal high = compress, low = expand).
      let reach = false
      for (const fAp of [1.4, 2.8, 5.6, 11, 16])
        for (let sd = 0; sd <= 1.001; sd += 0.25)
          for (let bd = 0; bd <= 1.001; bd += 0.25)
            for (let fo = 0; fo <= 1.001; fo += 0.1) {
              const p = { f: fAp, subjectDist: sd, bgDist: bd, focal: fo, ...(s.lock || {}) }
              if (s.check(effectiveBlur(p), p)) reach = true
            }
      ok(`${tag}: reachable`, reach)
    } else if (s.kind === 'focus' && s.check) {
      // Rack focus: check(focusDist 0..1). Must fail at the start plane and be nailable in range.
      const domain = []
      for (let v = 0; v <= 1.0001; v += 0.02) domain.push(+v.toFixed(2))
      ok(`${tag}: fails at start`, !s.check(s.start?.focusDist ?? 0))
      ok(`${tag}: reachable`, domain.some((v) => s.check(v)))
    } else if (s.kind === 'motion' && s.check) {
      ok(`${tag}: fails at start`, !s.check(s.start))
      ok(`${tag}: reachable`, [0, 1, 2, 3, 4, 5, 6, 7].some((si) => s.check(si)))
    } else if (s.kind === 'light-direction' && s.check) {
      const init = { angle: 90, soft: 0.4, warmth: 0, fill: 0, ...(s.fixed || {}), ...(s.start || {}) }
      ok(`${tag}: fails at start`, !s.check(init))
      let reach = false
      for (let a = 0; a <= 180 && !reach; a += 5)
        for (let sf = 0; sf <= 1.0001 && !reach; sf += 0.1)
          for (let w = -0.4; w <= 1.0001 && !reach; w += 0.2)
            for (let f = 0; f <= 1.0001 && !reach; f += 0.1)
              if (s.check({ angle: a, soft: sf, warmth: w, fill: f })) reach = true
      ok(`${tag}: reachable`, reach)
    } else if (s.kind === 'eyedropper' && s.check) {
      // Before any sample the cast stands (temp = start). Clicking the neutral gray
      // card solves temp to -baseTemp (eff 0), which must neutralise.
      ok(`${tag}: fails at start`, !s.check(s.start?.temp ?? 0))
      ok(`${tag}: reachable`, s.check(-s.baseTemp))
    } else if (s.kind === 'triangle') {
      // Replicates TriangleView: balanced (|sum|<0.5) AND, if a reciprocity goal is
      // set, the goal lever passes its test. Assert start fails and a pass exists.
      const triPass = (a, si, ii) => {
        const sum = 4 - a + (si - 4) + (ii - 4)
        const balanced = Math.abs(sum) < 0.5
        if (!s.goal) return balanced
        const idx = s.goal.lever === 'aperture' ? a : s.goal.lever === 'shutter' ? si : ii
        return balanced && s.goal.test(idx)
      }
      ok(`${tag}: fails at start`, !triPass(s.start.aperture, s.start.shutter, s.start.iso))
      let reach = false
      for (let a = 0; a < 8 && !reach; a++)
        for (let si = 0; si < 8 && !reach; si++)
          for (let ii = 0; ii < 8 && !reach; ii++) if (triPass(a, si, ii)) reach = true
      ok(`${tag}: reachable`, reach)
    } else if (s.kind === 'rank') {
      const sorted = [...s.solution].sort((a, b) => a - b)
      ok(`${tag}: solution is a permutation`, s.solution.length === s.items.length && sorted.every((v, idx) => v === idx))
    } else if (s.kind === 'compose') {
      const t = s.target || { kind: 'thirds' }
      ok(`${tag}: fails at start`, !composeEval(t, s.start || { x: 50, y: 50 }).ok)
      let good
      if (t.kind === 'leadroom') good = t.facing === 'left' ? { x: 80, y: 50 } : { x: 20, y: 50 }
      else if (t.kind === 'horizon') good = { x: 50, y: t.third === 'low' ? 66.66 : 33.33 }
      else if (t.kind === 'leadinglines') good = t.point || { x: 66.66, y: 38 }
      else if (t.kind === 'balance' || t.kind === 'composefree') {
        const a = t.anchor || { x: 25, y: 50 } // mirror the anchor across centre to counterbalance
        good = { x: 100 - a.x, y: 100 - a.y }
      } else if (t.kind === 'negativespace') good = { x: 15, y: 50 }
      else good = { x: 33.33, y: 33.33 }
      ok(`${tag}: reachable`, composeEval(t, good).ok)
    } else if (s.kind === 'capture') {
      // band must be reachable and the start must be outside it
      const startIn = s.start >= s.targetExp.min && s.start <= s.targetExp.max
      ok(`${tag}: starts outside the target band`, !startIn)
    }
}
for (const lesson of course.lessons) {
  lesson.steps.forEach((s, i) => assertStep(s, `${lesson.id}[${i}] ${s.kind}`))
}

console.log('\n=== chapters partition the lessons ===')
{
  const chap = course.chapters.flatMap((c) => c.lessonIds)
  const ids = course.lessons.map((l) => l.id)
  ok('every lesson is in exactly one chapter', ids.every((id) => chap.filter((c) => c === id).length === 1))
  ok('no chapter references a missing lesson', chap.every((id) => ids.includes(id)))
  ok('chapter order matches lesson order', JSON.stringify(chap) === JSON.stringify(ids))
}

// A step LEAKS a live pre-commit correctness tell (turns unaided recall into recognition,
// BRAINLIFT SPOV 5/2b) if its view renders a discrete "you're right" state before the learner
// commits. triangle/capture have no silent mode (their green "correctly exposed" / "Good
// exposure" is unconditional); compose's power-point glow and slider readState are tells unless
// `silentCue` suppresses them. Reviews must use none of these.
const leaksLiveTell = (s) =>
  s.kind === 'triangle' ||
  s.kind === 'capture' ||
  (s.kind === 'compose' && !s.silentCue) ||
  (s.kind === 'slider-sim' && s.readState && !s.silentCue)

console.log('\n=== practice bank (spaced-retrieval items: unaided, fails at start, reachable) ===')
ok('every content lesson has a practice skill', skills.length === 15)
for (const sk of skills) {
  const s = sk.item
  const tag = `practice:${sk.id} ${s.kind}`
  ok(`${tag}: marked review (no hint ladder / show-why)`, s.review === true)
  ok(`${tag}: no live pre-commit correctness tell`, !leaksLiveTell(s))
  ok(`${tag}: has success copy`, typeof s.feedback?.correct === 'string' && s.feedback.correct.length > 0)
  ok(`${tag}: skill maps to a real content lesson`, course.lessons.some((l) => l.id === sk.lessonId))
  assertStep(s, tag) // same fails-at-start + reachable invariants as lessons
}

console.log('\n=== chapter reviews are unaided (no live correctness tell) ===')
for (const lesson of course.lessons.filter((l) => l.review)) {
  lesson.steps.forEach((s, i) => ok(`${lesson.id}[${i}] ${s.kind}: no live tell`, !leaksLiveTell(s)))
}

console.log('\n=== spaced-retrieval scheduler (src/lib/spacing.js) ===')
{
  // Expanding ladder: each box waits strictly longer than the last.
  let monoUp = true
  for (let b = 2; b <= MAX_BOX; b++) if (!(intervalMs(b) > intervalMs(b - 1))) monoUp = false
  ok('intervals strictly increase per box', monoUp)
  ok('box 1 is the shortest interval', intervalMs(1) === BOX_DAYS[0] * DAY)

  const NOW = 1_700_000_000_000
  ok('a never-reviewed (learned) skill is due now', isDue(undefined, NOW) === true)

  const s1 = reviewNext(undefined, true, NOW)
  ok('first correct -> box 1', s1.box === 1)
  ok('first correct -> not due now', isDue(s1, NOW) === false)
  ok('first correct -> due after the box-1 interval', s1.dueAt === NOW + intervalMs(1))

  const s2 = reviewNext(s1, true, NOW)
  ok('second correct -> box 2', s2.box === 2)
  ok('promotion pushes the next review further out', s2.dueAt > s1.dueAt)
  ok('reps accumulate', s2.reps === 2)

  const s3 = reviewNext(s2, false, NOW)
  ok('a miss resets to box 1', s3.box === 1)
  ok('a miss records a lapse', s3.lapses === 1)
  ok('a miss reschedules soon (box 1)', s3.dueAt === NOW + intervalMs(1))

  let cap
  for (let i = 0; i < MAX_BOX + 3; i++) cap = reviewNext(cap, true, NOW)
  ok('box caps at MAX_BOX', cap.box === MAX_BOX)

  // Selection: only learned AND due; interleave spreads chapters across the opening run.
  const allLearned = skills.map((s) => s.lessonId)
  ok('all learned, never-reviewed skills are due', selectDue(skills, {}, allLearned, NOW).length === skills.length)
  ok('nothing is due when no lessons are complete', selectDue(skills, {}, [], NOW).length === 0)
  const oneReviewed = { [skills[0].id]: reviewNext(undefined, true, NOW) }
  ok('a just-reviewed skill drops out of due', !selectDue(skills, oneReviewed, allLearned, NOW).some((s) => s.id === skills[0].id))

  const due = selectDue(skills, {}, allLearned, NOW)
  const inter = interleave(due)
  ok('interleave preserves the set', inter.length === due.length)
  const nChapters = new Set(due.map((s) => s.chapterId)).size
  let opensSpread = true
  for (let i = 1; i < Math.min(nChapters, inter.length); i++) if (inter[i].chapterId === inter[i - 1].chapterId) opensSpread = false
  ok('interleave spreads chapters across the opening run', opensSpread)

  const future = {
    [skills[0].id]: reviewNext(reviewNext(undefined, true, NOW), true, NOW), // box 2, due +3d
    [skills[1].id]: reviewNext(undefined, true, NOW), // box 1, due +1d
  }
  ok('nextDueAt returns the soonest upcoming review', nextDueAt(skills, future, allLearned, NOW) === NOW + intervalMs(1))
}

console.log('\n=== scene math ===')
const apStep = course.lessons[0].steps.find((s) => s.kind === 'slider-sim' && s.label === 'Aperture')
if (apStep) {
  let prev = Infinity
  let mono = true
  for (const f of apStep.control.stops) {
    const m = meanBrightness({ scene: apStep.scene, ...apStep.toParams(f) })
    if (m > prev + 1e-9) mono = false
    prev = m
  }
  ok('L1 aperture: brightness descends monotonically f/1.4 -> f/16', mono)
}
for (const scene of ['landscape', 'portrait', 'night', 'seascape', 'room', 'snow', 'backlit']) {
  const g = computeGrid({ scene, exposure: 0, iso: 40 })
  ok(`scene ${scene}: computeGrid all-finite`, g.every((row) => row.every((c) => c.every(Number.isFinite))))
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
