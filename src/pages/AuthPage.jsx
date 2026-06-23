import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { Button, Logo } from '../components/ui.jsx'

export default function AuthPage() {
  const { user, signUp, logIn, tryAnonymously, firebaseEnabled } = useApp()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'signup') await signUp(email.trim(), password, name.trim())
      else await logIn(email.trim(), password)
    } catch (err) {
      setError(err?.message?.replace('Firebase: ', '') || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const field =
    'w-full px-4 py-3 rounded-tile border border-hairline text-[15px] outline-none focus:border-link focus:ring-2 focus:ring-link/30 transition'

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center px-5 py-10 max-w-col w-full mx-auto">
      <Logo className="text-2xl mb-8" />
      <h1 className="text-[28px] font-semibold tracking-tight leading-tight mb-1">
        Learn photography by doing.
      </h1>
      <p className="text-muted mb-7 leading-relaxed">
        Master the exposure triangle one hands-on lesson at a time.
      </p>

      <div className="flex gap-1 mb-5 p-1 bg-surface rounded-tile w-fit">
        {['signup', 'login'].map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m)
              setError('')
            }}
            className={`px-4 py-1.5 rounded-[10px] text-[14px] font-medium transition ${
              mode === m ? 'bg-white shadow-tile text-ink' : 'text-muted'
            }`}
          >
            {m === 'signup' ? 'Sign up' : 'Log in'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        {mode === 'signup' && (
          <input
            className={field}
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        )}
        <input
          className={field}
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className={field}
          type="password"
          required
          minLength={6}
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        />
        {error && <p className="text-[14px] text-danger">{error}</p>}
        <Button type="submit" className="w-full mt-1" disabled={busy}>
          {busy ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Log in'}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5 text-muted text-[13px]">
        <span className="h-px flex-1 bg-hairline" />
        or
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <Button variant="ghost" className="w-full" onClick={tryAnonymously}>
        Try a lesson without an account
      </Button>

      {!firebaseEnabled && (
        <p className="text-[12px] text-muted/80 mt-6 leading-relaxed">
          Running in local mode — accounts and progress are stored in this browser. Add Firebase
          config in <code className="font-mono">.env</code> to sync to the cloud.
        </p>
      )}
    </div>
  )
}
