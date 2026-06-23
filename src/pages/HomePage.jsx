import { useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { course, getLesson, totalLessons } from '../content/course.js'
import { Button, Card, Logo } from '../components/ui.jsx'
import PixelScene from '../sim/PixelScene.jsx'

export default function HomePage() {
  const { user, progress, logOut, courseId } = useApp()
  const navigate = useNavigate()

  const done = progress.courses[courseId]?.completedLessonIds || []
  const lessonsMap = progress.courses[courseId]?.lessons || {}
  const correctCount = Object.values(lessonsMap).reduce((a, l) => a + (l.correct || 0), 0)
  const resume = progress.lastLesson
  const resumeLesson = resume ? getLesson(resume.lessonId) : null
  const firstName = user?.displayName?.split(' ')[0]

  return (
    <div className="min-h-[100dvh] max-w-col w-full mx-auto px-5 py-6 flex flex-col">
      <header className="flex items-center justify-between mb-8">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium bg-surface px-3 py-1.5 rounded-full">
            {progress.totalXp} XP
          </span>
          <button onClick={logOut} className="text-[13px] text-muted hover:text-ink transition">
            Log out
          </button>
        </div>
      </header>

      <h1 className="text-[26px] font-semibold tracking-tight mb-3">
        {firstName ? `Hi, ${firstName}.` : 'Welcome.'} Ready to make a photo?
      </h1>
      <div className="flex gap-4 text-[13px] text-muted mb-6">
        <span>
          <span className="text-correct font-medium">{correctCount}</span> answered correctly
        </span>
        <span>
          <span className="text-ink font-medium">
            {done.length}/{totalLessons}
          </span>{' '}
          lessons done
        </span>
      </div>

      {resumeLesson ? (
        <Card className="p-5 mb-4">
          <p className="text-[12px] uppercase tracking-wide text-muted font-medium mb-1">
            Pick up where you left off
          </p>
          <h2 className="text-[19px] font-semibold mb-4">{resumeLesson.title}</h2>
          <Button className="w-full" onClick={() => navigate(`/lesson/${resumeLesson.id}`)}>
            Continue lesson
          </Button>
        </Card>
      ) : (
        <Card className="p-5 mb-4 overflow-hidden">
          <div className="flex justify-center mb-4">
            <PixelScene scene="landscape" size={220} />
          </div>
          <h2 className="text-[19px] font-semibold mb-1">Start the course</h2>
          <p className="text-muted text-[15px] mb-4">Begin with how a photo is actually made.</p>
          <Button className="w-full" onClick={() => navigate(`/lesson/${course.lessons[0].id}`)}>
            Start Lesson 1
          </Button>
        </Card>
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
