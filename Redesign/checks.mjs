// Test-driven gate for the lesson layer. Run: node Redesign/checks.mjs  (npm test)
// Asserts the load-bearing invariant the user must never have to hand-debug:
// EVERY checked beat FAILS at its start state and is REACHABLE within its control's
// range — so a retuned scene or mapping can't silently make a lesson unpassable or
// pass-without-acting. Plus scene-math sanity (brightness monotonicity, no NaN).
import { course } from '../src/content/course.js'
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
for (const lesson of course.lessons) {
  lesson.steps.forEach((s, i) => {
    const tag = `${lesson.id}[${i}] ${s.kind}`
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
      ok(`${tag}: fails at start`, !s.check(effectiveBlur(bkBase)))
      const ctrls = Array.isArray(s.control) ? s.control : [s.control || 'aperture']
      const fav = { ...bkBase }
      for (const c of ctrls) {
        if (c === 'aperture') fav.f = 1.4
        else if (c === 'subjectDist') fav.subjectDist = 0
        else if (c === 'bgDist') fav.bgDist = 1
        else if (c === 'focal') fav.focal = 1
      }
      ok(`${tag}: reachable`, s.check(effectiveBlur(fav)))
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
      else if (t.kind === 'horizon') good = { x: 50, y: 33.33 }
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
  })
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
