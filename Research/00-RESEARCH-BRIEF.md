# Brilliant-Style Photography Learning App — Research Foundation

**Project:** "Aperture" (working title) — a simple, beautiful, truly interactive photography micro-course modeled on Brilliant.org
**Date:** 2026-06-23
**Grading priority:** UX & design quality in doing what Brilliant does. Photography content is the vehicle, not the point. **Simplicity and beauty come first.**

---

## 1. Executive Summary

Brilliant.org's magic is not its content — it's a **disciplined interaction loop** wrapped in a **calm, premium, game-feel design system**. We are cloning *that loop and that feel*, applied to photography's exposure fundamentals.

**What Brilliant does that we must replicate (the non-negotiables):**

1. **Pretest, then teach.** Every lesson opens with a thing to *attempt*, never a definition. The struggle primes the explanation.
2. **Learn by doing — one knob per concept.** Every screen has something to manipulate (slider, drag, tap) with an *immediate visible consequence*. No videos, no walls of text.
3. **One concept per lesson, simplest-first.** ~5–15 min lessons, single idea each, laddered into a path.
4. **Instant, warm feedback — and the wrong-answer correction is itself interactive.** A miss never sits without a "why," and the why lets you *re-manipulate the variable*, not just read an answer key.
5. **A calm, restrained, tactile visual system.** Single narrow column (~432px), one accent color per screen, chunky pressable buttons with hard offset shadows, motion that rewards rather than decorates.
6. **A lightweight habit loop.** XP for *solving* (not scrolling), a streak, a visible progress path, celebratory micro-moments. Cross-device persistence so you resume exactly where you left off.

**Our north star:** *Simple, beautiful, and truly interactive.* A learner with zero photography knowledge drags a slider, watches a real photo blur, guesses wrong, gets gently corrected by toggling the variable themselves, and feels the "aha." If a screen has a paragraph instead of a knob, we've failed. If a screen has three things to do at once, we've failed. **Depth over breadth: one course, done beautifully, end-to-end.**

**Important reality check from research:** Brilliant teaches *only STEM* — there is no Brilliant photography course. So the photography mapping is our application of Brilliant's documented design principles, not a copy of an existing Brilliant course. The exposure triangle is, however, a near-perfect fit: each control is a clean slider with one dominant, cheaply-simulatable visual effect, and the "balance" is a built-in puzzle that mirrors Brilliant's signature balance-scale mechanic.

---

## 2. What Makes Brilliant Work (Pedagogy)

These are the transferable mechanics. Each maps directly to a photography move.

### 2.1 Pretest before instruction (the single most important mechanic)
Brilliant inverts the normal order: *attempt → then explain*, not *explain → then quiz*. A failed retrieval attempt before instruction beats being handed the answer, because the struggle primes absorption (the pretesting / testing effect; Roediger & Karpicke found retrieval-practice groups retained 61% after a week vs. 40% for re-readers, who nonetheless *felt* more confident).

> **Photography move:** Don't open with "The exposure triangle is aperture, shutter, ISO." Open with two photos of the same scene — one blurry-bright, one sharp-dark — and ask *"Which setting changed?"* Let them guess first.

### 2.2 The canonical lesson rhythm
Synthesized across sources, every lesson follows:

**simplest-case hook → manipulate/predict → solve → feedback + why → celebrate → next**

- **Hook:** concrete visual setup, 2–4 sentences max with an illustration/animation, simplest version of the idea (minimize cognitive load).
- **Manipulate/predict:** the learner turns a knob and predicts.
- **Solve:** a question with a real answer (MC, numeric, drag, slider-target).
- **Feedback + why:** instant, custom, per-answer. Show the reasoning even when correct.
- **Celebrate → next:** a satisfying micro-flourish + XP tally, then a nudge to the next node.

