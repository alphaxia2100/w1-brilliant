import { useRef, useState } from 'react'
import { useApp } from '../store.jsx'
import { STEP_VIEWS, Feedback } from './steps.jsx'
import { Button, ProgressBar } from '../components/ui.jsx'

// One calm nudge — never a hint ladder, a show-why, or a live cue. A review that helps
// you isn't a review (BRAINLIFT SPOV 5). The instruments (histogram, loupe, meter) stay;
// they're how you do the task, not the answer.
const WRONG_MSG = 'Not quite — trust what you learned, and take the shot again.'

// An interleaved, UNAIDED spaced-retrieval run over the due skills. Grades each skill on
// its FIRST attempt (the honest recall signal) and reschedules it via the store.
export default function PracticeSession({ skills, onExit, onDone }) {
  const { recordReview } = useApp()
  const [idx, setIdx] = useState(0)
  const [status, setStatus] = useState('idle')
  const [msg, setMsg] = useState('')
  const recorded = useRef(new Set()) // skills whose first attempt has been graded
  const firstTry = useRef(0) // first-attempt recalls — the score that means something
  const lastResultAt = useRef(0)

  const skill = skills[idx]
  const step = skill.item
  const isLast = idx + 1 >= skills.length
  const View = STEP_VIEWS[step.kind]

  // Review mints no keeper and pops no polaroid — recall is its own quiet reward, not a
  // trophy run. (Keepers stay a gallery of LESSON bests; a per-review prize would tug the
  // calm "few minutes" session toward extrinsic collecting.)
  function handleResult(correct) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    if (now - lastResultAt.current < 400) return // swallow accidental double-clicks
    lastResultAt.current = now

    // Schedule update happens once, on the first attempt — a later success after a miss
    // is recognition, not the unaided recall the spacing science depends on.
    if (!recorded.current.has(skill.id)) {
      recorded.current.add(skill.id)
      recordReview(skill.id, correct)
      if (correct) firstTry.current += 1
    }

    if (correct) {
      setStatus('correct')
      setMsg(step.feedback?.correct || '')
      return
    }
    setStatus('wrong')
    setMsg(WRONG_MSG)
  }

  function handleActivity() {}

  function next() {
    if (isLast) {
      onDone({ total: skills.length, firstTry: firstTry.current })
      return
    }
    setStatus('idle')
    setMsg('')
    setIdx((i) => i + 1)
  }

  const showContinue = status === 'correct'
  const barActive = status !== 'idle' || showContinue

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-4 pb-2 max-w-col w-full mx-auto">
        <button
          onClick={onExit}
          aria-label="Exit review"
          className="-ml-2.5 w-11 h-11 grid place-items-center shrink-0 text-muted hover:text-ink transition-colors text-xl leading-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link/50"
        >
          ✕
        </button>
        <ProgressBar total={skills.length} index={idx} />
      </header>

      <main className="flex-1 px-4 pb-4 max-w-col w-full mx-auto flex flex-col">
        <div className="text-[12px] uppercase tracking-wide text-muted font-medium mb-2">
          Daily Review · {skill.chapterTitle} · {idx + 1} of {skills.length}
        </div>

        <p className="sr-only" aria-live="polite" key={`ann-${idx}`}>
          Review {idx + 1} of {skills.length}: {skill.title}.{step.prompt ? ` ${step.prompt}` : ''}
        </p>

        <div className="flex-1">
          <View key={idx} step={step} status={status} onResult={handleResult} onActivity={handleActivity} />
        </div>

        <div
          className={`space-y-3 pt-3 -mx-4 px-4 sticky bottom-0 bg-white ${barActive ? 'pb-3 border-t border-hairline/70 shadow-[0_-6px_18px_-10px_rgba(0,0,0,0.18)]' : ''}`}
        >
          <Feedback status={status} message={msg} showWhy={null} step={step} />
          {showContinue && (
            <Button className="w-full" onClick={next}>
              {isLast ? 'Finish review' : 'Continue'}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
