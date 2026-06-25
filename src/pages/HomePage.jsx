import { useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { course, getLesson, totalLessons } from '../content/course.js'
import { Button, Card, Logo } from '../components/ui.jsx'
import PixelScene from '../sim/PixelScene.jsx'
import DofBokeh from '../sim/DofBokeh.jsx'
import LightDirection from '../sim/LightDirection.jsx'
import { MotionShot, ComposeShot } from '../engine/steps.jsx'

function ShotThumb({ shot, size = 88 }) {
  const keeper = shot.verdict !== 'experiment'
  return (
    <div
      className="shrink-0 rounded-tile overflow-hidden border border-hairline relative"
      style={{ width: size, height: size }}
      title={shot.lessonTitle}
    >
      {shot.image ? (
        <img src={shot.image} alt="" className="block w-full h-full object-cover" />
      ) : shot.kind === 'bokeh' ? (
        <DofBokeh f={shot.f} subjectDist={shot.subjectDist} bgDist={shot.bgDist} focal={shot.focal} bg={shot.bg} size={size} rounded={false} />
      ) : shot.kind === 'light' ? (
        <LightDirection angle={shot.angle} soft={shot.soft} warmth={shot.warmth} size={size} rounded={false} />
      ) : shot.kind === 'motion' ? (
        <MotionShot si={shot.si} size={size} rounded={false} fill />
      ) : shot.kind === 'compose' ? (
        <ComposeShot scene={shot.scene} x={shot.x} y={shot.y} facing={shot.facing} size={size} rounded={false} fill />
      ) : (
        <PixelScene scene={shot.scene} size={size} rounded={false} {...shot.params} />
      )}
      <span
        className="absolute bottom-0 inset-x-0 text-[9px] text-center py-0.5 text-white"
        style={{ background: keeper ? 'rgba(31,138,59,0.74)' : 'rgba(20,20,20,0.6)' }}
      >
        {keeper ? 'keeper' : 'experiment'}
      </span>
    </div>
  )
}

function MetricChip({ label, value }) {
  return (
    <div className="flex-1 bg-surface rounded-tile px-3 py-2.5 text-center">
      <div className="text-[20px] font-semibold leading-none">{value}</div>
      <div className="text-[11px] text-muted mt-1">{label}</div>
    </div>
  )
}

export default function HomePage() {
  const { user, progress, logOut, courseId } = useApp()
  const navigate = useNavigate()

  const done = progress.courses[courseId]?.completedLessonIds || []
  const lessonsMap = progress.courses[courseId]?.lessons || {}
  const correctCount = Object.values(lessonsMap).reduce((a, l) => a + (l.correct || 0), 0)
  const shots = (progress.shots || []).filter((s) => s.verdict !== 'experiment')
  const recentShots = shots.slice().reverse()
  const keeperCount = shots.length
  const resume = progress.lastLesson
  const resumeLesson = resume ? getLesson(resume.lessonId) : null
  const firstName = user?.displayName?.split(' ')[0]
  const nextLesson = course.lessons.find((l) => !done.includes(l.id)) || course.lessons[0]

  return (
    <div className="min-h-[100dvh] max-w-col w-full mx-auto px-5 py-6 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <Logo />
        <button onClick={logOut} className="text-[13px] text-muted hover:text-ink transition">
          Log out
        </button>
      </header>

      <div>
        <h1 className="text-[27px] font-semibold tracking-tight leading-tight">
          {firstName ? `Hi, ${firstName}.` : 'Welcome.'}
        </h1>
        <p className="text-muted text-[15px] mt-1">Ready to make a photo?</p>
      </div>

      <div className="flex gap-2">
        <MetricChip label="XP" value={progress.totalXp} />
        <MetricChip label="Answered right" value={correctCount} />
        <MetricChip label="Lessons" value={`${done.length}/${totalLessons}`} />
      </div>

      {resumeLesson ? (
        <Card className="p-5">
          <p className="text-[12px] uppercase tracking-wide text-muted font-medium mb-1">
            Pick up where you left off
          </p>
          <h2 className="text-[19px] font-semibold mb-4">{resumeLesson.title}</h2>
          <Button className="w-full" onClick={() => navigate(`/lesson/${resumeLesson.id}`)}>
            Continue lesson
          </Button>
        </Card>
      ) : (
        <Card className="p-5">
          {done.length === 0 && (
            <div className="flex justify-center mb-4">
              <PixelScene scene="landscape" size={200} />
            </div>
          )}
          <h2 className="text-[19px] font-semibold mb-1">{done.length ? 'Keep going' : 'Start the course'}</h2>
          <p className="text-muted text-[15px] mb-4">
            {done.length ? 'Pick up the next lesson.' : 'Begin with how a photo is actually made — and start your roll.'}
          </p>
          <Button className="w-full" onClick={() => navigate(`/lesson/${nextLesson.id}`)}>
            {done.length ? `Next: ${nextLesson.title}` : 'Start Lesson 1'}
          </Button>
        </Card>
      )}

      {recentShots.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-[15px] font-semibold">Your roll</h2>
            <span className="text-[12px] text-muted">
              {keeperCount} {keeperCount === 1 ? 'keeper' : 'keepers'}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 items-start">
            <ShotThumb shot={recentShots[0]} size={132} />
            {recentShots.slice(1).map((s) => (
              <ShotThumb key={s.key + s.createdAt} shot={s} size={88} />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/course')}
        className="text-left bg-surface rounded-big p-5 transition hover:bg-hairline/60"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-semibold">{course.title}</h3>
            <p className="text-muted text-[14px]">{course.subtitle}</p>
          </div>
          <span className="text-[13px] text-muted font-medium">
            {done.length}/{totalLessons}
          </span>
        </div>
        <div className="mt-4 h-2 rounded-full bg-hairline overflow-hidden">
          <div
            className="h-full bg-pear transition-all duration-500"
            style={{ width: `${(done.length / totalLessons) * 100}%` }}
          />
        </div>
      </button>
    </div>
  )
}
