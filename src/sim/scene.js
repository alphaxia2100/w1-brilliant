// The pixel-grid scene engine. Every photography sim is a low-res grid of cells
// plus cheap per-cell effects: exposure, light accumulation, depth-of-field blur,
// motion smear, and ISO grain. One engine, reused by every lesson.

function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
const lerp = (a, b, t) => a + (b - a) * t

// ---- scene generators: return { cells:[N][N][r,g,b], subject:[N][N] bool } ----

function buildLandscape(N) {
  const rnd = mulberry32(101)
  const horizon = Math.floor(N * 0.6)
  const cells = []
  const subject = []
  for (let r = 0; r < N; r++) {
    cells[r] = []
    subject[r] = []
    for (let c = 0; c < N; c++) {
      let col
      if (r < horizon) {
        const t = r / horizon
        col = [lerp(96, 198, t), lerp(168, 224, t), lerp(226, 240, t)]
      } else {
        const t = (r - horizon) / (N - horizon)
        col = [lerp(86, 120, t), lerp(150, 176, t), lerp(70, 96, t)]
      }
      // sun
      const dx = c - N * 0.74
      const dy = r - N * 0.18
      if (dx * dx + dy * dy < N * N * 0.008) col = [255, 244, 205]
      // tree trunk
      if ((c === Math.round(N * 0.26) || c === Math.round(N * 0.26) + 1) && r >= horizon - 5 && r < horizon + 2)
        col = [110, 76, 44]
      // tree canopy
      const cx = c - N * 0.27
      const cy = r - (horizon - 6)
      if (cx * cx + cy * cy < N * N * 0.012) col = [70, 132, 52]
      col = col.map((v) => v + (rnd() - 0.5) * 12)
      cells[r][c] = col
      subject[r][c] = false
    }
  }
  return { cells, subject }
}

function buildPortrait(N) {
  const rnd = mulberry32(202)
  const cells = []
  const subject = []
  // bright, airy background so blurred highlights bloom into bokeh
  for (let r = 0; r < N; r++) {
    cells[r] = []
    subject[r] = []
    for (let c = 0; c < N; c++) {
      const t = r / N
      cells[r][c] = [lerp(212, 168, t), lerp(206, 150, t), lerp(186, 128, t)]
      subject[r][c] = false
    }
  }
  // scattered bright lights in the background — these become bokeh discs when blurred
  const lights = [
    [0.16, 0.2, 0.08, [255, 236, 168]],
    [0.8, 0.15, 0.09, [255, 244, 192]],
    [0.64, 0.3, 0.06, [255, 240, 180]],
    [0.08, 0.52, 0.07, [252, 226, 150]],
    [0.88, 0.58, 0.08, [255, 238, 176]],
    [0.34, 0.1, 0.05, [255, 248, 208]],
  ]
  for (const [lx, ly, lr, color] of lights) {
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++) {
        const dx = c - lx * N
        const dy = r - ly * N
        if (dx * dx + dy * dy < N * N * lr) cells[r][c] = color.slice()
      }
  }
  // centered subject: a dark, high-contrast silhouette so sharp edges read clearly
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      const hx = c - N * 0.5
      const hy = r - N * 0.41
      const head = hx * hx + hy * hy < N * N * 0.017
      const shoulders = r > N * 0.6 && Math.abs(c - N * 0.5) < N * (0.17 + (r / N) * 0.2)
      if (head || shoulders) {
        cells[r][c] = [52 + (rnd() - 0.5) * 10, 58 + (rnd() - 0.5) * 10, 74 + (rnd() - 0.5) * 10]
        subject[r][c] = true
      }
    }
  return { cells, subject }
}

function buildNight(N) {
  const rnd = mulberry32(303)
  const cells = []
  const subject = []
  for (let r = 0; r < N; r++) {
    cells[r] = []
    subject[r] = []
    for (let c = 0; c < N; c++) {
      const t = r / N
      cells[r][c] = [lerp(18, 34, t), lerp(22, 40, t), lerp(40, 58, t)]
      subject[r][c] = false
    }
  }
  // a few bright lights / stars
  const pts = 14
  const rp = mulberry32(77)
  for (let i = 0; i < pts; i++) {
    const c = Math.floor(rp() * N)
    const r = Math.floor(rp() * N * 0.7)
    cells[r][c] = [250, 240, 200]
  }
  // ground line
  for (let r = Math.floor(N * 0.8); r < N; r++)
    for (let c = 0; c < N; c++) cells[r][c] = [24 + rnd() * 8, 26 + rnd() * 8, 30 + rnd() * 8]
  return { cells, subject }
}

function buildSeascape(N) {
  const rnd = mulberry32(404)
  const horizon = Math.floor(N * 0.56)
  const cells = []
  const subject = []
  for (let r = 0; r < N; r++) {
    cells[r] = []
    subject[r] = []
    for (let c = 0; c < N; c++) {
      let col
      if (r < horizon) {
        const t = r / horizon
        col = [lerp(150, 224, t), lerp(186, 232, t), lerp(214, 236, t)]
      } else {
        const t = (r - horizon) / (N - horizon)
        col = [lerp(40, 70, t), lerp(108, 138, t), lerp(150, 170, t)]
      }
      col = col.map((v) => v + (rnd() - 0.5) * 10)
      cells[r][c] = col
      subject[r][c] = false
    }
  }
  return { cells, subject }
}

