// Acceptance gate for the redesigned sims. Run: node Redesign/gate.mjs
import { computeGrid, meanBrightness, histogram } from '../src/sim/scene.js'

function clipFrac(params) {
  const g = computeGrid(params)
  const N = g.length
  let white = 0
  let black = 0
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      const [R, G, B] = g[r][c]
      if (Math.min(R, G, B) >= 254) white++
      if (Math.max(R, G, B) <= 1) black++
    }
  return { white: white / (N * N), black: black / (N * N) }
}

console.log('=== L2 aperture brightness (scene: room) ===')
const F = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16]
const ap = (f) => -F.indexOf(f) * 0.6
let prev = Infinity
let monoOK = true
let jndOK = true
let clipOK = true
for (const f of F) {
  const exposure = ap(f)
  const m = meanBrightness({ scene: 'room', exposure })
  const cf = clipFrac({ scene: 'room', exposure })
  const drop = prev - m
  if (m >= prev) monoOK = false
  if (prev !== Infinity && Math.abs(drop) < 0.01) jndOK = false
  if (cf.white >= 0.99) clipOK = false
  console.log(
    `f/${f}\texp=${exposure.toFixed(2)}\tmean=${m.toFixed(3)}\tΔ=${prev === Infinity ? '—' : drop.toFixed(3)}\twhiteClip=${(cf.white * 100).toFixed(1)}%`,
  )
  prev = m
}
console.log(`L2 GATE: monotonic=${monoOK}  adjacentAboveJND=${jndOK}  noStop>=99%clip=${clipOK}  => ${monoOK && jndOK && clipOK ? 'PASS' : 'FAIL'}`)

console.log('\n=== L7 metering (scene: landscape) ===')
const CLIP = 0.09
function wellMetered(exposure) {
  const c = histogram({ scene: 'landscape', exposure })
  const total = c.reduce((a, b) => a + b, 0) || 1
  const noClip = c[0] / total <= CLIP && c[c.length - 1] / total <= CLIP
  const mean = meanBrightness({ scene: 'landscape', exposure })
  return { pass: noClip && mean >= 0.4 && mean <= 0.62, mean, lo: c[0] / total, hi: c[c.length - 1] / total }
}
const passes = []
for (let e = -2.5; e <= 2.5001; e += 0.25) {
  const r = wellMetered(e)
  if (r.pass) passes.push(e.toFixed(2))
  console.log(`EV=${e.toFixed(2)}\tmean=${r.mean.toFixed(3)}\tshadowClip=${(r.lo * 100).toFixed(1)}%\thiClip=${(r.hi * 100).toFixed(1)}%\t${r.pass ? 'PASS' : ''}`)
}
const startFails = !wellMetered(-1.7).pass
console.log(`L7 GATE: start(-1.7) fails=${startFails}  winningWindow=[${passes.join(', ')}]  => ${startFails && passes.length > 0 ? 'PASS' : 'FAIL'}`)
