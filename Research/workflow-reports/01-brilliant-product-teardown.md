## Brilliant.com — Product Teardown for Cloning

*Prepared for the team writing the photography-app PRD. This synthesizes five research finding-sets into one actionable blueprint. The goal is to clone Brilliant's learning mechanics for a single photography "chapter" (4–7 lessons) without re-deriving them from scratch.*

---

## 1. Executive Summary

Brilliant is a "learn by doing" platform that deliberately rejects passive video. Its entire product is built on **one rigid micro-loop repeated screen after screen** — show a minimal visual, make the learner *predict or act before being taught*, animate the consequence of their answer, explain why, then advance by adding exactly one new element. This loop is wrapped in a lightweight gamification shell (streaks, weekly XP, a node-based path map) that is intentionally *thin* — Brilliant runs a small set of well-executed habit loops rather than a dense game economy, to keep the focus on content.

The two highest-leverage things to clone are: (1) the **single-screen "step" component** with its predict→manipulate→feedback→advance states, and (2) the **live-preview slider** where a manipulable visual re-renders continuously as the learner drags a control. Photography is unusually well-suited to both — aperture, shutter, and ISO are inherently visual, continuous, and trade-off-driven.

---

## 2. Content Structure

### 2.1 The four-tier hierarchy

Brilliant nests content as:

```
Learning Path  (curated multi-course sequence in one subject)
  └─ Course    (one topic, e.g. "How AI Works")
       └─ Level (the chapter/unit tier — thematically named)
            └─ Lesson (single concept, short and self-contained)
                 └─ Step (one interactive screen / problem)
```

### 2.2 Real, verified proportions

The "How AI Works" course (read directly) decomposes to:

| Metric | Value |
|---|---|
| Lessons | 31 |
| Levels | 7 (e.g. "Prediction and Probabilities", "Language Model Training", "Deep Network Models") |
| Total exercises | 139 |
| ≈ Lessons per level | 4–5 |
| ≈ Steps per lesson | 4–5 |

Cross-referenced against other courses: Algebra I ≈ 23 lessons; a short course = 15 lessons in 3 sections; another = 38 lessons. So the defensible real-world ranges are:

- **Course:** ~15–40 lessons
- **Level:** ~3–8 lessons
- **Lesson:** ~5–15 minutes, ~5–10 interactive steps (denser lessons cited at 10–25 problems)

### 2.3 Mapping to the photography MVP

The MVP brief ("one chapter taught across 4–7 lessons") maps cleanly onto **a single Level**:

> **Course:** Photography Fundamentals → **Level:** "The Exposure Triangle" → **4–7 Lessons** → **5–8 steps each** (~7–12 min/lesson).

**Build the data model with the full nesting even though you ship only one Level.** Many small lessons beats few long ones — this is true to Brilliant's real proportions, not a guess. The single most important sizing constant to copy: **~5–8 interactive steps per lesson, ~7–12 minutes.** Make each step a discrete screen/card so partial completion is meaningful and resumable.

---

## 3. The Core In-Lesson Loop

Every source independently describes the *same* rhythm. This is the defining mechanic of the entire product and the thing you must clone most faithfully.

### 3.1 The micro-loop

```
VISUALIZE → PREDICT/ACT → MANIPULATE → FEEDBACK → ADVANCE (+1 new element)
```

1. **Visualize** — a minimal illustration/animation/simulation, plus only **2–4 sentences** of concept text. Never a wall of text; the screen's center of gravity is the interactive widget, not prose.
2. **Predict / Act** — the learner must commit *before* any teaching. This is "productive friction" by design.
3. **Manipulate** — they drag/tap/select to apply the just-introduced idea.
4. **Feedback** — instant, inline, on the same screen.
5. **Advance** — Continue adds **exactly one** new variable, building on what was just demonstrated.

### 3.2 Problem-first ("pretest") inversion — the non-obvious rule

Brilliant **does not explain the concept first.** It "pretests" — the learner tries to find a solution before learning the procedure. As one walkthrough put it: *"friction is the point… learners must do cognitive work before receiving explanations, preventing false comprehension."* The explanation is *gated behind an attempt.*

