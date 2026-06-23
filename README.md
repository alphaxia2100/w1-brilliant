# Aperture

Learn photography by doing. A Brilliant.org–style interactive course that teaches the
**exposure triangle** through hands-on lessons — drag a control, watch the photo change,
get gently corrected when you're wrong.

Built with **React + Vite + Tailwind + Firebase**. The full plan is in [`PRD.md`](PRD.md);
the research foundation is in [`Research/`](Research/).

---

## What's here (MVP vertical slice)

- **A pixel-grid scene engine** (`src/sim/`) — every photo sim is a low-res grid of cells
  with cheap per-cell effects: exposure, light accumulation, depth-of-field blur, motion
  smear, ISO grain. One engine, every lesson.
- **A data-driven lesson engine** (`src/engine/`) — lessons are data (`src/content/course.js`),
  not bespoke components. The player runs the universal loop: render → act → check →
  feedback → next, with one shared (calm-gray, never-red) feedback panel.
- **Four lessons** of the Exposure course: collected light · aperture · depth of field · shutter speed.
- **Real auth + persistence** — email/password + anonymous "try it" (with credential linking),
  progress saved per user, resume-where-you-left-off across logout/login.
- **Firebase Hosting deploy config**, ready to ship.

## Run it locally

```bash
npm install
npm run dev          # http://localhost:5173
```

By default the app runs in **local mode** — accounts and progress live in `localStorage`,
so you can develop and demo with no backend. (A banner on the login screen tells you.)

## Connect Firebase (optional for dev, required for the live deploy)

1. Create a Firebase project, enable **Authentication → Email/Password** (and Anonymous),
   and create a **Firestore** database.
2. Copy `.env.example` to `.env` and fill in the web config:
   ```bash
   cp .env.example .env
   ```
3. Restart `npm run dev`. The app now reads/writes the cloud and `firebaseEnabled` flips on.

Firestore stores **only user state** (progress, XP, resume position) under `users/{uid}`;
lesson content always ships in the bundle. Security rules (`firestore.rules`) lock each
user to their own document tree.

## Deploy

```bash
npm install -g firebase-tools      # once
firebase login                     # once
# set your project id in .firebaserc (replace REPLACE_WITH_FIREBASE_PROJECT_ID)
npm run deploy                     # = vite build + firebase deploy
```

This builds to `dist/` and deploys Hosting + Firestore rules.

## Project structure

```
src/
  lib/firebase.js     Firebase init (no-ops in local mode)
  store.jsx           auth + progress (Firebase or localStorage), one useApp() hook
  sim/                PixelScene + the scene/effects engine
  engine/             LessonPlayer + step views + Feedback
  components/ui.jsx   Button, Card, Slider, ProgressBar, ApertureIris, Logo
  content/course.js   the Exposure course as data
  pages/              Auth, Home, CoursePath, Lesson
```
