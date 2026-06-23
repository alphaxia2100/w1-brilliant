# Brilliant.org — Product Structure, UX Flow & Habit Loop

> Scope note on "photography": the brief asked me to also consider a *photography* course outline. **Brilliant does not teach photography or any visual/creative-arts subject** — it is strictly STEM (math, science, computer science, data analysis, logic, AI). I verified this on the subjects/courses pages (source: https://brilliant.org/help/using-brilliant/what-subjects-does-brilliant-teach/). So below I use Brilliant's *real* courses as the concrete examples (Fractions, How AI Works), and where you need a "photography-style" mapping I show how the same skeleton would apply.

Throughout, **[Verified]** = stated on an official page or directly observed in a credible teardown; **[Reported]** = from a third-party review; **[Inference]** = my synthesis, labeled as such.

---

## 1. Information Architecture

### Hierarchy and naming (verified with two real courses)

Brilliant's content tree, from top to bottom:

```
Subject (e.g. Math, Computer Science, Science, Data Analysis)
  └─ Learning Path  (curated, ordered sequence of courses — e.g. "Foundational Math")
       └─ Course     (e.g. "Fractions", "How AI Works")
            └─ Level  ← this is Brilliant's word for a unit/chapter
                 └─ Lesson  (e.g. "Finding Half")
                      └─ Interactive problem / exercise (10–25 per lesson)
```

The key naming quirk: **the unit/chapter tier is called a "Level."** Each Level ends with a **"Level Review"** lesson. This is verified by reading two live course pages:

**Example A — "Fractions"** (27 lessons, 363 exercises) (source: https://brilliant.org/courses/math-fundamentals/):
- *Level 1: Visualize Fractions* → lessons: Finding Half · Combining Parts · Splitting Parts · Splitting and Combining · Equal Parts · **Level Review**
- *Level 2: Equivalent Fractions* → Sixths and Twelfths · Eighths and Sixteenths · Making Equivalent Fractions · Simplifying Fractions · … · **Level Review**
- *Levels 3–5*: Comparing Fractions · Adding Fractions · Multiplying Fractions (each ending in a Level Review)

**Example B — "How AI Works"** (31 lessons, 139 exercises) (source: https://brilliant.org/courses/how-llms-work/):
- *Level 1: Prediction and Probabilities* → Intro to Language Models · Predicting the Next Word · Larger Context Windows · Calculating Word Probabilities
- *Level 2: Language Model Training* → Temperature · Improving Models · Loss · Tokenization · Byte-Pair Encoding …
- *Levels 3–7*: Deep Network Models · Neurons and Layers · Image Models · Language Analysis with Python · Text Generation with Python

So a course header literally advertises two counts — **"N Lessons, M Exercises"** — and the body is a vertical list of Levels, each expandable into its named lessons.

### How a learner navigates (verified + inference)
- **Courses page** (`/courses/`) lets you browse all 100+ courses, filter by subject, and "Jump to new courses or those related to a specific topic" (source: https://learnopoly.com/brilliant-org-review/).
- **Learning Paths** are the recommended spine: "guided sequences… organizing related courses in a logical order so you can learn progressively." Named paths verified on the features page: *Foundational Math, Programming & CS, Python, Data Analysis, Science, Logical Reasoning, Everyday Math, Technology, Advanced Math, Mind-Bending Math* (source: https://brilliant.org/help/features/).
- The redesigned **learning-path page "showed clear direction and progression while maintaining the user's freedom of choice"** — i.e. a suggested order plus the ability to jump around (source: https://ustwo.com/work/brilliant/).
- Inside a course, the **"Level Gameboard"** is the visual map of lessons; a **learning companion** (the mascot, see §8) points you to the next lesson (source: https://ustwo.com/work/brilliant/).

**[Inference]** A "photography" course on this skeleton would be e.g. *Course: Exposure* → *Level 1: The Exposure Triangle* (lessons: What Light Is · Aperture · Shutter Speed · ISO · Level Review) → *Level 2: Metering* → etc. The shape transfers cleanly; Brilliant just doesn't ship it.

---

## 2. Onboarding / First-Run Experience

**What's verified:**
- Sign-up is **email / Google / Apple** on web or the mobile app (source: https://brilliant.org/help/using-brilliant/).
- Onboarding asks **a few short questions**: *why* you want to use it, and whether you are a **student, curious, or a professional**; Brilliant uses these answers to **suggest a learning pathway** (sources: https://medium.com/design-bootcamp/a-case-for-programming-bewitched-by-brilliant-gamification-a941d2cfc7d0 ; https://learnopoly.com/brilliant-org-review/).
- A reviewer summarizes: "you answer a few short questions and Brilliant uses these to suggest a learning pathway that provides a good fit for your needs" (source: https://learnopoly.com/brilliant-org-review/).
- Marketing copy frames the system as adaptive from the start: "adjusting to your skill level, filling gaps before they become problems" (source: https://brilliant.org/).

**What I could NOT verify:** Whether there is a formal **diagnostic/placement quiz** that scores you and drops you at a specific Level. The help article "What course should I start with" was behind a redirect I couldn't read in full, and no source confirmed a graded placement test. Reviews describe a **goals/interests survey → recommended path**, not a skills test. So I'd describe onboarding as *interest-and-goal segmentation*, not adaptive placement — treat any "placement quiz" claim as **unverified**.

**Goal-setting:** The product surfaces **daily goals, streaks, and levels** as the motivational frame post-onboarding (source: https://brilliant.org/), but I found no source confirming an explicit "set your daily minutes goal" step during onboarding. The recurring concrete number reviewers cite is **~15–20 minutes/day** as the recommended routine (source: https://brilliant.org/help/using-brilliant/).

---

## 3. The Core Lesson Loop (step by step)

This is the repeated unit of the product. Verified mechanics, assembled into the screen sequence:

1. **Concept intro screen** — "a brief concept introduction, usually 2–4 sentences with an accompanying illustration or animation" (source: https://skillscouter.com/brilliant-review-math-science-coding/). Lessons "lead with interactive problems" rather than lecture (source: https://brilliant.org/).
2. **Interactive problem screen** — you act on the content: multiple choice, drag-and-drop, sliders/simulations. The "How AI Works" course, for instance, gives you a **live chat interface** and a **temperature slider / top-probabilities controls** to play with (source: https://brilliant.org/courses/how-llms-work/). Flow within a lesson: start with "simple questions and stories that tap into your intuition," then "more complex problems and quizzes," then "play with different ways to approach problems" (source: https://learnopoly.com/brilliant-org-review/).
3. **Submit → instant custom feedback** — "Each interactive problem gives instant, custom feedback based on your answer." If correct, a **whimsical in-lesson celebration** fires (source: https://ustwo.com/work/brilliant/). Some problems show the **"% of people who answer correctly"** (source: https://learnopoly.com/brilliant-org-review/).
4. **If wrong → hint / staged explanation** — "a hint nudges you toward the right reasoning without giving away the answer," plus "animated explanations in stages" (sources: https://skillscouter.com/... ; https://learnopoly.com/...). The **Koji** AI tutor can step in to guide you through a stuck point — and notably "can see exactly what you're working on — including the interactive elements on screen" (source: https://brilliant.org/help/features/).
5. **Continue button** — the standard progression control after each problem; a **flag icon** sits next to it to report a bad problem (source: https://brilliant.org/help/help-and-support/). On mobile, a **sound/mute icon is top-right** to silence Koji (source: same).
6. **Repeat** — 10–25 problems per lesson (a 15–30 min lesson); shorter reviews cite 5–10 problems / ~15 min (sources: https://skillscouter.com/... and https://upskillwise.com/reviews/brilliant/).
7. **Finish lesson screen** — on completing a lesson you tap **"finish lesson"** and get a card showing **a miniature image + the lesson title**, with two buttons: **"Continue"** (to the next lesson) and **"Redo lesson"** (source: https://brilliant.org/help/help-and-support/). This is where XP/streak progress is registered (see §5).

**Pacing/limits:** Free users are **capped at 2 lessons or practice sets per day**; Premium is unlimited (source: https://brilliant.org/help/using-brilliant/). One reviewer narrows the free tier further to "the first few lessons of most courses and one daily practice problem" (source: https://skillscouter.com/...) — treat the exact free-tier number as **variable/uncertain** (likely changes over time and by A/B test).

---

## 4. Progress Tracking

**Verified:**
- The course header shows the **"N Lessons / M Exercises"** counts as the denominator of progress (e.g. Fractions = 27/363) (source: https://brilliant.org/courses/math-fundamentals/).
- The **Level Gameboard** is the in-course progress map; ustwo built **progress trackers** and **lesson detail tooltips** as named components (source: https://ustwo.com/work/brilliant/).
- "Brilliant shows student progress through courses, including **streaks and XP**" (source: https://brilliant.org/help/using-brilliant/).
- Right/wrong is tracked at the problem level for **spaced repetition**: "the platform tracks which concepts you struggled with and surfaces review problems at spaced intervals" (source: https://skillscouter.com/...).
- Completed lessons can be **redone/reviewed** via a **Redo icon / Review button**, but "repeating a lesson you've already completed won't earn you extra XP" (source: https://brilliant.org/help/features/).
- Each **Level ends in a "Level Review"** lesson — the explicit mastery checkpoint (source: https://brilliant.org/courses/math-fundamentals/).

**Mastery framing:** Marketing/help copy says the system "tracks what you've mastered and where you're stuck, then builds practice around the gaps" (source: https://brilliant.org/). I did **not** find a public, numeric "mastery %" badge per skill — so I'd call mastery a *behavior of the recommender* (gap-filling + spaced review), not necessarily a visible percentage.

**Verified criticism / gap:** One teardown notes progress **percentages are emailed to you but not shown on the in-app dashboard** — the author flags this as a design flaw because "you're unlikely to check email reminders" (source: https://medium.com/design-bootcamp/...). So be cautious about assuming a prominent on-dashboard "% complete" — evidence is mixed.

---

## 5. Habit / Gamification Loop (verified carefully)

This is well-documented on official pages, so I can be specific without overstating:

**Streaks** (source: https://brilliant.org/help/features/)
- "The number of consecutive days you've learned on Brilliant."
- To extend: complete **either 3 problems or a full lesson in a single day.**
- **Resets to zero if you miss a day.**

**Streak Charges** (Brilliant's version of a streak freeze) (source: https://brilliant.org/help/features/)
- You earn **one Streak Charge** per lesson or practice completion.
- **Max of two** held at a time; they **never expire**. They auto-protect a missed day.

**XP** (source: https://brilliant.org/help/using-brilliant/what-is-xp/)
- Earned by "Completing lessons, Solving problems, Engaging with course content."
- "The amount of XP you earn corresponds to the time and effort required" — **no fixed per-problem number is published** (don't fabricate one).
- "Repeating a lesson you've already completed won't earn you extra XP."
- "Your weekly XP determines your standing in Leagues."

**Leagues** (weekly competition) (source: https://brilliant.org/help/features/)
- **30 learners per League.**
- Run **Sunday-to-Sunday, ending 8 PM PT / 11 PM ET.**
- End-of-week: top performers **promote**, bottom **relegate**, middle **stay.**
- **10 named tiers (all chemical elements):** Hydrogen → Lithium → Carbon → Neon → Titanium → Xenon → Barium → Neodymium → Tungsten → **Einsteinium.**

**Daily goals / reminders** (source: https://brilliant.org/help/using-brilliant/)
- "Streaks, levels, and daily goals" are the stated motivation triad (source: https://brilliant.org/).
- **Notifications & reminders** are configurable in preferences.
- **iOS home-screen widget** shows current streak status and "sends increasing reminders throughout the day if you haven't practiced yet"; tapping it opens the app. **iOS only** — no Android widget (source: https://brilliant.org/help/using-brilliant/).

**Things I'd be skeptical of:** Some third-party blogs mention "badges/achievements shared on social profiles" and "unlocking exclusive content" via streaks (source: https://trophy.so/blog/brilliant-gamification-case-study), but that article itself "provides no specific UI details" and reads partly generic. I would **not** assert badges/social-sharing as confirmed current features — official pages emphasize Streaks, Streak Charges, XP, and Leagues, and one reviewer explicitly says the design "prioritizes self-directed problem-solving over gamification or social features" (source: https://upskillwise.com/reviews/brilliant/). Net: the **verified** loop is **Streak + Streak Charges + XP → weekly League**, plus daily-goal reminders.

---

## 6. Persistence & Continuity

**Verified:**
- "Your progress **syncs automatically between devices**" (web, iOS, Android) (source: https://brilliant.org/help/using-brilliant/).
- "You can **pause and resume without losing context**, then continue where you left off" (source: https://brilliant.org/help/using-brilliant/ / search synthesis).
- Account is the unit of persistence (email/Google/Apple login), so logging out and back in on any device restores streak, XP, League standing, and in-course position. **[Inference, strongly supported]** by the cross-device sync statement — I did not find a help article literally titled "log out / log back in," but auto-sync to the account guarantees this behavior.
- **Internet connection required** on all platforms, with one exception: **iOS lets you download up to 6 courses for offline use** (Android/desktop cannot) (source: https://upskillwise.com/reviews/brilliant/).

---

## 7. Mobile vs. Desktop

**Verified / reported:**
- Brilliant is "one of the few learning platforms where **mobile is as good as desktop**"; the **5–15 min lesson format is built for daily mobile use** (source: https://skillscouter.com/...).
- Touch adaptations confirmed: **drag-and-drop**, **tap-to-answer**, sliders, and a **top-right mute icon** for Koji on mobile (source: https://brilliant.org/help/help-and-support/).
- **iOS-only extras:** home-screen **streak widget** and **offline course downloads (max 6)** (sources: https://brilliant.org/help/using-brilliant/ ; https://upskillwise.com/reviews/brilliant/).
- ustwo's design goal was a "playful feel and necessary guidance" while preserving **focus** ("STEM subjects require deep focus") — implying restrained, distraction-light layouts on both form factors (source: https://ustwo.com/work/brilliant/).

**[Inference]** Desktop gives a wider two-pane feel (Level Gameboard / course outline visible alongside content), whereas mobile is single-column, full-screen-per-problem, thumb-reachable Continue button at the bottom. Sources confirm the components (gameboard, tiles, tooltips, progress trackers) but not exact responsive breakpoints.

---

## 8. Design System / Visual Language (for building convincing screens)

Verified from the Koto × Brilliant brand refresh and ustwo product work:
- **Typefaces:** **CoFo Robert** (marketing headers) and **CoFo Sans** (product UI) — both from **Contrast Foundry**; Brilliant uses a **slightly custom cut of CoFo Sans** (sources: https://ustwo.com/work/brilliant/ ; https://pcho.medium.com/a-brilliant-brand-refresh-4af021c11486).
- **Color:** a "**lighter, brighter** palette" with a **new "pear" color spectrum used for primary CTAs and streaks** (sources: same). **No official hex values were published** in these sources — do **not** invent specific hex codes; "pear" reads as a bright yellow-green. (If you need exact tokens, they'd have to be pulled from the live site's CSS, which I did not do.)
- **Mascot / learning companion:** **Koji** — "a sentient particle born from the Big Bang, your guide to the Brilliant universe," which **replaced the older "Blorb"** mascot; designed to "lower the stakes for learners and act as a natural cheerleader." Koji doubles as the **AI tutor** inside lessons (sources: https://pcho.medium.com/... ; https://brilliant.org/help/features/).
- **Illustration style ("PIX"):** built from **straight-edged line segments**; the **wordmark uses rounded + squared corners** echoing that geometry — "bold, yet friendly, works well at small sizes" (source: https://pcho.medium.com/...).
- **Named UI components** (ustwo asset library): **lesson tiles, challenge tiles, lesson-detail tooltips, progress trackers, points-earned displays, the Level Gameboard, in-lesson success celebrations, and encouragement moments for strugglers** (source: https://ustwo.com/work/brilliant/).

---

## 9. The Testing Scenario → Ideal Screens

Mapping a *log in → lesson → progress → log out → resume* loop to the screens evidence says a learner sees. (Real example used: the **Fractions** course, Level 1.)

| Step | Screen | What it shows (verified mechanics) |
|---|---|---|
| **0. Onboarding** (first run only) | Goal-survey screens | 2–3 questions: "Why are you here?" / "Student, curious, or professional?" → produces a **recommended Learning Path**. (No confirmed graded placement test.) |
| **1. Log in** | Email / Google / Apple auth → **Home / "Today"** | "Today" tab with a daily challenge + recommended next lesson; **current streak**, **XP**, **League** tier visible. Resume card = "where you left off." |
| **2. Open a course** | **Course page** ("Fractions") | Header: **"27 Lessons · 363 Exercises"**; vertical **Level Gameboard** (Level 1: Visualize Fractions → Finding Half · Combining Parts · … · Level Review). Completed lessons checked; next lesson highlighted by Koji. |
| **3. Start lesson** | **Concept intro** | 2–4 sentences + illustration/animation. Bottom: **Continue**. |
| **4. Interactive steps** (×10–25) | **Problem screens** | Tap / drag / slider input → **Submit** → instant custom feedback. Correct = celebration; wrong = **hint** then staged animated explanation; **Koji** available for stuck moments. Some problems show **"% answered correctly."** Mobile: full-screen single column, bottom **Continue**, top-right mute. |
| **5. Finish lesson** | **Completion card** | Mini-image + lesson title; buttons **Continue** / **Redo lesson**. **XP added**, **streak advanced** (≥3 problems or full lesson), **+1 Streak Charge** (cap 2), weekly **League XP** updated. |
| **6. See progress** | Back to **Level Gameboard / Home** | New checkmark on the lesson; updated lesson/exercise count; streak number ticks up; League standing reflects added XP. (Note verified caveat: % progress may arrive by **email**, not always on the dashboard.) |
| **7. Log out** | Account/settings → Log out | State is on the account. |
| **8. Resume** (other device / next day) | Re-auth → **Home** | **Auto-synced**: same streak, XP, League, and **resume-where-you-left-off** card pointing back into Fractions Level 1. iOS: streak **widget** + reminders nudge you back; **Streak Charge** protects a skipped day. |

---

## Confidence summary

- **High confidence (official pages):** Level/Lesson/Exercise hierarchy and naming, the two course outlines, Streaks/Streak Charges/XP/Leagues mechanics (30/week, Sun 8 PM PT, 10 element-named tiers), free-tier 2-lessons/day cap, cross-device sync, iOS widget, typefaces (CoFo Robert/Sans), "pear" CTA/streak color, Koji mascot+tutor, Level Gameboard.
- **Medium confidence (consistent across reviews):** lesson loop step order, 10–25 problems/15–30 min, hints + staged explanations, "% answered correctly," mobile parity, offline downloads (iOS, 6 max).
- **Unverified / flagged — do not assert as fact:** any graded **placement quiz** during onboarding; a prominent on-dashboard **mastery %**; **badges / social sharing**; **exact hex color values**. And again: **no photography (or any arts) course exists** on Brilliant — it is STEM-only.

### Primary sources
- https://brilliant.org/help/features/
- https://brilliant.org/help/using-brilliant/
- https://brilliant.org/help/using-brilliant/what-is-xp/
- https://brilliant.org/courses/how-llms-work/
- https://brilliant.org/courses/math-fundamentals/
- https://brilliant.org/
- https://ustwo.com/work/brilliant/
- https://pcho.medium.com/a-brilliant-brand-refresh-4af021c11486
- https://skillscouter.com/brilliant-review-math-science-coding/
- https://learnopoly.com/brilliant-org-review/
- https://upskillwise.com/reviews/brilliant/
- https://medium.com/design-bootcamp/a-case-for-programming-bewitched-by-brilliant-gamification-a941d2cfc7d0