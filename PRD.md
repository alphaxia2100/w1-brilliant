# Aperture — Product Requirements Document

> A Brilliant.org–style interactive micro-course that teaches the **exposure triangle** to adult beginner photographers, through hands-on lessons where you *do something and see the result instantly*.

**Owner:** sky · **Repo:** https://github.com/alphaxia2100/w1-brilliant.git
**Date:** 2026-06-23 (rev. 2) · **Status:** approved direction, pre-build
**Grading lens:** depth & quality of UX *in doing what Brilliant does*. The photography content is the vehicle; **design and interaction quality are the product.**

Research foundation: [`Research/CONSOLIDATED-FINDINGS.md`](Research/CONSOLIDATED-FINDINGS.md), [`Research/00-RESEARCH-BRIEF.md`](Research/00-RESEARCH-BRIEF.md) (two independent research efforts converged on this direction).

---

## 1. Vision & north star

Brilliant's magic is not its content — it's a **disciplined interaction loop** wrapped in a **calm, premium, game-feel design system**. We clone *that loop and that feel*, applied to the one photography concept that fits it almost perfectly: the exposure triangle.

**North star:** *Simple, beautiful, and truly interactive.* A learner who knows nothing about cameras drags a slider, watches a scene change, guesses wrong, gets gently corrected by re-toggling the variable themselves, and feels the "aha."

Two failure tests we hold every screen to:
- **If a screen has a paragraph instead of a knob, we've failed.**
- **If a screen asks you to do three things at once, we've failed.**

---

## 2. Target user (persona)

**Maya, 29 — adult beginner hobbyist.** Just bought her first mirrorless camera (or shoots phone "pro mode") and is frustrated that "Auto" gives flat results. She's smart, motivated, time-poor, and wants to finally *understand* why a photo looks the way it does — not memorize jargon.

**Design implications:** warm-but-grown-up tone; **zero condescension** on wrong answers; calm, sophisticated, whitespace-heavy aesthetic; 8–12 minute lessons; mobile + desktop both first-class; explanations give the *why*, not just the rule.

---

## 3. Goals & non-goals

### Goals (what success looks like)
1. A learner can **log in, complete an interactive lesson, see their progress tracked, log out, and resume exactly where they left off.** (This is the graded test scenario.)
2. Every lesson is **active**: at least one real manipulation per concept with instant visual feedback. No videos, no walls of text.
3. Wrong answers are handled **warmly and interactively** — guidance, not a red buzzer.
4. The product **looks and feels premium and cohesive** — a believable Brilliant-quality design system.
5. **Real authentication and persistence** (Firebase) survive logout/login across devices, and the app is **deployed on Firebase Hosting**.

### Non-goals (explicitly out of scope — see §10)
- Teaching photography comprehensively. One chapter, done beautifully.
- Social features (leagues, leaderboards, friends), **streaks**, payments, content-authoring UI.
- Real photo upload, true optical simulation, or any non-exposure chapter.

---

## 4. Scope: the exposure-triangle staircase

