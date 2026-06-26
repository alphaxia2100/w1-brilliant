import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { course, getLesson, totalLessons } from '../content/course.js'
import LessonPlayer from '../engine/LessonPlayer.jsx'
import { Button, Logo } from '../components/ui.jsx'
import PixelScene from '../sim/PixelScene.jsx'

const XP_PER_LESSON = 20

function CompletionCard({ lesson, nextLesson, onReplay, stats }) {
  const navigate = useNavigate()
  const correct = stats?.correct || 0
  const wrong = stats?.wrong || 0
  return (
    <div className="min-h-[100dvh] max-w-col w-full mx-auto px-5 py-10 flex flex-col justify-center text-center animate-pop">
      <div className="flex justify-center mb-6">
        <PixelScene scene={lesson.steps.find((s) => s.scene)?.scene || 'landscape'} size={200} />
      </div>
      <div className="inline-flex self-center items-center gap-2 bg-correct-bg text-correct-ink font-medium px-4 py-1.5 rounded-full mb-4">
        Lesson complete · +{XP_PER_LESSON} XP
      </div>
      <h1 className="text-[24px] font-semibold tracking-tight mb-2">{lesson.title}</h1>
      <p className="text-muted mb-3">Nicely done. Your progress is saved.</p>
      <div className="flex justify-center gap-5 text-[14px] mb-8">
        <span className="text-correct-text font-medium">{correct} correct</span>
        <span className="text-muted">{wrong} missed</span>
      </div>

      <div className="flex flex-col gap-3">
        {nextLesson ? (
          <Button onClick={() => navigate(`/lesson/${nextLesson.id}`)}>
            Next: {nextLesson.title}
          </Button>
        ) : (
          <Button onClick={() => navigate('/course')}>Back to the course</Button>
        )}
        <Button variant="ghost" onClick={() => navigate('/course')}>
          See my progress
        </Button>
        <button onClick={onReplay} className="text-[13px] text-muted hover:text-ink transition mt-1 px-3 py-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link/50">
          Replay this lesson
        </button>
      </div>
    </div>
  )
}

export default function LessonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { progress, completeLesson, courseId } = useApp()
  const [completed, setCompleted] = useState(false)
  const [nonce, setNonce] = useState(0)

  // Navigating to a different lesson reuses this component — reset per-lesson state.
  useEffect(() => {
    setCompleted(false)
    setNonce(0)
  }, [id])

  const base = getLesson(id)

  const lesson = useMemo(() => {
    if (!base) return null
    const resumeStepIndex = nonce > 0 ? 0 : progress.courses[courseId]?.lessons[id]?.resumeStepIndex || 0
    return { ...base, totalLessons, resumeStepIndex }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, nonce])

  if (!base) {
    return (
      <div className="min-h-[100dvh] grid place-items-center gap-4 text-center px-6">
        <Logo />
        <p className="text-muted">That lesson doesn’t exist.</p>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Go home
        </Button>
      </div>
    )
  }

  const idx = course.lessons.findIndex((l) => l.id === id)
  const nextLesson = course.lessons[idx + 1] || null

  if (completed) {
    return (
      <CompletionCard
        lesson={base}
        nextLesson={nextLesson}
        stats={progress.courses[courseId]?.lessons[id]}
        onReplay={() => {
          setNonce((n) => n + 1)
          setCompleted(false)
        }}
      />
    )
  }

  return (
    <LessonPlayer
      key={`${id}:${nonce}`}
      lesson={lesson}
      onExit={() => navigate('/course')}
      onComplete={() => {
        completeLesson(id, XP_PER_LESSON)
        setCompleted(true)
      }}
    />
  )
}
