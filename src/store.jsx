import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, firebaseEnabled } from './lib/firebase.js'

const COURSE = 'exposure'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

function emptyProgress() {
  return {
    totalXp: 0,
    lastLesson: null,
    shots: [], // captured photos: keepers + experiments (params to re-render, not images)
    courses: { [COURSE]: { completedLessonIds: [], lessons: {} } },
  }
}

function course(progress, courseId = COURSE) {
  if (!progress.courses[courseId]) {
    progress.courses[courseId] = { completedLessonIds: [], lessons: {} }
  }
  return progress.courses[courseId]
}

/* ---------- LOCAL mode (no Firebase config) ---------- */
const LS_CURRENT = 'aperture::current'
const LS_ACCOUNTS = 'aperture::accounts'
const lsKey = (uid) => `aperture::progress::${uid}`

const localStore = {
  readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  },
  writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* quota / private mode — ignore */
    }
  },
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [progress, setProgress] = useState(emptyProgress())
  const [ready, setReady] = useState(false)
  const saveTimer = useRef(null)

  /* ----- bootstrap auth ----- */
  useEffect(() => {
    if (firebaseEnabled) {
      // Safety net: never hang on the splash if auth init stalls (e.g. blocked storage).
      const fallback = setTimeout(() => setReady(true), 4000)
      const unsub = onAuthStateChanged(auth, (fbUser) => {
        clearTimeout(fallback)
        if (fbUser) {
          const u = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            isAnonymous: fbUser.isAnonymous,
          }
          setUser(u)
          // Load progress in the background — never block first paint on a Firestore read.
          loadRemote(u).then(setProgress).catch(() => {})
        } else {
          setUser(null)
          setProgress(emptyProgress())
        }
        setReady(true)
      })
      return () => {
        clearTimeout(fallback)
        unsub()
      }
    }
    // LOCAL mode
    const current = localStore.readJSON(LS_CURRENT, null)
    if (current) {
      setUser(current)
      setProgress(localStore.readJSON(lsKey(current.uid), emptyProgress()))
    }
    setReady(true)
  }, [])

  /* ----- persistence ----- */
  async function loadRemote(u) {
    const ref = doc(db, 'users', u.uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data()
      return {
        totalXp: data.totalXp || 0,
        lastLesson: data.lastLesson || null,
        shots: data.shots || [],
        courses: data.courses || emptyProgress().courses,
      }
    }
    const fresh = emptyProgress()
    await setDoc(ref, {
      email: u.email || null,
      displayName: u.displayName || null,
      isAnonymous: u.isAnonymous,
      createdAt: Date.now(),
      ...fresh,
    })
    return fresh
  }

  function persist(u, next) {
    if (!u) return
    if (firebaseEnabled) {
      setDoc(
        doc(db, 'users', u.uid),
        {
          email: u.email || null,
          displayName: u.displayName || null,
          isAnonymous: u.isAnonymous,
          updatedAt: Date.now(),
          totalXp: next.totalXp,
          lastLesson: next.lastLesson,
          shots: next.shots || [],
          courses: next.courses,
        },
        { merge: true },
      ).catch(() => {})
    } else {
      localStore.writeJSON(lsKey(u.uid), next)
    }
  }

  /* ----- auth actions ----- */
  async function tryAnonymously() {
    if (firebaseEnabled) {
      await signInAnonymously(auth)
      return
    }
    const u = { uid: 'local:anon', email: null, displayName: null, isAnonymous: true }
    localStore.writeJSON(LS_CURRENT, u)
    setUser(u)
    setProgress(localStore.readJSON(lsKey(u.uid), emptyProgress()))
  }

  async function signUp(email, password, displayName) {
    if (firebaseEnabled) {
      const cred = EmailAuthProvider.credential(email, password)
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        await linkWithCredential(auth.currentUser, cred) // carry anon progress over
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      if (displayName) await updateProfile(auth.currentUser, { displayName })
      // onAuthStateChanged won't re-fire for profile/link updates — reflect them now,
      // and refresh the denormalized doc fields (email / isAnonymous: false).
      const cur = auth.currentUser
      const u = { uid: cur.uid, email: cur.email, displayName: displayName || cur.displayName, isAnonymous: cur.isAnonymous }
      setUser(u)
      setProgress((prev) => {
        persist(u, prev)
        return prev
      })
      return
    }
    // LOCAL mode: migrate any anonymous progress to the new account
    const accounts = localStore.readJSON(LS_ACCOUNTS, {})
    const uid = 'local:' + email.toLowerCase()
    const u = { uid, email, displayName: displayName || null, isAnonymous: false }
    accounts[email.toLowerCase()] = { ...u, password }
    localStore.writeJSON(LS_ACCOUNTS, accounts)
    const anon = localStore.readJSON(lsKey('local:anon'), null)
    const carried = anon || progress
    localStore.writeJSON(lsKey(uid), carried)
    localStore.writeJSON(LS_CURRENT, u)
    setUser(u)
    setProgress(carried)
  }

  async function logIn(email, password) {
    if (firebaseEnabled) {
      await signInWithEmailAndPassword(auth, email, password)
      return
    }
    const accounts = localStore.readJSON(LS_ACCOUNTS, {})
    const rec = accounts[email.toLowerCase()]
    if (!rec || rec.password !== password) {
      throw new Error('No local account with that email and password. Sign up first.')
    }
    const u = { uid: rec.uid, email: rec.email, displayName: rec.displayName, isAnonymous: false }
    localStore.writeJSON(LS_CURRENT, u)
    setUser(u)
    setProgress(localStore.readJSON(lsKey(u.uid), emptyProgress()))
  }

  async function logOut() {
    if (firebaseEnabled) {
      await signOut(auth)
      return
    }
    localStorage.removeItem(LS_CURRENT)
    setUser(null)
    setProgress(emptyProgress())
  }

  /* ----- progress actions ----- */
  // Debounced — called on every step change; we don't write per keystroke.
  function saveResume(lessonId, stepIndex) {
    setProgress((prev) => {
      const next = structuredClone(prev)
      next.lastLesson = { courseId: COURSE, lessonId, stepIndex }
      const c = course(next)
      c.lessons[lessonId] = { ...(c.lessons[lessonId] || {}), resumeStepIndex: stepIndex }
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => persist(user, next), 600)
      return next
    })
  }

  function recordAttempt(lessonId, correct) {
    setProgress((prev) => {
      const next = structuredClone(prev)
      const c = course(next)
      const l = c.lessons[lessonId] || { attempts: 0, correct: 0, wrong: 0 }
      l.attempts = (l.attempts || 0) + 1
      if (correct) l.correct = (l.correct || 0) + 1
      else l.wrong = (l.wrong || 0) + 1
      l.lastAttemptAt = Date.now()
      c.lessons[lessonId] = l
      return next
    })
  }

  // Save a captured photo. At most one keeper + one experiment per lesson step
  // (re-shooting overwrites), so the gallery stays meaningful, not spammy.
  function saveShot(shot) {
    setProgress((prev) => {
      const next = structuredClone(prev)
      const key = `${shot.lessonId}:${shot.stepIndex}:${shot.verdict}`
      const kept = (next.shots || []).filter((s) => s.key !== key)
      kept.push({ ...shot, key, createdAt: Date.now() })
      next.shots = kept.slice(-60) // cap the roll
      persist(user, next)
      return next
    })
  }

  function completeLesson(lessonId, xpGain = 20) {
    if (saveTimer.current) clearTimeout(saveTimer.current) // cancel any pending resume write
    setProgress((prev) => {
      const next = structuredClone(prev)
      const c = course(next)
      const already = c.completedLessonIds.includes(lessonId)
      if (!already) {
        c.completedLessonIds.push(lessonId)
        next.totalXp += xpGain
      }
      c.lessons[lessonId] = { ...(c.lessons[lessonId] || {}), status: 'done', resumeStepIndex: 0 }
      next.lastLesson = null
      persist(user, next)
      return next
    })
  }

  const value = {
    user,
    progress,
    ready,
    firebaseEnabled,
    courseId: COURSE,
    tryAnonymously,
    signUp,
    logIn,
    logOut,
    saveResume,
    recordAttempt,
    completeLesson,
    saveShot,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
