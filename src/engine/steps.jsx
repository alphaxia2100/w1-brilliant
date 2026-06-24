import { useEffect, useRef, useState } from 'react'
import PixelScene from '../sim/PixelScene.jsx'
import { meanBrightness, histogram } from '../sim/scene.js'
import { dofCalc, fmtDist, dofTag, SENSORS } from '../sim/dof.js'
import { Slider, Button, ApertureIris } from '../components/ui.jsx'

const fmtF = (f) => (f % 1 === 0 ? String(f) : f.toFixed(1))

// "Show why it fails" widgets — mounted inside the feedback panel, parameterized
// by the learner's actual wrong choice. They show the consequence, they don't tell.
function TwoIris({ a, b }) {
  const light = (f) => 1 / (f * f)
  const base = light(Math.min(a, b)) // normalize to the wider (brighter) one
  return (
    <div className="flex justify-center gap-8 py-1">
      {[a, b].map((f, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <ApertureIris f={f} size={52} />
          <span className="font-mono text-[13px]">f/{fmtF(f)}</span>
          <div className="w-14 h-2 rounded-full bg-hairline overflow-hidden">
            <div className="h-full bg-pear" style={{ width: `${Math.min(light(f) / base, 1) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function BeforeAfter({ left, right, leftLabel, rightLabel, scene }) {
  return (
    <div className="flex justify-center gap-3 py-1">
      {[
        [left, leftLabel],
        [right, rightLabel],
      ].map(([p, label], i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <PixelScene scene={scene} size={120} {...p} />
          <span className="font-mono text-[12px] text-muted">{label}</span>
        </div>
      ))}
    </div>
  )
}

function resolveParams(showWhy, step) {
  const p = showWhy.params
  if (p === 'fromChoice') return step?.toParams ? step.toParams(showWhy.chosen) : {}
  if (typeof p === 'function') return p(showWhy.chosen, step)
  return p || {}
}

function ShowWhy({ showWhy, step }) {
  const w = showWhy.widget
  if (!w || w === 'none') return null
  const cap = showWhy.caption ? (
    <p className="text-[12px] mt-1.5 text-center opacity-80">{showWhy.caption}</p>
  ) : null
  if (w === 'TwoIris')
    return (
      <div>
        <TwoIris a={showWhy.params.a} b={showWhy.params.b} />
        {cap}
      </div>
    )
  if (w === 'BeforeAfter')
    return (
      <div>
        <BeforeAfter {...showWhy.params} scene={showWhy.scene} />
        {cap}
      </div>
    )
  if (w === 'PixelScene')
    return (
      <div className="flex flex-col items-center">
        <PixelScene scene={showWhy.scene || step?.scene} size={160} {...resolveParams(showWhy, step)} />
        {cap}
      </div>
    )
  return null
}

// The one shared feedback panel — calm gray when wrong, never red. On a miss it
// SHOWS the consequence of the learner's choice first, then guides without revealing.
export function Feedback({ status, message, showWhy, step }) {
  if (status === 'idle') return null
  const correct = status === 'correct'
  const hasVisual = !correct && showWhy && showWhy.widget && showWhy.widget !== 'none'
  return (
    <div
      className="rounded-tile px-4 py-3 text-[15px] leading-snug animate-pop"
      style={{
        background: correct ? '#D4F5DD' : '#E5E5E5',
        color: correct ? '#00370F' : '#383838',
      }}
      role="status"
    >
      {hasVisual && (
        <div className="mb-2.5">
          <ShowWhy showWhy={showWhy} step={step} />
        </div>
      )}
      {correct && <span className="font-medium">Nice. </span>}
      {message}
    </div>
  )
}

function Prompt({ children }) {
  return <p className="text-[18px] leading-snug font-medium mb-4">{children}</p>
}

// The shutter-release glyph used on every "take the shot" button.
function Shutter() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

// A live luminance histogram — the metering readout. Clipped ends glow red.
function Histogram({ params }) {
  const counts = histogram(params)
  const total = counts.reduce((a, b) => a + b, 0) || 1
  const max = Math.max(...counts, 1)
  const clipLow = counts[0] / total > 0.09
  const clipHigh = counts[counts.length - 1] / total > 0.09
  return (
    <div className="mb-4">
      <div className="flex items-end gap-[2px] h-16 bg-surface rounded-tile px-2 py-1.5">
        {counts.map((c, i) => {
          const clipped = (i === 0 && clipLow) || (i === counts.length - 1 && clipHigh)
          return (
            <span
              key={i}
              className="flex-1 rounded-t-[2px]"
              style={{ height: `${(c / max) * 100}%`, minHeight: '2px', background: clipped ? '#FF5D5D' : '#9AA0A6' }}
            />
          )
        })}
      </div>
      <div className="flex justify-between text-[11px] text-muted mt-1">
        <span style={{ color: clipLow ? '#C23B3B' : undefined }}>shadows{clipLow ? ' clipped' : ''}</span>
        <span style={{ color: clipHigh ? '#C23B3B' : undefined }}>{clipHigh ? 'clipped ' : ''}highlights</span>
      </div>
    </div>
  )
}

/* ---------- intro ---------- */
function IntroView({ step }) {
  return (
    <div className="animate-risein">
      {step.scene && (
        <div className="mb-5 flex justify-center">
          <PixelScene scene={step.scene} exposure={step.exposure ?? 0} size={300} />
        </div>
      )}
      {step.title && <h2 className="text-[22px] font-semibold mb-2 tracking-tight">{step.title}</h2>}
      {(Array.isArray(step.body) ? step.body : [step.body]).map((p, i) => (
        <p key={i} className="text-[16px] leading-relaxed text-ink/85 mb-3">
          {p}
        </p>
      ))}
    </div>
  )
}

/* ---------- predict (multiple choice) ---------- */
function PredictView({ step, status, onResult, onActivity }) {
  const [sel, setSel] = useState(null)
  const locked = status === 'correct'
  return (
    <div className="animate-risein">
      <Prompt>{step.prompt}</Prompt>
      <div className="flex flex-col gap-2.5 mb-4">
        {step.options.map((opt, i) => {
          const active = sel === i
          return (
            <button
              key={i}
              disabled={locked}
              onClick={() => {
                setSel(i)
                onActivity?.()
              }}
              className="text-left px-4 py-3 rounded-tile border text-[15px] transition-[transform,box-shadow,border-color] duration-150 ease-pop active:translate-y-[1px]"
              style={{
                borderColor: active ? '#456DFF' : '#E5E5E5',
                boxShadow: active ? '0 0 0 2px rgba(69,109,255,0.35)' : '0 2px 0 0 #E5E5E5',
                background: '#fff',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {!locked && (
        <Button className="w-full" disabled={sel === null} onClick={() => onResult(sel === step.answer, { chosen: sel })}>
          Check
        </Button>
      )}
    </div>
  )
}

/* ---------- capture (Lesson 1: collect light to a target) ---------- */
function meter(scene, exposure) {
  return meanBrightness({ scene, exposure })
}
function CaptureView({ step, status, onResult, onActivity }) {
  const [exp, setExp] = useState(step.start ?? -2)
  const [progress, setProgress] = useState(1)
  const [busy, setBusy] = useState(false)
  const raf = useRef(null)
  const locked = status === 'correct'

  const bandLo = meter(step.scene, step.targetExp.min)
  const bandHi = meter(step.scene, step.targetExp.max)
  const marker = meter(step.scene, exp)
  const inBand = exp >= step.targetExp.min && exp <= step.targetExp.max

  function take() {
    if (raf.current) cancelAnimationFrame(raf.current)
    setBusy(true)
    const start = performance.now()
    const dur = 1000
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1)
      setProgress(p < 1 ? 1 - Math.pow(1 - p, 2) : 1)
      if (p < 1) {
        raf.current = requestAnimationFrame(tick)
      } else {
        setBusy(false)
        const msg = inBand
          ? step.feedback.correct
          : marker < bandLo
            ? 'Too dark — your photo gathered too little light. Open the shutter longer.'
            : 'Too bright — you blew out the highlights. Let in a little less light.'
        onResult(inBand, { override: inBand ? undefined : msg, shot: { scene: step.scene, params: { exposure: exp } } })
      }
    }
    setProgress(0)
    raf.current = requestAnimationFrame(tick)
  }

  return (
    <div className="animate-risein">
      <Prompt>{step.prompt}</Prompt>
      <div className="flex justify-center mb-3">
        <PixelScene scene={step.scene} exposure={exp} progress={progress} size={300} />
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[12px] text-muted mb-1.5">
          <span>Light gathered</span>
          <span style={{ color: inBand ? '#1F8A3B' : '#666' }}>{inBand ? 'Good exposure' : 'Aim for the green'}</span>
        </div>
        <div className="relative h-3 rounded-full bg-hairline overflow-hidden">
          <span
            className="absolute inset-y-0 rounded-full"
            style={{ left: `${bandLo * 100}%`, width: `${(bandHi - bandLo) * 100}%`, background: '#C0EAC9' }}
          />
          <span
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-5 rounded-full"
            style={{ left: `${Math.min(marker, 1) * 100}%`, background: inBand ? '#29CC57' : '#141414' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <span className="text-[13px] text-muted w-20 shrink-0">Shutter time</span>
        <Slider
          value={exp}
          min={-3}
          max={2}
          step={0.1}
          onChange={(v) => {
            setExp(v)
            onActivity?.()
          }}
          ariaLabel="Shutter time — light gathered"
        />
      </div>

      {!locked && (
        <Button className="w-full" disabled={busy} onClick={take}>
          {busy ? 'Exposing…' : <><Shutter /> Take the photo</>}
        </Button>
      )}
    </div>
  )
}

/* ---------- slider-sim (Lessons 2–6: drive a PixelScene effect with one slider) ---------- */
function SliderSimView({ step, status, onResult, onActivity }) {
  const stops = step.control.stops
  const useIndex = Array.isArray(stops)
  const [raw, setRaw] = useState(step.control.start)
  const locked = status === 'correct'

  const value = useIndex ? stops[raw] : raw
  const params = step.toParams(value)

  return (
    <div className="animate-risein">
      <Prompt>{step.prompt}</Prompt>
      <div className="relative flex justify-center mb-4">
        <PixelScene scene={step.scene} size={300} live={!!params.iso} {...params} />
        {step.loupe && (
          <div className="absolute bottom-3 right-3 w-[88px] h-[88px] rounded-tile overflow-hidden border-2 border-white shadow-rest">
            <PixelScene
              scene={step.scene}
              size={88}
              rounded={false}
              live={!!params.iso}
              {...params}
              crop={step.loupe}
            />
          </div>
        )}
      </div>

      {step.histogram && <Histogram params={{ scene: step.scene, ...params }} />}

      <div className="flex items-center gap-4 mb-4">
        {step.iris && <ApertureIris f={value} />}
        <div className="flex flex-col">
          <span className="font-mono text-[26px] font-medium leading-none">{step.format(value)}</span>
          {step.label && <span className="text-[12px] text-muted mt-1">{step.label}</span>}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <Slider
          value={raw}
          min={useIndex ? 0 : step.control.min}
          max={useIndex ? stops.length - 1 : step.control.max}
          step={useIndex ? 1 : step.control.step || 1}
          onChange={(v) => {
            setRaw(v)
            onActivity?.()
          }}
          ariaLabel={step.ariaLabel || 'adjust'}
        />
      </div>
      <div className="flex justify-between text-[11px] text-muted mb-5">
        <span>{step.ends?.[0]}</span>
        <span>{step.ends?.[1]}</span>
      </div>

      {!locked && (
        <Button
          className="w-full"
          onClick={() => onResult(step.check(value), { chosen: value, shot: { scene: step.scene, params: params } })}
        >
          <Shutter /> Take the shot
        </Button>
      )}
    </div>
  )
}

/* ---------- triangle (Lesson 6 hero: balance all three controls) ---------- */
const TRI_APS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16]
const TRI_SHUT = ['1/1000', '1/500', '1/250', '1/125', '1/60', '1/30', '1/15', '1/8']
const TRI_ISOS = [100, 200, 400, 800, 1600, 3200, 6400, 12800]
const clampN = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)

function TriRow({ label, value, raw, setRaw, onActivity, locked, ends }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] text-muted">{label}</span>
        <span className="font-mono text-[15px] font-medium">{value}</span>
      </div>
      <Slider
        value={raw}
        min={0}
        max={7}
        step={1}
        ariaLabel={label}
        onChange={(v) => {
          if (!locked) {
            setRaw(v)
            onActivity?.()
          }
        }}
      />
    </div>
  )
}

function TriangleView({ step, status, onResult, onActivity }) {
  const [ai, setAi] = useState(step.start.aperture)
  const [si, setSi] = useState(step.start.shutter)
  const [ii, setII] = useState(step.start.iso)
  const locked = status === 'correct'

  // Each control's light contribution in stops, all measured from the SAME neutral
  // middle (index 4): wider aperture (lower index) adds light, slower shutter and
  // higher ISO (higher index) add light. {4,4,4} is perfectly balanced.
  const sum = 4 - ai + (si - 4) + (ii - 4)
  const params = {
    exposure: sum * 0.7, // gentle: a balanced shot looks right, a misbalanced one reads bright/dark not blown
    aperture: TRI_APS[ai],
    motion: Math.round(Math.max(0, si - 2) * 0.9),
    iso: clampN(Math.log2(TRI_ISOS[ii] / 100) * 14, 0, 110),
  }
  const angle = clampN(sum * 5, -28, 28)
  const balanced = Math.abs(sum) < 0.5

  function check() {
    const shot = { scene: step.scene, params }
    if (balanced) onResult(true, { shot })
    else
      onResult(false, {
        shot,
        override:
          sum > 0
            ? 'Overexposed — too much light. Trade some away: narrow the aperture, speed up the shutter, or lower the ISO.'
            : 'Underexposed — too little light. Add some: open the aperture, slow the shutter, or raise the ISO.',
      })
  }

  return (
    <div className="animate-risein">
      <Prompt>{step.prompt}</Prompt>
      <div className="flex justify-center mb-3">
        <PixelScene scene={step.scene} size={260} live {...params} />
      </div>

      <div className="mb-4">
        <svg viewBox="0 0 220 64" width="180" height="52" className="mx-auto block" aria-hidden="true">
          <g
            style={{ transition: 'transform 0.2s cubic-bezier(0,0,0.2,1)' }}
            transform={`rotate(${angle} 110 24)`}
          >
            <rect x="30" y="21" width="160" height="6" rx="3" fill={balanced ? '#29CC57' : '#141414'} />
            <circle cx="30" cy="24" r="7" fill="none" stroke={balanced ? '#29CC57' : '#141414'} strokeWidth="3" />
            <circle cx="190" cy="24" r="7" fill="none" stroke={balanced ? '#29CC57' : '#141414'} strokeWidth="3" />
          </g>
          <polygon points="110,24 99,50 121,50" fill="#141414" />
          <rect x="92" y="50" width="36" height="5" rx="2" fill="#141414" />
        </svg>
        <p
          className="text-center text-[13px] font-medium mt-1"
          style={{ color: balanced ? '#1F8A3B' : '#666' }}
        >
          {balanced ? 'Level — correctly exposed' : sum > 0 ? 'Overexposed' : 'Underexposed'}
        </p>
      </div>

      <TriRow label="Aperture" value={'f/' + (TRI_APS[ai] % 1 === 0 ? TRI_APS[ai] : TRI_APS[ai].toFixed(1))} raw={ai} setRaw={setAi} onActivity={onActivity} locked={locked} />
      <TriRow label="Shutter" value={TRI_SHUT[si] + 's'} raw={si} setRaw={setSi} onActivity={onActivity} locked={locked} />
      <TriRow label="ISO" value={TRI_ISOS[ii]} raw={ii} setRaw={setII} onActivity={onActivity} locked={locked} />

      {!locked && (
        <Button className="w-full mt-2" onClick={check}>
          <Shutter /> Take the shot
        </Button>
      )}
    </div>
  )
}

/* ---------- compose (rule of thirds: drag the subject onto a power point) ---------- */
const THIRDS = [
  { x: 33.33, y: 33.33 },
  { x: 66.66, y: 33.33 },
  { x: 33.33, y: 66.66 },
  { x: 66.66, y: 66.66 },
]
function ComposeView({ step, status, onResult, onActivity }) {
  const [pos, setPos] = useState(step.start || { x: 50, y: 50 })
  const frame = useRef(null)
  const dragging = useRef(false)
  const locked = status === 'correct'
  const near = THIRDS.some((p) => Math.hypot(p.x - pos.x, p.y - pos.y) < 11)

  function place(e) {
    const rect = frame.current.getBoundingClientRect()
    setPos({
      x: clampN(((e.clientX - rect.left) / rect.width) * 100, 5, 95),
      y: clampN(((e.clientY - rect.top) / rect.height) * 100, 5, 95),
    })
    onActivity?.()
  }
  function down(e) {
    if (locked) return
    dragging.current = true
    place(e)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* no active pointer (e.g. synthetic event) — fine */
    }
  }

  return (
    <div className="animate-risein">
      <Prompt>{step.prompt}</Prompt>
      <div className="relative mx-auto mb-4" style={{ maxWidth: 300 }}>
        <PixelScene scene={step.scene} size={300} />
        <div
          ref={frame}
          className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing rounded-tile overflow-hidden"
          onPointerDown={down}
          onPointerMove={(e) => dragging.current && place(e)}
          onPointerUp={() => (dragging.current = false)}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
            {[33.33, 66.66].map((v) => (
              <line key={'v' + v} x1={v} y1="0" x2={v} y2="100" stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" />
            ))}
            {[33.33, 66.66].map((h) => (
              <line key={'h' + h} x1="0" y1={h} x2="100" y2={h} stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" />
            ))}
            {THIRDS.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="1.6" fill="rgba(255,255,255,0.9)" />
            ))}
          </svg>
          <div
            className="absolute w-8 h-8 rounded-full border-[3px] grid place-items-center transition-[background,border-color] duration-150"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              background: near ? '#29CC57' : '#FFFFFF',
              borderColor: near ? '#1F8A3B' : '#141414',
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: near ? '#fff' : '#141414' }} />
          </div>
        </div>
      </div>
      <p className="text-[13px] text-center text-muted mb-4">
        {near ? 'On a power point — that’s the spot.' : 'Drag your subject onto a point where the lines cross.'}
      </p>
      {!locked && (
        <Button className="w-full" onClick={() => onResult(near)}>
          Check
        </Button>
      )}
    </div>
  )
}

/* ---------- dof (Lesson 3: side-view depth-of-field diagram, four factors) ---------- */
const FOCALS = [14, 24, 35, 50, 85, 135, 200]
const APS_D = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22]

function SliderRow({ label, value, children }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] text-muted">{label}</span>
        {value && <span className="font-mono text-[14px] font-medium">{value}</span>}
      </div>
      {children}
    </div>
  )
}

function ReadoutCard({ label, value }) {
  return (
    <div className="flex-1 bg-surface rounded-tile px-2 py-2 text-center min-w-0">
      <div className="text-[10px] uppercase tracking-wide text-muted truncate">{label}</div>
      <div className="text-[17px] font-semibold font-mono leading-tight mt-0.5">{value}</div>
    </div>
  )
}

function Silhouette({ kind, x, groundY, h, color, blur, opacity }) {
  const style = { filter: blur ? `blur(${blur}px)` : undefined, opacity }
  if (kind === 'flower')
    return (
      <g style={style}>
        <rect x={x - h * 0.018} y={groundY - h * 0.6} width={h * 0.036} height={h * 0.6} fill={color} />
        <circle cx={x} cy={groundY - h * 0.64} r={h * 0.13} fill={color} />
        <circle cx={x - h * 0.11} cy={groundY - h * 0.56} r={h * 0.07} fill={color} />
        <circle cx={x + h * 0.11} cy={groundY - h * 0.56} r={h * 0.07} fill={color} />
      </g>
    )
  if (kind === 'tree')
    return (
      <g style={style}>
        <rect x={x - h * 0.05} y={groundY - h * 0.45} width={h * 0.1} height={h * 0.45} fill={color} />
        <circle cx={x} cy={groundY - h * 0.6} r={h * 0.3} fill={color} />
      </g>
    )
  if (kind === 'hill')
    return (
      <g style={style}>
        <ellipse cx={x} cy={groundY + h * 0.25} rx={h * 1.3} ry={h * 0.8} fill={color} />
      </g>
    )
  const w = h * 0.44
  return (
    <g style={style}>
      <circle cx={x} cy={groundY - h * 0.85} r={h * 0.15} fill={color} />
      <path
        d={`M ${x - w * 0.5} ${groundY} L ${x - w * 0.4} ${groundY - h * 0.62} Q ${x} ${groundY - h * 0.8} ${x + w * 0.4} ${groundY - h * 0.62} L ${x + w * 0.5} ${groundY} Z`}
        fill={color}
      />
    </g>
  )
}

function DofView({ step, status, onResult }) {
  const [fi, setFi] = useState(Math.max(0, FOCALS.indexOf(step.start?.focal ?? 50)))
  const [ai, setAi] = useState(Math.max(0, APS_D.indexOf(step.start?.fnum ?? 5.6)))
  const [distM, setDistM] = useState(step.start?.distM ?? 3)
  const [sensorKey, setSensorKey] = useState(step.start?.sensor ?? 'Full frame')
  const [imperial, setImperial] = useState(true)
  const [adv, setAdv] = useState(false)
  const locked = status === 'correct'

  const focal = FOCALS[fi]
  const fnum = APS_D[ai]
  const coc = SENSORS[sensorKey]
  const d = dofCalc({ focal, fnum, distM, coc })
  const u = d.u
  const dist = (mm) => fmtDist(mm, imperial)

  const W = 960
  const H = 300
  const originX = 130
  const rightX = 940
  const span = rightX - originX
  const groundY = 248
  const midY = 150
  const xOf = (mm) => Math.max(originX, Math.min(rightX, originX + (span * mm) / (mm + u)))
  const xn = xOf(d.near)
  const xf = d.far === Infinity ? rightX : xOf(d.far)
  const coneHalf = Math.max(34, Math.min(116, span * Math.tan(Math.atan(12 / focal))))

  const objects = [
    { kind: 'flower', dist: u * 0.5 },
    { kind: 'person', dist: u },
    { kind: 'tree', dist: u * 2.4 },
    { kind: 'hill', dist: u * 7 },
  ]
    .map((o) => {
      const inBand = o.dist >= d.near && o.dist <= d.far
      const out = inBand ? 0 : o.dist < d.near ? (d.near - o.dist) / d.near : (o.dist - d.far) / Math.max(d.far, 1)
      return { ...o, x: xOf(o.dist), h: Math.max(15, Math.min(196, 96 * (u / o.dist))), inBand, blur: inBand ? 0 : Math.min(2 + out * 9, 11) }
    })
    .sort((a, b) => b.dist - a.dist)

  function check() {
    onResult(step.check({ total: d.total, near: d.near, far: d.far, focal, fnum, distM }), {
      shot: { scene: 'portrait', params: { aperture: fnum, exposure: 0 } },
    })
  }

  return (
    <div className="animate-risein">
      <Prompt>{step.prompt}</Prompt>

      <div className="rounded-tile overflow-hidden border border-hairline mb-3 bg-white">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ aspectRatio: `${W} / ${H}` }} aria-hidden="true">
          <polygon points={`${originX - 36},${midY} ${rightX},${midY - coneHalf} ${rightX},${midY + coneHalf}`} fill="#14141410" />
          <rect x={xn} y="8" width={Math.max(2, xf - xn)} height={groundY - 8} fill="rgba(41,204,87,0.16)" />
          <line x1={xn} y1="8" x2={xn} y2={groundY} stroke="#29CC57" strokeWidth="1.5" />
          <line x1={xf} y1="8" x2={xf} y2={groundY} stroke="#29CC57" strokeWidth="1.5" strokeDasharray={d.far === Infinity ? '5 4' : undefined} />
          <line x1={xOf(u)} y1="0" x2={xOf(u)} y2={groundY} stroke="#FF5D5D" strokeWidth="2" strokeDasharray="6 4" />
          <line x1="0" y1={groundY} x2={W} y2={groundY} stroke="#E5E5E5" strokeWidth="2" />
          {objects.map((o, i) => (
            <Silhouette key={i} kind={o.kind} x={o.x} groundY={groundY} h={o.h} blur={o.blur} opacity={o.inBand ? 0.92 : 0.5} color={o.inBand ? '#2A2E3A' : '#9AA0AC'} />
          ))}
          <g>
            <rect x="38" y={midY - 24} width="60" height="44" rx="6" fill="#141414" />
            <rect x="92" y={midY - 12} width="22" height="22" rx="4" fill="#141414" />
            <circle cx="68" cy={midY - 1} r="10" fill="#3A3F4C" stroke="#fff" strokeWidth="1.5" />
          </g>
          <text x="36" y={midY - 34} fill="#141414" fontSize="17" fontWeight="600" fontFamily="monospace">
            {focal}mm f/{fnum % 1 === 0 ? fnum : fnum.toFixed(1)}
          </text>
          <text x={xn - 5} y={groundY + 22} fill="#1F8A3B" fontSize="13" textAnchor="end" fontFamily="monospace">{dist(d.near)}</text>
          {d.far !== Infinity && (
            <text x={xf + 5} y={groundY + 22} fill="#1F8A3B" fontSize="13" textAnchor="start" fontFamily="monospace">{dist(d.far)}</text>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <ReadoutCard label="Near focus" value={dist(d.near)} />
        <ReadoutCard label="Far focus" value={dist(d.far)} />
        <ReadoutCard label="Total depth of field" value={dist(d.total)} />
        <ReadoutCard label="Hyperfocal" value={dist(d.H)} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-semibold tracking-wide px-3 py-1 rounded-full" style={{ background: '#EEEDFE', color: '#3C3489' }}>
          {dofTag(d.total)}
        </span>
        <div className="flex gap-1 text-[12px]">
          {['m', 'ft'].map((un) => {
            const on = (un === 'ft') === imperial
            return (
              <button key={un} onClick={() => setImperial(un === 'ft')} className="px-2.5 py-1 rounded-[8px]" style={{ background: on ? '#141414' : '#F2F2F2', color: on ? '#fff' : '#666' }}>
                {un}
              </button>
            )
          })}
        </div>
      </div>

      <SliderRow label="Distance" value={dist(u)}>
        <Slider value={distM} min={0.5} max={12} step={0.1} onChange={setDistM} ariaLabel="Subject distance" />
      </SliderRow>
      <SliderRow label="Focal length" value={`${focal}mm`}>
        <Slider value={fi} min={0} max={FOCALS.length - 1} step={1} onChange={setFi} ariaLabel="Focal length" />
      </SliderRow>
      <SliderRow label="Aperture" value={`f/${fnum % 1 === 0 ? fnum : fnum.toFixed(1)}`}>
        <Slider value={ai} min={0} max={APS_D.length - 1} step={1} onChange={setAi} ariaLabel="Aperture" />
      </SliderRow>

      <button onClick={() => setAdv(!adv)} className="text-[12px] text-link mb-3">
        {adv ? '− Hide sensor size' : '+ Sensor size'}
      </button>
      {adv && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {Object.keys(SENSORS).map((k) => (
            <button key={k} onClick={() => setSensorKey(k)} className="px-2.5 py-1 rounded-[8px] text-[12px]" style={{ background: k === sensorKey ? '#141414' : '#F2F2F2', color: k === sensorKey ? '#fff' : '#666' }}>
              {k}
            </button>
          ))}
        </div>
      )}

      {!locked && (
        <Button className="w-full mt-1" onClick={check}>
          <Shutter /> Take the shot
        </Button>
      )}
    </div>
  )
}

/* ---------- motion (Lesson 4: a moving subject + shutter-driven blur) ---------- */
function drawCar(ctx, cx, baseY, h) {
  const w = h * 2.0
  const x = cx - w / 2
  ctx.beginPath()
  ctx.moveTo(x, baseY)
  ctx.lineTo(x + w, baseY)
  ctx.lineTo(x + w, baseY - h * 0.5)
  ctx.lineTo(x + w * 0.74, baseY - h * 0.5)
  ctx.lineTo(x + w * 0.6, baseY - h)
  ctx.lineTo(x + w * 0.32, baseY - h)
  ctx.lineTo(x + w * 0.2, baseY - h * 0.5)
  ctx.lineTo(x, baseY - h * 0.5)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + w * 0.26, baseY, h * 0.17, 0, 7)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + w * 0.74, baseY, h * 0.17, 0, 7)
  ctx.fill()
}

function MotionView({ step, status, onResult }) {
  const [si, setSi] = useState(step.start ?? 5)
  const locked = status === 'correct'
  const ref = useRef(null)
  const raf = useRef(null)
  const siRef = useRef(si)
  siRef.current = si

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    let startT = null
    const speed = (W + 160) / 2600 // px per ms
    const frame = (now) => {
      if (startT == null) startT = now
      const t = now - startT
      const x = ((t * speed) % (W + 160)) - 80
      const dashOff = (t * speed) % 72
      const s = siRef.current
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#CFE6F5'
      ctx.fillRect(0, 0, W, H * 0.6)
      ctx.fillStyle = '#5C6168'
      ctx.fillRect(0, H * 0.6, W, H * 0.4)
      ctx.fillStyle = '#E9E9E9'
      for (let i = -1; i * 72 - dashOff < W; i++) ctx.fillRect(i * 72 - dashOff, H * 0.78, 38, 5)
      const carH = H * 0.17
      const baseY = H * 0.73
      const blurLen = (s / 7) * W * 0.45
      const steps = Math.max(1, Math.round(blurLen / 6))
      ctx.fillStyle = '#1E2230'
      for (let i = steps; i >= 1; i--) {
        ctx.globalAlpha = 0.1
        drawCar(ctx, x - (i / steps) * blurLen, baseY, carH)
      }
      ctx.globalAlpha = s === 0 ? 1 : 0.9
      drawCar(ctx, x, baseY, carH)
      ctx.globalAlpha = 1
      raf.current = requestAnimationFrame(frame)
    }
    raf.current = requestAnimationFrame(frame)
    return () => raf.current && cancelAnimationFrame(raf.current)
  }, [])

  const frozen = si <= 1
  return (
    <div className="animate-risein">
      <Prompt>{step.prompt}</Prompt>
      <div className="rounded-tile overflow-hidden border border-hairline mb-4">
        <canvas ref={ref} width={600} height={300} className="w-full block" style={{ aspectRatio: '2 / 1' }} />
      </div>
      <div className="flex items-center gap-4 mb-3">
        <span className="font-mono text-[26px] font-medium leading-none">{TRI_SHUT[si]}s</span>
        <span className="text-[13px]" style={{ color: frozen ? '#1F8A3B' : '#666' }}>{frozen ? 'Frozen sharp' : 'Motion blur'}</span>
      </div>
      <Slider value={si} min={0} max={7} step={1} onChange={setSi} ariaLabel="Shutter speed" />
      <div className="flex justify-between text-[11px] text-muted mb-5 mt-2">
        <span>1/1000 · freeze</span>
        <span>1/8 · blur</span>
      </div>
      {!locked && (
        <Button
          className="w-full"
          onClick={() => onResult(step.check(si), { chosen: si, shot: { scene: 'portrait', params: { motion: Math.round(si * 0.85) } } })}
        >
          <Shutter /> Take the shot
        </Button>
      )}
    </div>
  )
}

export const STEP_VIEWS = {
  intro: IntroView,
  predict: PredictView,
  capture: CaptureView,
  'slider-sim': SliderSimView,
  triangle: TriangleView,
  compose: ComposeView,
  dof: DofView,
  motion: MotionView,
}
