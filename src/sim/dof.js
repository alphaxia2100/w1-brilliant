// Depth-of-field optics. Standard thin-lens formulas (Wikipedia "Depth of field"),
// validated against dofsimulator: 50mm f/1.8 @ 6ft FF -> near 5'9", far 6'3", H 157'4".
// All internal lengths are millimetres.

// Circle of confusion by format (mm) ≈ sensor diagonal / 1500.
export const SENSORS = {
  'Full frame': 0.029,
  'APS-C': 0.019,
  'Micro 4/3': 0.015,
  Phone: 0.005,
}

export function dofCalc({ focal, fnum, distM, coc }) {
  const f = focal
  const N = fnum
  const u = distM * 1000 // subject distance, mm
  const H = (f * f) / (N * coc) + f // hyperfocal
  const k = coc * N * (u - f)
  const near = (f * f * u) / (f * f + k)
  const farDenom = f * f - k
  const far = farDenom > 0 ? (f * f * u) / farDenom : Infinity
  const total = far === Infinity ? Infinity : far - near
  return { H, near, far, total, u }
}

export function fmtDist(mm, imperial) {
  if (mm === Infinity) return '∞'
  if (imperial) {
    const inches = mm / 25.4
    let ft = Math.floor(inches / 12)
    let inch = Math.round(inches - ft * 12)
    if (inch === 12) {
      ft += 1
      inch = 0
    }
    return `${ft}' ${inch}"`
  }
  if (mm < 1000) return `${Math.round(mm / 10)} cm`
  return `${(mm / 1000).toFixed(mm < 10000 ? 2 : 1)} m`
}

// A friendly label for the current depth of field.
export function dofTag(totalMm) {
  if (totalMm === Infinity || totalMm > 30000) return 'LANDSCAPE'
  if (totalMm > 3000) return 'GROUP / SCENE'
  if (totalMm > 600) return 'PORTRAIT'
  if (totalMm > 120) return 'TIGHT PORTRAIT'
  return 'MACRO / PRODUCT'
}
