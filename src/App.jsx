import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './store.jsx'
import { Logo } from './components/ui.jsx'
import AuthPage from './pages/AuthPage.jsx'
import HomePage from './pages/HomePage.jsx'
import CoursePathPage from './pages/CoursePathPage.jsx'
import LessonPage from './pages/LessonPage.jsx'

function Splash() {
  return (
    <div className="min-h-[100dvh] grid place-items-center">
      <Logo className="text-2xl animate-pop" />
    </div>
  )
}

export default function App() {
  const { ready, user } = useApp()
  if (!ready) return <Splash />

  const guard = (el) => (user ? el : <Navigate to="/auth" replace />)

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={guard(<HomePage />)} />
      <Route path="/course" element={guard(<CoursePathPage />)} />
      <Route path="/lesson/:id" element={guard(<LessonPage />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
