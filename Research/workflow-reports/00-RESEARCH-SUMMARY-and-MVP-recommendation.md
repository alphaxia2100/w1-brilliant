# Research Summary & MVP Recommendation
### Photography Learning App — A Brilliant-Style Interactive Clone

---

## 1. TL;DR

- **Build "The Exposure Triangle" as the one MVP chapter** — it's the universally-agreed Chapter 1 of photography, and a closed numeric system (stops) that is the single most browser-simulatable concept in the entire domain.
- **Target the "stuck in Auto" adult hobbyist** (~25–45, owns a mirrorless/DSLR, intimidated by Manual mode, motivated to "get off Auto"). Mobile-first, web-responsive.
- **Clone Brilliant's exact in-lesson loop**: predict/act *before* teaching → one live-updating simulation per step → instant non-punitive feedback → tiered hints on wrong answers → one new variable per step.
- **Ship 6 lessons** of ~5–8 interactive steps each, all driven by ONE reusable `ExposureScene` simulation and a typed-step content schema (lessons authored as JSON, not new code).
- **Stack is React + Vite + Firebase** (Anonymous-first Auth → upgrade to email; Firestore UID-keyed progress for cross-device resume; CSS/SVG filters for the photo effects). **AI tutor, leagues, and advanced chapters are explicitly deferred.**

---

## 2. Recommended User Persona

**"Priya, the Auto-mode escapee."**

| Attribute | Recommendation |
|---|---|
| **Who** | Adult hobbyist, ~25–45. Recently bought an interchangeable-lens camera (mirrorless or DSLR) — often a new parent, traveler, or recent enthusiast. |
| **Goal** | "Get off Auto and actually understand my dials." Wants to deliberately control blur, motion, and brightness instead of letting the camera guess. |
| **Device** | Mobile-first (the habit-forming surface — short sessions, on the couch/commute) but fully responsive to desktop (the deep-work surface). |
| **Motivation** | Intimidated by Manual mode, which feels like "too many numbers." Highly motivated by *seeing* cause-and-effect and by quick, reassuring wins. Aperture Priority is the confidence bridge. |
| **Tone needed** | Reassuring, concrete, goal-framed ("By the end of this chapter you'll control aperture, shutter, and ISO yourself"). Not aimed at teens or working pros. |

This persona is well-documented across manual-mode guides (Fstoppers, Digital Photography School, The Blonde Abroad) and directly dictates the chapter framing: lower the intimidation barrier with analogies (aperture = the pupil of your eye; exposure = a bucket filling with light).

---

## 3. Recommended MVP Concept & Chapter

### Pick: **"The Exposure Triangle — Get Off Auto"** (one chapter / one Brilliant "Level")

This is the decisive, non-arbitrary choice. Two independent lines of research converge on it:

**It is foundational.** Every reputable beginner curriculum surveyed (B&H eXplora, Photography Life, StudioBinder, PetaPixel, Digital Photography School, university Photography-101 syllabi) treats the exposure triangle as *the* first concept — taught before composition, lighting, or lenses, because every other technical and creative decision depends on it. A photographer evaluating our clone will immediately recognize it as "correct."

**It is the most interactive-simulatable concept in a browser.** The triangle is a *closed numeric system*:
- A **"stop"** is the atomic unit — one stop doubles or halves the light, *identically* across all three controls.
- Each control snaps to a finite, ordered ladder: aperture (f/1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22), shutter (1/4000…1/250…1s, 2s, 4s), ISO (100, 200, 400, 800, 1600…).
- Correctness is **deterministic math**: `exposureValue = apertureStops + shutterStops + isoStops`. Any learner answer can be graded exactly ("you're 2 stops underexposed") — enabling precise, Brilliant-style wrong-answer guidance with no ambiguity.
- Each control has **one dominant, visually demonstrable side effect** that maps cleanly to a cheap browser render: aperture → background blur (CSS `blur()`), shutter → directional motion blur (SVG `feGaussianBlur` "X,0"), ISO → grain (noise overlay opacity), plus overall brightness (CSS `brightness()`).
- The killer "aha" — **equivalent exposures** (same brightness, different look) — is a single slider that trades aperture for shutter while brightness stays locked and depth-of-field vs. motion-blur visibly trade off. This is the most Brilliant-like mechanic available in the whole domain.