> **Photography application:** Do NOT front-load a paragraph defining aperture. Show an aperture slider on a live photo, ask *"drag until the background is blurry,"* let them commit, THEN reveal *"that blur is shallow depth of field, caused by a wide aperture."*

### 3.3 Difficulty sequencing (within and across)

- **Within a lesson:** step 1 is a gimme that locks in the new idea; later steps escalate toward real-world application and combine the new variable with previously-taught ones (a tradeoff).
- **Across a level:** explicitly progressive — `see-the-effect → single-variable control → multi-variable tradeoff → applied scenario`.

> **Photography sequencing:** Lesson on shutter speed ends by trading it off against aperture from the previous lesson. Encode a difficulty tag per step for analytics.

### 3.4 The reusable Step component (the single most important build decision)

Implement **one** `Step` component with explicit states. Author *every* lesson as an ordered array of these. **Never put two interactions on one screen.**

| State | What renders |
|---|---|
| `INTRO` | 2–4 sentences + SVG/canvas visual |
| `INTERACT` | one widget (slider / drag / tap / choice) |
| `CHECK` | context-aware CTA, enabled once an answer exists |
| `CORRECT` | green flash + short celebration + XP tick + one-line "why" → unlock Continue |
| `WRONG` | encouraging copy + animate widget to *show* why; widget stays live for re-experiment; tiered hint; retry — **never block, never deduct** |

---

## 4. The Interactive Mechanics Catalogue

Brilliant's interaction vocabulary is **small and tactile**. Manipulation is preferred over pure multiple choice — Reddit reviewers stress it "makes you think and problem-solve instead of guessing at multiple choice."

| Interaction type | How Brilliant uses it | Photography clone |
|---|---|---|
| **Live-driving slider** *(build first)* | Sliders that update a live diagram continuously (e.g. light through polarized filters); on a wrong prediction "the diagram changes to show you why" | Aperture f/1.8→f/16 blurs/sharpens background DoF in real time; shutter adds/removes motion blur; ISO adds grain + brightens; focal length compresses background |
| **Tap-to-select / image hotspot** | Tap parts of a visual, not text MCQ; answers constructed *on the image* | "Tap the in-focus subject" / "tap the blown-out highlight" / "tap the rule-of-thirds intersection" |
| **Drag-and-drop / drag-to-order** | "Feels rewarding"; drag weights onto lever arms, drag-manipulate diagrams | Drag focal point onto a thirds gridline; drag-order shutter speeds fastest→slowest; drag settings onto "too dark / correct / too bright" |
| **Predict-the-outcome** | Learner forecasts before the animation plays the real result; the *gap* is the teaching moment | "Predict: will a faster shutter make this waterfall silky or frozen?" → then animate the photo updating |
| **Visual multiple choice** | Low-stakes; choices are images/diagrams, not text; selecting enables Check | "Which of these 3 photos used a wide aperture?" |
| **Free-explore simulation** | Coupled controls + live state to explore tradeoffs | Exposure-triangle simulator: 3 coupled sliders + live meter + photo preview |
| **Numeric / constructed answer** | Build the answer rather than guess from options | Enter an exposure value, etc. |

### 4.1 The single-button CTA state machine

One persistent, thumb-reachable bottom button drives the whole flow:

```
disabled "Check" (no input) → enabled "Check" (input given) → "Continue" (after submit)
```

Centralize in a `<LessonFooter>` with a small flag/report icon next to it. Keep it fixed to the bottom for mobile thumb reach.

### 4.2 Mobile-first widget ergonomics

The live-preview drag is the core value prop, so use **Pointer Events (touch + mouse), not mouse-only**, with large touch targets and normalized (0–1) coordinates so widgets scale across devices. Test aperture-slider + preview re-render performance on a phone — the tactile feel *is* the product.

---

## 5. Pedagogy & Wrong-Answer Handling

Brilliant's pedagogy maps directly onto established learning science (active recall, interleaving, spaced repetition, desirable difficulties). The principles:

