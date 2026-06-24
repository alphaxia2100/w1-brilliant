// Light & Direction: a classic lighting-study sphere whose shading shifts as the
// light swings from FRONT (flat) → SIDE (dimensional, raking shadows) → BEHIND
// (rim-lit silhouette), with a hard↔soft edge. Bespoke SVG like DofBokeh — a felt
// illustration, not a physical renderer. Used by the lesson AND the keepsake.

export default function LightDirection({ angle = 90, soft = 0.4, size = 300, rounded = true, className = '' }) {
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
            <stop offset="0%" stopColor="#F7EFDC" />
            <stop offset={`${a}%`} stopColor="#EFE2C6" />
            <stop offset={`${b}%`} stopColor="#2B2632" />
            <stop offset="100%" stopColor="#201C28" />
          </linearGradient>
          <radialGradient id="ld-bg" cx="0.42" cy="0.34" r="0.85">
            <stop offset="0%" stopColor="#3B3552" />
            <stop offset="100%" stopColor="#181520" />
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
            stroke="#FBEFD6"
            strokeWidth={1.6 + soft}
            strokeLinecap="round"
            opacity={backlit * 0.9}
          />
        )}
      </svg>
    </div>
  )
}
