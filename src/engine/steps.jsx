import { useRef, useState } from 'react'
import PixelScene from '../sim/PixelScene.jsx'
import { meanBrightness } from '../sim/scene.js'
import { Slider, Button, ApertureIris } from '../components/ui.jsx'

// The one shared feedback panel — calm gray when wrong, never red.
export function Feedback({ status, message }) {
  if (status === 'idle') return null
  const correct = status === 'correct'
  return (
    <div
      className="rounded-tile px-4 py-3 text-[15px] leading-snug animate-pop"
      style={{
        background: correct ? '#D4F5DD' : '#E5E5E5',
        color: correct ? '#00370F' : '#383838',
      }}
      role="status"
    >
      <span className="font-medium">{correct ? 'Nice. ' : 'Not quite. '}</span>
      {message}
    </div>
  )
}

function Prompt({ children }) {
  return <p className="text-[18px] leading-snug font-medium mb-4">{children}</p>
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
        <Button className="w-full" disabled={sel === null} onClick={() => onResult(sel === step.answer)}>
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
        onResult(inBand, inBand ? undefined : msg)
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
          {busy ? 'Exposing…' : 'Take the photo'}
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
        <Button className="w-full" onClick={() => onResult(step.check(value))}>
          Check
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

  // Each control's light contribution in stops, relative to a neutral middle.
  const sum = 4 - ai + (si - 4) + (ii - 2)
  const params = {
    exposure: sum * 0.7, // gentle: a balanced shot looks right, a misbalanced one reads bright/dark not blown
    aperture: TRI_APS[ai],
    motion: Math.round(Math.max(0, si - 2) * 0.9),
    iso: clampN(Math.log2(TRI_ISOS[ii] / 100) * 14, 0, 110),
  }
  const angle = clampN(sum * 5, -28, 28)
  const balanced = Math.abs(sum) < 0.5

  function check() {
    if (balanced) onResult(true)
    else
      onResult(
        false,
        sum > 0
          ? 'Too bright — remove light: narrow the aperture (higher f-number), use a faster shutter, or lower the ISO.'
          : 'Too dark — add light: open the aperture (lower f-number), slow the shutter, or raise the ISO.',
      )
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
          Check
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
}