| Principle | Brilliant's implementation | Photography application |
|---|---|---|
| **Problem-first pretest** | Try before being taught the procedure | Drag aperture to blur *before* the f-number rule is named |
| **Intuition before formalism** | Build from the simplest visual idea before definitions | Slide a control, watch the photo change, *then* name the f-stop |
| **Active recall over rereading** | Short intro then 10–25 problems; require interaction every step | Require an interaction on every step; aim 8–15 |
| **Scaffolding fades** | End-of-lesson practice sets strip away hints/aids to test independent ability | Guide early lessons; make the final step/lesson a bare, no-hints assessment |
| **Interleaving + spaced repetition** | Resurfaces weak areas, mixes concepts at intervals | Resurface previously-wrong concepts in a mixed checkpoint |

### 5.1 Wrong-answer handling — tiered, non-punitive, interactive

This is an explicit MVP requirement, and Brilliant's exact pattern is the template. **Wrong answers never hard-block and never deduct points.** Mistakes are framed as part of the learning journey ("supportive environment that encourages risk-taking without fear").

The tiered recovery flow:

1. **Hint first** — a nudge specific to the *chosen wrong answer*, pointing toward the right reasoning **without revealing the answer.** Build *per-distractor* hints, not one shared "try again."
2. **Retry** — the interactive widget stays live so the learner *re-experiments* rather than re-guesses.
3. **Interactive solution** — if still stuck, the explanation itself is interactive/animated: the diagram changes to *show why* it's wrong (e.g. animate the photo into clipping/over-exposure), letting them explore the fix rather than read it.

> An interactive "explore the solution" state is more on-brand than a static "Wrong, the answer is X." Persist which hint tier was reached per step (for analytics and to drive encouragement copy).

### 5.2 The AI tutor (Koji) — and the no-LLM substitute

Brilliant's premium "Koji" tutor sees the on-screen interactive state and walks through the *thinking* — "a patient tutor looking over their shoulder" — teaching "how to get there" without handing over the answer. It is **pull-based** (only when stuck).

> **MVP without an LLM:** hard-code a **tiered hint array** per step. A "Stuck? Get a hint" affordance reveals a nudge on first tap, then a fuller step-by-step explanation on a second tap — mirroring scaffolded guidance instead of dumping the answer.

---

## 6. Gamification & the Habit Loop

Brilliant **intentionally keeps few game mechanics** to avoid distracting from learning. The case study is explicit: it "avoids packing too many game incentives into the product." **Do not build streaks + XP + leagues + badges + levels all at once.** Depth over breadth.

### 6.1 The retention stack

| Mechanic | Exact rule | MVP verdict |
|---|---|---|
| **Streak** | Complete **3 problems OR one full lesson** per calendar day; increments by 1/day. The central daily routine. | **Ship.** Crisp, 2-minute, achievable bar. Vague goals kill streaks. |
| **Streak Charge** (freeze/forgiveness) | Earn 1 per completed lesson/practice; **hold max 2**; never expire; **auto-applied** on a missed day to preserve (but *freeze*, not increment) the streak; renders as battery icons | **Ship a lean version (cap 1–2).** Critical anti-shame/anti-churn mechanic. |
| **Weekly XP** | Measures activity, scales with effort, **no XP for repeating completed lessons**; **resets every Sunday** (8 PM PT) | **Ship a lightweight version** ("earn 50 XP this week" goal ring). The two-clock design (weekly XP + never-resetting streak) is worth copying. |
| **Leagues** | 30 learners/group; 10 element-named tiers (Hydrogen → Einsteinium); weekly promotion/demotion by rank | **Post-MVP.** Heaviest lift (needs cohorting + a backend job). |
| **Celebration animation** | **Rive-powered, synced to the number ticking up** so the reward feels tied to the action | **Ship.** Highest-ROI polish. Cheap in React (Lottie/SVG/CSS burst). |
| **Reminders** (the cue) | Tiered, channel-customizable; iOS widget sends *escalating* same-day nudges if the goal isn't yet met | **Ship email / web-push** that fires only if today's goal is unmet. |

