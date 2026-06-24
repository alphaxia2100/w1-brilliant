# Aperture — Handoff

**Date:** 2026-06-24 · **Repo:** https://github.com/alphaxia2100/w1-brilliant (branch `main`, latest `5291f44`)
**Read this first, then `PRD.md`, then `Redesign/AUDIT-LEDGER.md`.**

A Brilliant.org-style interactive photography course. Adult-beginner persona. Stack: **Vite + React + Tailwind + Firebase** (Auth + Firestore + Hosting). All visuals are **geometric pixel-art / SVG — no real photos** (locked decision). Design system: white/charcoal canvas, one **pear** accent, single ~432px column, wrong-answer feedback is **calm gray, never red**, XP only (no streaks).

---

## TL;DR of the current problem (why this handoff exists)

Development became reactive — many small feedback-driven edits — and the **depth-of-field lesson, the portrait/silhouette rendering, the blur quality, and the motion→polaroid flow are now an inconsistent mess.** The scaffolding underneath is solid; the *visual treatment of a few interactive parts* and *one lesson's structure* need a clean, deliberate redo rather than more patches.

### The specific things the user is unhappy with (verbatim intent)
1. **DoF lesson style is disliked and "too complicated at points."** The current DoF is a 6-step lesson built around an abstract **side-view lens diagram** (camera → cone → focus band → objects). The user does **not** want that. They want a **simple, forward-facing photo demo: a flower in focus with other things in the background, showing how the background blurs** as you open the aperture. Cut the step count down; drop or hide the side-view diagram.
2. **Blur edges look bad.** The blur is done as a per-cell box-blur on the low-res pixel grid (`boxBlur` in `src/sim/scene.js`) and/or a CSS `filter: blur()` on SVG silhouettes in the diagram. Both produce ugly/blocky edges. **Needs a cleaner blur** (e.g. layered approach: a sharp subject layer over a CSS-`blur()`'d background layer, or a higher-res/gaussian treatment).
3. **Portrait/silhouette style is disliked.** History: subject was a crude person → swapped to a sunflower → reverted to a "nicer" head-and-shoulders **bust silhouette**. The user still doesn't love it. For the new DoF they want a **flower** subject (forward-facing, not a side-diagram silhouette).
4. **Motion → polaroid artifacts.** In the shutter lesson (`MotionView`), after the shutter fires, the **blurred car is still visible behind/around the polaroid** (the live canvas shows through the semi-transparent overlay backdrop), and the captured blurred frame lingers in the view. Looks broken.
5. **Multiple choice mostly remains.** Mentor advice: "anything is better than multichoice." Only L2 and L4 were converted to a `rank` (tap-to-order) interaction. **L1, L3, L5, L6, L7, L8, L9 still use `predict` (MC).**

---

## What's solid (keep)
- **The data-driven lesson engine** (`src/engine/LessonPlayer.jsx` + `steps.jsx`): lessons are data; each step `kind` maps to a renderer. Clean loop: render → act → check → feedback → next.
- **The no-reveal feedback model**: `feedback.{correct, byOption (per-distractor Socratic), stages (escalating, never the answer), showWhy (visual)}`. Calm gray, never red. This is good — preserve it.
- **Auth + persistence** (`src/store.jsx`): Firebase when `.env` present, else localStorage fallback. Resume, XP, attempt counts, gallery shots. First paint never blocks on Firestore.
- **The shutter + gallery loop**: shootable steps save a "shot" (keeper/experiment) to `progress.shots`; Home shows "Your roll." Shots store params to re-render (no image storage) — except motion, which snapshots the canvas.
- **The polaroid reveal idea** (develops, random tilt) — good; just fix the artifact behind it.
- **Exposure-triangle core (L1, L2, L4, L5, L6)** mostly works and is verified.
- **DoF optics math** (`src/sim/dof.js`) is correct (validated vs dofsimulator). Even if the *diagram* is dropped, the math can drive a forward-scene blur amount.

---

## Architecture map
```
src/
  main.jsx, App.jsx            routing (App keys /lesson/:id so it remounts per lesson)
  store.jsx                    AppProvider: auth + progress + shots; Firebase/local
  lib/firebase.js              init; firebaseEnabled = config present
  sim/
    scene.js                   PixelScene engine: computeGrid + effects
                               (exposure, aperture→box-blur, motion smear, ISO noise, temp/WB, histogram);
                               scene generators: landscape, portrait, night, seascape, room
    PixelScene.jsx             canvas renderer for a scene + effects (+ crop loupe)
    dof.js                     thin-lens DoF math (near/far/total/hyperfocal) + formatting
  engine/
    LessonPlayer.jsx           the loop; handleResult (tiered hints) + PolaroidReveal mount
    steps.jsx                  ALL step views + Feedback + PolaroidReveal + show-why widgets
  components/ui.jsx            Button, Card, Slider, ProgressBar, ApertureIris, Logo
  content/course.js            the 9 lessons as data  ← most content lives here
  pages/                       AuthPage, HomePage (gallery), CoursePathPage, LessonPage
```
**Step kinds** (in `steps.jsx` STEP_VIEWS): `intro, predict (MC), capture, slider-sim, triangle, compose, dof, motion, rank`.

**Lessons today** (`course.js`):
1. `collected-light` — intro · capture (collect light to target) · intro (stops) · predict
2. `aperture-hole` — intro · slider-sim (brightness on `room`) · intro (f = fraction) · **rank** (order apertures by light)
3. `depth-of-field` — intro · **dof ×4** (aperture → distance → focal → all four, side-view diagram) · predict  ← THE ONE TO REDESIGN
4. `shutter-speed` — intro · **motion** (animated car; sharp live, blur on capture) · **rank** (order shutters by blur)
5. `iso-noise` — intro · slider-sim (brighten night) · intro (grain cost) · slider-sim (lowest usable ISO) · predict
6. `the-triangle` — intro · triangle (balance 3 sliders) · predict
7. `metering` — intro · slider-sim (histogram) · predict
8. `white-balance` — intro · slider-sim (temp/WB on `seascape`) · predict
9. `rule-of-thirds` — intro · compose (drag subject onto a power point) · predict

**Data model** (`users/{uid}` in Firestore, mirrored in localStorage):
`{ email, displayName, isAnonymous, totalXp, lastLesson, shots: [{key, lessonId, stepIndex, verdict:'keeper'|'experiment', scene, params, image?, createdAt}], courses: { exposure: { completedLessonIds, lessons: { <id>: {status, resumeStepIndex, attempts, correct, wrong} } } } }`

---

## Recommended next steps (in priority order)

### 1. Redesign Depth of Field (the big one)
- **Drop the side-view lens diagram** as the primary view (it's disliked + complex). Optionally keep it behind an "advanced" toggle, or delete `DofView` and the diagram `Silhouette`/`ReadoutCard` code.
- Build a **forward-facing bokeh demo**: a **flower** (sharp foreground/subject) with a few **background objects** (trees, lights) that **blur smoothly as the aperture opens**. One aperture slider; show the photo. Maybe a 2nd step adds distance/focal as "also affects this" — but keep it short (≈2–3 steps, not 6).
- **Fix the blur.** Do NOT box-blur the low-res grid (blocky edges). Recommended: render the **background on its own layer and apply CSS `filter: blur(Xpx)`**, with the sharp subject composited on top — clean, GPU-cheap, good edges. `dof.js` can still compute a believable blur radius from aperture (+distance/focal if wanted).

### 2. Fix the motion → polaroid artifact (`steps.jsx` MotionView + PolaroidReveal)
- When the shutter fires, **stop/clear the live canvas** (or make the `PolaroidReveal` backdrop opaque) so the blurred car doesn't show through behind the polaroid. After dismiss, don't leave a messy blurred frame in the view — reset to live, or show only the clean captured polaroid.

### 3. Remove the remaining multiple choice
- Build a **drag-to-bin / sort** interaction for conceptual questions (e.g. "sort each control into *deepens DoF* / *shallows DoF*"). Convert L1, L3, L5, L6, L7, L8, L9 predicts to `rank` or the new sort. `rank` already exists and works.

### 4. Consistency + polish pass
- Make the interactive parts visually consistent. Re-check on **mobile (375px)** — `preview_resize` preset mobile; the DoF cards already needed a 2×2 fix once.

### 5. Then: deploy + later phases
- **Deploy:** run `firebase login` once (interactive — can't be automated), then `npm run deploy` (builds + deploys Hosting + Firestore rules). Site → `aperture-dac66.web.app`.
- **Enable Anonymous sign-in** in the Firebase console, or "Try a lesson without an account" stays broken (currently errors `auth/admin-restricted-operation` — handled gracefully with a message).
- Then **Fri = AI Socratic tutor**, **Sun = learning science** (spacing, checkpoint) per `PRD.md`.

---

## How to run / test
- **Dev:** `npm run dev` → http://localhost:5173 (or the Claude_Preview MCP, server name `aperture` from `.claude/launch.json`).
- **Verify in-browser** (don't trust a single screenshot of an animated step): play full lesson flows, click Next between lessons, test wrong answers, and **check mobile width**.
- **Sim acceptance gate:** `node Redesign/gate.mjs` (prints L2 brightness monotonicity + L7 metering window — extend it for new sims).
- **Build:** `npm run build`. **Firebase config** lives in `.env` (gitignored; web keys are public, not secret). Project: `aperture-dac66`.

## Design history (so we don't re-loop)
- All-geometric pixel-art, **no real photos** — locked.
- DoF: pixel-blur portrait ("bad") → **side-view lens diagram** (liked initially, now "too complicated/disliked") → **now: simple forward flower-bokeh photo with better blur**.
- Subject: crude person → sunflower → bust silhouette → **flower (for the new forward DoF)**.
- Feedback: multiple-choice → **Socratic no-reveal + show-why**; MC being replaced by `rank`/drag interactions.
- Research + plan: `Research/`, `Redesign/00-REDESIGN-PLAN.md`, `Redesign/AUDIT-LEDGER.md` (open issues tracked there too).

## Honest assessment
The **engine, feedback model, auth/persistence, gallery, and the exposure-triangle lessons (1,2,4,5,6) are in good shape.** The **DoF lesson (3) needs a ground-up simpler redesign**, the **blur needs to be layered/CSS not per-cell**, and the **motion→polaroid flow has a visual bug**. Multiple choice should be finished off. Do those four, then it's deploy + AI tutor + learning science.
