// Lesson-factory verification harness — the "test" in the factory's correctness loop.
// Imports the REAL engine math and a single candidate lesson module, then runs the
// same invariants checks.mjs enforces on the shipped course, plus structural guards
// (predict-first, no multiple choice, valid step kinds, feedback present).
//
// Usage:  node Factory/verify-lesson.mjs Factory/generated/<id>.lesson.mjs
// Exit 0 = the lesson is buildable + on-spec; exit 1 = failures (printed) to fix.

import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { meanBrightness, computeGrid } from '../src/sim/scene.js'
import { effectiveBlur } from '../src/sim/bokehMath.js'
import { composeEval } from '../src/sim/composeEval.js'

const SCENES = ['landscape', 'portrait', 'night', 'seascape', 'room', 'snow', 'backlit']
const KINDS = ['intro', 'capture', 'slider-sim', 'triangle', 'compose', 'bokeh', 'light-direction', 'motion', 'rank', 'eyedropper']

const fails = []
const fail = (m) => fails.push(m)

const path = process.argv[2]
if (!path) {
  console.error('usage: node Factory/verify-lesson.mjs <lesson.mjs>')
  process.exit(2)
}
const mod = await import(pathToFileURL(resolve(path)).href)
const lesson = mod.default || mod.lesson
if (!lesson || !Array.isArray(lesson.steps)) {
  console.error('FAIL: module has no default-exported lesson with a steps[] array')
  process.exit(1)
}

// ---- lesson-level structure ----
if (!lesson.id || !lesson.title || !lesson.blurb) fail('lesson missing id/title/blurb')
const interactive = lesson.steps.filter((s) => s.kind !== 'intro')
if (interactive.length < 4) fail(`only ${interactive.length} interactive beats — need at least 4 (depth)`)
if (lesson.steps[0]?.kind === 'intro') fail('opens on an intro — must be PREDICT-FIRST (first beat is an action)')
const introCount = lesson.steps.filter((s) => s.kind === 'intro').length
if (introCount > 2) fail(`${introCount} intro beats — too much telling (max 2)`)
// ends on a kept artifact (a shootable beat or a rank), not an intro
if (lesson.steps[lesson.steps.length - 1].kind === 'intro') fail('ends on an intro — should end on an active keeper/transfer')