### 6.2 The two-clock model

Keep two separate timers: a **weekly-resetting XP score** (competition/variety) and a **never-resetting streak** (habit). XP scales with effort and is **never awarded for replays** — this prevents grinding the same lesson.

### 6.3 The "Today" home screen — the daily cue anchor

Build **one glanceable "Today" dashboard** as the entry point, aggregating: today's lesson CTA, streak flame + charge batteries, daily-goal progress ring, and a rotating daily photography challenge. Don't scatter these across pages — this is the routine's launchpad.

### 6.4 Onboarding: personalize BEFORE the signup wall

Brilliant asks interest/goal questions **first**, *then* account creation, *then* drops you straight into a free interactive lesson. This ordering is explicitly intended to lift conversion — asking before gating creates investment and personalizes the first lesson.

> **Photography clone:** 3–4 tappable-card questions ("What do you want to shoot? Portraits / Landscapes / Street" and "What camera? Phone / Mirrorless / DSLR") → Firebase Auth (Google/Apple/email) → first lesson tailored to the answers. Defer any paywall to *after* the first taste of value.

### 6.5 Progress visualization — many small signals, not one meter

Use several glanceable indicators, each a micro-hit of competence: a **streak flame**, a **daily-goal ring**, a **node-based lesson path** (completed = filled/check, current = pulsing, locked = greyed, with animated connecting lines), and a **course progress bar**. The node map doubles as navigation *and* progress viz *and* the resume entry point.

### 6.6 Course-home as a vertical "Level Gameboard"

The course home is a **vertical scrollable branching path** of lesson nodes (Duolingo-style), not a flat list, with a companion character nudging to the next lesson. **On load, auto-scroll to and highlight the next incomplete node** so "resume" is one tap. This reads well on mobile, satisfying the responsive requirement.

### 6.7 Progression & completion model

- **Linear unlock, no score gate:** lesson N+1 unlocks the moment lesson N's `completed` flag flips true. This matches Brilliant's free-tier sequential experience (what most users actually see) and is trivial to enforce.
- **Per-lesson completion** rolls up: all lessons done → Level complete → Course complete.
- **XP only on first completion** (store an `xpAwarded` flag). Repeats earn nothing.
- **Easy-to-find Redo/Review** on completed nodes — Brilliant *buried* this and reviewers complained. Mark replays as no-XP.

---

## 7. Worked Lesson Walkthroughs

Three real Brilliant lessons were traced moment-to-moment. Each demonstrates a transferable pattern.

### 7.1 Lesson A — Neural Networks (the "accreting diagram" template)

| Screen | What happens |
|---|---|
| 1 | Minimal diagram: 2 inputs, 1 hidden layer, 1 output. Prompt: *"What happens to the output if you increase this input weight?"* + 3 selectable answers. |
| On answer | Diagram **animates to show what happens**; system explains *why* the right answer is right. |
| 2 | A second hidden layer is added (one new element). |
| 3 | A sigmoid activation is added. |
| 4 | Live weight-adjustment during training. |
| End | *"You've watched a network learn to classify points — and you've made every prediction yourself before seeing the answer."* |

**Pattern:** one persistent diagram that visibly reacts to each answer, accreting exactly one part of complexity per screen.

> **Photography clone:** A single scene whose rendered preview updates as you change one setting per step, ending with you "driving" a full correct exposure.

### 7.2 Lesson B — Scientific Thinking "Mobiles / Balancing" (teach a quantitative relationship with ZERO formulas)

Lesson sequence (explicit): `Balancing Weights → Moments → Adding Moments → Adding a Level → Multiple Levels → A Mystery Weight → Multiple Unknowns → Simultaneous Solving`. Learners **drag and hang weights on lever arms** and solve for mystery weights — the course "dispenses with number-crunching… in search of physical insight." A quantitative law (weight × distance) is taught entirely by *dragging objects and reading a balance state*, never by showing the equation.