Existing polished simulators (CameraSim, Canon's Exposure Simulator, dofsimulator.net) **prove the interaction model is feasible** — and they lack exactly what we'll add: lesson-scoping, single-variable-at-a-time pacing, wrong-answer guidance, and persistent progress.

**Why not composition/focus/editing?** Composition is taught *late* in every canonical syllabus and its "correct answers" are more subjective. Focus/metering and editing/astro are rich but belong to later chapters (the research flags them explicitly as post-MVP depth). The exposure triangle wins on *both* axes: most foundational AND most simulatable.

---

## 4. The MVP Lessons (6)

Ordered per canonical intra-chapter pedagogy: isolate one variable per lesson (aperture first — most tangible), then integrate. Each lesson is ~5–8 steps, ~7–12 min. The first step of each lesson is a gimme; later steps combine with prior lessons.

| # | Lesson title | Core idea taught | Interactive mechanic | Learner action | Success / feedback | Brilliant pattern cloned |
|---|---|---|---|---|---|---|
| 1 | **What is Exposure?** | Brightness = light collected; over/under-exposure | "Bucket of light" / pupil meter; single brightness slider | Drag to hit a target exposure | Meter snaps to "correctly exposed"; micro-celebration. Wrong: "Too dark by N — add more light" | Intuition-before-formalism; predict-then-reveal |
| 2 | **Aperture & Depth of Field** | Wider aperture (lower f-number) = more light + blurrier background | Live SVG scene + aperture slider snapping f/1.4→f/22; animated iris opens; background blur changes in real time | "Drag until the background is blurry" *before* the term is defined | Pass when f ≤ f/2.8. Wrong: "Background's still sharp — open the aperture toward f/2.8" | Pretest inversion; live-diagram slider; the counterintuitive inverse as the "aha" |
| 3 | **Shutter Speed & Motion** | Fast = freeze, slow = motion blur | Moving subject + shutter slider 1/4000→1s; SVG directional motion blur; optional panning toggle | "Freeze the action," then "make the waterfall silky" | Graded at ≥1/1000s (freeze) / ≤1/4s (silk). Diagram animates the smear on a miss | Single-variable control; diagram reacts to wrong answers |
| 4 | **ISO & Noise** | Higher ISO brightens but adds grain; ISO *amplifies*, it doesn't collect light | ISO slider 100→12800; brightness + procedural grain overlay (luminance + chroma) ramp together; "radio-volume" reveal widget | Brighten a night shot while keeping it "clean enough" | Hint points at shadow speckle: "Brighter, yes — but look at the cost in the shadows" | Sequenced misconception reveal; intuition before formalism |
| 5 | **Stops — The Common Language** | +1 stop of ISO, shutter, OR aperture brightens identically | "Stop meter": three controls feeding one live brightness bar | Make three *different* moves that each add exactly one stop | Bar ticks identically each time + XP burst. Reinforces the shared unit | Active recall; one tactile metaphor ridden through |
| 6 | **Equivalent Exposures — Your First Manual Decision** (capstone) | Same brightness, many ways — choose by creative intent | Brightness LOCKED; "creative slider" trades aperture↔shutter in equal opposite stops; DoF and motion blur both visibly change | Capstone brief: "Shoot this sports scene" (pick fast shutter, then compensate) | Scoring checks each creative-intent constraint independently; wrong-answer names the violated intent | Scaffolding fades (bare assessment); interleaving of all prior lessons |

**Optional 7th = a no-hints "Checkpoint"** practice set that pulls one fresh problem from each prior lesson — a lightweight clone of Brilliant's spaced-review/practice-set pattern and a clean place to compute mastery.

---

## 5. Brilliant Patterns We Will Clone

These are the must-have mechanics, drawn directly from analysis of real Brilliant lessons. **Clone all of these; they are the product.**

**Lesson structure**
- One concept per lesson; ~5–8 single-screen "steps"; ~7–12 min; **never video**.
- Each step = 2–4 sentences max + exactly ONE interactive element + a context-aware CTA + inline feedback. Never two interactions on one screen.
- One new variable added per step; difficulty ramps within a lesson and across the chapter.

**The defining mechanic: problem-first ("learn by doing")**
- The learner **must act/predict BEFORE the explanation is shown**. Friction is the point. Gate the explanation/Continue behind an attempt. Do *not* front-load definitions.

**Interaction types** (small, tactile vocabulary)
- Live-updating sliders (highest value), tap-to-select / image hotspots, drag-and-snap / drag-to-order, predict-then-reveal, image-based multiple choice, constrained numeric. Prefer manipulation over plain text MCQ. Use **drag-and-snap and discrete stops** so correctness is unambiguous ("almost right is catastrophically wrong").

**The check-answer flow**
- One persistent bottom CTA whose state machine is: disabled "Check" → enabled "Check" → "Continue."
- **Correct** = green flash + short celebration animation *synced to an XP counter ticking up* + one-line "why it's right," then unlock Continue.
- **Incorrect = non-punitive**: no points lost, never blocked. Animate the widget to *show why it's wrong* (e.g., the photo clips/over-exposes), keep the sim live so the learner re-experiments rather than re-guesses.

**Wrong-answer guidance (an explicit requirement)**
- Tiered, scaffolded hints that *nudge without revealing*: attempt 1 → targeted hint (ideally per-distractor); attempt 2 → stronger hint; then an interactive "explore the solution" state. Hints generated from the same pure functions that drive the sim, so they're always consistent with the screen.

**Progress / motivation (lean)**
- A vertical "branching path" / Level Gameboard of lesson nodes (done / current-pulsing / locked); auto-scroll to the current node on load so resume is one tap.
- XP awarded only on a lesson's **first** completion; visible **streak** (rule: complete 1 lesson OR 3 interactions/day); completion celebration animation.
- **Auto-applied streak freeze** (cap 1–2) so a single missed day doesn't reset progress — the key anti-churn mechanic.
- Personalize *before* the signup wall (a few interest/goal cards), then auth, then straight into lesson 1.

---

## 6. In Scope vs Out of Scope

### ✅ In scope — the Wednesday MVP
- **One chapter**: "The Exposure Triangle — Get Off Auto," 6 lessons (optionally +1 checkpoint).
- One reusable `ExposureScene` simulation engine (CSS/SVG filters) driving all lessons.
- Reusable typed-step engine + JSON lesson schema + component registry.
- Core interactions: live sliders (aperture/shutter/ISO), predict-then-reveal, image-based MCQ, the equivalent-exposure "creative slider."
- Deterministic grading + tiered wrong-answer hints.
- Firebase Anonymous Auth → email upgrade; Firestore UID-keyed progress; **log out / log back in / resume to exact step** (cross-device).
- Lean gamification: XP (first-completion only), streak + auto-freeze, completion animations, node-based path map.
- Personalize-before-signup onboarding; mobile-first responsive UI; Firebase Hosting deploy.

### ⏸ Deferred — early/final submission
- **AI tutor (Koji-style)** — for the MVP, hard-coded tiered hints stand in. LLM tutor is a final-submission feature.
- **Additional chapters**: Composition (rule of thirds, leading lines, framing), Focus & Metering (AF modes, focus-and-recompose/cosine error, hyperfocal, histograms), Editing/Color (tone curves, white balance, HSL), Astrophotography (500/NPF rule, star trails, stacking), Sensors (crop factor). All researched and widget-ready, intentionally held back for depth-over-breadth.
- **Leagues / leaderboards / streak-charges-as-economy** — heaviest backend lift (cohorting + scheduled jobs); a weekly-XP goal ring is the lightweight substitute if needed.
- Spaced-repetition adaptivity beyond the single checkpoint; offline download; push/email reminders (a PWA web-push nudge is a stretch goal); free-play sandbox / Aperture-Priority mode toggle; WebGL/shader rendering (CSS+SVG covers the MVP).

### ❌ Explicitly out
- Video content, user photo uploads, social sharing, payments/paywall, native apps.

---

## 7. Tech Stack & Data Model (at a glance)

**Stack:** React + **Vite** + **Firebase** (Auth + Firestore + Hosting). Photo effects via **CSS filters + one SVG filter + a noise overlay** (GPU-cheap, mobile-friendly; WebGL out of scope). Sliders = native `<input type="range">`; drag via `@use-gesture/react`; transitions via framer-motion.

**Auth:** `signInAnonymously()` on first launch (zero friction → straight into lesson 1). Upgrade in place with `linkWithCredential()` (preserves UID, so guest progress survives). Wrap in try/catch for `auth/email-already-in-use`. Gate the app behind the first `onAuthStateChanged` callback (no logged-out flash).

**Rendering core:** one `ExposureScene` React component driven by `{apertureStop, shutterStop, isoStop}`. Pure functions map those indices to brightness (multiplier), background blur (SVG/CSS blur radius), motion-blur (SVG `feGaussianBlur` "X,0"), and grain (overlay opacity). The *same* function computes the displayed image and grades the answer — so the grader can never disagree with the screen.

**Lesson-as-data schema (authored JSON, validated against a JSON Schema in CI):**
```
Lesson = { id, title, conceptId, estMinutes,
           parameters:{ maxAttempts, showFeedback },
           steps:[ Step ] }

Step = { id,
         type: 'concept'|'multiple-choice'|'tap-select'|'slider-sim'|'drag-order'|'numeric',
         prompt,
         payload,            // interaction data (image, slider config, choices…)
         solution,           // correctResponse; slider-sim uses target ± tolerance
         feedback:{ correct, incorrect, hints:[…], distractorFeedback:{} },
         scaffold: true }
```
A single `<StepRenderer>` dispatches `STEP_REGISTRY[step.type]` → a "dumb" widget that emits the answer; a separate **pure `evaluate(step, answer)`** module owns scoring (testable, no UI). New lesson = JSON only; new interaction = one widget + one evaluator + a registry entry.

**Firestore layout** (split static content from per-user state):
```
// Public, read-only content
courses/{courseId}/chapters/{chapterId}/lessons/{lessonId}   // steps[] inline, <1 MiB

// Private per-user state
users/{uid}                       { isAnonymous, xp, currentStreak, longestStreak,
                                    lastActiveDate,
                                    resume:{ courseId, chapterId, lessonId, stepIndex } }
users/{uid}/lessonProgress/{lessonId}   { status, completedSteps[], lastStepIndex }
users/{uid}/attempts/{stepId}           { correctCount, wrongCount, hintsShown }
```

**Rules** (~10 lines):
```
match /users/{uid}/{document=**} { allow read, write: if request.auth.uid == uid; }
match /courses/{document=**}     { allow read: if true; allow write: if false; }
```

**Operational guardrails:** `FieldValue.increment()` for attempt counters (offline-safe, no transaction); a `runTransaction()` *only* for daily-streak rollover, run once on first activity/day. Respect the **~1 write/sec/document** limit — persist on step-completion, not on every slider drag. Enable offline cache via `initializeFirestore(app,{ localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })`. The **resume pointer** on the user doc is one read → route to the exact step (works on any device after sign-in). Deploy: `firebase.json` with `"public":"dist"` and a `** → /index.html` SPA rewrite.

---

## 8. Open Questions for the User to Decide

These are genuine either/or calls that need a human before the PRD is locked:

1. **6 lessons vs. 6 + a checkpoint (7th)?** The checkpoint adds the most authentic Brilliant "mastery" feel and a clean place to compute mastery — but it's extra content + a mixed-review renderer. Ship it in the Wed MVP, or hold for early submission?
2. **Onboarding diagnostic — yes or no for Wed?** Personalize-before-signup is high-conversion and on-brand, but adds a flow + branching first lesson. Minimum viable = skip it and drop everyone into lesson 1. Which for the deadline?
3. **Anonymous-first auth, or force email up front?** Anonymous-first removes the signup wall (recommended, more Brilliant-like) but adds the account-linking edge case and stale-guest cleanup. Force-email is simpler to build but adds friction. Recommend anonymous-first — confirm?
4. **Streak + auto-freeze in the Wed MVP, or just XP + completion animation?** The freeze is the highest-ROI retention mechanic but adds the daily-rollover transaction and date-edge-case logic. Include, or defer streak to early submission?
5. **One scrollable lesson-path "gameboard" vs. a simple lesson list for Wed?** The gameboard is more on-brand and doubles as resume UI; the list is faster to ship. Which fidelity for the deadline?

*(Recommended defaults if no answer: include the checkpoint, skip the diagnostic for Wed, anonymous-first auth, include streak+freeze, ship the gameboard.)*

---

## 9. Recommended Next Steps (path to the PRD)

1. **Lock section 8's five decisions** (≈30 min). These are the only blockers to a complete PRD.
2. **Freeze the lesson list** — confirm the 6 lessons in §4, their per-step counts, and each step's target value + tolerance + hint copy. This becomes the PRD's content appendix and the authored JSON.
3. **Write the PRD** from this doc, structured as: persona & goal → MVP scope (in/out from §6) → the 6 lessons as user stories → the Brilliant patterns as functional requirements (§5) → tech architecture & data model (§7) → success criteria (resume works cross-device; deterministic grading; all 6 lessons completable on mobile).
4. **Spike the riskiest component first** in parallel — the `ExposureScene` engine (CSS/SVG-filter aperture/shutter/ISO render at 60fps on a phone). Everything else (schema, Firebase, path UI) is well-trodden; the live simulation feel is the one true unknown and the core of the value prop.
5. **Author the JSON Schema + one full sample lesson** (Lesson 2, Aperture) end-to-end as the reference implementation the PRD points engineering at.

---

## Sources

**Brilliant product / pedagogy / gamification**
- https://brilliant.org/help/using-brilliant/
- https://brilliant.org/help/using-brilliant/what-are-learning-paths/
- https://brilliant.org/help/features/
- https://brilliant.org/about/
- https://brilliant.org/courses/how-llms-work/
- https://brilliant.org/courses/puzzle-science/
- https://brilliant.org/help/using-brilliant/what-is-a-streak/
- https://brilliant.org/help/using-brilliant/what-is-a-streak-charge/
- https://brilliant.org/help/using-brilliant/what-is-xp/
- https://brilliant.org/help/using-brilliant/what-are-leagues-and-leaderboards/
- https://brilliant.org/help/using-brilliant/how-do-i-get-started-on-brilliant/
- https://blog.brilliant.org/when-almost-right-is-catastrophically-wrong-evals-for-ai-learning-games/
- https://ustwo.com/work/brilliant/
- https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations
- https://beginnersinai.org/brilliant-explained/
- https://screensdesign.com/showcase/brilliant-learn-by-doing
- https://e-student.org/brilliant-org-review/
- https://skillscouter.com/brilliant-review-math-science-coding/
- https://trophy.so/blog/brilliant-gamification-case-study
- https://trysavvy.com/example/brilliant-onboarding
- https://uxdesign.cc/the-key-to-learning-math-and-science-online-is-interactive-play-6ea68ce167fe

**Photography domain (exposure, composition, focus, advanced)**
- https://photographylife.com/what-is-exposure-triangle
- https://fstoppers.com/education/exposure-triangle-understanding-how-aperture-shutter-speed-and-iso-work-together-72878
- https://www.studiobinder.com/blog/what-is-the-exposure-triangle-explained/
- https://petapixel.com/exposure-triangle/
- https://www.bhphotovideo.com/explora/photography/tips-and-solutions/understanding-exposure-part-1-the-exposure-triangle
- https://www.universalclass.com/i/course/photography101/syllabus.htm
- https://www.camerasim.com/original-camerasim
- https://dofsimulator.net/en/
- https://iceland-photo-tours.com/articles/photography-tutorials/the-exposure-triangle-aperture-iso-shutter-speed-explained
- https://www.slrlounge.com/iso-aperture-shutter-speed-a-cheat-sheet-for-beginners/
- https://photographylife.com/what-is-depth-of-field
- https://en.wikipedia.org/wiki/Rule_of_thirds
- https://www.cambridgeincolour.com/tutorials/hyperfocal-distance.htm
- https://capturetheatlas.com/focus-modes/
- https://www.photoworkout.com/metering-modes/
- https://blog.frame.io/2017/09/20/beginners-guide-to-color-curves/
- https://astrobackyard.com/the-500-rule/
- https://www.cambridgeincolour.com/tutorials/digital-camera-sensor-size.htm

**Technical (Firebase, React, rendering, lesson engine)**
- https://firebase.google.com/docs/firestore/manage-data/structure-data
- https://firebase.google.com/docs/firestore/data-model
- https://firebase.google.com/docs/firestore/best-practices
- https://firebase.blog/posts/2023/07/best-practices-for-anonymous-authentication/
- https://firebase.google.com/docs/auth/web/anonymous-auth
- https://firebase.google.com/docs/auth/web/auth-state-persistence
- https://firebase.google.com/docs/firestore/manage-data/enable-offline
- https://medium.com/firebase-developers/patterns-for-security-with-firebase-per-user-permissions-for-cloud-firestore-be67ee8edc4a
- https://firebase.google.com/docs/firestore/security/rules-conditions
- https://firebase.google.com/docs/firestore/solutions/counters
- https://firebase.google.com/docs/firestore/quotas
- https://firebase.google.com/docs/hosting/full-config
- https://developer.mozilla.org/en-US/docs/Web/CSS/filter
- https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComponentTransfer
- https://tympanus.net/codrops/2015/04/08/motion-blur-effect-svg/
- https://www.viget.com/articles/film-grain-effect/
- http://json-quiz.github.io/json-quiz/spec/quiz.html
- https://www.imsglobal.org/spec/qti/v3p0/guide
- https://digitaliser.getmarked.ai/docs/api/question_schema/
- https://github.com/wingkwong/react-quiz-component
- https://fireship.io/lessons/firestore-nosql-data-modeling-by-example/