### 2.3 Feedback on wrong answers (warm + *interactive correction*)
This is the most differentiating mechanic and deserves real build time. When wrong:
- **Tone is encouraging, never punitive** ("Almost — most people guess this. Here's what's actually happening…"). Note that Brilliant's own *incorrect* feedback panel is **calm gray, not red** — a deliberate emotional choice.
- **The correction is interactive.** Don't just say "f/1.8." Re-show the two images and let the learner *toggle* between f/1.8 and f/16 to feel the difference, then state the rule.
- **Scaffold back:** miss twice → drop a hint ("Smaller f-number = wider opening = shallower focus") → offer an easier variant → return to the original. Socratic, never just handing over the answer.

### 2.4 Scaffolding & difficulty ramp
- **One concept per lesson.** Hold all-but-one variable fixed.
- **Simplest-first within and across lessons.** Build a *staircase*, not a sandbox: isolate each variable before revealing the full system.
- **Minimal text** — a sentence beside every interactive, never a wall. Photography is inherently visual; lean all the way in.

### 2.5 Reward recall, not consumption
XP is earned for *solving problems*, not scrolling. Keep failure private; celebrate progress. (Stretch / learning-science day: space earlier concepts into later lessons — an edge Brilliant itself underuses.)

---

## 3. UX & Habit Loop

### 3.1 Information architecture
Brilliant's real hierarchy (note the naming quirk: a unit/chapter is called a **"Level"**):

```
Subject → Learning Path → Course → Level (unit) → Lesson → Interactive step
```

A course header advertises two counts — **"N Lessons · M Exercises"** — over a vertical list of Levels, each ending in a **"Level Review."** The in-course map is the **"Level Gameboard"**; a learning companion points to the next lesson while "maintaining the user's freedom of choice."

**Our simplified IA (MVP):**
```
Course: "Exposure" → 6 lessons (a single Level) → steps within each lesson
```
We ship **one course = one Level**, rendered as a vertical gameboard path. No subjects, no multiple paths.

### 3.2 The core lesson loop screens
Per problem: **concept intro → interactive problem → submit → instant feedback (celebrate if right / staged interactive hint if wrong) → Continue.** 10–25 problems is Brilliant's range; for our MVP target **6–10 steps per lesson** (~8–12 min). End on a **completion card** (mini-image + lesson title + Continue / Redo), where XP and streak register.

### 3.3 Onboarding (keep it tiny)
Brilliant asks a few short interest/goal questions (*why are you here? student / curious / professional?*) → recommends a path. There is **no verified graded placement quiz**. For us: a 1–2 screen welcome, then straight into Lesson 1. Don't build adaptive placement.

### 3.4 Persistence, mobile/desktop
- **Account is the unit of persistence**; progress auto-syncs across devices; pause/resume without losing context. This guarantees the "log out → log back in → resume" behavior.
- **Mobile parity matters** — the 5–15 min format is built for the thumb. Mobile = single full-screen column, Continue button bottom, mute top-right. Desktop = same narrow column centered in whitespace (optionally with the gameboard alongside).

### 3.5 Habit loop (verified Brilliant mechanics; we adopt a subset)
- **Streak:** consecutive days; extended by completing 3 problems or a full lesson. **Streak Charge** = a freeze token (earn 1 per completion, hold max 2) that forgives a missed day.
- **XP:** earned for completing lessons / solving problems; repeating a finished lesson earns none.
- **Leagues** (30 learners, weekly, 10 element-named tiers Hydrogen→Einsteinium): **out of scope for MVP** — defer the whole social layer.
- **Sound effects toggleable / default-off** (reviewers found them annoying).

### 3.6 Test scenario mapping: login → lesson → progress → resume

