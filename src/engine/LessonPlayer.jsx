import { useEffect, useState } from 'react'
import { useApp } from '../store.jsx'
import { STEP_VIEWS, Feedback } from './steps.jsx'
import { Button, ProgressBar } from '../components/ui.jsx'

// The universal lesson loop: render step → act → check → feedback → next.
export default function LessonPlayer({ lesson, onExit, onComplete }) {
  const { saveResume, recordAttempt } = useApp()
  const [idx, setIdx] = useState(Math.min(lesson.resumeStepIndex || 0, lesson.steps.length - 1))
  const [status, setStatus] = useState('idle')
  const [msg, setMsg] = useState('')

  const step = lesson.steps[idx]
  const isIntro = step.kind === 'intro'
  const isLast = idx + 1 >= lesson.steps.length

  useEffect(() => {
    setStatus('idle')
    setMsg('')
    saveResume(lesson.id, idx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  function handleResult(correct, override) {
    recordAttempt(lesson.id, correct)
    setStatus(correct ? 'correct' : 'wrong')
    setMsg(override || (correct ? step.feedback?.correct : step.feedback?.wrong) || '')
  }

  // When the learner re-engages the control after a miss, clear the stale hint.
  function handleActivity() {
    if (status === 'wrong') {
      setStatus('idle')
      setMsg('')
    }
  }

  function next() {
    if (isLast) onComplete()
    else setIdx((i) => i + 1)
  }

  const View = STEP_VIEWS[step.kind]
  const showContinue = isIntro || status === 'correct'

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-4 pb-2 max-w-col w-full mx-auto">
        <button
          onClick={onExit}
          aria-label="Exit lesson"
          className="text-muted hover:text-ink transition-colors text-xl leading-none w-6"
        >
          ✕
        </button>
        <ProgressBar total={lesson.steps.length} index={idx} />
      </header>

      <main className="flex-1 px-4 pb-4 max-w-col w-full mx-auto flex flex-col">
        <div className="text-[12px] uppercase tracking-wide text-muted/80 font-medium mb-2">
          {lesson.title} · Lesson {lesson.number} of {lesson.totalLessons}
        </div>

        <div className="flex-1">
          <View key={idx} step={step} status={status} onResult={handleResult} onActivity={handleActivity} />
        </div>

        <div className="space-y-3 pt-3 sticky bottom-0 bg-white">
          <Feedback status={status} message={msg} />
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