> **Photography clone — the trade-off puzzle:** *"Keep the photo equally bright, but blur the background."* The learner opens the aperture AND must compensate by speeding up the shutter to keep the exposure meter centered — teaching **reciprocity by manipulation, never by formula.** Success triggers an XP burst.

### 7.3 Lesson C — CS "Understanding Variables" (one tactile metaphor, ridden through the whole chapter)

Algebra is taught *purely* through a **balance-scale puzzle** you manipulate — "users engage directly with on-screen elements rather than watching demonstrations." If a red ball weighs twice a blue ball, one red balances two blue. The lesson never leaves the scale metaphor.

> **Pattern:** pick ONE tactile metaphor and ride it through the entire chapter. For photography that recurring spine is the **exposure-triangle / brightness-meter-must-stay-centered** metaphor — present on every step.

### 7.4 The synthesized photography lesson blueprint (putting it together)

A model Lesson 1 — "Aperture & Depth of Field":

1. **Predict** (tap): finished portrait shown — *"Which setting made this background blurry?"* (3 image choices). Commit before any teaching.
2. **Manipulate** (live slider): *"Drag the aperture until the background goes soft."* Background blurs in real time via CSS/canvas. → reveal 2–4 sentences: "wide aperture = shallow depth of field."
3. **Single-variable target:** *"Set the aperture to keep both subjects sharp."*
4. **Predict-then-reveal:** forecast the outcome of f/16 vs f/1.8, then animate.
5. **Trade-off (combines with next concept's seed):** keep brightness constant while changing blur.
6. **No-hints practice:** fresh scenario (a different photo, a different goal) — scaffolding removed, mastery computed.
7. **Completion card:** restates 2–3 takeaways ("Wider aperture = blurrier background = shallower depth of field") + XP burst.

---

## 8. Suggested Data Model (Firebase)

```
lessons/{lessonId}          → { levelId, order, steps: [ {type, prompt, hintTiers[], perDistractorHints{}, difficultyTag, ...} ] }
users/{uid}                 → { xp, weeklyXp, streak, lastActiveDay, charges (≤2), onboarding{shoot, camera} }
users/{uid}/progress/{lessonId} → { completed, xpAwarded, lastStepIndex, struggledStepIds[], mastery 0-1, hintsUsed }
```

- Write progress on **every step completion** (not just lesson end) so resume lands on the exact next step.
- Derive level/course completion from per-lesson `completed` booleans.
- On login: read the user doc, hydrate the path map (locked/current/done), deep-link to the current node → satisfies "log out / log back in / resume."
- Streak logic each session: compare `lastActiveDay` to today. If exactly one day missed and `charges > 0` → decrement a charge, freeze streak. If >1 day missed and no charge → reset to 0.

---

## 9. What We Must Replicate for the MVP — Checklist

**Content & structure**
- [ ] Data model nested Path → Course → Level → Lesson → Step (even though we ship one Level).
- [ ] One Level = 4–7 lessons; each lesson = **5–8 interactive steps, ~7–12 min**. Many small lessons, not few long ones.
- [ ] Text capped at **2–4 sentences per step**; the widget is the center of gravity. **No video, ever.**

**The core loop (highest priority)**
- [ ] One reusable `Step` component with states: `INTRO → INTERACT → CHECK → CORRECT / WRONG`. Never two interactions per screen.
- [ ] **Problem-first / pretest:** learner must act before the explanation; explanation gated behind an attempt.
- [ ] Each Continue adds **exactly one** new variable; difficulty ramps `observe → control one → combine/tradeoff → applied`.

**Interactive widgets**
- [ ] **Live-preview slider (build FIRST):** aperture → DoF blur in real time. Reuse pattern for shutter (motion blur), ISO (grain + brightness), focal length (compression).
- [ ] Exposure-triangle simulator (3 coupled sliders + live meter + preview) as the recurring metaphor.
- [ ] Predict-then-reveal wrapper; image-hotspot (tap-the-region); drag-to-place / drag-to-order.
- [ ] Pointer Events (touch + mouse), large touch targets, normalized coordinates — mobile-first.

**Wrong-answer handling (explicit requirement)**
- [ ] **Non-punitive:** never block, never deduct on a wrong answer.
- [ ] **Tiered:** per-distractor hint (no answer revealed) → retry with widget still live → interactive/animated solution that *shows why*.
- [ ] Tiered "Stuck?" hint array per step (no-LLM substitute for Koji).
- [ ] Persist `hintsUsed` / tier reached per step.

**Gamification (lean — ship only these)**
- [ ] XP on **first completion only** (`xpAwarded` flag); no XP for replays.
- [ ] Streak counter (rule: 1 lesson OR 3 interactions/day) + **auto-applied freeze** (cap 1–2 charges).
- [ ] Weekly XP goal ring (Sunday reset) — *lightweight, skip full Leagues for MVP.*
- [ ] Completion celebration animation **synced to the XP number ticking up.**
- [ ] Optional: escalating same-day email/web-push reminder that fires only if the goal is unmet.

**Navigation, progress & persistence**
- [ ] Vertical "Level Gameboard" path of lesson nodes (done / current-pulsing / locked) with animated connectors; **auto-scroll to next incomplete node on load.**
- [ ] Single "Today" dashboard aggregating lesson CTA + streak + charges + daily-goal ring + daily challenge.
- [ ] **Linear unlock, no score gate** (lesson N+1 unlocks when N completes).
- [ ] Easy-to-find **Redo/Review** on completed nodes (no-XP replays).
- [ ] Write progress **per step** to Firestore; resume to exact next step after logout/login.

**Onboarding**
- [ ] Personalize **before** the signup wall: 3–4 tappable interest/camera questions → Firebase Auth → first tailored lesson. No early paywall.

**Reinforcement**
- [ ] End the chapter with a **mixed no-hints "checkpoint"** lesson sampling one problem from each prior lesson (spaced-review / mastery feel).
- [ ] Completion cards that restate 2–3 key takeaways.

**Polish (cheap, high perceived-quality)**
- [ ] On-brand themed loader (camera-shutter / aperture-blade animation) instead of a spinner.
- [ ] Single bottom-CTA state machine (`disabled Check → Check → Continue`) + flag/report icon, thumb-reachable.

---

## Sources

- https://brilliant.org/ — homepage
- https://brilliant.org/about/
- https://brilliant.org/help/using-brilliant/
- https://brilliant.org/help/using-brilliant/what-are-learning-paths/
- https://brilliant.org/help/using-brilliant/what-subjects-does-brilliant-teach/
- https://brilliant.org/help/using-brilliant/how-do-i-get-started-on-brilliant/
- https://brilliant.org/help/using-brilliant/what-is-xp/
- https://brilliant.org/help/using-brilliant/what-is-a-streak/
- https://brilliant.org/help/using-brilliant/what-is-a-streak-charge/
- https://brilliant.org/help/using-brilliant/what-are-leagues-and-leaderboards/
- https://brilliant.org/help/features/
- https://brilliant.org/help/why-brilliant/reddit-reviews/
- https://brilliant.org/courses/
- https://brilliant.org/courses/how-llms-work/
- https://brilliant.org/courses/puzzle-science/
- https://brilliant.org/courses/geometry-fundamentals/
- https://brilliant.org/wiki/balance-puzzles/
- https://ustwo.com/work/brilliant/
- https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations
- https://beginnersinai.org/brilliant-explained/
- https://screensdesign.com/showcase/brilliant-learn-by-doing
- https://e-student.org/brilliant-org-review/
- https://skillscouter.com/brilliant-review-math-science-coding/
- https://learnopoly.com/brilliant-org-review/
- https://upskillwise.com/reviews/brilliant/
- https://edwize.org/brilliant-course-order/
- https://uxdesign.cc/the-key-to-learning-math-and-science-online-is-interactive-play-6ea68ce167fe
- https://trophy.so/blog/brilliant-gamification-case-study
- https://trysavvy.com/example/brilliant-onboarding
- https://www.structural-learning.com/post/desirable-difficulties
- https://cei.umn.edu/teaching-resources/leveraging-learning-sciences/spaced-and-interleaved-practice-improves-recall