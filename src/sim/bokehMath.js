// Depth-of-field math — the four real levers, as one felt blur magnitude.
// Pure + node-importable (tested in Redesign/checks.mjs). NO metric targets.

export const BOKEH_STOPS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16]

// Aperture → background blur (px @ size 300). Wider (low f) blurs most; ~sharp by f/11.
export function blurForAperture(f) {
  const i = Math.max(0, BOKEH_STOPS.indexOf(f))
  const t = i / (BOKEH_STOPS.length - 1) // 0 wide .. 1 narrow
  return 19 * Math.pow(1 - t, 1.7)
}

// subjectDist / bgDist / focal are 0..1 sliders (the felt position of each lever):
//   subjectDist: 0 = up close to the subject (shallow), 1 = far back (deep)
//   bgDist:      0 = background just behind, 1 = background far away (melts more)
//   focal:       0 = wide-angle, 1 = telephoto (compresses + blurs more)
// Returns ONE combined blur magnitude so a beat can check the felt result of any lever.
export function effectiveBlur({ f = 5.6, subjectDist = 0.5, bgDist = 0.4, focal = 0.3 } = {}) {
  const base = blurForAperture(f)
  const subjF = 1.6 - 1.1 * subjectDist // close 1.6 .. far 0.5
  const bgF = 0.6 + 1.0 * bgDist // close 0.6 .. far 1.6
  const focF = 0.65 + 1.15 * focal // wide 0.65 .. tele 1.8
  return Math.max(0, Math.min(24, base * subjF * bgF * focF))
}