We teach the exposure triangle as a **staircase, not a sandbox** — isolate one variable per lesson, then reveal the system. "Three sliders, go play" is explicitly rejected (that's just CameraSim). **Scope is incremental:** we build lessons in order and add more as time allows — quality bar before quantity. Build order is the priority; lesson count is flexible.

| # | Title | Core idea | Hands-on interaction | Misconception corrected | Phase |
|---|---|---|---|---|---|
| **1** | **A Photo Is Collected Light** *(redesigned, animated)* | A photo = light gathered over time; "correct" exposure is a *target* fill, not maximum. | **Animated capture:** scene starts black; light *pours into the pixel grid over time* with a fill meter. Learner closes the shutter at the right moment (tap / duration slider) — too short = dark, too long = blown out. | "Brighter is always better"; exposure is automatic magic. | **Wed** |
| **2** | **Aperture: the Pizza-Slice Hole** | Aperture = hole size; f-numbers are fractions, so **f/1.8 is big, f/22 is tiny**. Wider = more light. | f-stop slider driving an animated SVG iris; the pixel scene brightens/darkens in sync. | "Bigger number = bigger opening" (the #1 beginner trap). | **Wed** |
| **3** | **Aperture's Secret Job: Depth of Field** | Wide aperture blurs the background; narrow keeps all sharp. | Same slider, brightness auto-held so *only* blur changes — background cells blur, subject cells stay crisp. "Make the portrait pop." | "Blur = always better"; DoF is aperture-only. | **Wed** |
| **4** | **Shutter Speed: Freeze or Blur Time** | Fast freezes motion, slow blurs it; longer = brighter. | Shutter slider over an animated subject whose cells **smear across columns** + tripod/handheld toggle. | "Blur is always a mistake"; subject blur ≠ camera shake. | **Wed** |
| **5** | **ISO: the Volume Knob with a Cost** | ISO amplifies signal → brightens, but adds noise/grain. | ISO slider that adds **shadow-weighted per-cell jitter** + a zoom-loupe inset on the shadows. | "High ISO is always bad." | **Next** |
| **6** | **The Triangle: Balance the Three** *(hero)* | All three share one job (light); change one → compensate another, each with a creative side effect. | Three live sliders + a persistent exposure meter that must stay level. Puzzle: "Dim sports game, keep shutter at 1/1000s, fix the darkness." | Settings are independent; equivalent exposures exist. | **Next** |

**Build order:** lesson engine + pixel-scene engine → L1 → L2 → L3 → L4 (first deployable cut), then L5, then the L6 hero (which *reuses* the blur/motion/noise effects from L2–L5). Four flawless lessons beat six rough ones.

---

## 5. User stories

### In focus (MVP)
- As a new visitor, I can **try a lesson immediately** (anonymous), *and* I can **create a real account / log in** with email + password (Google optional).
- As a returning user, I **log in and land on Home** showing my progress and a clear "next" lesson.
- As a learner, I work a lesson by **manipulating a control and getting instant feedback**.
- When **wrong**, I get a **calm, specific hint** and can immediately re-adjust the control.
- When **right**, I get a **satisfying confirmation** and continue.
- On finishing a lesson, I see a **completion card**; my **XP and progress update**.
- After signing up, the progress I made anonymously **carries over** (credential linking).
- I can **log out and back in** (any device) and **resume at the exact step**.

### Not in focus (deferred)
- Streaks, leagues, leaderboards, social sharing, notifications.
- In-app lesson authoring; adaptive placement testing.

---

## 6. The core experience (screen flow)

```
Welcome (1–2 screens, optional name)
   → Auth      (log in / sign up · or "try without an account")
   → Home      (resume card · XP · course path)
      → Course path "Exposure"  (vertical gameboard: ✓ done · ◉ next · ○ locked)
         → Lesson player  (5–8 steps)
              concept intro → interactive step → submit
                 → correct: green expo-pop → Continue
                 → wrong: calm-gray hint → re-try the control → staged explanation
           → Completion card  (XP added · progress saved)
      ← back to Home (checkmark appears, resume card updates)
   Settings → Log out  →  re-auth → resume card points back to exact step
```

### Test-scenario mapping (the graded path)
| Step | Screen | What happens |
|---|---|---|
| Log in | Auth → Home | One Firestore read: XP, resume card, course path |
| Open course | Course path | "Exposure · N Lessons", gameboard with states |
| Start lesson | Concept intro → steps | Manipulate → submit → instant feedback |
| Finish | Completion card | XP + progress written |
| See progress | Home/path | New checkmark; resume card updated |
| Log out → resume | Auth → Home | Auto-synced; resume to `lastLesson.stepIndex` |

---

## 7. Design system (the graded core)

Full tokens in [`Research/00-RESEARCH-BRIEF.md`](Research/00-RESEARCH-BRIEF.md) §4. Essentials:

- **Canvas:** white `#FFFFFF` light / charcoal `#1E1E1E` dark — **not navy.** Near-monochrome ground.
- **Accent:** ONE per screen. Signature **pear `#D8E82E`** for primary CTA; blue `#456DFF` for selection/focus; green `#29CC57` for correct.
- **Wrong-answer feedback is calm gray `#E5E5E5`, never red.** Red is reserved for hard system errors only. *(Deliberate emotional decision; key differentiator.)*
- **Layout:** single **~432px column** centered in whitespace; one idea per screen; 4px spacing grid.
- **Type:** one friendly geometric sans (**General Sans**, Inter fallback) for everything; mono (`SFMono/Menlo`) for f-numbers and shutter values. Body 16px, problem text 18px, sentence case always.
- **Widgets:** chunky, pressable, flat fills, 12–20px radius, **hard non-blurred offset shadow** (`0 4px 0 0` lip) that compresses on press — the tactile "key" feel.
- **Motion:** 150/200/300ms; celebratory **expo-pop** `cubic-bezier(0.16,1,0.3,1)`; correct = green panel pops + XP counts up; wrong = soft, no alarm. Sound default-off.
- **Illustration:** flat geometric SVG + the **pixel-grid scene** (see §8). Every visual is *interactive*, never decorative. **No mascot, no streak UI** — warmth comes from type, color, motion.

---

## 8. Architecture

### Stack (boring on purpose)
| Concern | Choice |
|---|---|
| Build | Vite + React (JS) |
| Styling | Tailwind CSS, tokens mapped to the design system |
| Animation | plain CSS transitions + `requestAnimationFrame` for the capture/motion sims |
| Sliders/drag | native Pointer Events, one reusable `<Slider>` — no library |
| Sims | **low-res pixel-grid scene** (see below) on canvas + SVG overlays (iris, meters) |
| Auth + data | Firebase Auth + Firestore (Spark free tier) |
| Hosting | **Firebase Hosting** — deploy-ready from day one |
| Routing | react-router-dom (~5 routes) |

Runtime deps: `react`, `react-dom`, `react-router-dom`, `firebase` (+ dev `tailwindcss`, `vite`).

### 8a. The pixel-grid scene engine (the rendering unlock)
Every scene is a **low-resolution square grid** (≈ 24–40 cells/side) of colored cells, rendered to a `<canvas>` (or SVG `<rect>`s for the smallest grids). This single `PixelScene` component, driven by an `effects` object, powers *all* lessons — and turns every "hard" sim into trivial per-cell math:

| Effect | Per-cell operation | Lesson |
|---|---|---|
| **Exposure / brightness** | multiply each cell's value by an exposure factor; clip highlights | L1, L2 |
| **Light accumulation** (animated) | over time, ramp cell values from 0 toward scene value (long-exposure fill) | L1 |
| **Depth-of-field blur** | box-blur background cells (average neighbors) by a radius from aperture; keep subject cells sharp | L3 |
| **Motion blur** | smear the moving subject's cells across N columns based on shutter time | L4 |
| **ISO noise** | add random jitter per cell, weighted into the shadows; amount scales with ISO | L5 |

The low-res aesthetic reads as **intentional pixel-art**, is GPU-cheap and mobile-friendly, and is fully cohesive with the geometric design language. Built once, reused everywhere.

### 8b. The data-driven lesson engine
Every lesson is **data, not bespoke components**. A lesson = an array of *step* objects; each `type` maps to a renderer in a registry. The engine drives the universal loop (render → act → check → feedback → next). New lessons become content files, not new code. Wrong-answer behavior lives in one shared `<Feedback>` component.

```
src/
  lib/        firebase.js, auth.js, progress.js     (Firebase + persistence)
  engine/     LessonPlayer.jsx, useLessonState.js, stepTypes.js, Feedback.jsx
  sim/        PixelScene.jsx, effects.js, scenes.js  (the pixel-grid engine)
  components/ Slider.jsx, ApertureSVG.jsx, Button, Card, ProgressBar
  content/    courses.js, exposure/lesson1..6.js     (STATIC — not in Firestore)
  pages/      Welcome, Auth, Home, CoursePath, Lesson
  hooks/      useAuth.js
```

```js
// example step (slider-sim)
{ type: "slider-sim",
  prompt: "Widen the aperture until the background blurs.",
  scene: "portrait",
  param: { key: "aperture", stops: [1.4,2,2.8,4,5.6,8,11,16], start: 4 },
  effects: ["dof"],           // which PixelScene effects this step drives
  check: (v) => v <= 2.8,
  feedback: {
    correct: "A wide aperture (low f-number) blurs the background.",
    wrong: "Try lower f-numbers — watch the background as you drag." } }
```

Step types (MVP): `intro`, `slider-sim`, `capture` (animated L1), `multiple-choice`, `slider-target`.

### 8c. Sim performance notes
- Render the grid to a small backing canvas, scale up with `image-rendering: pixelated`.
- Update cells directly on drag (no CSS transition on the canvas); throttle to animation frames.
- Keep grids small (≤ 40²); all effects are O(cells) and run easily at 60fps on mobile.

---

## 9. Authentication & data model (Firebase)

### Auth (real login, first-class)
- **Providers:** email/password (primary) + Google (optional, one extra line) + **anonymous "try it"** that upgrades to a real account via **`linkWithCredential`** so anonymous progress carries over.
- **Visible in the demo:** a polished sign-up / log-in screen is part of the MVP, not skipped.
- **Session:** Firebase persists auth; `onAuthStateChanged` gates routes; logout returns to Auth.

### Firestore (only user state — lesson content ships in the bundle)
```
users/{uid}
  email | null, isAnonymous, displayName | null, createdAt
  lastLesson: { courseId, lessonId, stepIndex }   // resume in 1 read
  totalXp

users/{uid}/progress/{courseId}
  completedLessonIds: [ ... ]
  lessons: {
    "<lessonId>": { status, resumeStepIndex, attempts, correct, wrong, lastAttemptAt }
  }
```
*(No `streak` — XP + completion only.)*

- **Write economy:** debounce `resumeStepIndex` on step change; write counters/XP on lesson completion. No per-keystroke writes.
- **Security rules** (`firestore.rules`): `allow read, write: if request.auth.uid == uid;`
- Spark free tier is far more than enough.

### Deployment prep (Firebase Hosting)
Committed from the start so deploy is one command and repeatable:
- `firebase.json` (Hosting → `dist/`, SPA rewrite to `/index.html`), `.firebaserc` (project alias).
- `firestore.rules` + `firestore.indexes.json`.
- `.env` for Firebase web config (gitignored); config injected at build.
- Scripts: `npm run build` → `firebase deploy`. CI optional later.
- README documents the deploy + env setup.

---

## 10. Scope discipline

### In scope — first deployable cut (target Wed)
- One course ("Exposure"), **L1–L4 polished end-to-end**, plus the **pixel-scene engine** + **lesson engine** + shared `<Feedback>`.
- **Real auth** (email/password + anonymous-with-linking) and a polished Auth screen.
- **Firestore progress** (resume, counters, XP roll-up) + security rules.
- Welcome / Auth / Home / course-path / lesson / completion screens; **resume-where-you-left-off**.
- Full design system applied; **mobile + desktop responsive**; sound default-off.
- **Deployed on Firebase Hosting**, deploy repeatable.

### Next (same week, incremental)
- L5 (ISO + loupe), then L6 (Light Balance hero). Google sign-in. More lessons as needed.

### Out of scope (cut list)
- **Streaks**, leagues, leaderboards, friends, any social layer · payments · content-authoring UI.
- Real image upload · true optical sims · focal-length/compression · composition & metering chapters.
- Offline/PWA/push · multiple courses · Rive/Lottie · paid CoFo fonts · graded placement quiz · **mascot**.

### Defer to Fri (AI tutor)
- A **Socratic hint tutor** that sees the current step and guides without giving the answer; pinpoints the misconception. The Wed interactive wrong-answer correction is the manual scaffold this automates.

### Defer to Sun (learning science)
- **Spaced repetition** (resurface earlier concepts), retention checks at delays, a no-hints checkpoint as a true retrieval test.

---

## 11. Milestones

| When | Deliverable |
|---|---|
| **Wed 11:59** | First deployable cut: pixel-scene + lesson engines, L1–L4, real auth + persistence, full design system, **live on Firebase Hosting**. |
| **Fri 11:59** | Early submission: AI Socratic tutor layered on the MVP. |
| **Sun 11:59** | Final: learning-science features (spacing, checkpoint), L5–L6 hero, polish. |

**Submission:** GitHub link · 3–5 min demo video (persona, domain, features, user story) · brainlift · public app link.

---

## 12. Success criteria

- **The test scenario passes flawlessly** (log in → lesson → progress → log out → resume) on mobile and desktop, against the **deployed** app.
- A first-time user can complete a lesson **with no instructions** and articulate the concept afterward (depth-over-breadth check).
- Every lesson screen is genuinely interactive (the two failure tests in §1 hold).
- The product reads as **premium and cohesive** — a believable Brilliant-quality clone.
- Wrong answers feel **encouraging, never punishing.**

---

## 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Sims feel cheap | The **low-res pixel grid is a deliberate style**, not a compromise — and makes noise/motion/blur trivial and convincing. DoF blur already proven in prototype. |
| Over-building (too many rough lessons) | Hard build-order; incremental scope; 4 flawless > 6 rough. |
| Sim jank on mobile | Tiny grids (≤40²), direct canvas updates, rAF throttle — all O(cells). |
| Auth/deploy left to the end | Both are **MVP, day-one** — real login screen + Firebase Hosting config committed first. |
| Firestore cost/complexity | One roll-up doc, debounced writes, static content in bundle. |
| Scope creep into "playground" | Staircase, not sandbox — one variable per lesson, enforced in content. |

---

## 14. Open / to-confirm
- Product name: **"Aperture"** working title — confirm or rename.
- Firebase project id / Hosting site to deploy to (need access or I'll scaffold a placeholder).
- Exact lesson copy & step counts (authored in `content/` during build).