lesson.steps.forEach((s, i) => {
  const tag = `${lesson.id}[${i}] ${s.kind}`
  if (!KINDS.includes(s.kind)) fail(`${tag}: unknown step kind (not in the engine)`)
  // No multiple choice, ever.
  if (s.options || s.choices || s.kind === 'predict') fail(`${tag}: looks like multiple choice — forbidden`)
  if (s.scene && !SCENES.includes(s.scene)) fail(`${tag}: scene "${s.scene}" does not exist`)
  if (s.kind !== 'intro' && !(s.feedback && (s.feedback.correct || s.feedback.wrong))) fail(`${tag}: interactive beat has no feedback.correct`)
  if (s.kind === 'intro' && !s.body) fail(`${tag}: intro has no body`)

  // ---- per-kind reachability: fails at start AND a winning state exists in range ----
  try {
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
      if (s.check(startVal)) fail(`${tag}: does NOT fail at start (passes immediately)`)
      if (!domain.some((v) => s.check(v))) fail(`${tag}: NOT reachable (no value in range passes)`)
    } else if (s.kind === 'bokeh' && s.check) {
      const base = { f: 5.6, subjectDist: 0.5, bgDist: 0.4, focal: 0.3, ...(s.lock || {}), ...(s.start || {}) }
      if (s.check(effectiveBlur(base))) fail(`${tag}: does NOT fail at start`)
      const ctrls = Array.isArray(s.control) ? s.control : [s.control || 'aperture']
      const fav = { ...base }
      for (const c of ctrls) {
        if (c === 'aperture') fav.f = 1.4
        else if (c === 'subjectDist') fav.subjectDist = 0
        else if (c === 'bgDist') fav.bgDist = 1
        else if (c === 'focal') fav.focal = 1
      }
      if (!s.check(effectiveBlur(fav))) fail(`${tag}: NOT reachable`)
    } else if (s.kind === 'motion' && s.check) {
      if (s.check(s.start)) fail(`${tag}: does NOT fail at start`)
      if (![0, 1, 2, 3, 4, 5, 6, 7].some((si) => s.check(si))) fail(`${tag}: NOT reachable`)
    } else if (s.kind === 'light-direction' && s.check) {
      const init = { angle: 90, soft: 0.4, warmth: 0, ...(s.fixed || {}), ...(s.start || {}) }
      if (s.check(init)) fail(`${tag}: does NOT fail at start`)
      let reach = false
      for (let a = 0; a <= 180 && !reach; a += 5)
        for (let sf = 0; sf <= 1.0001 && !reach; sf += 0.1)
          for (let w = -0.4; w <= 1.0001 && !reach; w += 0.2) if (s.check({ angle: a, soft: sf, warmth: w })) reach = true
      if (!reach) fail(`${tag}: NOT reachable`)
    } else if (s.kind === 'eyedropper' && s.check) {
      if (s.check(s.start?.temp ?? 0)) fail(`${tag}: does NOT fail at start`)
      if (typeof s.baseTemp !== 'number' || !s.check(-s.baseTemp)) fail(`${tag}: neutral card not reachable (check baseTemp)`)
    } else if (s.kind === 'triangle') {
      const triPass = (a, si, ii) => {
        const sum = 4 - a + (si - 4) + (ii - 4)
        const balanced = Math.abs(sum) < 0.5
        if (!s.goal) return balanced
        const idx = s.goal.lever === 'aperture' ? a : s.goal.lever === 'shutter' ? si : ii
        return balanced && s.goal.test(idx)
      }
      if (triPass(s.start.aperture, s.start.shutter, s.start.iso)) fail(`${tag}: does NOT fail at start`)
      let reach = false
      for (let a = 0; a < 8 && !reach; a++)
        for (let si = 0; si < 8 && !reach; si++)
          for (let ii = 0; ii < 8 && !reach; ii++) if (triPass(a, si, ii)) reach = true
      if (!reach) fail(`${tag}: NOT reachable`)
    } else if (s.kind === 'compose') {
      const t = s.target || { kind: 'thirds' }
      if (composeEval(t, s.start || { x: 50, y: 50 }).ok) fail(`${tag}: does NOT fail at start`)
      let good
      if (t.kind === 'leadroom') good = t.facing === 'left' ? { x: 80, y: 50 } : { x: 20, y: 50 }
      else if (t.kind === 'horizon') good = { x: 50, y: 33.33 }
      else if (t.kind === 'leadinglines') good = t.point || { x: 66.66, y: 38 }
      else good = { x: 33.33, y: 33.33 }
      if (!composeEval(t, good).ok) fail(`${tag}: NOT reachable`)
    } else if (s.kind === 'capture') {
      const startIn = s.start >= s.targetExp.min && s.start <= s.targetExp.max
      if (startIn) fail(`${tag}: start is already inside the target band`)
    } else if (s.kind === 'rank') {
      const sorted = [...s.solution].sort((a, b) => a - b)
      if (!(s.solution.length === s.items.length && sorted.every((v, idx) => v === idx))) fail(`${tag}: rank solution is not a permutation`)
    }
  } catch (e) {
    fail(`${tag}: threw during verification — ${e.message}`)
  }
})

// ---- scene math: every pixel scene used renders finite (no NaN) ----
for (const scene of new Set(lesson.steps.map((s) => s.scene).filter(Boolean))) {
  const g = computeGrid({ scene, exposure: 0, iso: 40 })
  if (!g.every((row) => row.every((c) => c.every(Number.isFinite)))) fail(`scene ${scene}: computeGrid produced NaN`)
  void meanBrightness // (kept imported for parity with the gate)
}

if (fails.length) {
  console.log(`FAIL (${fails.length}) — ${lesson.id}`)
  for (const f of fails) console.log('  ✗ ' + f)
  process.exit(1)
}
console.log(`PASS — ${lesson.id} (${lesson.steps.length} beats, ${interactive.length} interactive)`)
process.exit(0)
