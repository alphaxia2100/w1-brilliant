import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useApp } from './store.jsx'
import { Logo } from './components/ui.jsx'
import AuthPage from './pages/AuthPage.jsx'
import HomePage from './pages/HomePage.jsx'
import CoursePathPage from './pages/CoursePathPage.jsx'
import LessonPage from './pages/LessonPage.jsx'
import GradePage from './pages/GradePage.jsx'
import PracticePage from './pages/PracticePage.jsx'
import TryPage from './pages/TryPage.jsx'

function Splash() {
  return (
    <div className="min-h-[100dvh] grid place-items-center">
      <Logo className="text-2xl animate-pop" />
    </div>
  )
}

// Key by lesson id so the page fully remounts on every lesson change — no stale
// completion state can carry over between lessons.
function LessonRoute() {
  const { id } = useParams()
  return <LessonPage key={id} />
}

export default function App() {
  const { ready, user } = useApp()
  if (!ready) return <Splash />

  const guard = (el) => (user ? el : <Navigate to="/auth" replace />)

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/try" element={user ? <Navigate to="/" replace /> : <TryPage />} />
      <Route path="/" element={guard(<HomePage />)} />
      <Route path="/course" element={guard(<CoursePathPage />)} />
      <Route path="/practice" element={guard(<PracticePage />)} />
      <Route path="/grade" element={guard(<GradePage />)} />
      <Route path="/lesson/:id" element={guard(<LessonRoute />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