| Step | Screen | What happens |
|---|---|---|
| **0. Onboarding** (first run) | 1–2 welcome screens | Optional name; no graded test. → Home |
| **1. Log in** | Email/Google auth → **Home** | Shows resume card ("where you left off"), streak, XP, the course path. **One Firestore read.** |
| **2. Open course** | **Course path** ("Exposure") | "6 Lessons · N Exercises"; vertical gameboard, completed lessons checked, next highlighted. |
| **3. Start lesson** | **Concept intro** | 2–4 sentences + illustration. Bottom: Continue. |
| **4. Interactive steps** | **Problem screens** ×6–10 | Drag/tap/slider → Submit → instant feedback. Correct = celebration; wrong = interactive hint → staged explanation. Mobile: full-screen, bottom Continue. |
| **5. Finish lesson** | **Completion card** | Mini-image + title + Continue / Redo. **XP added, streak advanced, +1 Streak Charge.** |
| **6. See progress** | Back to **path/Home** | New checkmark; streak ticks; resume card updates. |
| **7. Log out** | Settings → Log out | State lives on the account. |
| **8. Resume** | Re-auth → **Home** | Auto-synced: same streak/XP and a resume card pointing back into the exact step (`resumeStepIndex`). |

---

## 4. Visual Design System (PRIORITY)

This is the graded core. The values below are grounded in Brilliant's *actual production design tokens* (extracted from its live CSS, a Chakra-based `--bits-*` system) plus the Koto / ustwo / Rive case studies. **Key correction: Brilliant is NOT navy.** It is **white light-mode + charcoal dark-mode**, with bright fruit-named accents. Blue is an accent, never the ground.

### 4.1 The three load-bearing design ideas
1. **One idea per screen** in a **single narrow column (~432px)** surrounded by whitespace. This *is* the layout system.
2. **Game feel:** whimsical flourishes on success, encouragement on struggle, a visible progress gameboard.
3. **Restraint everywhere else:** near-monochrome canvas, one bright accent doing the work per screen, generous spacing.

### 4.2 Palette (hex — grounded in Brilliant's real tokens)

**Canvas / neutrals**
| Token | Hex | Role |
|---|---|---|
| `--bg` | `#FFFFFF` | light page background |
| `--surface` | `#F8F8F8` | secondary surface |
| `--ink` | `#141414` | primary text (also dark-mode bg) |
| `--card-dark` | `#1E1E1E` | dark-mode cards (charcoal, **not navy**) |
| `--muted` | `#666666` | secondary text |
| `--border` | `#E5E5E5` | hairline borders |

Gray ramp: `#F8F8F8 #F2F2F2 #E5E5E5 #CCCCCC #B3B3B3 #999999 #666666 #4C4C4C #383838 #141414`

**Accents (use ONE per screen)**
| Hue | Hex (500) | Role |
|---|---|---|
| **Pear** (signature) | `#D8E82E` | primary CTA, streaks, brand moments |
| **Blue** | `#456DFF` | links, selection/focus, secondary CTA |
| **Green** | `#29CC57` | success/correct |
| **Red** | `#FF5D5D` | hard errors only (NOT wrong-answer feedback) |
| **Yellow** | `#F7C325` | warning / "retry" |
| Papaya `#FF775C`, Purple `#9D62FF`, Mint `#5CF0B6` | — | optional topic-coding / illustration |

**Feedback fills (the literal answer-panel backgrounds)**
- **Correct:** light `#D4F5DD` mint / dark `#00370F` forest green.
- **Incorrect:** **calm gray** light `#E5E5E5` / dark `#383838` — *not red*. This is a deliberate emotional decision.
- **Retry ("close"):** amber, light `#FCE49D` / dark `#403000`.

**Feel:** calm-but-cheerful. Near-monochrome ground; one saturated, slightly-retro fruit accent per screen as celebration/topic color, never a large fill.

### 4.3 Typography
- **Brilliant uses** custom CoFo Sans (UI) + CoFo Robert (marketing slab). These are paid. **Free analogs with the right "square-ish, friendly geometric" character:** **General Sans**, **Geist**, or **Inter** (self-host via `@font-face` to avoid FOUT). Pick one and use it for both headings and body — Brilliant uses size + weight + tracking for hierarchy, not a contrasting face.
- **Mono** (for f-numbers, shutter values): system mono stack `SFMono-Regular, Menlo, monospace`.
- **Scale (rem):** body `1.0` (16px); **problem/lesson text `1.125` (18px)**; headings `1.5–2.25`; hero `3`+.
- **Weights:** body 400–500; headings/buttons 600–700; heavy weights sparingly.
- **Line height** 1.5; **reading measure capped at 60ch**; slight negative tracking (`-0.025em`) on large headings.

