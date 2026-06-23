# Building a Brilliant-like Interactive Learning Site (React + Firebase) — A 1-Week Solo MVP Playbook

This is an opinionated, research-backed build guide. The through-line: **pick the boring, well-documented tool every time, lean on plain platform features (CSS transitions, Pointer Events, CSS filters) before reaching for libraries, and aggressively cut scope.** Sources are cited inline.

---

## 0. The recommended concrete stack (TL;DR)

| Concern | Pick | Why |
|---|---|---|
| Build tool | **Vite + React** (JS or TS) | Fast HMR, zero-config, the de-facto default |
| Styling | **Tailwind CSS** | Fastest path to a polished, consistent look solo; dominant ecosystem and AI-tool support (source: https://www.13labs.au/compare/tailwind-vs-css-modules) |
| Components | **Hand-rolled + a few from shadcn/ui if needed** | Avoid a full component lib; you want a *custom* calm aesthetic, not Material/Ant default look |
| Animation | **Plain CSS transitions by default; add Framer Motion (now "Motion") only for enter/exit + spring** | CSS covers 90% of MVP needs; Motion only where state-driven motion is genuinely needed (source: https://motion.dev/blog/do-you-still-need-framer-motion) |
| Drag / sliders | **Native Pointer Events + `setPointerCapture` + `touch-action: none`** | No library needed for sliders/draggable SVG (source: https://dev.to/nishinoshake/smooth-drag-interactions-with-pointer-events-5e2j) |
| Photo sims | **A real `<img>` + CSS `filter` (`blur()`, `brightness()`, `contrast()`) + SVG overlays for diagrams** | Convincing exposure/DoF fakes with near-zero code; Canvas only if you need per-pixel work |
| Backend | **Firebase: Auth (anonymous + email) + Firestore** | Free Spark tier is plenty; no server to run |
| Hosting | **Firebase Hosting** | One `firebase deploy`; 10 GB/mo transfer free (source: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) |
| Routing | **react-router-dom** (or even just state, see §6) | A handful of routes only |

Total runtime deps you actually need: `react`, `react-dom`, `react-router-dom`, `firebase`, and *optionally* `framer-motion`. That's it.

---

## 1. The aesthetic target: what "Brilliant-like" actually means

Before choosing tools, pin down the look so you don't drift. Concrete, verified facts about Brilliant's current design system:

- **Typography:** Brilliant uses **CoFo Robert** (from Contrast Foundry) for marketing headers and a slightly-customized **CoFo Sans** across the product UI (source: https://pcho.medium.com/a-brilliant-brand-refresh-4af021c11486). Those are paid foundry fonts — for an MVP, substitute a free geometric/humanist sans with similar warmth. Good free analogs: **Inter**, **General Sans**, or **Geist**. The key trait is a friendly, slightly rounded sans, not a neutral grotesque.
- **Color:** The 2023 refresh moved to a "**lighter, brighter color palette**" and introduced a "**pear** color spectrum for use across primary CTAs and streaks" (source: https://pcho.medium.com/a-brilliant-brand-refresh-4af021c11486) — i.e., a yellow-green as the signature accent. I could **not** verify exact hex codes from a primary source (the Brandfetch page 403'd, and the brand article publishes no hex values), so do not treat any specific hex as official. Practical takeaway: **one warm accent color** (a pear/lime green), near-black text on near-white, generous neutrals. Pick your own hexes; a defensible starter set is `--accent:#A3E635` (lime/pear), `--ink:#18181B`, `--bg:#FFFFFF`, `--muted:#71717A`, `--surface:#F4F4F5`.
- **Illustration/wordmark:** Built from **straight-edged line segments**, with the wordmark "composed of rounds and squared off corners" — "bold, yet friendly" (source: https://pcho.medium.com/a-brilliant-brand-refresh-4af021c11486). Translation for you: simple geometric SVG shapes, rounded-but-confident corners (`border-radius` ~8–12px), no gradients-for-the-sake-of-it.

Behavioral design traits to copy (these are what make it feel "Brilliant," more than the palette):

- **One concept per lesson, start from the simplest version** to minimize cognitive load (source: https://brilliant.org/ and the ustwo case study https://ustwo.com/work/brilliant/).
- **Active wrong-answer handling:** "When users answer incorrectly, the explanation often includes interactive elements, allowing them to explore the solution actively rather than just reading it" (source: https://screensdesign.com/showcase/brilliant-learn-by-doing). This is the single most differentiating mechanic — budget time for it.
- **Course as a visible branching path / gameboard**, plus celebratory micro-feedback (XP counters, satisfying success animations) rather than generic spinners — Brilliant uses tangram-style loading animations tied to its brand (source: https://screensdesign.com/showcase/brilliant-learn-by-doing).
- **Motion is reward-oriented:** "playful and colorful moments brimming with surprise and delight," with success/streak animations "seamlessly aligned with the increasing number count" (source: https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations). Brilliant uses **Rive** state machines for this — **do not** adopt Rive for a 1-week MVP; it's a whole authoring tool. A scale/color CSS transition on a correct answer gets you 80% of the feel.

---

## 2. Front end

### 2.1 Styling: Tailwind, decisively

**Recommendation: Tailwind CSS.** For a solo dev on a deadline, it's the fastest route to a *consistent* polished look because the design tokens (spacing scale, color scale, radius, typography) are built-in and enforced — you stop re-deciding margins on every component. Tailwind also has overwhelming ecosystem and AI-codegen support, which matters when you're moving fast (source: https://www.13labs.au/compare/tailwind-vs-css-modules; https://dev.to/_d7eb1c1703182e3ce1782/css-in-js-vs-tailwind-css-vs-css-modules-which-to-choose-in-2025-cbi).

Why not the alternatives:
- **CSS Modules** are perfectly fine and give "pure CSS control," and they shine when extending an older codebase (source: https://www.13labs.au/compare/tailwind-vs-css-modules). But solo and fast, you'll spend time naming classes and re-establishing a spacing system Tailwind gives you free.
- **A full component library (MUI/Ant/Chakra):** Avoid. They impose *their* visual identity, and fighting it to get a calm custom Brilliant-like look costs more than building ~10 small components yourself. If you want a couple of accessible primitives (dialog, popover), copy them in from **shadcn/ui** (which is itself Tailwind-based and copy-paste, not a dependency) rather than installing a styled library.
- **Hybrid is legitimate:** Tailwind for layout/utilities, plus a plain `.css` file for the handful of complex keyframes or filter animations that read awkwardly as utility classes (source: https://medium.com/@ignatovich.dm/css-modules-vs-css-in-js-vs-tailwind-css-a-comprehensive-comparison-24e7cb6f48e9).

**Polish tips that punch above their weight (all free):**
- Define exactly **one accent color** and use it sparingly (CTAs, correct-answer feedback, progress). Restraint reads as "designed."
- Use a tight type scale and lots of whitespace. Brilliant's calm comes largely from generous spacing and a clear hierarchy/branching path (source: https://screensdesign.com/showcase/brilliant-learn-by-doing).
- Rounded corners (`rounded-lg`/`rounded-xl`), soft single-layer shadows, no busy borders.
- Self-host the font (Inter/General Sans) via `@font-face` for speed and to avoid FOUT.

### 2.2 Animation: CSS transitions first, Motion only where it earns its place

The honest 2025/2026 consensus: CSS transforms/transitions are GPU-accelerated, run on the compositor thread, and are the right tool for hover states, fades, simple slides, and color changes; the performance gap with JS libraries has shrunk because Motion uses the Web Animations API under the hood (source: https://theekshanachamodhya.medium.com/why-framer-motion-still-beats-css-animations-in-2025-16b3d74eccbd; https://motion.dev/blog/do-you-still-need-framer-motion). Josh Comeau's guidance is the practical rule: prefer CSS for what it can express; reach for JS when you need orchestration/physics/interruption (source: https://www.joshwcomeau.com/animation/css-vs-javascript/).

**Use plain CSS transitions for (the MVP majority):**
- Correct/wrong feedback (scale pop + color flash): `transition: transform .18s ease, background-color .18s ease;`
- Button/hover/focus states, card lifts, progress-bar fills, page-section fades.
- Anything triggered by a class toggle.

**Reach for Framer Motion / "Motion" only for:**
- **Enter/exit animations** of elements leaving the DOM (`AnimatePresence`) — this is genuinely painful in raw CSS/React and is Motion's killer feature (source: https://motion.dev/blog/do-you-still-need-framer-motion).
- **Spring physics** (e.g., a slider thumb that springs back) and **layout transitions** (an item smoothly re-flowing) (source: https://jsdev.space/howto/react-animation-solutions/).
- The pragmatic rule from the field: "lean on CSS for your simple, static transitions, and when you need complex, state-driven, or interactive animations... bring in Framer Motion" (source: https://dev.to/manukumar07/framer-motion-tailwind-the-2025-animation-stack-1801).

For a 1-week build, it's defensible to ship **zero animation libraries** and do everything with CSS transitions + one or two `@keyframes`. Add Motion in week 2 if the success moment feels flat. **Do not adopt Rive/Lottie** — that's Brilliant's production-scale tooling, not MVP-appropriate.

### 2.3 Smooth sliders and draggable SVG — no library required

This is the core interactive primitive for photography sims (aperture/shutter/ISO sliders). Build it with **native Pointer Events**:

- Use **`pointerdown` → `pointermove` → `pointerup`/`pointercancel`**, and call **`setPointerCapture()`** on `pointerdown` so the element keeps receiving move events even when the cursor leaves it — this removes the need to bind move handlers to `window` (source: https://dev.to/nishinoshake/smooth-drag-interactions-with-pointer-events-5e2j).
- Pointer Events **unify mouse, pen, and touch** under one event stream, so you don't write separate touch handlers; use the `isPrimary` flag to ignore extra multi-touch contacts (source: https://dev.to/nishinoshake/smooth-drag-interactions-with-pointer-events-5e2j).
- Add **`touch-action: none`** in CSS on the draggable element so the browser doesn't hijack the gesture for scrolling (source: https://dev.to/nishinoshake/smooth-drag-interactions-with-pointer-events-5e2j).
- For position, **track the start position and compute deltas** rather than relying on `movementX/Y` (which truncates to integers); update with `requestAnimationFrame` for smoothness (source: https://dev.to/nishinoshake/smooth-drag-interactions-with-pointer-events-5e2j).
- Map drag position → value with simple linear math, e.g. `value = Math.floor(((x - MIN_X) * 100) / (MAX_X - MIN_X))` (source pattern: https://blog.sethcorker.com/make-a-complex-slider-in-react-using-svg/).
- Move the visual via **CSS `transform: translate(...)`**, which works regardless of the element's positioning context (source: https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/; https://blog.sethcorker.com/make-a-complex-slider-in-react-using-svg/).

Note: the popular "SVG slider in React" tutorial happens to use the Pose library, but its author confirms the library isn't required for basic functionality — Pose just adds spring-on-release polish (source: https://blog.sethcorker.com/make-a-complex-slider-in-react-using-svg/). For an MVP, ship the Pointer Events version; if you want the springy snap-back later, that's the one place Motion is worth adding.

Reusable plan: build **one `<Slider>` component** (label, min, max, value, onChange) and reuse it for every photography parameter. Don't build three sliders.

---

## 3. Rendering interactive photography sims: SVG vs Canvas vs CSS filters

**Recommendation: a real photo `<img>` styled with CSS `filter`, plus SVG for overlays/diagrams. Skip Canvas for the MVP.**

The CSS `filter` property gives you photographically convincing fakes with essentially no code (source: https://developer.mozilla.org/en-US/docs/Web/CSS/filter):

- **Depth-of-field fake:** `filter: blur(Xpx)` on the background, sharp subject on top. Subtle blurs (~0.5–2px) read as shallow DoF; for a more realistic *gradient* falloff, combine `blur()` with a **`mask-image` linear-gradient** so the blur fades in progressively (source: https://medium.com/@paarthgupta6393/css-image-filters-a-2025-guide-to-visual-effects-for-web-devs-c9ca5406ee80). Drive `blur()` amount from your aperture slider value.
- **Exposure fake:** `filter: brightness(b) contrast(c)` — `brightness < 1` darkens, `> 1` brightens; a slight contrast bump makes a dull image "snap" (source: https://thecodeaccelerator.com/blog/css-filters-applying-blur-brightness-contrast-and-more-to-images; https://medium.com/@paarthgupta6393/css-image-filters-a-2025-guide-to-visual-effects-for-web-devs-c9ca5406ee80). Map your shutter/ISO/aperture sliders to a computed brightness so the "exposure triangle" visibly balances.
- **Motion blur fake (shutter speed):** directional blur via SVG `feGaussianBlur` in a filter, or a simple `blur()` increase on moving subjects — good enough to teach the concept.

**Performance caveat (important):** Do **not** animate `filter` values frame-by-frame on large images — it forces expensive re-rasterization. Keep blur to tight bounding boxes and update filter values on slider *release* or throttle them, rather than animating continuously (source: https://medium.com/@paarthgupta6393/css-image-filters-a-2025-guide-to-visual-effects-for-web-devs-c9ca5406ee80). In practice: update the CSS variable as the user drags (cheap if the image is modest-resolution), and don't add a `transition` on the filter.

**Use SVG for:** the exposure-triangle diagram, the aperture-blades graphic that opens/closes, sliders/dials, and any labeled overlay. SVG gives more freedom to manipulate effects than CSS filters and is resolution-independent (source: https://medium.com/@paarthgupta6393/css-image-filters-a-2025-guide-to-visual-effects-for-web-devs-c9ca5406ee80). An animated aperture (a circle of rotating "blades") is a few `<path>`s + a CSS transform driven by the slider — high visual payoff, low effort.

**Use Canvas only if** you need true per-pixel work (histogram of an actual image, real bokeh, pixel-level exposure on uploaded photos). That's a scope trap for week one — defer it. Specialized blur libs like StackBlur.js exist for heavy cases (source: https://cloudinary.com/guides/image-effects/an-extensive-walkthrough-of-blurring-images-with-javascript) but you almost certainly don't need them.

**Curriculum hook:** The natural first course is the **exposure triangle** — aperture (f-stop: small number = wider opening), shutter speed (duration), ISO (sensor sensitivity), and how they balance to a correct exposure (source: https://photographylife.com/what-is-exposure-triangle; https://www.masterclass.com/articles/beginners-guide-to-exposure-triangle-in-photography). This maps perfectly onto three sliders + one CSS-filtered photo: change one, see the image change, and learn the trade-off (more light vs. blur vs. noise). One concept per lesson, simplest first — exactly the Brilliant model.

---

## 4. Firebase: minimal setup

### 4.1 Auth

Use **Firebase Authentication** with two providers:
- **Anonymous auth** as the default on first load — let people start a lesson with zero friction (very Brilliant-like try-before-signup). This creates a real UID you can attach progress to.
- **Email/password** (or an email link) for permanent accounts. On sign-up, **link the anonymous account** to the email credential so progress carries over (`linkWithCredential`). This is the single most valuable Auth detail for a learning app — get it right and you avoid orphaned progress.

Free tier: Firebase Auth includes **10k verifications/month** on the Spark plan, with most core services unlimited (source: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans). For an MVP that's effectively free.

### 4.2 Firestore data model (concrete, minimal schema)

Design principle from Firebase: **embedding is the first technique to consider — it's the most cost-effective and performant (1 document read)**, and use **subcollections for one-to-many** relationships (source: https://medium.com/@louisjaphethkouassi/data-modeling-basics-for-cloud-firestore-2a5f68c3a536; https://firebase.google.com/docs/firestore/manage-data/structure-data). Also avoid hotspotting: **use auto-generated IDs, not sequential ones** (source: https://firebase.google.com/docs/firestore/best-practices). And "it's often much easier to do many small queries and combine client-side than one giant query" (source: https://firebase.google.com/docs/firestore/manage-data/structure-data).

A pragmatic schema for users / course progress / per-lesson right-wrong / resume position:

```
users/{uid}
  displayName: string
  email: string | null
  isAnonymous: boolean
  createdAt: timestamp
  // lightweight roll-up so the home screen reads ONE doc:
  lastLesson: { courseId: "photography-basics", lessonId: "exposure-triangle", stepIndex: 3 }
  totalXp: number
  streak: { count: number, lastActiveDay: "2026-06-23" }

users/{uid}/progress/{courseId}        // one doc per course (subcollection)
  courseId: "photography-basics"
  completedLessonIds: ["intro", "aperture"]   // small array = fine to embed
  lessons: {
    "exposure-triangle": {
      status: "in_progress",            // not_started | in_progress | completed
      resumeStepIndex: 3,               // <-- resume position
      attempts: 5,
      correct: 4,
      wrong: 1,
      lastAttemptAt: timestamp
    }
  }

// OPTIONAL, only if you need per-question analytics later:
users/{uid}/answers/{autoId}
  courseId, lessonId, stepId
  correct: boolean
  answer: <value>
  at: timestamp
```

Key decisions and the rationale:
- **Course catalog/lesson content is NOT in Firestore.** Ship it as static JSON/JS in the app bundle. Lesson definitions don't change per user, so putting them in code means zero reads and instant load. Only *user state* lives in Firestore.
- **`lastLesson` + `streak` + `totalXp` are denormalized onto the `users/{uid}` doc** so the home screen and resume button cost **one read** — the embedding-first principle (source: https://medium.com/@louisjaphethkouassi/data-modeling-basics-for-cloud-firestore-2a5f68c3a536).
- **`progress` is a subcollection** keyed by `courseId` (one-to-many user→courses), each doc embedding a `lessons` map. For a handful of lessons per course, an embedded map is cheaper than a doc-per-lesson and stays well under limits.
- **`resumeStepIndex`** directly answers "resume position." Write it as the user advances steps.
- **Per-lesson right/wrong** lives as `correct`/`wrong`/`attempts` counters in the lessons map. Only add the separate `answers/` subcollection if you actually need question-level analytics — for an MVP, skip it.
- **Write economy:** Don't write to Firestore on every keystroke or every step. Batch: write `resumeStepIndex` on step change (debounced) and the counters on lesson completion. This keeps you far under the write quota.

Add basic **security rules**: a user can read/write only their own `users/{uid}` tree (`allow read, write: if request.auth.uid == uid`). This is essential even for an MVP — it's a few lines and prevents data leakage.

### 4.3 Free tier and hosting

Spark (free) plan, verified:
- **Firestore:** 1 GB stored, **50,000 reads / 20,000 writes / 20,000 deletes per day**; exceed it and you're simply billed for the overage that day (so it degrades gracefully if you've added billing) (source: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans; https://firebase.google.com/docs/firestore/quotas).
- **Hosting:** **1 GB stored, 10 GB transfer/month** (source: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).
- **Auth:** ~10k verifications/month; Analytics/Crashlytics/Cloud Messaging free (source: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).

For a learning MVP these limits are very hard to hit — with content in the bundle and batched writes, a single active user might cost a few reads/writes per session. **Firebase Hosting** deploy is one command (`firebase init hosting`, point it at Vite's `dist/`, `firebase deploy`) — it serves the static SPA over CDN with free SSL. No server to operate. (Honesty note: I did not re-verify whether the Spark plan still requires no billing account in mid-2026 — confirm on the pricing page before launch, since Google occasionally adjusts plan mechanics.)

Operational best practices that matter here: **avoid monotonically increasing IDs / high-rate sequential writes** (hotspotting) and rely on Firestore's auto-IDs (scatter algorithm) for any collection like `answers/` (source: https://firebase.google.com/docs/firestore/best-practices).

---

## 5. Project structure for a small lesson app + shared "lesson engine"

Start small. For an app with a handful of lessons, the guidance is explicit: **begin with `components/`, `hooks/`, and one of `utils/`/`lib/`, and add structure only when the codebase demands it** (source: https://www.robinwieruch.de/react-folder-structure/; https://dev.to/pramod_boda/recommended-folder-structure-for-react-2025-48mc). A light **feature-folder** approach fits a lesson app well.

Recommended layout:

```
src/
├── main.jsx                 # entry
├── App.jsx                  # routes / top-level state
├── index.css                # Tailwind directives + @font-face + a few @keyframes
│
├── lib/
│   ├── firebase.js          # init app, export auth + db
│   └── progress.js          # read/write progress, resume, counters (all Firestore here)
│
├── engine/                  # the SHARED lesson engine — the heart of the app
│   ├── LessonPlayer.jsx     # drives steps: render current step, handle check, feedback, next
│   ├── useLessonState.js    # hook: stepIndex, status, correct/wrong, advance(), reset()
│   ├── stepTypes.js         # registry: { 'multiple-choice': MCStep, 'slider': SliderStep, ... }
│   └── Feedback.jsx         # right/wrong UI incl. the interactive wrong-answer explanation
│
├── components/              # shared presentational pieces
│   ├── Slider.jsx           # the Pointer Events slider (§2.3) — reused everywhere
│   ├── PhotoSim.jsx         # <img> + CSS filters driven by props (§3)
│   ├── ApertureSVG.jsx
│   ├── Button.jsx, Card.jsx, ProgressBar.jsx
│
├── content/                 # STATIC lesson data (no Firestore)
│   ├── courses.js           # course → lessons index (the "branching path")
│   └── photography-basics/
│       ├── exposure-triangle.js   # array of step objects
│       └── aperture.js
│
├── pages/
│   ├── Home.jsx             # resume button + course path (1 Firestore read)
│   ├── CoursePath.jsx       # the gameboard-style branching map
│   ├── Lesson.jsx           # wraps <LessonPlayer> with a content file
│   └── Auth.jsx
│
└── hooks/
    └── useAuth.js           # anonymous-by-default, email link/upgrade
```

**The lesson engine — the one design idea to get right.** Represent every lesson as **data, not bespoke components**. A lesson is an array of *step* objects; each step has a `type` that maps to a renderer in `stepTypes.js`. The engine handles the universal loop: render step → user acts → `checkAnswer` → show `<Feedback>` → record correct/wrong → `next`. New lessons are then **content files, not new code** — you write a JS array, not a React component. Example step shape:

```js
// content/photography-basics/exposure-triangle.js
export default [
  { type: "info", title: "Exposure", body: "Three controls balance light…" },
  {
    type: "slider-sim",
    prompt: "Widen the aperture until the background blurs.",
    sim: { image: "/img/portrait.jpg" },     // PhotoSim maps value → blur()
    param: { key: "aperture", min: 1.4, max: 16 },
    check: (v) => v <= 2.8,                    // correct if shallow DoF
    feedback: {
      correct: "Right — a wide aperture (low f-number) blurs the background.",
      wrong:   "Try lower f-numbers. Notice the background change as you drag."  // interactive retry, not a wall of text
    }
  },
  { type: "multiple-choice", prompt: "Which gives a brighter photo?", options: [...], answer: 1 }
];
```

This keeps the engine ~150 lines, makes every lesson cheap to add, and centralizes the Brilliant-style "explore the wrong answer interactively" behavior in one `<Feedback>` component (source for the mechanic: https://screensdesign.com/showcase/brilliant-learn-by-doing).

Routing: `react-router-dom` with ~4 routes (`/`, `/course/:id`, `/lesson/:courseId/:lessonId`, `/auth`). For a true MVP you could even drive screens with a single state value and skip the router — but the router is cheap and worth it for shareable URLs.

---

## 6. Pitfalls that waste time in a 1-week build (and explicit non-goals)

**Time sinks to actively avoid:**

1. **Building bespoke React components per lesson.** This is the #1 trap. If lessons aren't data-driven through the engine (§5), you'll rewrite the same step/feedback logic ten times. Build the engine on day 1–2.
2. **Adopting Rive/Lottie/Canvas to "match Brilliant."** Brilliant's polish comes from a *team* and Rive state machines (source: https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations). A CSS scale+color transition on success captures most of the feeling for none of the cost. Match the *behavior* (instant, rewarding feedback), not the production values.
3. **Animating CSS `filter` continuously on big images.** It forces frame-by-frame rasterization and jank (source: https://medium.com/@paarthgupta6393/css-image-filters-a-2025-guide-to-visual-effects-for-web-devs-c9ca5406ee80). Use modest-resolution images and update filters on drag/release, not via a `transition`.
4. **Pulling in a drag/slider library before trying Pointer Events.** Native `setPointerCapture` + `touch-action: none` handles mouse/pen/touch in one path (source: https://dev.to/nishinoshake/smooth-drag-interactions-with-pointer-events-5e2j). Libraries add bundle weight and API learning for a 60-line component.
5. **Over-normalizing Firestore / writing on every interaction.** Putting lesson *content* in Firestore, or writing per-keystroke, burns reads/writes and adds latency. Content in the bundle; user state denormalized onto `users/{uid}` for 1-read home screens (source: https://medium.com/@louisjaphethkouassi/data-modeling-basics-for-cloud-firestore-2a5f68c3a536); batch/debounce writes.
6. **A full component library for a custom look.** You'll fight its defaults. Hand-roll ~10 small Tailwind components; borrow from shadcn/ui only for accessible primitives.
7. **TypeScript + heavy tooling setup if you don't already live in it.** TS is great, but the setup/typing tax during a 1-week sprint can cost a half-day. If you're not already fast in TS, ship JS and add types later. (Opinion, not a verified claim.)
8. **Skipping Firestore security rules.** They're a few lines and prevent users reading each other's data — don't defer this.

**Deliberately out of scope for the MVP (cut list):**
- Leaderboards, leagues, friends, social — Brilliant has these but they're a motivation layer you can add later (source: https://screensdesign.com/showcase/brilliant-learn-by-doing).
- Payments / paywall / subscription flow.
- Real image upload + per-pixel Canvas processing, real histograms, real bokeh.
- Admin/content-authoring UI — author lessons by editing JS files in `content/`.
- Offline support, PWA, push notifications.
- Multiple courses — ship **one** course (Exposure Triangle, 3–5 lessons) end-to-end and make it feel great. Depth over breadth.
- Custom paid fonts (CoFo) — use a free analog (Inter/General Sans).
- Rive/Lottie animations.

**One-week sequencing (suggested):** Day 1: Vite + Tailwind + Firebase init, anonymous auth, deploy a "hello" to Hosting (de-risk deploy early). Day 2: lesson engine + step registry + one `info` and one `multiple-choice` step. Day 3: `Slider` (Pointer Events) + `PhotoSim` (CSS filters) + the aperture/exposure sim. Day 4: progress persistence (resume, counters, streak/XP roll-up) + security rules. Day 5: course path/home polish, success animation, wrong-answer interactive feedback. Day 6: content — author the full Exposure Triangle course. Day 7: visual polish, mobile/touch test, final deploy.

---

### Sources
- Brilliant / ustwo case study: https://ustwo.com/work/brilliant/
- Brilliant UI breakdown (screensdesign): https://screensdesign.com/showcase/brilliant-learn-by-doing
- Brilliant + Rive animations: https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations
- Brilliant brand refresh (fonts/colors): https://pcho.medium.com/a-brilliant-brand-refresh-4af021c11486
- Brilliant home: https://brilliant.org/
- Tailwind vs CSS Modules: https://www.13labs.au/compare/tailwind-vs-css-modules ; https://dev.to/_d7eb1c1703182e3ce1782/css-in-js-vs-tailwind-css-vs-css-modules-which-to-choose-in-2025-cbi ; https://medium.com/@ignatovich.dm/css-modules-vs-css-in-js-vs-tailwind-css-a-comprehensive-comparison-24e7cb6f48e9
- Framer Motion vs CSS: https://motion.dev/blog/do-you-still-need-framer-motion ; https://www.joshwcomeau.com/animation/css-vs-javascript/ ; https://jsdev.space/howto/react-animation-solutions/ ; https://dev.to/manukumar07/framer-motion-tailwind-the-2025-animation-stack-1801 ; https://theekshanachamodhya.medium.com/why-framer-motion-still-beats-css-animations-in-2025-16b3d74eccbd
- Pointer Events drag: https://dev.to/nishinoshake/smooth-drag-interactions-with-pointer-events-5e2j ; https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/ ; https://blog.sethcorker.com/make-a-complex-slider-in-react-using-svg/
- CSS filters: https://developer.mozilla.org/en-US/docs/Web/CSS/filter ; https://medium.com/@paarthgupta6393/css-image-filters-a-2025-guide-to-visual-effects-for-web-devs-c9ca5406ee80 ; https://thecodeaccelerator.com/blog/css-filters-applying-blur-brightness-contrast-and-more-to-images ; https://cloudinary.com/guides/image-effects/an-extensive-walkthrough-of-blurring-images-with-javascript
- Firestore modeling & best practices: https://medium.com/@louisjaphethkouassi/data-modeling-basics-for-cloud-firestore-2a5f68c3a536 ; https://firebase.google.com/docs/firestore/manage-data/structure-data ; https://firebase.google.com/docs/firestore/best-practices
- Firebase pricing/limits: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans ; https://firebase.google.com/docs/firestore/quotas
- React/Vite structure: https://www.robinwieruch.de/react-folder-structure/ ; https://dev.to/pramod_boda/recommended-folder-structure-for-react-2025-48mc
- Exposure triangle curriculum: https://photographylife.com/what-is-exposure-triangle ; https://www.masterclass.com/articles/beginners-guide-to-exposure-triangle-in-photography ; https://www.slrlounge.com/iso-aperture-shutter-speed-a-cheat-sheet-for-beginners/

**Verification caveats:** No official Brilliant hex codes could be confirmed from a primary source (Brandfetch returned 403; the brand article publishes none) — treat any hex in §1 as a suggested starting palette, not Brilliant's actual values. Confirm current Spark-plan billing mechanics on the live pricing page before launch.