import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { skills } from '../content/course.js'
import { selectDue, interleave, nextDueAt, humanizeIn } from '../lib/spacing.js'
import PracticeSession from '../engine/PracticeSession.jsx'
import { Button, Card, Logo } from '../components/ui.jsx'
import PixelScene from '../sim/PixelScene.jsx'

const SESSION_CAP = 8 // a focused sitting; the rest stay due for the next one

// A small strength pip (filled boxes = Leitner box). Calm, not a score.
function StrengthPips({ box }) {
  return (
    <span className="inline-flex gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[6px] h-[6px] rounded-[1px]"
          style={{ background: i < box ? 'var(--pear, #D8E82E)' : 'var(--hairline, #E5E5E5)' }}
        />
      ))}
    </span>
  )
}

function SkillRow({ skill, state }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium truncate">{skill.title}</div>
        <div className="text-[12px] text-muted truncate">{skill.chapterTitle}</div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[11px] text-muted">Ready</span>
        <StrengthPips box={state?.box || 0} />
      </div>
    </div>
  )
}

export default function PracticePage() {
  const navigate = useNavigate()
  const { progress, courseId } = useApp()
  const [mode, setMode] = useState('hub') // hub | session | summary
  const [sessionSkills, setSessionSkills] = useState([])
  const [result, setResult] = useState(null)

  const reviewSkills = progress.review?.skills || {}
  const completed = progress.courses[courseId]?.completedLessonIds || []

  // Recompute whenever progress changes (a finished session reschedules its skills).
  const { learned, due } = useMemo(() => {
    const now = Date.now()
    const completedSet = new Set(completed)
    const learnedList = skills.filter((s) => completedSet.has(s.lessonId))
    const dueList = interleave(selectDue(skills, reviewSkills, completed, now))
    return { learned: learnedList, due: dueList }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress])

  function startSession() {
    setSessionSkills(due.slice(0, SESSION_CAP))
    setMode('session')
  }

  if (mode === 'session') {
    return (
      <PracticeSession
        skills={sessionSkills}
        onExit={() => setMode('hub')}
        onDone={(r) => {
          setResult(r)
          setMode('summary')
        }}
      />
    )
  }

  if (mode === 'summary') {
    const { total, firstTry } = result
    const missed = total - firstTry
    const stillDue = due.length // recomputed: just-reviewed skills are no longer due
    return (
      <div className="min-h-[100dvh] max-w-col w-full mx-auto px-5 py-10 flex flex-col justify-center text-center animate-pop">
        <div className="flex justify-center mb-6">
          <PixelScene scene="landscape" size={180} />
        </div>
        <div className="inline-flex self-center items-center gap-2 bg-correct-bg text-correct-ink font-medium px-4 py-1.5 rounded-full mb-4">
          Review complete
        </div>
        <h1 className="text-[24px] font-semibold tracking-tight mb-2">
          {firstTry} of {total} recalled first try
        </h1>
        <p className="text-muted mb-8">
          {missed === 0
            ? 'All from memory — that recall is what makes it stick. These move further out.'
            : `The ${missed} you reached for come back sooner; the rest move further out. Spacing does the work.`}
        </p>
        <div className="flex flex-col gap-3">
          {stillDue > 0 ? (
            <Button onClick={startSession}>Review {stillDue} more</Button>
          ) : null}
          <Button variant={stillDue > 0 ? 'ghost' : 'primary'} onClick={() => setMode('hub')}>
            Back to review
          </Button>
          <button
            onClick={() => navigate('/')}
            className="text-[13px] text-muted hover:text-ink transition mt-1 px-3 py-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link/50"
          >
            Home
          </button>
        </div>
      </div>
    )
  }

  // ── hub
  const now = Date.now()
  const next = nextDueAt(skills, reviewSkills, completed, now)

  return (
    <div className="min-h-[100dvh] max-w-col w-full mx-auto px-5 py-6 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <Logo />
        <button
          onClick={() => navigate('/')}
          className="text-[13px] text-muted hover:text-ink transition rounded-md px-3 py-2.5 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link/50"
        >
          Home
        </button>
      </header>

      <div>
        <h1 className="text-[27px] font-semibold tracking-tight leading-tight">Daily Review</h1>
        <p className="text-muted text-[15px] mt-1">
          Recall from memory on fresh scenes — no hints. Spaced out over days, that’s what makes it stick.
        </p>
      </div>

      {learned.length === 0 ? (
        <Card className="p-5 text-center">
          <div className="flex justify-center mb-4">
            <PixelScene scene="portrait" size={160} />
          </div>
          <h2 className="text-[19px] font-semibold mb-1">Nothing to review yet</h2>
          <p className="text-muted text-[15px] mb-4">
            Practice brings back what you’ve already learned. Finish a lesson and it’ll show up here.
          </p>
          <Button className="w-full" onClick={() => navigate('/course')}>
            Go to the course
          </Button>
        </Card>
      ) : due.length > 0 ? (
        <>
          <Card className="p-5">
            <p className="text-[12px] uppercase tracking-wide text-muted font-medium mb-1">Ready now</p>
            <h2 className="text-[19px] font-semibold mb-1">
              {due.length} skill{due.length === 1 ? '' : 's'} ready to review
            </h2>
            <p className="text-muted text-[14px] mb-4">
              {due.length > SESSION_CAP
                ? `A focused set of ${SESSION_CAP}, mixed across chapters. The rest stay ready.`
                : 'Mixed across chapters — recalling them shuffled is harder, and better.'}
            </p>
            <Button className="w-full" onClick={startSession}>
              Start review ({Math.min(due.length, SESSION_CAP)})
            </Button>
          </Card>

          <div>
            <h3 className="text-[13px] uppercase tracking-wide text-muted font-medium mb-1 px-1">Due</h3>
            <div className="divide-y divide-hairline">
              {due.map((s) => (
                <SkillRow key={s.id} skill={s} state={reviewSkills[s.id]} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <Card className="p-5 text-center">
          <h2 className="text-[19px] font-semibold mb-1">All caught up</h2>
          <p className="text-muted text-[15px]">
            {next
              ? `Nothing to review right now. Come back ${humanizeIn(next - now)} — these resurface just as memory starts to fade.`
              : 'Nothing to review right now. Finish a lesson and it’ll come back here when it’s worth a second look.'}
          </p>
        </Card>
      )}
    </div>
  )
}