### 4.4 Spacing & layout
- **4px base grid** (`space-1 = 4px`).
- **Two widths:** lesson/reading content **~432px** single centered column; dashboards up to ~1216px. The narrow column is *the* "uncluttered, focused" device — mostly whitespace framing one interactive.
- **Radii:** buttons/tiles `12–20px`; pills/avatars full.

### 4.5 Widget aesthetics (the tactile "game" look)
The signature detail: **chunky buttons/cards with a hard, non-blurred offset bottom shadow** — a solid colored lip so it reads as a physical key.
- Resting card: `box-shadow: 0 2px 0 0 #CCCCCC;`
- Pressed/active: deepen to `0 4px 0 0` (compress on press).
- Completed (course card): hard green offset edge `4px 4px 0 0 green-800`, grows to `6px 6px` on hover.
- All answer chips / draggables / MC tiles share: flat fill, 12–20px radius, hard offset shadow, state change on hover/active.
- **Focus/selection:** blue `#456DFF`; focus ring `0 0 0 1px #fff, 0 0 0 3px #456DFF`.
- **Progress bar:** segmented; incorrect segment is subtle gray `#666666`, never alarming.

### 4.6 Motion (verified timings)
- **Durations:** fast `150ms`, normal `200ms`, slow `300ms`.
- **Easing:** default enter `cubic-bezier(0,0,0.2,1)`; **celebratory "pop" `cubic-bezier(0.16,1,0.3,1)`** (expo-out overshoot).
- Animate **transform + box-shadow + fill together** → produces the "press" feel.
- **Correct** = green panel snaps in with the expo pop + XP counter choreographed to the count.
- **Wrong** = calm, soft; encouragement, no alarm.
- **Loading** = thematic (not a generic spinner) — a small aperture-iris assembling works as our brand analog to Brilliant's tangram.
- Keep audio/haptics optional, default-off.

### 4.7 Illustration style
Brilliant's "PIX" system: **flat, geometric, built from straight-edged line segments**, bold flat fills, minimal gradients, confident linework — visually rhyming with the square-ish type. **Our analog:** simple geometric SVG (aperture blades, light buckets, balance scale, a friendly particle-style mascot guide). All diagrams are *interactive*, not decorative.

### 4.8 Starter design-token set (drop-in)
```css
:root{
  /* color */
  --bg:#FFFFFF; --surface:#F8F8F8; --ink:#141414; --muted:#666666; --border:#E5E5E5;
  --accent:#D8E82E;        /* pear — primary CTA / streak */
  --accent-ink:#141414;    /* text on pear */
  --link:#456DFF; --select:#456DFF;
  --correct-bg:#D4F5DD; --correct-ink:#00370F;
  --wrong-bg:#E5E5E5;  --wrong-ink:#383838;   /* calm gray, NOT red */
  --retry-bg:#FCE49D;  --retry-ink:#403000;
  --error:#FF5D5D;     /* hard errors only */
  /* type */
  --font:"General Sans","Inter",system-ui,sans-serif;
  --font-mono:"SFMono-Regular",Menlo,monospace;
  --fs-body:1rem; --fs-problem:1.125rem; --fs-h2:1.5rem; --fs-h1:2.25rem;
  --lh:1.5; --measure:60ch;
  /* space / shape */
  --space:4px; --col:432px; --radius:16px; --radius-pill:9999px;
  /* shadow (hard offset) */
  --shadow-rest:0 2px 0 0 #CCCCCC;
  --shadow-press:0 4px 0 0 rgba(0,0,0,.2);
  --ring:0 0 0 1px #fff, 0 0 0 3px var(--select);
  /* motion */
  --dur-fast:150ms; --dur:200ms; --dur-slow:300ms;
  --ease:cubic-bezier(0,0,0.2,1);
  --ease-pop:cubic-bezier(0.16,1,0.3,1);
}
```