const GENERATORS = {
  landscape: buildLandscape,
  portrait: buildPortrait,
  night: buildNight,
  seascape: buildSeascape,
}
const cache = new Map()

export function getScene(name, N) {
  const key = `${name}:${N}`
  if (!cache.has(key)) {
    const gen = GENERATORS[name] || buildLandscape
    cache.set(key, gen(N))
  }
  return cache.get(key)
}

// ---- effects ----

function boxBlur(grid, subject, radius, blurSubject) {
  const N = grid.length
  const out = grid.map((row) => row.map((c) => c.slice()))
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (subject[r][c] !== blurSubject) continue
      let sr = 0
      let sg = 0
      let sb = 0
      let n = 0
      for (let dr = -radius; dr <= radius; dr++)
        for (let dc = -radius; dc <= radius; dc++) {
          const rr = clamp(r + dr, 0, N - 1)
          const cc = clamp(c + dc, 0, N - 1)
          sr += grid[rr][cc][0]
          sg += grid[rr][cc][1]
          sb += grid[rr][cc][2]
          n++
        }
      out[r][c] = [sr / n, sg / n, sb / n]
    }
  return out
}

function horizontalSmear(grid, subject, half) {
  const N = grid.length
  const out = grid.map((row) => row.map((c) => c.slice()))
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (!subject[r][c]) continue
      let sr = 0
      let sg = 0
      let sb = 0
      let n = 0
      for (let dc = -half; dc <= half; dc++) {
        const cc = clamp(c + dc, 0, N - 1)
        sr += grid[r][cc][0]
        sg += grid[r][cc][1]
        sb += grid[r][cc][2]
        n++
      }
      out[r][c] = [sr / n, sg / n, sb / n]
    }
  return out
}

// Map an f-number to a background blur radius in cells. Only wide apertures blur;
// by f/5.6 and narrower the scene is sharp front-to-back (deep depth of field).
export function apertureToBlurRadius(f, N = 32) {
  if (f > 5.6) return 0
  const t = clamp((f - 1.4) / (5.6 - 1.4), 0, 1)
  return Math.round(lerp(3, 0, t) * (N / 32))
}

export function computeGrid(params) {
  const {
    scene = 'landscape',
    N = 32,
    exposure = 0,
    iso = 0,
    aperture = null,
    motion = 0,
    temp = 0,
    progress = 1,
  } = params
  const sc = getScene(scene, N)
  let g = sc.cells.map((row) => row.map((c) => c.slice()))

  if (aperture != null) {
    const radius = apertureToBlurRadius(aperture, N)
    if (radius > 0) g = boxBlur(g, sc.subject, radius, false) // blur background only
  }
  if (motion > 0) g = horizontalSmear(g, sc.subject, Math.round(motion))

  const factor = Math.pow(2, exposure) * progress
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      g[r][c][0] *= factor
      g[r][c][1] *= factor
      g[r][c][2] *= factor
    }

  // White balance: warm (temp > 0) adds red / removes blue; cool does the reverse.
  if (temp !== 0) {
    const rF = 1 + 0.32 * temp
    const bF = 1 - 0.32 * temp
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++) {
        g[r][c][0] *= rF
        g[r][c][2] *= bF
      }
  }

  if (iso > 0) {
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++) {
        const lum = (g[r][c][0] + g[r][c][1] + g[r][c][2]) / 3
        const shadowW = 1 - clamp(lum / 255, 0, 1)
        const n = (Math.random() - 0.5) * iso * (0.35 + shadowW)
        g[r][c][0] += n
        g[r][c][1] += n
        g[r][c][2] += n
      }
  }
  return g
}

export function drawScene(ctx, params) {
  const grid = computeGrid(params)
  const N = grid.length
  // Optional loupe: draw only a sub-square of the grid, scaled to fill the canvas.
  const crop = params.crop
  const span = crop ? crop.cells : N
  const oR = crop ? crop.cy : 0
  const oC = crop ? crop.cx : 0
  const cw = ctx.canvas.width / span
  for (let i = 0; i < span; i++)
    for (let j = 0; j < span; j++) {
      const px = grid[Math.min(oR + i, N - 1)][Math.min(oC + j, N - 1)]
      ctx.fillStyle = `rgb(${clamp(px[0], 0, 255) | 0},${clamp(px[1], 0, 255) | 0},${clamp(px[2], 0, 255) | 0})`
      ctx.fillRect(Math.floor(j * cw), Math.floor(i * cw), Math.ceil(cw), Math.ceil(cw))
    }
}

// Tonal distribution (luminance) of the current scene — for the metering histogram.
export function histogram(params, bins = 22) {
  const grid = computeGrid({ ...params, iso: 0 })
  const N = grid.length
  const counts = new Array(bins).fill(0)
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      const lum = (grid[r][c][0] + grid[r][c][1] + grid[r][c][2]) / 3
      const bin = clamp(Math.floor((lum / 255) * bins), 0, bins - 1)
      counts[bin]++
    }
  return counts
}

// Average scene brightness (0..1) at the current settings — used for exposure meters.
export function meanBrightness(params) {
  const grid = computeGrid({ ...params, iso: 0 })
  const N = grid.length
  let sum = 0
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) sum += (grid[r][c][0] + grid[r][c][1] + grid[r][c][2]) / 3
  return sum / (N * N * 255)
}
