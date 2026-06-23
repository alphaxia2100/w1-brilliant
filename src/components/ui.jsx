// Shared UI kit — the tactile, calm design system in component form.

export function Button({ variant = 'primary', className = '', children, ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-key px-5 py-3.5 text-base ' +
    'transition-[transform,box-shadow] duration-150 ease-pop select-none disabled:opacity-40 ' +
    'disabled:cursor-not-allowed active:translate-y-[2px]'
  const styles = {
    primary: 'bg-pear text-pear-ink shadow-key active:shadow-keyPress',
    dark: 'bg-ink text-white shadow-[0_4px_0_0_#000] active:shadow-[0_2px_0_0_#000]',
    ghost: 'bg-white text-ink border border-hairline shadow-tile active:shadow-none hover:bg-surface',
  }
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Card({ className = '', children }) {
  return (
    <div className={`bg-white rounded-big border border-hairline ${className}`}>{children}</div>
  )
}

export function Slider({ value, min, max, step = 1, onChange, ariaLabel }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <input
      type="range"
      className="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{
        background: `linear-gradient(90deg, var(--pear) ${pct}%, var(--hairline) ${pct}%)`,
      }}
    />
  )
}

// Segmented progress bar across a lesson's steps.
export function ProgressBar({ total, index }) {
  return (
    <div className="flex gap-1.5 flex-1" aria-label={`Step ${index + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="h-[7px] flex-1 rounded-full transition-colors duration-200"
          style={{ background: i < index ? '#D8E82E' : i === index ? '#141414' : '#E5E5E5' }}
        />
      ))}
    </div>
  )
}

// The animated aperture iris — opening scales with the f-number.
export function ApertureIris({ f, size = 56 }) {
  const t = Math.max(0, Math.min(1, (f - 1.4) / (16 - 1.4)))
  const r = 9 + 25 * (1 - t)
  const N = 7
  const cx = 40
  const cy = 40
  const R = 33
  const pts = []
  const blades = []
  for (let k = 0; k < N; k++) {
    const a = ((-90 + (k * 360) / N + 12) * Math.PI) / 180
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
    const xo = cx + R * Math.cos(a)
    const yo = cy + R * Math.sin(a)
    blades.push(<line key={k} x1={x.toFixed(1)} y1={y.toFixed(1)} x2={xo.toFixed(1)} y2={yo.toFixed(1)} stroke="#4A4A4A" strokeWidth="1.2" />)
  }
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true" className="shrink-0">
      <circle cx="40" cy="40" r="36" fill="#1E1E1E" />
      <circle cx="40" cy="40" r="33" fill="#2A2A2A" />
      <polygon points={pts.join(' ')} fill="#BFE2F0" />
      {blades}
    </svg>
  )
}

export function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold text-ink ${className}`}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#141414" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="#D8E82E" />
      </svg>
      Aperture
    </span>
  )
}