---

## 5. Recommended Domain Scope

**Build the Exposure Triangle chapter.** This is the strongly-supported recommendation, for reasons specific to Brilliant's mechanics, not just popularity:

1. **It's the canonical entry point** of every beginner curriculum (dPS, Northrup, B&H, Photography Life) — the clearest "I learned the foundational thing" payoff.
2. **Each variable is a clean slider with one distinct, cheaply-simulatable consequence** — rare and valuable: aperture→blur, shutter→motion, ISO→brightness+noise. All renderable with CSS filters / canvas, *no large photo library required*.
3. **The interdependence IS a puzzle with a correct answer** — it maps directly onto Brilliant's signature balance-scale mechanic ("change one, compensate another to hold exposure level"). Composition can't offer this objectivity; metering requires the triangle first.

**The critical caveat:** *don't build "three sliders, go play"* (that's just another CameraSim). The pedagogical value is **isolating one variable per lesson first**, then revealing the system at the end. Build it as a **staircase**, not a sandbox.

### Lesson outline (6 lessons, staircase order)

| # | Title | Core idea | Hands-on interaction | Misconception corrected |
|---|---|---|---|---|
| **1** | **Light is a Bucket** | A photo = collected light; "correct" = a *target* fill, not max brightness. A *stop* = double/half the light. | Single brightness slider over a fixed scene + a "bucket fill" meter. *Drag to the correct exposure before any control is named.* | "Brighter is always better"; exposure is magic/automatic. |
| **2** | **Aperture: the Pizza-Slice Hole** | Aperture = hole size; f-numbers are fractions, so **f/1.8 is big, f/22 is tiny**. Wider = more light. | f-stop slider with an animating iris graphic; image brightens/darkens. *"To let in MORE light, move toward f/1.8 or f/22?"* | "Bigger number = bigger opening" (the #1 beginner trap). |
| **3** | **Aperture's Secret Job: Depth of Field** | Wide aperture blurs the background; narrow keeps everything sharp. | Same slider, brightness auto-held so *only* blur changes. *"Make the portrait pop" / "make the landscape sharp."* | "Blur = always better"; that DoF is aperture-only (tease distance/focal length, don't dump). |
| **4** | **Shutter Speed: Freeze or Blur Time** | Fast freezes motion; slow blurs it; longer = brighter. | Shutter slider over an animated subject (runner/waterfall) + tripod/handheld toggle. *"Freeze the sprinter" / "make the waterfall silky."* | "Blur is always a mistake"; subject blur ≠ camera shake (reciprocal rule). |
| **5** | **ISO: the Volume Knob with a Cost** | ISO amplifies signal → brightens, but adds noise/grain. | ISO slider over a dim scene + a 100% zoom-loupe inset on the shadows. *"Brighten to usable with the LEAST noise."* | "High ISO is always bad / never above 400." ISO is the third resort, a tool not a sin. |
| **6** | **The Triangle: Balance the Three** | All three share one job (light); change one → compensate another, but each compensation has a creative side effect. | All three sliders live + a persistent exposure meter that must stay centered. Constraint puzzle: *"Dim sports game — keep shutter at 1/1000s. Photo's too dark. Fix it."* | Settings are independent; there's one "right" answer (equivalent exposures exist). |

*(Optional stretch L7 — "Be the Photographer": scored free-play sandbox across portrait/sports/landscape/night scenes. Only after the staircase is mastered.)*

---

## 6. Interactive Widget Catalog

Difficulty: 🟢 easy (SVG/CSS + slider) · 🟡 medium (canvas blur/noise compositing) · 🔴 hard (defer).

