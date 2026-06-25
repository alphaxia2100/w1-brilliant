// Light & Direction: a classic lighting-study sphere whose shading shifts as the
// light swings from FRONT (flat) → SIDE (dimensional, raking shadows) → BEHIND
// (rim-lit silhouette), with a hard↔soft edge AND a warm↔cool color (golden hour
// vs harsh midday). Bespoke SVG like DofBokeh — a felt illustration, not a physical
// renderer. Used by the lesson AND the keepsake.

const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v))
const hexRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
// Tint a color toward warm-golden (w>0) or cool-blue (w<0). w === 0 is identity,
// so a neutral shot renders byte-for-byte as before.
function tint(hex, w, amt = 1) {
  const [r, g, b] = hexRgb(hex)
  const k = w * amt
  return `rgb(${clamp255(r * (1 + 0.12 * k) + (k > 0 ? 8 * k : 0))},${clamp255(g * (1 + 0.02 * k))},${clamp255(b * (1 - 0.3 * k))})`
}

export default function LightDirection({ angle = 90, soft = 0.4, warmth = 0, size = 300, rounded = true, className = '' }) {
  const phi = (angle * Math.PI) / 180
  const lit = (1 + Math.cos(phi)) / 2 // 1 = front (all lit) · 0.5 = side · 0 = behind
  const sh = 0.04 + soft * 0.2 // terminator half-width: hard = crisp, soft = wide
  const a = Math.max(0, Math.min(100, (lit - sh) * 100))
  const b = Math.max(0, Math.min(100, (lit + sh) * 100))
  const backlit = Math.max(0, (0.24 - lit) / 0.24) // rim strength as the light goes behind
  const cx = 50
  const cy = 45
  const R = 25
  const shadowCx = cx + (1 - lit) * 15 // cast shadow swings away from the light
  return (
    <div
      className={`relative overflow-hidden ${rounded ? 'rounded-tile' : ''} ${className}`}
      style={{ width: '100%', maxWidth: size, aspectRatio: '1 / 1' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full block">
        <defs>
          <linearGradient id="ld-face" x1="0" y1="0.18" x2="1" y2="0.82">
            <stop offset="0%" stopColor={tint('#F7EFDC', warmth)} />
            <stop offset={`${a}%`} stopColor={tint('#EFE2C6', warmth)} />
            <stop offset={`${b}%`} stopColor="#2B2632" />
            <stop offset="100%" stopColor="#201C28" />
          </linearGradient>
          <radialGradient id="ld-bg" cx="0.42" cy="0.34" r="0.85">
            <stop offset="0%" stopColor={tint('#3B3552', warmth, 0.5)} />
            <stop offset="100%" stopColor={tint('#181520', warmth, 0.5)} />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#ld-bg)" />
        {/* ground + cast shadow */}
        <ellipse cx={shadowCx} cy={cy + R + 7} rx={24 + soft * 9} ry={5 + soft * 3} fill="#0C0A12" opacity={0.3 * (0.4 + lit)} />
        {/* the subject */}
        <circle cx={cx} cy={cy} r={R} fill="url(#ld-face)" />
        {/* rim light catching the edge when lit from behind */}
        {backlit > 0 && (
          <path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx} ${cy - R}`}
            fill="none"
            stroke={tint('#FBEFD6', warmth)}
            strokeWidth={1.6 + soft}
            strokeLinecap="round"
            opacity={backlit * 0.9}
          />
        )}
      </svg>
    </div>
  )
}
