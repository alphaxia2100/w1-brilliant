import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store.jsx'
import { Button, Logo } from '../components/ui.jsx'

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  )
}

export default function AuthPage() {
  const { user, signUp, logIn, logInWithGoogle, firebaseEnabled } = useApp()
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
      const code = err?.code || ''
      setError(
        code === 'auth/invalid-email'
          ? 'That email doesn’t look right — check it and try again.'
          : code === 'auth/weak-password'
            ? 'Password needs at least 6 characters.'
            : code === 'auth/email-already-in-use'
              ? 'That email already has an account — try logging in instead.'
              : code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found'
                ? 'Email or password doesn’t match. Give it another go.'
                : err?.message?.replace('Firebase: ', '') || 'Something went wrong.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function google() {
    setError('')
    setBusy(true)
    try {
      await logInWithGoogle()
    } catch (err) {
      const code = err?.code || ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        /* the user just closed the popup — not an error */
      } else {
        setError(
          code === 'auth/operation-not-allowed'
            ? 'Google sign-in isn’t enabled yet — turn on Google in Firebase → Authentication.'
            : err?.message?.replace('Firebase: ', '') || 'Couldn’t sign in with Google.',
        )
      }
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
        Master exposure, light, and composition — one hands-on lesson at a time.
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
            aria-label="Your name (optional)"
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
          aria-label="Email"
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
          aria-label="Password (at least 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        />
        {mode === 'signup' && password.length > 0 && (
          <p className="text-[12px] -mt-1.5 ml-1" style={{ color: password.length >= 6 ? '#1B7D35' : '#666' }}>
            {password.length >= 6 ? '✓ Strong enough' : `${6 - password.length} more character${6 - password.length === 1 ? '' : 's'} to go`}
          </p>
        )}
        {error && <p className="text-[14px] text-danger">{error}</p>}
        <Button type="submit" className="w-full mt-1" disabled={busy}>
          {busy ? (mode === 'signup' ? 'Creating account…' : 'Signing in…') : mode === 'signup' ? 'Create account' : 'Log in'}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5 text-muted text-[13px]">
        <span className="h-px flex-1 bg-hairline" />
        or
        <span className="h-px flex-1 bg-hairline" />
      </div>

      {firebaseEnabled && (
        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 mb-3 rounded-tile border border-hairline bg-white text-[15px] font-medium hover:bg-surface transition disabled:opacity-60"
        >
          <GoogleG /> Continue with Google
        </button>
      )}

      <Button variant="ghost" className="w-full" onClick={() => navigate('/try')}>
        Try the first lesson — no sign-up
      </Button>

      {!firebaseEnabled && (
        <p className="text-[12px] text-muted mt-6 leading-relaxed">
          Running in local mode — accounts and progress are stored in this browser. Add Firebase
          config in <code className="font-mono">.env</code> to sync to the cloud.
        </p>
      )}
    </div>
  )
}
