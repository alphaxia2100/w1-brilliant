import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { course } from '../content/course.js'
import LessonPlayer from '../engine/LessonPlayer.jsx'
import { Button } from '../components/ui.jsx'
import PixelScene from '../sim/PixelScene.jsx'

// Cold-start: let a visitor play the very first lesson with NO account. The store's
// persistence no-ops without a user (progress lives in memory, the keepsake still
// develops), so nothing is saved — we ask for the account only after they've felt the
// "aha", at the end. This removes signup friction up front and the Anonymous-sign-in
// console dependency that the old guest button needed.
export default function TryPage() {
  const navigate = useNavigate()
  const [done, setDone] = useState(false)
  const base = course.lessons[0]
  const lesson = { ...base, totalLessons: course.lessons.length, resumeStepIndex: 0 }

  if (done) {
    return (
      <div className="min-h-[100dvh] max-w-col w-full mx-auto px-5 py-10 flex flex-col justify-center text-center animate-pop">
        <div className="flex justify-center mb-6">
          <PixelScene scene="landscape" size={200} />
        </div>
        <div className="inline-flex self-center items-center gap-2 bg-correct-bg text-correct-ink font-medium px-4 py-1.5 rounded-full mb-4">
          You made your first photo
        </div>
        <h1 className="text-[24px] font-semibold tracking-tight mb-2">That’s the whole idea — learn by doing.</h1>
        <p className="text-muted mb-8 leading-relaxed">
          Create a free account to keep your shot and unlock all {course.lessons.length} lessons —
          exposure, depth of field, metering, white balance, composition, light, and more.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate('/auth')}>Create a free account</Button>
          <Button variant="ghost" onClick={() => navigate('/auth')}>I already have one</Button>
        </div>
      </div>
    )
  }

  return (
    <LessonPlayer
      key={lesson.id}
      lesson={lesson}
      onExit={() => navigate('/auth')}
      onComplete={() => setDone(true)}
    />
  )
}
