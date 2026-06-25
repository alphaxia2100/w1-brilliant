---
name: add-google-login
description: >
  Add Google (or another social OAuth) sign-in to this Vite + React + Firebase Auth app.
  Use this whenever the user wants to add "Google login", "Sign in with Google", "social login",
  "OAuth", or any third-party auth provider (Apple, GitHub, Microsoft) to the Aperture
  photography course — even if they don't name the exact files. It wires the provider into
  Firebase Auth, adds the store action (with anonymous→provider account linking so guest progress
  survives), adds the login-screen button, and tells you the one Firebase-console step a human must do.
---

# Add Google login (social OAuth) to Aperture

This app already does real Firebase Auth: email/password + an anonymous "guest" mode that upgrades
to a real account via `linkWithCredential` (so a guest's progress carries over). Adding Google is
the same shape with a provider popup instead of a credential. Keep that **anonymous→provider linking**
intact — losing a guest's keepers on sign-in is the kind of regression that matters here.

The app falls back to a localStorage-only "LOCAL mode" when `.env` Firebase config is absent
(`firebaseEnabled`). Social login only works in Firebase mode, so gate the UI and the action on
`firebaseEnabled`.

## The four edits (in order)

### 1. `src/lib/firebase.js` — export the provider
Import `GoogleAuthProvider` from `firebase/auth` and export a singleton, null in local mode:

```js
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
// ...existing config + firebaseEnabled...
export const googleProvider = firebaseEnabled ? new GoogleAuthProvider() : null
```

For another provider, swap the class (`OAuthProvider('apple.com')`, `GithubAuthProvider`, etc.).

### 2. `src/store.jsx` — add the `logInWithGoogle` action
Add `signInWithPopup, linkWithPopup` to the `firebase/auth` import, and `googleProvider` to the
`./lib/firebase.js` import. Then add this action and **expose it in the context `value` object**:

```js
async function logInWithGoogle() {
  if (!firebaseEnabled) throw new Error('Google sign-in needs Firebase — add config in .env.')
  const cur = auth.currentUser
  // A guest? Upgrade the SAME account so their progress (keepers/XP) carries over.
  if (cur && cur.isAnonymous) {
    try {
      const res = await linkWithPopup(cur, googleProvider)
      // A same-uid upgrade may not re-fire onAuthStateChanged — reflect + persist manually,
      // mirroring how signUp() handles the email link.
      const fb = res.user
      const u = { uid: fb.uid, email: fb.email, displayName: fb.displayName, isAnonymous: fb.isAnonymous }
      setUser(u)
      setProgress((prev) => { persist(u, prev); return prev })
      return
    } catch (err) {
      // That Google account already exists as its own user — fall through to a plain sign-in
      // (the anon progress can't be merged; that's the expected Firebase behaviour).
      if (err?.code !== 'auth/credential-already-in-use') throw err
    }
  }
  // Fresh sign-in: onAuthStateChanged fires and loadRemote() loads THIS user's saved progress,
  // so do NOT setProgress here (that would clobber their cloud data with the current state).
  await signInWithPopup(auth, googleProvider)
}
```

Why the split: for a brand-new auth state the existing `onAuthStateChanged` handler already loads
the user's remote progress; only the anonymous-link case (uid unchanged) needs a manual reflect.

### 3. `src/pages/AuthPage.jsx` — add the button
Pull `logInWithGoogle` from `useApp()`. Add a handler that swallows the harmless
popup-cancel codes and surfaces the "provider not enabled" case clearly:

```jsx
async function google() {
  setError(''); setBusy(true)
  try { await logInWithGoogle() }
  catch (err) {
    const code = err?.code || ''
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      /* user just closed the popup — not an error */
    } else {
      setError(
        code === 'auth/operation-not-allowed'
          ? 'Google sign-in isn’t enabled yet — turn on Google in Firebase → Authentication.'
          : err?.message?.replace('Firebase: ', '') || 'Couldn’t sign in with Google.',
      )
    }
  } finally { setBusy(false) }
}
```

Render a branded button (the 4-colour Google "G" + "Continue with Google"), gated on `firebaseEnabled`,
placed with the other social/guest options (after the "or" divider, before the guest button). Match the
app's tokens: `rounded-tile border border-hairline bg-white`, `disabled:opacity-60`, calm and simple.

### 4. Firebase console — the one human step
Code alone is not enough: an admin must enable the provider once.
**Firebase Console → Authentication → Sign-in method → Google → Enable** (set a support email),
for project `aperture-dac66`. Until then the button returns `auth/operation-not-allowed` (handled above).
For non-localhost domains, also add them under Authentication → Settings → Authorized domains
(`aperture-dac66.web.app` is authorized by default).

## Verify
- `npm run build` is clean and `npm test` (the gate) stays green — these edits don't touch lessons.
- The "Continue with Google" button renders on the auth screen in Firebase mode and is hidden in local mode.
- The OAuth popup itself can't be fully exercised in the preview iframe (partitioned storage) — confirm
  the wiring/build and verify the live popup on the deployed site after the console toggle is on.
- Then `npm run deploy` to push it live.

## Notes
- Keep it to ONE social button unless asked — beauty in simplicity; don't clutter the auth screen.
- The same recipe adds Apple/GitHub/Microsoft: change the provider in step 1, the label/icon in step 3.
- Don't store provider secrets anywhere — Google web OAuth needs none here; the public web config is enough.