| Lesson | Widget | Manipulated | Changes in real time | Difficulty |
|---|---|---|---|---|
| **1** | **Bucket** (shutter-as-valve cousin) | brightness slider | image `brightness()` + an SVG "bucket" fills proportionally | 🟢 |
| **2** | **The Iris (brightness)** | f-stop slider | SVG iris blades open/close in sync; image brightens/darkens | 🟢 (iris) / 🟡 (smooth) |
| **3** | **The Iris (DoF)** | f-stop slider, brightness auto-held | background `blur()` grows toward f/1.8; highlights bloom into bokeh discs; foreground stays crisp | 🟡 |
| **4** | **Freeze or Flow** | shutter slider (log), scene picker, tripod toggle | moving subject smears into a motion trail (waterfall silky / headlights ribbon); tripod toggle isolates shake from subject blur | 🟡 |
| **5** | **Turning up the Gain** | ISO slider (100→25600) | image brightens; past ~1600 grain crawls into shadows; a zoom-loupe magnifies a shadow patch so noise is unmistakable | 🟡 |
| **6** | **The Light Balance** (hero) | 3 sliders (aperture/shutter/ISO) in stops + ambient-light control | a balance-beam tilts off-level on any change; learner re-levels by trading a stop elsewhere; preview shows blur/motion/grain shifting *while brightness stays constant* | 🟡 (composes L2–L5 engines) |
| **6** | **Reciprocity puzzle** | given a baseline, hit a goal ("freeze the bird, same brightness") | instant pass/fail: beam levels + checkmark celebration when math balances AND goal met | 🟢 (thin layer over hero) |

**Core insight to engineer once:** L6's hero reuses the blur (L3), motion (L4), and noise (L5) engines. The exposure math is simple arithmetic — `EV = log2(aperture²) + log2(1/shutter) − log2(ISO/100)` — and the beam reads the delta from target via an SVG rotation transform. **Build the three single-concept engines first, then compose the hero.**

**Deferred widgets** (not MVP): live histogram with clipping (🟡, great but metering is a later chapter), rule-of-thirds drag-snap (🟢, lovely but composition is a different chapter), focal-length/compression "dolly zoom" (🔴, needs 3D or matched photo sequence). The rule-of-thirds drag-snap is noted as the single easiest *delightful* widget — keep it as a candidate "morale-boost" demo if we want one non-exposure flourish, but it's out of the core staircase.

---

## 7. Recommended Tech Approach

**Stack (boring, well-documented, minimal):**

| Concern | Pick |
|---|---|
| Build | **Vite + React** (JS, not TS, for a 1-week sprint unless already fluent) |
| Styling | **Tailwind CSS** (tokens enforced → consistent polish fast) |
| Components | hand-rolled ~10 small Tailwind components; borrow accessible primitives from shadcn/ui only if needed |
| Animation | **plain CSS transitions** (+ optional Framer/Motion later only for enter/exit + spring) — **no Rive/Lottie** |
| Drag/sliders | **native Pointer Events** + `setPointerCapture()` + `touch-action:none` — one reusable `<Slider>`, no library |
| Photo sims | real `<img>` + CSS `filter` (`blur`, `brightness`, `contrast`) + SVG overlays; Canvas only for noise/loupe |
| Backend | **Firebase Auth + Firestore** (Spark free tier) |
| Hosting | **Firebase Hosting** (one `firebase deploy`) |
| Routing | `react-router-dom`, ~4 routes |

Total runtime deps: `react`, `react-dom`, `react-router-dom`, `firebase` (+ optional `framer-motion`).

### 7.1 Rendering sims simply (the key technique)
- **DoF / blur:** `filter: blur(Xpx)` on a background layer, sharp subject on top; drive the px from the aperture slider. For realistic falloff, combine `blur()` with a `mask-image` linear-gradient. Fake bokeh = soft radial-gradient discs where highlight pixels exceed a threshold.
- **Exposure:** `filter: brightness(b) contrast(c)`; map the three sliders to a computed brightness so the triangle visibly balances.
- **Motion blur:** composite N sampled frames of the moving sprite at decreasing opacity (N scales with exposure time), or SVG `feGaussianBlur`.
- **Noise (ISO):** a canvas pixel pass adding random noise weighted into the shadows; the loupe is a second small canvas sampling a region at higher scale.
- **Iris / balance scale / diagrams:** SVG `<path>`s + CSS transform driven by the slider.
- **Performance trap:** do **not** put a CSS `transition` on `filter` or animate it frame-by-frame on large images (forces re-rasterization). Use modest-resolution images and update the filter value directly on drag.

