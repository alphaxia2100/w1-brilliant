import { useEffect, useRef, useState } from 'react'
import PixelScene from '../sim/PixelScene.jsx'
import DofBokeh from '../sim/DofBokeh.jsx'
import { BOKEH_STOPS, effectiveBlur } from '../sim/bokehMath.js'
import { composeEval, THIRDS } from '../sim/composeEval.js'
import LightDirection from '../sim/LightDirection.jsx'
import { meanBrightness, histogram, getScene } from '../sim/scene.js'
import { dofCalc, fmtDist, dofTag, SENSORS } from '../sim/dof.js'
import { Slider, Button, ApertureIris } from '../components/ui.jsx'
import { useReducedMotion } from '../components/useReducedMotion.js'

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

// The captured photo, shown briefly on a polaroid that "develops" after a shot.
export function PolaroidReveal({ shot, onDone }) {
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  const tiltRef = useRef(null)
  if (tiltRef.current === null) tiltRef.current = Math.random() * 11 - 5.5 // random orientation each shot
  useEffect(() => {
    const t = setTimeout(() => doneRef.current(), 2400)
    return () => clearTimeout(t)
  }, [])
  const keeper = shot.verdict !== 'experiment'
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-6 cursor-pointer"
      style={{ background: 'rgba(16,16,18,0.82)' }}
      onClick={onDone}
      role="status"
      aria-label="Captured photo — tap to continue"
    >
      <div style={{ transform: `rotate(${tiltRef.current}deg)` }}>
        <div className="polaroid-in bg-white rounded-[8px] p-3 pb-9" style={{ width: 252, boxShadow: '0 18px 44px rgba(0,0,0,0.32)' }}>
        <div className="rounded-[3px] overflow-hidden bg-[#10131A]" style={{ aspectRatio: shot.image || shot.kind === 'motion' ? '2 / 1' : '1 / 1' }}>
          {shot.image ? (
            <img src={shot.image} alt="" className="block w-full polaroid-develop" />
          ) : shot.kind === 'bokeh' ? (
            <div className="polaroid-develop">
              <DofBokeh f={shot.f} subjectDist={shot.subjectDist} bgDist={shot.bgDist} focal={shot.focal} bg={shot.bg} size={228} rounded={false} />
            </div>
          ) : shot.kind === 'light' ? (
            <div className="polaroid-develop">
              <LightDirection angle={shot.angle} soft={shot.soft} warmth={shot.warmth} size={228} rounded={false} />
            </div>
          ) : shot.kind === 'motion' ? (
            <div className="polaroid-develop">
              <MotionShot si={shot.si} size={228} rounded={false} />
            </div>
          ) : shot.kind === 'compose' ? (
            <div className="polaroid-develop">
              <ComposeShot scene={shot.scene} x={shot.x} y={shot.y} facing={shot.facing} size={228} rounded={false} />
            </div>
          ) : (
            <div className="polaroid-develop">
              <PixelScene scene={shot.scene} size={228} rounded={false} {...shot.params} />
            </div>
          )}
        </div>
        <div className="text-center mt-3 font-mono text-[12px]" style={{ color: keeper ? '#1F8A3B' : '#888' }}>
          {keeper ? '★ keeper' : 'experiment'}
        </div>
        </div>
      </div>
      <p className="absolute bottom-8 inset-x-0 text-center text-[12px] text-white/55">tap to continue</p>
    </div>
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
              style={{ height: `${(c / max) * 100}%`, minHeight: '2px', background: clipped ? '#C9A227' : '#9AA0A6' }}
            />
          )
        })}
      </div>
      <div className="flex justify-between text-[11px] text-muted mt-1">
        <span style={{ color: clipLow ? '#8A6D1A' : undefined }}>shadows{clipLow ? ' clipped' : ''}</span>
        <span style={{ color: clipHigh ? '#8A6D1A' : undefined }}>{clipHigh ? 'clipped ' : ''}highlights</span>
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
  const [blinkOn, setBlinkOn] = useState(true)
  const locked = status === 'correct'

  // Blinkies blink: toggle a flag a couple times a second so clipped cells flash.
  useEffect(() => {
    if (!step.blinkies) return
    const id = setInterval(() => setBlinkOn((b) => !b), 430)
    return () => clearInterval(id)
  }, [step.blinkies])

  const value = useIndex ? stops[raw] : raw
  const params = step.toParams(value)

  return (
    <div className="animate-risein">
      <Prompt>{step.prompt}</Prompt>
      <div className="relative flex justify-center mb-4">
        <PixelScene scene={step.scene} size={300} live={!!params.iso} blinkies={!!step.blinkies} blinkOn={blinkOn} {...params} />
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
          valueText={step.format ? step.format(value) : undefined}
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

// A creative GOAL for a reciprocity beat: hit a look on ONE lever, then trade the
// light back on another to keep the meter level. lever ∈ aperture|shutter|iso.
const GOAL_IDX = { aperture: (a) => a, shutter: (_, s) => s, iso: (_, __, i) => i }
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

  // Reciprocity goal (optional): the shot must ALSO hit a creative look on one lever.
  const goal = step.goal
  const goalMet = !goal || goal.test(goal.lever === 'aperture' ? ai : goal.lever === 'shutter' ? si : ii)
  const pass = balanced && goalMet

  function check() {
    const shot = { scene: step.scene, params }
    if (pass) return onResult(true, { shot })
    if (goal && !goalMet && balanced)
      return onResult(false, { shot, override: goal.unmet })
    onResult(false, {
      shot,
      override:
        sum > 0
          ? `Overexposed — too much light. ${goal ? 'Keep your look and trade light away: ' : 'Trade some away: '}narrow the aperture, speed up the shutter, or lower the ISO.`
          : `Underexposed — too little light. ${goal ? 'Keep your look and add light back: ' : 'Add some: '}open the aperture, slow the shutter, or raise the ISO.`,
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

      {goal && (
        <div className="flex items-center justify-between rounded-tile px-3 py-2 mb-3" style={{ background: goalMet ? '#D4F5DD' : '#F2F2F2' }}>
          <span className="text-[13px] font-medium" style={{ color: goalMet ? '#1F8A3B' : '#555' }}>
            Your look: {goal.label}
          </span>
          <span className="text-[12px] font-mono" style={{ color: goalMet ? '#1F8A3B' : '#999' }}>
            {goalMet ? '✓ got it' : 'not yet'}
          </span>
        </div>
      )}

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
// A little figure drawn at a frame position (0..100). The subject the learner places.
function ComposeFigure({ x, y, ok, gaze }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="-4.6" r="3.1" fill={ok ? '#29CC57' : '#141414'} stroke="#fff" strokeWidth="0.7" />
      <path d="M -4 6.2 C -4 0.6, -2.2 -1.4, 0 -1.4 C 2.2 -1.4, 4 0.6, 4 6.2 Z" fill={ok ? '#29CC57' : '#141414'} stroke="#fff" strokeWidth="0.7" />
      {gaze && <circle cx={gaze === 'right' ? 5.4 : -5.4} cy="-4.6" r="1.05" fill="#FBE39A" />}
    </g>
  )
}

// The composition keepsake — re-renders the scene + the placed subject from params.
export function ComposeShot({ scene, x, y, facing, size = 228, rounded = true, fill = false }) {
  return (
    <div
      className={`relative overflow-hidden ${rounded ? 'rounded-tile' : ''}`}
      style={fill ? { width: '100%', height: '100%' } : { width: '100%', maxWidth: size, aspectRatio: '1 / 1' }}
      aria-hidden="true"
    >
      <PixelScene scene={scene} size={size} rounded={false} className="absolute inset-0" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <ComposeFigure x={x} y={y} ok={false} gaze={facing} />
      </svg>
    </div>
  )
}

function ComposeView({ step, status, onResult, onActivity }) {
  const target = step.target || { kind: 'thirds' }
  const horizon = target.kind === 'horizon'
  const leading = target.kind === 'leadinglines'
  const conv = target.point || { x: 66.66, y: 38 }
  const [pos, setPos] = useState(step.start || { x: 50, y: 50 })
  const [moved, setMoved] = useState(false)
  const frame = useRef(null)
  const dragging = useRef(false)
  const locked = status === 'correct'
  const { ok, cue } = composeEval(target, pos)

  function place(e) {
    const rect = frame.current.getBoundingClientRect()
    const x = clampN(((e.clientX - rect.left) / rect.width) * 100, 6, 94)
    const y = clampN(((e.clientY - rect.top) / rect.height) * 100, 6, 94)
    setPos(horizon ? { x: 50, y } : { x, y })
    setMoved(true)
    onActivity?.()
  }
  function down(e) {
    if (locked) return
    dragging.current = true
    place(e)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* synthetic event — fine */
    }
  }

  return (
    <div className="animate-risein">
      <Prompt>{step.prompt}</Prompt>
      <div className="relative mx-auto mb-3" style={{ maxWidth: 300 }}>
        <PixelScene scene={step.scene} size={300} />
        <div
          ref={frame}
          className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing rounded-tile overflow-hidden"
          onPointerDown={down}
          onPointerMove={(e) => dragging.current && place(e)}
          onPointerUp={() => (dragging.current = false)}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
            {/* a "cramped" vignette when the frame reads static — the felt cue */}
            {!ok && moved && !horizon && !leading && (
              <>
                <rect x="0" y="0" width="17" height="100" fill="rgba(8,8,12,0.26)" />
                <rect x="83" y="0" width="17" height="100" fill="rgba(8,8,12,0.26)" />
              </>
            )}
            {/* leading lines: rails/path converging on a point the eye is drawn to */}
            {leading &&
              [{ x: 0, y: 100 }, { x: 34, y: 100 }, { x: 66, y: 100 }, { x: 100, y: 100 }, { x: 0, y: 64 }, { x: 100, y: 64 }].map((p, i) => (
                <line key={'L' + i} x1={p.x} y1={p.y} x2={conv.x} y2={conv.y} stroke={ok ? 'rgba(41,204,87,0.7)' : 'rgba(255,255,255,0.55)'} strokeWidth="0.5" />
              ))}
            <g style={{ opacity: moved ? 1 : 0, transition: 'opacity 0.3s' }}>
              {!leading &&
                [33.33, 66.66].map((v) => (
                  <line key={'v' + v} x1={v} y1="0" x2={v} y2="100" stroke="rgba(255,255,255,0.62)" strokeWidth="0.4" />
                ))}
              {!leading &&
                [33.33, 66.66].map((h) => (
                  <line key={'h' + h} x1="0" y1={h} x2="100" y2={h} stroke="rgba(255,255,255,0.62)" strokeWidth="0.4" />
                ))}
              {!horizon && !leading &&
                THIRDS.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="1.4" fill="rgba(255,255,255,0.85)" />)}
            </g>
            {horizon ? (
              <>
                <rect x="0" y="0" width="100" height={pos.y} fill="rgba(150,200,255,0.12)" />
                <line x1="0" y1={pos.y} x2="100" y2={pos.y} stroke={ok ? '#29CC57' : '#FFFFFF'} strokeWidth="1.4" />
                <rect x="42" y={pos.y - 3.2} width="16" height="6.4" rx="2" fill={ok ? '#29CC57' : '#141414'} />
              </>
            ) : (
              <ComposeFigure x={pos.x} y={pos.y} ok={ok} gaze={target.kind === 'leadroom' ? target.facing || 'right' : null} />
            )}
          </svg>
        </div>
      </div>
      <p className="text-[13px] text-center mb-4 font-medium" style={{ color: ok ? '#1F8A3B' : '#777' }}>
        {cue}
      </p>
      {!locked && (
        <Button
          className="w-full"
          onClick={() =>
            onResult(ok, step.keeper ? { shot: { kind: 'compose', scene: step.scene, x: pos.x, y: pos.y, ...(target.facing ? { facing: target.facing } : {}) } } : undefined)
          }
        >
          {step.keeper ? <><Shutter /> Take the shot</> : 'Check'}
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

// A held (non-adjustable) factor — shown so the learner knows it's fixed this step.
function FixedRow({ label, value }) {
  return (
    <div className="flex items-center justify-between mb-2 text-[13px] text-muted/70">
      <span>{label}</span>
      <span className="font-mono">{value} · fixed</span>
    </div>
  )
}

function Silhouette({ kind, x, groundY, h, color, blur, opacity }) {
  const style = { filter: blur ? `blur(${blur}px)` : undefined, opacity }
  if (kind === 'flower') {
    const cyB = groundY - h * 0.78
    const petals = [0, 1, 2, 3, 4].map((k) => {
      const a = ((-90 + k * 72) * Math.PI) / 180
      return [x + Math.cos(a) * h * 0.17, cyB + Math.sin(a) * h * 0.17]
    })
    return (
      <g style={style}>
        <rect x={x - h * 0.025} y={cyB} width={h * 0.05} height={groundY - cyB} fill={color} />
        <ellipse cx={x - h * 0.14} cy={groundY - h * 0.34} rx={h * 0.13} ry={h * 0.05} fill={color} transform={`rotate(-28 ${x - h * 0.14} ${groundY - h * 0.34})`} />
        {petals.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={h * 0.12} fill={color} />
        ))}
        <circle cx={x} cy={cyB} r={h * 0.11} fill={color} />
      </g>
    )
  }
  if (kind === 'rock')
    return (
      <g style={style}>
        <ellipse cx={x} cy={groundY - h * 0.22} rx={h * 0.55} ry={h * 0.4} fill={color} />
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
  // person — a smooth head-and-shoulders portrait bust
  const headR = h * 0.15
  const headCy = groundY - h * 0.8
  const sw = h * 0.52
  return (
    <g style={style}>
      <ellipse cx={x} cy={headCy} rx={headR * 0.9} ry={headR} fill={color} />
      <path
        d={`M ${x - sw} ${groundY} C ${x - sw} ${groundY - h * 0.4}, ${x - h * 0.26} ${headCy + headR * 0.5}, ${x} ${headCy + headR * 0.5} C ${x + h * 0.26} ${headCy + headR * 0.5}, ${x + sw} ${groundY - h * 0.4}, ${x + sw} ${groundY} Z`}
        fill={color}
      />
    </g>
  )
}

function DofView({ step, status, onResult }) {
  const init = { focal: 50, fnum: 5.6, distM: 3, sensor: 'Full frame', ...(step.lock || {}), ...(step.start || {}) }
  const controls = step.controls || ['distance', 'focal', 'aperture']
  const [fi, setFi] = useState(Math.max(0, FOCALS.indexOf(init.focal)))
  const [ai, setAi] = useState(Math.max(0, APS_D.indexOf(init.fnum)))
  const [distM, setDistM] = useState(init.distM)
  const [sensorKey, setSensorKey] = useState(init.sensor)
  const [imperial, setImperial] = useState(true)
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
    { kind: 'flower', dist: u * 0.5 }, // foreground bouquet (like the dofsimulator reference)
    { kind: 'person', dist: u }, // the portrait subject
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

      {controls.includes('aperture') ? (
        <SliderRow label="Aperture" value={`f/${fnum % 1 === 0 ? fnum : fnum.toFixed(1)}`}>
          <Slider value={ai} min={0} max={APS_D.length - 1} step={1} onChange={setAi} ariaLabel="Aperture" />
        </SliderRow>
      ) : (
        <FixedRow label="Aperture" value={`f/${fnum % 1 === 0 ? fnum : fnum.toFixed(1)}`} />
      )}
      {controls.includes('distance') ? (
        <SliderRow label="Distance" value={dist(u)}>
          <Slider value={distM} min={0.5} max={12} step={0.1} onChange={setDistM} ariaLabel="Subject distance" />
        </SliderRow>
      ) : (
        <FixedRow label="Distance" value={dist(u)} />
      )}
      {controls.includes('focal') ? (
        <SliderRow label="Focal length" value={`${focal}mm`}>
          <Slider value={fi} min={0} max={FOCALS.length - 1} step={1} onChange={setFi} ariaLabel="Focal length" />
        </SliderRow>
      ) : (
        <FixedRow label="Focal length" value={`${focal}mm`} />
      )}
      {controls.includes('sensor') && (
        <div className="mb-3">
          <div className="text-[13px] text-muted mb-1">Sensor size</div>
          <div className="flex gap-1.5 flex-wrap">
            {Object.keys(SENSORS).map((k) => (
              <button key={k} onClick={() => setSensorKey(k)} className="px-2.5 py-1 rounded-[8px] text-[12px]" style={{ background: k === sensorKey ? '#141414' : '#F2F2F2', color: k === sensorKey ? '#fff' : '#666' }}>
                {k}
              </button>
            ))}
          </div>
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

// One frame of the road scene. The LIVE preview always draws the car sharp (si=0)
// — your eyes don't see motion blur. Blur only appears in a CAPTURED frame.
function drawRoad(ctx, W, H, x, si, dashOff) {
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#CFE6F5'
  ctx.fillRect(0, 0, W, H * 0.6)
  ctx.fillStyle = '#5C6168'
  ctx.fillRect(0, H * 0.6, W, H * 0.4)
  ctx.fillStyle = '#E9E9E9'
  for (let i = -1; i * 72 - dashOff < W; i++) ctx.fillRect(i * 72 - dashOff, H * 0.78, 38, 5)
  const carH = H * 0.17
  const baseY = H * 0.73
  const blurLen = (si / 7) * W * 0.45
  const steps = Math.max(1, Math.round(blurLen / 6))
  ctx.fillStyle = '#1E2230'
  for (let i = steps; i >= 1; i--) {
    ctx.globalAlpha = 0.1
    drawCar(ctx, x - (i / steps) * blurLen, baseY, carH)
  }
  ctx.globalAlpha = si === 0 ? 1 : 0.92
  drawCar(ctx, x, baseY, carH)
  ctx.globalAlpha = 1
}

// The motion keepsake — re-rendered deterministically from the shutter index `si`
// (NO stored pixels; a base64 JPEG in the Firestore user doc was a self-DoS toward
// the 1MiB cap). Used by PolaroidReveal + the Home roll.
export function MotionShot({ si, size = 228, rounded = true, fill = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    drawRoad(c.getContext('2d'), c.width, c.height, c.width * 0.6, si, 0)
  }, [si])
  return (
    <canvas
      ref={ref}
      width={size * 2}
      height={size}
      className={`block ${fill ? 'w-full h-full object-cover' : 'w-full'} ${rounded ? 'rounded-tile' : ''}`}
      style={fill ? undefined : { aspectRatio: '2 / 1' }}
      aria-hidden="true"
    />
  )
}

function MotionView({ step, status, onResult }) {
  const [si, setSi] = useState(step.start ?? 5)
  const [captured, setCaptured] = useState(null) // { x, si, dashOff } once the shutter fires
  const ref = useRef(null)
  const raf = useRef(null)
  const siRef = useRef(si)
  siRef.current = si
  const xRef = useRef(-80)
  const dashRef = useRef(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    // Captured: draw the frozen photo ONCE — no perpetual rAF (it used to repaint a
    // static frame at 60fps forever, pure battery burn).
    if (captured) {
      drawRoad(ctx, W, H, captured.x, captured.si, captured.dashOff)
      return
    }
    // Reduced motion: a single static frame, no animation loop.
    if (reduced) {
      xRef.current = W * 0.5
      dashRef.current = 0
      drawRoad(ctx, W, H, xRef.current, 0, 0)
      return
    }
    // Live: the car drives across, sharp (your eyes do not see motion blur).
    let startT = null
    const speed = (W + 160) / 2600
    const frame = (now) => {
      if (startT == null) startT = now
      const t = now - startT
      const x = ((t * speed) % (W + 160)) - 80
      const dashOff = (t * speed) % 72
      xRef.current = x
      dashRef.current = dashOff
      drawRoad(ctx, W, H, x, 0, dashOff)
      raf.current = requestAnimationFrame(frame)
    }
    raf.current = requestAnimationFrame(frame)
    return () => raf.current && cancelAnimationFrame(raf.current)
  }, [captured, reduced])

  function shoot() {
    const s = siRef.current
    // Store re-renderable PARAMS, never pixels — the keepsake renders from `si`.
    setCaptured({ x: xRef.current, si: s, dashOff: dashRef.current })
    onResult(step.check(s), { chosen: s, shot: { kind: 'motion', si: s } })
  }

  const frozen = captured && captured.si <= 1
  return (
    <div className="animate-risein">
      <Prompt>{step.prompt}</Prompt>
      <div className="rounded-tile overflow-hidden border border-hairline mb-3 relative">
        <canvas ref={ref} width={600} height={300} className="w-full block" style={{ aspectRatio: '2 / 1' }} />
        {captured && (
          <span className="absolute top-2 left-2 text-[11px] font-medium text-white px-2 py-0.5 rounded-full" style={{ background: 'rgba(20,20,20,0.6)' }}>
            your photo
          </span>
        )}
      </div>

      {captured ? (
        <>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[20px] font-medium">{TRI_SHUT[captured.si]}s</span>
            <span className="text-[13px]" style={{ color: frozen ? '#1F8A3B' : '#666' }}>
              {frozen ? 'Frozen sharp' : 'The car moved while the shutter was open — motion blur'}
            </span>
          </div>
          {status !== 'correct' && (
            <Button variant="ghost" className="w-full" onClick={() => setCaptured(null)}>
              Retake
            </Button>
          )}
        </>
      ) : (
        <>
          <p className="text-[13px] text-muted mb-3">
            Your eyes see the car sharp. Set the shutter speed, then take the shot.
          </p>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-[22px] font-medium">{TRI_SHUT[si]}s</span>
          </div>
          <Slider value={si} min={0} max={7} step={1} onChange={setSi} ariaLabel="Shutter speed" />
          <div className="flex justify-between text-[11px] text-muted mb-4 mt-2">
            <span>1/1000 · freeze</span>
            <span>1/8 · blur</span>
          </div>
          <Button className="w-full" onClick={shoot}>
            <Shutter /> Take the shot
          </Button>
        </>
      )}
    </div>
  )
}

/* ---------- rank (tap tiles into the correct order — replaces multiple choice) ---------- */
function RankView({ step, status, onResult }) {
  const [placed, setPlaced] = useState([])
  const locked = status === 'correct'
  const items = step.items
  const inTray = items.map((_, i) => i).filter((i) => !placed.includes(i))
  const full = placed.length === items.length

  function placeTile(i) {
    if (locked || placed.includes(i)) return
    setPlaced((p) => [...p, i])
  }
  function removeAt(pos) {
    if (locked) return
    setPlaced((p) => p.filter((_, idx) => idx !== pos))
  }
  function check() {
    onResult(JSON.stringify(placed) === JSON.stringify(step.solution), { chosen: placed.join(',') })
  }

  return (
    <div className="animate-risein">
      <Prompt>{step.prompt}</Prompt>
      {step.scale && (
        <div className="flex justify-between text-[12px] text-muted mb-2 px-1">
          <span>← {step.scale[0]}</span>
          <span>{step.scale[1]} →</span>
        </div>
      )}
      <div className="flex gap-2 mb-4">
        {items.map((_, pos) => {
          const idx = placed[pos]
          const filled = idx != null
          return (
            <button
              key={pos}
              disabled={locked || !filled}
              onClick={() => removeAt(pos)}
              className="flex-1 h-14 rounded-tile flex items-center justify-center font-mono text-[13px] leading-tight text-center px-1 transition"
              style={{
                border: `2px ${filled ? 'solid' : 'dashed'} ${filled ? '#141414' : '#E5E5E5'}`,
                background: filled ? '#fff' : '#FAFAFA',
              }}
            >
              {filled ? items[idx].label : <span className="text-muted/50 text-[12px]">{pos + 1}</span>}
            </button>
          )
        })}
      </div>
      <div className="flex gap-2 flex-wrap mb-5 min-h-[46px]">
        {inTray.map((i) => (
          <button
            key={i}
            disabled={locked}
            onClick={() => placeTile(i)}
            className="px-3 py-2.5 rounded-tile border border-hairline font-mono text-[13px] bg-white shadow-tile active:translate-y-[1px]"
          >
            {items[i].label}
          </button>
        ))}
        {inTray.length === 0 && !locked && (
          <span className="text-[12px] text-muted self-center">Tap a slot to move it back</span>
        )}
      </div>
      {!locked && (
        <Button className="w-full" disabled={!full} onClick={check}>
          Check the order
        </Button>
      )}
    </div>
  )
}

/* ---------- bokeh (Depth of field: any of the four DoF levers drive the melt) ---------- */
const BOKEH_CTRL = {
  aperture: { label: 'Aperture', ends: ['f/1.4 · wide', 'f/16 · narrow'] },
  subjectDist: { label: 'Distance to subject', ends: ['up close', 'far back'] },
  bgDist: { label: 'Background distance', ends: ['just behind', 'far away'] },
  focal: { label: 'Focal length', ends: ['wide-angle', 'telephoto'] },
}
function BokehView({ step, status, onResult }) {
  const controls = Array.isArray(step.control) ? step.control : [step.control || 'aperture']
  const base = { f: 5.6, subjectDist: 0.5, bgDist: 0.4, focal: 0.3, ...(step.lock || {}), ...(step.start || {}) }
  const [fi, setFi] = useState(Math.max(0, BOKEH_STOPS.indexOf(base.f)))
  const [subjectDist, setSubjectDist] = useState(base.subjectDist)
  const [bgDist, setBgDist] = useState(base.bgDist)
  const [focal, setFocal] = useState(base.focal)
  const locked = status === 'correct'
  const f = BOKEH_STOPS[fi]
  const blur = effectiveBlur({ f, subjectDist, bgDist, focal })

  const ui = {
    aperture: { value: fi, min: 0, max: BOKEH_STOPS.length - 1, step: 1, set: setFi, valueText: `f/${fmtF(f)}` },
    subjectDist: { value: subjectDist, min: 0, max: 1, step: 0.05, set: setSubjectDist, valueText: `${Math.round((1 - subjectDist) * 100)}% close` },
    bgDist: { value: bgDist, min: 0, max: 1, step: 0.05, set: setBgDist, valueText: `${Math.round(bgDist * 100)}% far` },
    focal: { value: focal, min: 0, max: 1, step: 0.05, set: setFocal, valueText: `${Math.round(focal * 100)}% tele` },
  }

  return (
    <div className="animate-risein">
      <Prompt>{step.prompt}</Prompt>
      <div className="flex justify-center mb-4">
        <DofBokeh f={f} subjectDist={subjectDist} bgDist={bgDist} focal={focal} bg={step.bg || 'garden'} size={300} />
      </div>
      {controls.includes('aperture') && (
        <div className="flex items-center gap-4 mb-3">
          <ApertureIris f={f} />
          <span className="font-mono text-[26px] font-medium leading-none">f/{fmtF(f)}</span>
        </div>
      )}
      {controls.map((c) => {
        const s = ui[c]
        return (
          <div key={c} className="mb-3">
            <div className="text-[13px] text-muted mb-1">{BOKEH_CTRL[c].label}</div>
            <Slider value={s.value} min={s.min} max={s.max} step={s.step} onChange={s.set} ariaLabel={BOKEH_CTRL[c].label} valueText={s.valueText} />
            <div className="flex justify-between text-[11px] text-muted mt-1">
              <span>{BOKEH_CTRL[c].ends[0]}</span>
              <span>{BOKEH_CTRL[c].ends[1]}</span>
            </div>
          </div>
        )
      })}
      {!locked && (
        <Button
          className="w-full mt-2"
          onClick={() => onResult(step.check(blur), { chosen: Math.round(blur), shot: { kind: 'bokeh', f, subjectDist, bgDist, focal, bg: step.bg || 'garden' } })}
        >
          <Shutter /> Take the shot
        </Button>
      )}
    </div>
  )
}

/* ---------- light-direction (Light & Direction: direction · softness · warmth) ---------- */
const LD_CFG = {
  angle: { min: 0, max: 180, step: 1, label: 'Light direction', ends: ['front · flat', 'behind · rim'], readout: (v) => `${Math.round(v)}°` },
  soft: { min: 0, max: 1, step: 0.02, label: 'Softness', ends: ['hard · crisp', 'soft · gentle'], readout: (v) => `${Math.round(v * 100)}%` },
  warmth: { min: -0.4, max: 1, step: 0.02, label: 'Warmth', ends: ['cool · midday', 'warm · golden'], readout: (v) => (v >= 0.45 ? 'golden' : v <= -0.1 ? 'cool' : 'neutral') },
}
function LightDirView({ step, status, onResult }) {
  const init = { angle: 90, soft: 0.4, warmth: 0, ...(step.fixed || {}), ...(step.start || {}) }
  const controls = step.controls || [step.control || 'angle']
  const [angle, setAngle] = useState(init.angle)
  const [soft, setSoft] = useState(init.soft)
  const [warmth, setWarmth] = useState(init.warmth)
  const locked = status === 'correct'
  const val = { angle, soft, warmth }
  const setter = { angle: setAngle, soft: setSoft, warmth: setWarmth }
  return (
    <div className="animate-risein">
      <Prompt>{step.prompt}</Prompt>
      <div className="flex justify-center mb-4">
        <LightDirection angle={angle} soft={soft} warmth={warmth} size={300} />
      </div>
      {controls.map((c) => {
        const cfg = LD_CFG[c]
        return (
          <div key={c} className="mb-3">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-[18px] font-medium">{cfg.readout(val[c])}</span>
              <span className="text-[12px] text-muted">{cfg.label}</span>
            </div>
            <Slider value={val[c]} min={cfg.min} max={cfg.max} step={cfg.step} onChange={setter[c]} ariaLabel={cfg.label} valueText={String(cfg.readout(val[c]))} />
            <div className="flex justify-between text-[11px] text-muted mt-1">
              <span>{cfg.ends[0]}</span>
              <span>{cfg.ends[1]}</span>
            </div>
          </div>
        )
      })}
      {!locked && (
        <Button
          className="w-full mt-2"
          onClick={() => onResult(step.check(val), { chosen: controls.map((c) => val[c]).join(','), shot: { kind: 'light', angle, soft, warmth } })}
        >
          <Shutter /> Take the shot
        </Button>
      )}
    </div>
  )
}

/* ---------- eyedropper (White balance: click a neutral surface to set WB) ---------- */
// Click-white-balance: sample a cell, solve the temperature that neutralises its
// warm/cool imbalance (rF=1+0.32·eff on red, bF=1-0.32·eff on blue → eff that makes
// the clicked cell's red = blue). Tap the gray card and the whole scene snaps neutral;
// tap a warm wall and it tints the wrong way — the felt lesson of WHY you need a
// known-neutral reference.
function EyedropView({ step, status, onResult }) {
  const base = step.baseTemp || 0
  const [temp, setTemp] = useState(step.start?.temp ?? 0)
  const [picked, setPicked] = useState(false)
  const frame = useRef(null)
  const locked = status === 'correct'
  const N = 32
  const cells = getScene(step.scene, N).cells

  function pick(e) {
    if (locked) return
    const rect = frame.current.getBoundingClientRect()
    const col = clampN(Math.floor(((e.clientX - rect.left) / rect.width) * N), 0, N - 1)
    const row = clampN(Math.floor(((e.clientY - rect.top) / rect.height) * N), 0, N - 1)
    const px = cells[row][col]
    const br = px[0]
    const bb = px[2]
    const eff = (bb - br) / (0.32 * (br + bb) || 1) // temp that equalises this cell's red & blue
    setTemp(clampN(eff - base, -1, 1))
    setPicked(true)
  }

  return (
    <div className="animate-risein">
      <Prompt>{step.prompt}</Prompt>
      <div className="relative mx-auto mb-3" style={{ maxWidth: 300 }}>
        <PixelScene scene={step.scene} size={300} temp={temp} baseTemp={base} />
        <div ref={frame} onClick={pick} className="absolute inset-0 rounded-tile cursor-crosshair" />
      </div>
      <p className="text-[13px] text-center mb-4" style={{ color: picked ? '#1F8A3B' : '#777' }}>
        {picked ? 'Sampled — tap a different spot to try another, or take the shot.' : 'Tap the surface that should be a neutral gray.'}
      </p>
      {!locked && (
        <Button
          className="w-full"
          disabled={!picked}
          onClick={() => onResult(step.check(temp), { chosen: temp, shot: { scene: step.scene, params: { temp, baseTemp: base } } })}
        >
          <Shutter /> Take the shot
        </Button>
      )}
    </div>
  )
}

export const STEP_VIEWS = {
  intro: IntroView,
  eyedropper: EyedropView,
  capture: CaptureView,
  'slider-sim': SliderSimView,
  triangle: TriangleView,
  compose: ComposeView,
  dof: DofView,
  bokeh: BokehView,
  'light-direction': LightDirView,
  motion: MotionView,
  rank: RankView,
}
