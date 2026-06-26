import { useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { course, getLesson, totalLessons } from '../content/course.js'

// One lesson node in a chapter's timeline (done ✓ / next / locked).
function LessonNode({ lesson, index, activeIndex, done, navigate }) {
  const isDone = done.includes(lesson.id)
  const isNext = index === activeIndex
  const locked = index > activeIndex
  return (
    <li className="relative z-10 mb-3">
      <button
        disabled={locked}
        onClick={() => navigate(`/lesson/${lesson.id}`)}
        className={`w-full text-left flex items-center gap-4 p-3 rounded-big transition ${
          locked ? 'opacity-45 cursor-not-allowed' : 'hover:bg-surface active:translate-y-[1px]'
        }`}
      >
        <span
          className="shrink-0 w-10 h-10 rounded-full grid place-items-center text-[15px] font-semibold border-2"
          style={{
            background: isDone ? '#D8E82E' : isNext ? '#141414' : '#fff',
            color: isDone ? '#141414' : isNext ? '#fff' : '#999',
            borderColor: isDone ? '#D8E82E' : isNext ? '#141414' : '#E5E5E5',
          }}
        >
          {isDone ? (
            '✓'
          ) : locked ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.4" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          ) : lesson.review ? (
            '★'
          ) : (
            lesson.number
          )}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-[16px] leading-tight truncate">{lesson.title}</span>
            {lesson.review && !isDone && (
              <span className="shrink-0 text-[10px] uppercase tracking-wide font-semibold text-muted/70 border border-hairline rounded-full px-1.5 py-0.5">Review</span>
            )}
          </span>
          <span className="block text-[13px] text-muted truncate">{lesson.blurb}</span>
        </span>
        {isNext && <span className="ml-auto text-[12px] font-medium text-link shrink-0">Start →</span>}
      </button>
    </li>
  )
}

export default function CoursePathPage() {
  const { progress, courseId } = useApp()
  const navigate = useNavigate()
  const done = progress.courses[courseId]?.completedLessonIds || []
  const nextIndex = course.lessons.findIndex((l) => !done.includes(l.id))
  const activeIndex = nextIndex === -1 ? course.lessons.length : nextIndex

  return (
    <div className="min-h-[100dvh] max-w-col w-full mx-auto px-5 py-6">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} aria-label="Back" className="text-muted hover:text-ink transition text-xl w-6">
          ←
        </button>
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight leading-none">{course.title}</h1>
          <p className="text-[13px] text-muted mt-1">
            {done.length} of {totalLessons} lessons complete · {course.chapters.length} chapters
          </p>
        </div>
      </header>

      <div className="space-y-7">
        {course.chapters.map((chapter, ci) => {
          const chLessons = chapter.lessonIds.map(getLesson).filter(Boolean)
          const chDone = chLessons.filter((l) => done.includes(l.id)).length
          const chComplete = chDone === chLessons.length
          return (
            <section key={chapter.id}>
              <div className="flex items-baseline justify-between mb-2 px-1">
                <div className="min-w-0">
                  <span className="text-[11px] uppercase tracking-wide text-muted/80 font-medium">Chapter {ci + 1}</span>
                  <h2 className="text-[17px] font-semibold leading-tight">{chapter.title}</h2>
                </div>
                <span
                  className="text-[12px] font-medium shrink-0 ml-3"
                  style={{ color: chComplete ? '#1F8A3B' : '#999' }}
                >
                  {chComplete ? '✓ done' : `${chDone}/${chLessons.length}`}
                </span>
              </div>
              <ol className="relative">
                <span className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-hairline -z-0" aria-hidden="true" />
                {chLessons.map((lesson) => (
                  <LessonNode
                    key={lesson.id}
                    lesson={lesson}
                    index={course.lessons.findIndex((l) => l.id === lesson.id)}
                    activeIndex={activeIndex}
                    done={done}
                    navigate={navigate}
                  />
                ))}
              </ol>
            </section>
          )
        })}
      </div>
    </div>
  )
}