### 7.2 The lesson engine (the one architectural idea to get right)
Represent **every lesson as data, not bespoke components.** A lesson = an array of *step* objects; each `type` maps to a renderer in a registry. The engine drives the universal loop (render → act → check → feedback → next). New lessons become content files, not new code. Centralize the interactive wrong-answer behavior in one `<Feedback>` component.

```
src/
  lib/        firebase.js, progress.js   (all Firestore lives here)
  engine/     LessonPlayer.jsx, useLessonState.js, stepTypes.js, Feedback.jsx
  components/ Slider.jsx, PhotoSim.jsx, ApertureSVG.jsx, Button, Card, ProgressBar
  content/    courses.js, exposure/lesson1..6.js   (STATIC — not in Firestore)
  pages/      Home, CoursePath, Lesson, Auth
  hooks/      useAuth.js
```

```js
// example step
{ type:"slider-sim",
  prompt:"Widen the aperture until the background blurs.",
  sim:{ image:"/img/portrait.jpg" },
  param:{ key:"aperture", min:1.4, max:16 },
  check:(v)=> v<=2.8,
  feedback:{ correct:"A wide aperture (low f-number) blurs the background.",
             wrong:"Try lower f-numbers — watch the background as you drag." } }
```

### 7.3 Firestore schema (auth + progress)
- **Auth:** anonymous-by-default on first load (zero-friction try); email/password to make it permanent; **`linkWithCredential` on sign-up so anonymous progress carries over** (the single most valuable auth detail).
- **Lesson content lives in the bundle (static JS), NOT Firestore** — only user state is stored.
- **Denormalize a roll-up onto `users/{uid}`** so Home reads **one doc**.

```
users/{uid}
  email | null, isAnonymous, createdAt
  lastLesson: { courseId, lessonId, stepIndex }   // resume in 1 read
  totalXp
  streak: { count, lastActiveDay }

users/{uid}/progress/{courseId}
  completedLessonIds: [...]
  lessons: {
    "<lessonId>": { status, resumeStepIndex, attempts, correct, wrong, lastAttemptAt }
  }
```
- **Write economy:** debounce `resumeStepIndex` on step change; write counters on lesson completion. Don't write per keystroke.
- **Security rules (non-negotiable, a few lines):** `allow read, write: if request.auth.uid == uid;`
- Spark free tier (1GB / 50k reads / 20k writes per day; 10GB/mo hosting transfer) is far more than enough. *(Confirm current Spark billing mechanics on the live pricing page before launch.)*

---

## 8. Recommended User Persona

**Pick: the adult beginner hobbyist** (e.g., someone who just bought their first mirrorless/DSLR, or shoots on a phone in "pro" mode and wants to understand *why*).

**Why:**
- **Matches the content's natural audience.** The exposure triangle is the universal entry point for adults picking up a real camera — the largest, most motivated "I want to finally understand this" group.
- **Justifies the calm, premium aesthetic.** Our graded design direction (restrained, sophisticated, whitespace-heavy) reads as "designed for a discerning adult," not gamified-for-teens. A high-schooler persona would pull us toward louder gamification, which fights the simplicity north star.
- **Tolerates — even wants — depth-over-breadth.** A hobbyist is happy with one beautifully-built chapter they can finish in a sitting; they're intrinsically motivated, so we can keep the habit layer light (streak + XP) rather than building leagues.
- **Mobile + desktop both plausible** — commute-sized 8–12 min lessons fit the hobbyist's life, validating mobile parity without forcing a mobile-only build.

Design implications: warm-but-grown-up tone, real photographs in sims (not cartoons), explanations that respect intelligence, and zero condescension on wrong answers.

