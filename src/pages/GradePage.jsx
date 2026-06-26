import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { httpsCallable } from 'firebase/functions'
import { functions, firebaseEnabled } from '../lib/firebase.js'
import { Button, Card, Logo } from '../components/ui.jsx'

// Downscale + JPEG-compress in the browser so the upload stays small (and within
// the callable-function payload limit) before it ever leaves the device.
function downscale(file, maxEdge = 1280, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve({ dataUrl, base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Couldn't read that image."))
    }
    img.src = url
  })
}

const SCORE_COLOR = (s) => (s >= 8 ? '#1B7D35' : s >= 5 ? '#8A6D14' : '#B0563B')

function ScoreRing({ value }) {
  const r = 34
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value)) / 100
  return (
    <div className="relative shrink-0" style={{ width: 88, height: 88 }}>
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#EDEDED" strokeWidth="7" />
        <circle
          cx="40" cy="40" r={r} fill="none" stroke="#D8E82E" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[24px] font-semibold leading-none">{value}</span>
        <span className="text-[10px] text-muted">/ 100</span>
      </div>
    </div>
  )
}

export default function GradePage() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [photo, setPhoto] = useState(null) // { dataUrl, base64, mimeType }
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function pick(file) {
    if (!file) return
    setError('')
    setResult(null)
    try {
      setPhoto(await downscale(file))
    } catch (e) {
      setError(e.message || "Couldn't read that image.")
    }
  }

  async function grade() {
    if (!photo) return
    if (!firebaseEnabled || !functions) {
      setError('The grader needs the deployed backend — it isn’t available in local mode.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const call = httpsCallable(functions, 'gradePhoto')
      const res = await call({ imageBase64: photo.base64, mimeType: photo.mimeType })
      setResult(res.data)
    } catch (e) {
      const code = e?.code || ''
      const raw = (e?.message || '').replace('FirebaseError: ', '')
      const friendly = 'The grader had trouble — please try again in a moment.'
      setError(
        code === 'functions/unauthenticated'
          ? 'Please sign in to grade a photo.'
          : code === 'functions/not-found'
            ? 'The grader isn’t available yet — it needs to be deployed.'
            : // surface real HttpsError sentences, but never a bare code like "internal"
              raw && raw.length > 14 && raw !== 'internal'
              ? raw
              : friendly,
      )
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setPhoto(null)
    setResult(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="min-h-[100dvh] max-w-col w-full mx-auto px-5 py-6 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <Logo />
        <button onClick={() => navigate('/')} className="text-[13px] text-muted hover:text-ink transition">
          Home
        </button>
      </header>

      <div>
        <h1 className="text-[26px] font-semibold tracking-tight leading-tight">Grade my photo</h1>
        <p className="text-muted text-[15px] mt-1">
          Upload one of your own shots. A coach grades it on the six fundamentals you’re learning.
        </p>
      </div>

      {/* Upload / preview */}
      <Card className="p-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
        {photo ? (
          <div className="flex flex-col gap-3">
            <img src={photo.dataUrl} alt="Your upload" className="w-full rounded-tile object-contain max-h-[44vh] bg-surface" />
            {!result && (
              <div className="flex gap-2">
                <Button className="flex-1" disabled={busy} onClick={grade}>
                  {busy ? 'Developing your grade…' : 'Grade my photo'}
                </Button>
                <Button variant="ghost" disabled={busy} onClick={() => fileRef.current?.click()}>
                  Change
                </Button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-tile border-2 border-dashed border-hairline bg-surface/60 py-12 px-4 flex flex-col items-center gap-2 hover:bg-surface transition"
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" strokeWidth="1.6" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="12" cy="12" r="3.2" />
              <path d="M8 5l1.2-2h5.6L16 5" />
            </svg>
            <span className="text-[15px] font-medium">Tap to choose a photo</span>
            <span className="text-[12px] text-muted">JPEG, PNG, or WebP — it’s resized on your device first</span>
          </button>
        )}
      </Card>

      {error && <p className="text-[14px] text-danger -mt-2">{error}</p>}

      {busy && !result && (
        <p className="text-[13px] text-muted text-center animate-pulse">Reading the light, the focus, the frame…</p>
      )}

      {/* Result */}
      {result && (
        <div className="flex flex-col gap-4 animate-risein">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <ScoreRing value={result.overall} />
              <p className="text-[16px] leading-snug">{result.verdict}</p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-[13px] uppercase tracking-wide text-muted font-medium mb-3">The six fundamentals</h2>
            <div className="flex flex-col gap-3.5">
              {(result.dimensions || []).map((d) => (
                <div key={d.name}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[14px] font-medium">{d.name}</span>
                    <span className="font-mono text-[13px]" style={{ color: SCORE_COLOR(d.score) }}>{d.score}/10</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-hairline overflow-hidden mb-1">
                    <div className="h-full rounded-full" style={{ width: `${d.score * 10}%`, background: SCORE_COLOR(d.score) }} />
                  </div>
                  <p className="text-[13px] text-ink/75 leading-snug">{d.note}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {result.strengths?.length > 0 && (
              <Card className="p-5">
                <h2 className="text-[13px] uppercase tracking-wide font-medium mb-2" style={{ color: '#1B7D35' }}>What’s working</h2>
                <ul className="flex flex-col gap-1.5">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-[14px] leading-snug flex gap-2"><span style={{ color: '#1B7D35' }}>✓</span>{s}</li>
                  ))}
                </ul>
              </Card>
            )}
            {result.improvements?.length > 0 && (
              <Card className="p-5">
                <h2 className="text-[13px] uppercase tracking-wide text-muted font-medium mb-2">Try next</h2>
                <ul className="flex flex-col gap-1.5">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="text-[14px] leading-snug flex gap-2"><span className="text-muted">→</span>{s}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {result.nextLesson?.id && (
            <button
              onClick={() => navigate(`/lesson/${result.nextLesson.id}`)}
              className="text-left bg-surface rounded-big p-5 transition hover:bg-hairline/60"
            >
              <p className="text-[12px] uppercase tracking-wide text-muted font-medium mb-1">Practice this next</p>
              <h3 className="text-[17px] font-semibold">{result.nextLesson.title}</h3>
              <p className="text-muted text-[14px] mt-0.5">{result.nextLesson.why}</p>
            </button>
          )}

          <Button variant="ghost" className="w-full" onClick={reset}>
            Grade another photo
          </Button>
        </div>
      )}
    </div>
  )
}
