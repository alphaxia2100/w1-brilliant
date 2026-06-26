import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store.jsx'
import { STEP_VIEWS, Feedback, PolaroidReveal } from './steps.jsx'
import { Button, ProgressBar } from '../components/ui.jsx'

// The universal lesson loop: render step → act → check → feedback → next.
export default function LessonPlayer({ lesson, onExit, onComplete }) {
  const { saveResume, recordAttempt, saveShot } = useApp()
  const [idx, setIdx] = useState(Math.min(lesson.resumeStepIndex || 0, lesson.steps.length - 1))
  const [status, setStatus] = useState('idle')
  const [msg, setMsg] = useState('')
  const [tries, setTries] = useState(0)
  const [showWhy, setShowWhy] = useState(null)
  const [polaroid, setPolaroid] = useState(null)
  const lastResultAt = useRef(0) // debounce accidental double-clicks (real retries are far slower)

  const step = lesson.steps[idx]
  const isIntro = step.kind === 'intro'
  const isLast = idx + 1 >= lesson.steps.length

  useEffect(() => {
    setStatus('idle')
    setMsg('')
    setTries(0)
    setShowWhy(null)
    setPolaroid(null)
    saveResume(lesson.id, idx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  // Guide without revealing. Tier 1 (first miss): a per-option Socratic nudge and
  // a visual "show-why" of the learner's actual choice. Tier 2+: escalating hints
  // that name a lever + direction but never the exact answer/value.
  function handleResult(correct, meta = {}) {
    // Swallow accidental double-clicks: two events fired in the same burst would otherwise
    // double-count attempts (and skip a hint tier on a miss). A deliberate retry is always
    // slower than 400ms because it requires re-interacting first.
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    if (now - lastResultAt.current < 400) return
    lastResultAt.current = now

    recordAttempt(lesson.id, correct)
    // A "shootable" step hands back a shot — KEEPERS ONLY: save it and reveal the polaroid on
    // success; a wrong attempt goes straight to calm feedback (no keepsake). `noKeeper` beats are
    // the deliberately-ruin-the-shot ones (blow/crush highlights, max-noise) — success there means
    // the learner correctly RUINED the frame, so it must NOT be filed as a keeper.
    if (correct && meta.shot && !step.noKeeper) {
      saveShot({ ...meta.shot, lessonId: lesson.id, lessonTitle: lesson.title, stepIndex: idx, verdict: 'keeper' })
      setPolaroid({ ...meta.shot, verdict: 'keeper' })
    }
    const fb = step.feedback || {}
    if (correct) {
      setStatus('correct')
      setMsg(meta.override || fb.correct || '')
      setShowWhy(null)
      return
    }
    setStatus('wrong')
    let m = meta.override
    if (!m) {
      if (lesson.review) {
        // Reviews are spaced RECALL, not a guided lesson: one calm nudge, never the hint ladder
        // or a show-why. (Advertised as "no hints" in /course.)
        m = 'Not quite — trust what you learned, and try again.'
      } else if (tries === 0) {
        const bo = fb.byOption || {}
        m = (meta.chosen != null && bo[meta.chosen]) || (meta.bucket && bo[meta.bucket]) || fb.stages?.[0]
      } else {
        m = fb.stages?.[Math.min(tries, (fb.stages?.length || 1) - 1)]
      }
      if (!m && !lesson.review) {
        const w = fb.wrong // legacy fallback
        m = Array.isArray(w) ? w[Math.min(tries, w.length - 1)] : w
      }
    }
    setMsg(m || '')
    setShowWhy(lesson.review ? null : fb.showWhy ? { ...fb.showWhy, chosen: meta.chosen } : null)
    setTries((t) => t + 1)
  }

  // No-op: the hint and its show-why stay visible while the learner re-adjusts, so
  // they can study the consequence; only a fresh Check advances the hint tier.
  function handleActivity() {}

  function next() {
    if (isLast) {
      onComplete()
      return
    }
    // Reset transient feedback synchronously so the next step never flashes the
    // previous step's green success panel + Continue for a frame.
    setStatus('idle')
    setMsg('')
    setTries(0)
    setShowWhy(null)
    setPolaroid(null)
    setIdx((i) => i + 1)
  }

  const View = STEP_VIEWS[step.kind]
  const showContinue = isIntro || status === 'correct'
  const barActive = status !== 'idle' || showContinue

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {polaroid && <PolaroidReveal shot={polaroid} onDone={() => setPolaroid(null)} />}
      <header className="flex items-center gap-3 px-4 pt-4 pb-2 max-w-col w-full mx-auto">
        <button
          onClick={onExit}
          aria-label="Exit lesson"
          className="-ml-2.5 w-11 h-11 grid place-items-center shrink-0 text-muted hover:text-ink transition-colors text-xl leading-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link/50"
        >
          ✕
        </button>
        <ProgressBar total={lesson.steps.length} index={idx} />
      </header>

      <main className="flex-1 px-4 pb-4 max-w-col w-full mx-auto flex flex-col">
        <div className="text-[12px] uppercase tracking-wide text-muted font-medium mb-2">
          {lesson.title} · Lesson {lesson.number} of {lesson.totalLessons}
        </div>

        <div className="flex-1">
          <View key={idx} step={step} status={status} onResult={handleResult} onActivity={handleActivity} />
        </div>

        <div
          className={`space-y-3 pt-3 -mx-4 px-4 sticky bottom-0 bg-white ${barActive ? 'pb-3 border-t border-hairline/70 shadow-[0_-6px_18px_-10px_rgba(0,0,0,0.18)]' : ''}`}
        >
          <Feedback status={status} message={msg} showWhy={showWhy} step={step} />
          {showContinue && (
            <Button className="w-full" onClick={next}>
              {isLast ? 'Finish lesson' : 'Continue'}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