---

## 9. Scope Discipline

### In scope — Wed MVP
- **One course ("Exposure"), 6 lessons**, end-to-end and polished. Depth over breadth.
- The **lesson engine** (data-driven steps + registry + interactive `<Feedback>`).
- **Core widgets:** brightness/bucket (L1), iris brightness + DoF (L2–3), freeze/flow (L4), ISO+loupe (L5), **the Light Balance hero + reciprocity puzzle (L6)**.
- **Anonymous→email auth** with credential linking; **Firestore progress** (resume, counters, streak, XP roll-up); **security rules**.
- **Home / course-path / lesson / completion** screens; **resume-where-you-left-off**.
- **Full design system** applied: palette, type, narrow column, chunky pressable widgets, calm-gray wrong feedback, CSS-transition celebration.
- **Mobile + desktop responsive**; sound default-off.

### Out of scope — Wed MVP (explicit cut list)
- Leagues / leaderboards / friends / any social layer.
- Payments / paywall.
- Real image upload, per-pixel histograms, true bokeh, focal-length/compression (🔴) widgets.
- Composition & metering chapters (different chapters; defer).
- Admin/authoring UI (author by editing `content/*.js`).
- Offline / PWA / push notifications.
- Multiple courses or paths.
- Rive/Lottie; paid CoFo fonts (use a free analog).
- Graded placement quiz.

### Defer to Fri (AI tutor)
- A **Socratic hint tutor** (Brilliant's "Koji") that can see the current step and guide step-by-step without giving the answer; pinpoints the misconception. The wrong-answer interactive correction we build Wed is the manual scaffold this later automates.

### Defer to Sun (learning science)
- **Spaced repetition** — resurface earlier concepts in later lessons (2d / 1w / 2w), the documented edge over Brilliant.
- **Retention measurement** at 7- and 30-day delays rather than immediate scores.
- Equivalent-exposure mastery checks / Level Review as a true retrieval test.

---

## 10. Open Questions for the User (decide before the PRD)

1. **Persona lock:** Confirm **adult beginner hobbyist** (my recommendation) vs. high-schooler — this sets tone, illustration style, and how loud the gamification gets.
2. **Lesson count for Wed:** Ship all **6** lessons, or guarantee **3–4 polished** (L1–L4) plus the hero as a stretch? (Depth-over-breadth says: make fewer perfect before adding more.)
3. **Sim asset style:** Real **photographs** (more convincing, needs a small curated set per scene) vs. **illustrated/SVG scenes** (fully on-brand "PIX" geometric look, zero photo licensing, but less "wow"). My lean: real photos for DoF/ISO sims, SVG for diagrams.
4. **Mascot/companion:** Do we want a Koji-style friendly guide character (adds warmth + sets up the Fri AI tutor), or keep it character-free and purely typographic?
5. **Auth friction:** Anonymous-first (start a lesson instantly, sign up later) vs. require email up front? (Anonymous-first is more Brilliant-like and demos better.)
6. **Habit layer depth for Wed:** streak + XP only (recommended), or also a visible "League"-style element? (Recommend deferring all social.)
7. **Font choice:** General Sans vs. Inter vs. Geist as the CoFo Sans analog — any brand preference?

---

**Bottom line:** Build the Exposure Triangle as a 6-lesson staircase for an adult beginner, on a Vite+React+Firebase stack, with a data-driven lesson engine and CSS-filter sims. Win the grade on the design system — calm white/charcoal canvas, one pear accent per screen, a single 432px column, chunky pressable widgets, calm-gray (never red) wrong-answer feedback, and one satisfying expo-pop celebration. The hero is the Light Balance widget; the soul is the pretest-then-teach loop with interactive wrong-answer correction.

*Verification notes carried from research: Brilliant has no real photography course (the mapping is applied design principles); exact CoFo fonts are paid (use free analogs); the palette hexes are extracted from Brilliant's live CSS and are safe to adopt; confirm Spark-plan billing mechanics before launch.*