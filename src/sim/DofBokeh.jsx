// Forward-facing depth-of-field demo: a sharp geometric flower over a background
// that melts into creamy bokeh. Driven by the FOUR real DoF levers (aperture,
// subject distance, background distance, focal length) so each lesson beat can
// isolate a distinct one. Layered CSS blur, not pixel box-blur — clean edges.
// The lesson AND the captured keepsake render through this SAME component.
import { effectiveBlur, BOKEH_STOPS } from './bokehMath.js'

const lerp = (a, b, t) => a + (b - a) * t

// Warm garden highlights (become bokeh discs) and a couple of point "fairy lights".
const GARDEN_LIGHTS = [
  [16, 24, 5.5, '#FBE39A'], [80, 18, 6.5, '#F6D98A'], [63, 33, 4.5, '#FCEAB0'],
  [31, 52, 5, '#F4D080'], [88, 58, 5.5, '#FBE39A'], [45, 14, 4, '#FFF2C4'],
  [9, 66, 4.5, '#EFCB84'], [72, 72, 5, '#F8DE96'], [52, 64, 3.5, '#FCEAB0'],
]
const GARDEN_FOLIAGE = [
  [22, 40, 26, 22, '#5C8A4A'], [74, 46, 30, 26, '#4E7E42'],
  [50, 84, 40, 26, '#3F6E39'], [92, 24, 22, 20, '#6B9755'],
]
// Night point-lights — bloom into glowing bokeh balls when the aperture opens.
const NIGHT_LIGHTS = [
  [18, 26, 6, '#FFE9A8'], [78, 20, 7, '#FFD27A'], [60, 36, 5, '#BFE0FF'],
  [33, 56, 6, '#FFF0C0'], [86, 60, 6.5, '#FFDA8C'], [46, 16, 5, '#FFFFFF'],
  [10, 70, 5.5, '#FFCF86'], [70, 74, 6, '#CFE8FF'], [50, 66, 4.5, '#FFE9A8'],
]

// The subject plane (the flower) sits at this depth on the 0..1 focus track.
const SUBJECT_DEPTH = 0.34
export default function DofBokeh({
  f = 5.6,
  subjectDist = 0.5,
  bgDist = 0.4,
  focal = 0.3,
  focusDist = null, // null = subject always sharp (back-compat). 0..1 = rack-focus plane (near..far).
  bg = 'garden',
  size = 300,
  rounded = true,
  className = '',
}) {
  const blur = (effectiveBlur({ f, subjectDist, bgDist, focal }) * size) / 300
  // Rack focus: the subject is sharp only when the focus plane sits on it; miss it and the
  // subject softens (up to the same blur magnitude the wide aperture throws at the background).
  const subjectBlur = focusDist == null ? 0 : blur * Math.min(1, Math.abs(focusDist - SUBJECT_DEPTH) / 0.24)
  const open = 1 - Math.max(0, BOKEH_STOPS.indexOf(f)) / (BOKEH_STOPS.length - 1) // 1 wide .. 0 narrow
  const night = bg === 'lights'

  // Subject grows as you step closer; background recedes + compresses with focal length.
  const subjectScale = lerp(1.32, 0.72, subjectDist)
  const bgScale = 1.06 + focal * 0.34 + bgDist * 0.12
  // Discs bloom with a wide aperture, a far background, and a long lens.
  const discScale = (0.45 + 0.8 * open) * (0.82 + 0.55 * bgDist) * (0.82 + 0.55 * focal)
  const lights = night ? NIGHT_LIGHTS : GARDEN_LIGHTS
  const discBase = night ? 0.6 + 0.55 * open : 0.5 + 0.45 * open

  return (
    <div
      className={`relative overflow-hidden ${rounded ? 'rounded-tile' : ''} ${className}`}
      style={{ width: '100%', maxWidth: size, aspectRatio: '1 / 1' }}
      aria-hidden="true"
    >
      {/* Background layer — blurred + scaled (compression). Scaled past the frame so blur never reveals an edge. */}
      <div
        className="absolute inset-0"
        style={{ filter: blur ? `blur(${blur}px)` : undefined, transform: `scale(${bgScale})`, transformOrigin: '50% 45%' }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
          <defs>
            <linearGradient id="bk-bg" x1="0" y1="0" x2="0" y2="1">
              {night ? (
                <>
                  <stop offset="0%" stopColor="#1B2440" />
                  <stop offset="60%" stopColor="#14203A" />
                  <stop offset="100%" stopColor="#0C1326" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#CFE3B6" />
                  <stop offset="55%" stopColor="#9FC07E" />
                  <stop offset="100%" stopColor="#5E8A4C" />
                </>
              )}
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#bk-bg)" />
          {!night &&
            GARDEN_FOLIAGE.map(([x, y, rx, ry, c], i) => (
              <ellipse key={'f' + i} cx={x} cy={y} rx={rx} ry={ry} fill={c} opacity="0.7" />
            ))}
          {lights.map(([x, y, r, c], i) => (
            <circle key={'l' + i} cx={x} cy={y} r={Math.max(1, r * discScale)} fill={c} opacity={Math.min(1, discBase)} />
          ))}
        </svg>
      </div>

      {/* Subject layer — the flower; grows as the subject gets closer. Sharp unless the
          focus plane has been racked off it (focusDist), in which case it softens. */}
      <div className="absolute inset-0" style={{ transform: `scale(${subjectScale})`, transformOrigin: '50% 64%', filter: subjectBlur ? `blur(${subjectBlur}px)` : undefined }}>
        <svg viewBox="0 0 100 100" className="w-full h-full block">
          <path d="M50 52 C 49 70, 51 86, 50 100 L50 100 Z" stroke="#3C6B36" strokeWidth="2.6" fill="none" />
          <ellipse cx="41" cy="72" rx="9" ry="4.2" fill="#4B8043" transform="rotate(-26 41 72)" />
          <ellipse cx="60" cy="82" rx="8" ry="3.8" fill="#3F7339" transform="rotate(24 60 82)" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
            <ellipse key={k} cx="50" cy="32" rx="5.6" ry="12.5" fill="#F2789F" transform={`rotate(${k * 45} 50 46)`} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
            <ellipse key={'i' + k} cx="50" cy="38" rx="3.4" ry="7.5" fill="#F8A0BD" transform={`rotate(${k * 45 + 22} 50 46)`} />
          ))}
          <circle cx="50" cy="46" r="7.4" fill="#FFC94D" />
          <circle cx="50" cy="46" r="7.4" fill="none" stroke="#E8A93A" strokeWidth="1" />
          <circle cx="50" cy="46" r="3.1" fill="#E89A2C" />
        </svg>
      </div>
    </div>
  )
}
