# Technical Build Guide — Firebase + React for an Interactive Lesson App

This guide synthesizes research across three domains — Firebase Auth/Firestore architecture, a reusable data-driven lesson engine, and browser-based photography effect simulations — into a concrete, buildable plan for a Brilliant-style interactive photography learning app. It is written to be the technical foundation for a PRD and a first implementation sprint. Where specific numbers, encodings, or APIs matter, they are preserved verbatim.

---

## 1. Executive Summary & Stack Decision

| Layer | Recommendation | Why |
|---|---|---|
| **Auth** | Firebase Auth, **anonymous-first**, upgrade to email/password (and optionally Google) via `linkWithCredential()` | Zero onboarding friction; UID preserved on upgrade so guest progress survives |
| **Database** | Cloud Firestore, split into **public content** (`/courses/...`) and **private per-user state** (`/users/{uid}/...`) | Independent security rules and lifecycles; UID-keyed progress enables cross-device resume |
| **Offline** | `persistentLocalCache` + `persistentMultipleTabManager` | Keep answering on flaky mobile; optimistic UI via `onSnapshot` metadata flags |
| **Hosting** | Firebase Hosting with SPA wildcard rewrite against Vite's `dist/` | Deep links survive refresh |
| **Lesson engine** | Data-driven `steps[]` array with a typed component registry | New lessons are authored as JSON, not code |
| **Effects** | CSS `filter` chains for most effects; one SVG `feGaussianBlur` for motion blur; noise overlay for ISO; SVG `feComponentTransfer` or canvas LUT for tone curve | GPU-accelerated, 60fps on phones, minimal complexity |

The core architectural insight is the same in every domain: **separate data from code.** Content is data (Firestore docs / lesson JSON). Per-user state is data (UID-keyed Firestore). Lessons are data (typed step arrays). The React app is a small, fixed set of renderers and evaluators that interpret that data.

---

## 2. Firebase Auth — Anonymous-First with In-Place Upgrade

### 2.1 The recommended pattern

Call `signInAnonymously()` on first launch. Firebase's own best-practices blog recommends this to remove onboarding friction so learners can "try out" the app with a random server-generated UID — letting a learner tap straight into Lesson 1 (aperture, shutter, ISO) with no signup wall, exactly the Brilliant try-before-you-commit feel.

When the learner decides to commit, **upgrade the same account in place**:

```js
linkWithCredential(
  auth.currentUser,
  EmailAuthProvider.credential(email, password)
)
```

This is `linkWithCredential`, **not** `signInWith`. The UID stays identical, so all attempts/streaks earned as a guest survive — **no data-merge code is needed in the happy path.** Use `user.isAnonymous` to decide when to show a "Save your progress" conversion prompt. Optionally add a Google button via `linkWithPopup(GoogleAuthProvider)` for one-tap upgrade.

### 2.2 The one gotcha you must handle: `auth/email-already-in-use`

If the chosen email already belongs to an existing account, `linkWithCredential()` fails with `auth/email-already-in-use` (and `credential-already-in-use` for federated providers). You must:

1. Catch the error.
2. Surface a friendly "You already have an account — sign in?" message.
3. Manually copy the anonymous user's Firestore docs to the existing UID before signing in (which abandons the anonymous UID).

> **This is the single most common bug that silently drops a learner's chapter progress.** Ship the simple upgrade flow first, but always wrap `linkWithCredential` in a `try/catch` for this case.

### 2.3 Cross-device resume comes from data, not auth persistence

A critical distinction:

- **Auth persistence** (`browserLocalPersistence`, the default, stored in IndexedDB) is **device-specific**. Closing the browser on device A does not touch device B. It handles *same-device* resume without re-login.
- **Cross-device resume** works because all progress lives at `/users/{uid}/...` keyed by the Firebase UID. Signing into the same account on any device lets that device query the same documents.

> Do **not** stuff progress into `localStorage` — it will not sync across devices. Store a resume pointer (`courseId`, `chapterId`, `lessonId`, `stepIndex`) in the user's progress doc so any device jumps straight back to the exact step.

### 2.4 React auth-gating: wait for `onAuthStateChanged`

The SDK restores the session **asynchronously** from IndexedDB on page load. A documented pitfall is reading `user` before `onAuthStateChanged` fires, causing a flash of the logged-out state or a wrong redirect.

The fix:

- A `useEffect` subscribes to `onAuthStateChanged`, holds a `loading` state until the first callback, and unsubscribes on unmount (avoid memory leaks).
- Gate the whole app behind an auth-loading spinner until that first callback. Then route the learner straight to their `resume` pointer.
- Note: IndexedDB is unavailable in some private-browsing modes.

### 2.5 Operational note — stale anonymous accounts

Anonymous UIDs never expire on the default Spark/Auth tier and accumulate. Enabling **Firebase Authentication with Identity Platform** unlocks automatic cleanup that deletes anonymous users **30 days after creation**. Also note anonymous tokens can be minted via the REST API by bad actors — they are **not** app attestation; use **App Check** for that. Acceptable to defer for an MVP, but plan for either the 30-day cleanup or a pruning Cloud Function before shipping widely.

---

## 3. Firestore Data Model

### 3.1 Principle: split static content from per-user state

Firestore offers three structuring options, each with tradeoffs:

| Structure | Pros | Cons |
|---|---|---|
| **Nested fields** | Simple | Don't scale as lists grow; bloat the 1 MiB doc |
| **Subcollections** | Parent doc size stays constant; full query capability | "You can't easily delete subcollections" |
| **Root-level collections** | Good for many-to-many; powerful per-collection queries | More rules surface |

Hierarchical course content (`courses → chapters → lessons → steps`) maps naturally onto **subcollections**. Disparate per-user state belongs in its own `/users` tree. This gives content and progress **independent security rules and lifecycles**, and keeps authored content cacheable/public while user data stays private.

### 3.2 Concrete recommended layout

**Content (read-only, world-readable, never client-written):**

```
/courses/{courseId}
    { title, order }

/courses/{courseId}/chapters/{chapterId}
    { title, order, lessonCount }

/courses/{courseId}/chapters/{chapterId}/lessons/{lessonId}
    { title, order, estMinutes,
      parameters: { maxAttempts, showFeedback },
      steps: [ { id, type, prompt, payload, solution, feedback } ]  // embedded array
    }
```

Keep each lesson document **under 1 MiB**. If a lesson grows large, promote `steps` to a `/steps` subcollection.

**Per-user (private):**

```
/users/{uid}
    { displayName, isAnonymous, createdAt,
      currentStreak, longestStreak, lastActiveDate,
      resume: { courseId, chapterId, lessonId, stepIndex } }

/users/{uid}/lessonProgress/{lessonId}
    { status: 'in_progress' | 'completed',
      completedSteps: [...], lastStepIndex, updatedAt }

/users/{uid}/attempts/{stepId}
    { correctCount, wrongCount, lastAnswer, hintsShown }
```

> An equivalent course-scoped variant nests progress as `/users/{uid}/courseProgress/{courseId}` (summary) with `/users/{uid}/courseProgress/{courseId}/lessonAttempts/{lessonId}` (per-step results). Either works; the flat `lessonProgress` + `attempts` form above is the simplest for the MVP.

### 3.3 How each piece is used

- **`resume` map** — read on login to jump to the exact step (one document read, no replay).
- **`lessonProgress`** — drives the chapter checklist UI.
- **`attempts`** — drives wrong-answer analytics and adaptive hints.

Keeping `lessonProgress` and `attempts` as **separate subcollection documents** (rather than one monolithic progress doc) avoids the **1-write/sec-per-document** throttle during rapid quiz answering.

### 3.4 Hard limits to design against

| Limit | Value |
|---|---|
| Document size cap | **1 MiB (1,048,576 bytes)** |
| Sustained writes per document | **~1 write/sec** (bursts of 5–50 queued; sustained high QPS hotspots → contention/latency/failed writes) |
| Max path depth | **100 levels** |
| Default offline cache | **40 MB** |
| Ramp rule for new collections | **500/50/5** — start at 500 ops/sec, +50% every 5 min |

> Avoid monotonically increasing / sequential document IDs (`Customer1`, `Customer2`) — they create write hotspots. Use auto-generated IDs (`addDoc`) or natural keys (`uid`, `lessonId`). Key `/users/{uid}/lessonProgress/{lessonId}` so it maps **1:1** to content IDs.

---

## 4. Security Rules

### 4.1 The two core rules (~10 lines total)

Per Doug Stevenson's per-user-permissions patterns, the cleanest approach is **document-ID-equals-UID**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Per-user private state: recursive wildcard, ID must equal caller UID
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }

    // Course content: public-read, client-immutable
    match /courses/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

This is **Pattern 1** (1:1 user-to-doc): the wildcard captures the doc ID and compares it to the caller's UID. For collections of auto-ID docs *outside* the `/users` tree (Pattern 2), store a `uid` field and check `request.resource.data.uid == request.auth.uid` on create and `resource.data.uid == request.auth.uid` on update.

> Security rules **cannot match substrings of wildcards** — composite IDs like `{uid}_{random}` won't work for auth checks.

### 4.2 Rules don't filter queries — your queries must match the rules

Firestore evaluates a query against its **potential** result set, not actual documents. If a query *could* return a document that violates a rule, **the entire query is rejected** (it does not silently filter).

Because all per-user data sits under `/users/{uid}`, you naturally query within that path and never hit this trap. But if you later add a top-level `/attempts` collection, **every** `list()` query must carry `where('uid', '==', request.auth.uid)` or it fails with `permission-denied` — a classic first-timer surprise.

Test rules in the **Rules Playground** / emulator before shipping.

---

## 5. Counters, Streaks & Offline Behavior

### 5.1 Attempt counters: `FieldValue.increment()`, not transactions

`increment()` atomically bumps a numeric field server-side **without a transaction**, is lighter-weight, and works offline (the SDK queues and latency-compensates the write). On each answer:

```js
increment(correctCount)  // or increment(wrongCount)
```

on `/users/{uid}/attempts/{stepId}`, plus a `hintsShown` counter. A single learner's own progress doc is never a high-concurrency hotspot, so distributed counters are **not** needed.

### 5.2 Streaks: a once-per-day transaction

Streak logic reads-then-writes conditionally (compare `lastActiveDate` to today; reset vs. increment `currentStreak`; bump `longestStreak`), so it belongs in a `runTransaction()`. Run it **once per session, on the first activity of the day** — not on every step — keeping you well under the 1-write/sec-per-doc limit even during rapid-fire answering.

### 5.3 Offline persistence: the modern API

Use the v9+ modular API at init (configure **once, before any read/write**):

```js
initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
})
```

- The old `enableIndexedDbPersistence()` / `enablePersistence()` is **deprecated** and threw `failed-precondition` with multiple tabs.
- Default cache is **40 MB**; set `CACHE_SIZE_UNLIMITED` via `cacheSizeBytes` if needed (min 1 MB).
- `persistentMultipleTabManager` prevents the classic multi-tab crash if a learner opens the course in two tabs.
- Supported on Chrome, Safari, Firefox; IndexedDB may be unavailable in private browsing.

### 5.4 Optimistic UI via `onSnapshot` metadata

Drive the lesson screen from a real-time listener with `{ includeMetadataChanges: true }`:

- `snapshot.metadata.fromCache` — `true` when data is cache-sourced (possibly stale).
- `snapshot.metadata.hasPendingWrites` — `true` when there are un-synced local writes.

Local writes are **latency-compensated** — they appear instantly in listeners before the server confirms. A query with no cached matches returns **empty** offline rather than erroring. This means a checkmark appears the instant an answer is recorded (`hasPendingWrites` still `true`) and reconciles silently when confirmed — the snappy, no-spinner Brilliant feel even on flaky mobile connections.

---

## 6. Hosting & Deploy

`firebase.json` for a Vite React SPA:

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

- `"public": "dist"` — Vite's build output (**not** CRA's `build/`).
- The wildcard rewrite is **mandatory**, or deep links like `/course/photography/chapter/2` will 404 on refresh. Hosting only applies the rewrite when no real file/dir matches the path, and returns the file content (not an HTTP redirect).
- `firebase init` scaffolds `firebase.json` + `.firebaserc`; deploy with `firebase deploy --only hosting` after `npm run build`.
- One hosting target is fine for the MVP; add staging/production targets later.

---

## 7. The Lesson Engine — Data-Driven Schema

### 7.1 What a "lesson" is (the pedagogy that constrains the schema)

A Brilliant lesson is a short (**5–15 min**), single-concept sequence that alternates **direct instruction** with **"blocked problem solving"** — the learner works the idea themselves with prompts, scaffolding, and **instant per-answer feedback**, not passive video. Practice sets later strip the scaffolding (no hints/visual aids) to test independent recall.

> **MVP unit:** one chapter ≈ **4–7 short steps** mixing explainer steps with interactive-problem steps, each with immediate feedback. Bake a step-level `mode` flag (**teach vs. practice**) so the same step types render with or without scaffolding for a later practice set.

### 7.2 The proven schema shape (synthesized from JSON-Quiz + QTI + GETMARKED)

Three established assessment standards converge on the same model — a lesson is an **ordered array of typed steps**, each with a `type` string that selects a renderer plus a self-contained payload:

- **JSON-Quiz** models a quiz as `steps[] → items[]`, each item with a MIME-like `type` (e.g. `application/x.choice+json`) and type-specific `content`. Behavior knobs live in a top-level `parameters`: `maxAttempts`, `randomOrder`, `showFeedback`, `showCorrectionAt`, `showScoreAt`, `showFullCorrection`.
- **QTI** separates the **four concerns every step needs**: `itemBody` (the interaction) + `responseDeclaration` (the correct answer) + `responseProcessing` (scoring) + feedback (`modalFeedback`, branched correct vs. incorrect).
- **GETMARKED** encodes per-type answer shapes (see §7.4).

**Recommended step schema:**

```json
{
  "id": "...",
  "type": "concept | multiple-choice | multi-select | tap-select | slider-sim | drag-order | numeric",
  "prompt": "...",
  "payload": { /* the interaction data — QTI itemBody */ },
  "solution": { /* correct answer — QTI responseDeclaration */ },
  "feedback": {
    "correct": "...",
    "incorrect": "...",
    "hints": [ "...", "..." ],
    "distractorFeedback": { "<wrongChoiceId>": "..." }
  },
  "scaffold": true,
  "mode": "teach | practice"
}
```

**Lesson wrapper:**

```json
{
  "id": "...",
  "title": "...",
  "conceptId": "...",
  "estMinutes": 8,
  "parameters": { "maxAttempts": 3, "showFeedback": true },
  "steps": [ /* ... */ ]
}
```

> **Keep scoring out of the React component.** Mirror QTI's four fields: `payload` (itemBody), `solution` (correctResponse), a type-keyed evaluator (responseProcessing), and `feedback` (modalFeedback). A pure `evaluate(stepType, userAnswer, solution)` function makes grading testable and shared.

### 7.3 Feedback needs a third state: guided recovery

Beyond right/wrong, Brilliant nudges a wrong answer "toward the right reasoning without giving away the answer" before revealing. Model a **recovery ladder** driven off the per-step attempt counter:

| Event | Response |
|---|---|
| Attempt 1 wrong | Targeted `hints[0]` |
| Attempt 2 wrong | Stronger `hints[1]` or reveal |
| After `maxAttempts` | Reveal worked explanation |
| Correct | Reinforcing explanation |

Optionally key `distractorFeedback` by the specific wrong option chosen (e.g. choosing "higher ISO" → "that brightens but adds noise; think about light *amount* instead").

### 7.4 Per-type answer encodings (copy these shapes)

| Type | Encoding |
|---|---|
| **MCQ (single)** | `choices: [{id, content}]`, `answers: [["b"]]` |
| **MRQ (multi-select)** | `answers: [["a","d"]]` |
| **CLOZE** | `%%%placeholder%%%` tokens in prompt; `interactions[]` each with accepted `answers: ["red","Red"]` |
| **MATCH** | `matching_interaction.left[]` / `.right[]`, `answers: [["1","a"]]` pairs |
| **NRQ (numeric)** | tolerance string `"3.141±0.0005"`; also range `X⟷Y` and precision `XpY` |

> The **numeric-tolerance pattern is the key** to grading "set the shutter to ~1/125" without exact-match brittleness — reuse NRQ's `±tolerance` idea for all exposure/aperture/ISO slider targets.

### 7.5 The non-negotiable rule: "almost right is catastrophically wrong"

Brilliant's engineering blog argues precision is non-negotiable: a near-correct simulation makes learners "doubt their own understanding rather than recognizing a flawed puzzle." Interactions are evaluated on **mathematical accuracy, unique solvability (usually exactly one solution path), state consistency across all inputs, physical plausibility, and safety constraints** preventing impossible/undefined states.

Two concrete mandates follow:

1. **The grader and the display must use the same math.** A "match the exposure" slider sim must compute the displayed brightness from the *same* formula it grades against.
2. **Constrain inputs with drag-and-snap and discrete placement.** Brilliant uses "integer-spaced placement systems" and predefined "drag-and-snap points." For photography:
   - Aperture snaps to f-stops (f/1.4, f/2, f/2.8, …)
   - Shutter snaps to standard speeds (1/30, 1/60, 1/125, …)
   - ISO snaps to stops (100, 200, 400, …)
   - Store the **snapped discrete value** as the answer, not raw slider pixels.

---

## 8. React Component Architecture

### 8.1 The registry dispatch pattern

A single `<StepRenderer>` switches on `step.type` to a component registry, so **new lessons are authored as JSON, not new code**:

```js
const STEP_REGISTRY = {
  'concept':         ConceptStep,
  'multiple-choice': MultipleChoiceStep,
  'multi-select':    MultiSelectStep,
  'tap-select':      TapSelectStep,
  'slider-sim':      SliderSimStep,
  'drag-order':      DragOrderStep,
  'numeric':         NumericStep,
};

function StepRenderer({ step, onAnswer, locked }) {
  const C = STEP_REGISTRY[step.type];
  if (!C) throw new Error(`No renderer for step type: ${step.type}`); // dev-time guard
  return <C payload={step.payload} onAnswer={onAnswer} disabled={locked} />;
}
```

Each step component is **"dumb"**: it receives a payload and emits the user's answer; it does **not** own scoring or progress.

### 8.2 Component hierarchy

```
<LessonPlayer>            // owns step index, attempt counters, persistence, hint ladder
  └─ <StepRenderer>       // registry dispatch on step.type
       └─ <*Step>         // individual interaction widgets (dumb)
  └─ <FeedbackPanel>      // shared correct/incorrect display
  └─ <HintReveal>         // escalation driven by attempt count
  └─ <ContinueButton>     // locked until correct-or-revealed
```

- **Adding a new interaction** = write one widget + one evaluator + register the type string.
- **Adding a new lesson** = author JSON only. This is the core reuse win.
- Lock "Continue" until correct-or-revealed so the experience stays active.

### 8.3 Persistence strategy under the write limit

Respect the ~1 write/sec/doc limit:

- Keep transient step state in React (and optionally `localStorage` for crash recovery only).
- Persist to Firestore **on step-completion** (a few writes per lesson), or batch the whole lesson's results in one `writeBatch` on lesson finish.
- Use **one attempt document per step** rather than repeatedly rewriting a single summary doc.
- On app load, read the **single** summary/`resume` doc to route the user straight back to `currentLessonId`/`currentStepIndex`, rehydrating already-correct steps as locked/completed — the MVP's "log out / log back in / resume" with **one document read and no replay**.

### 8.4 Validate authored lessons in CI

JSON-Quiz, GETMARKED, and QTI all define formal schemas so content is validated before use. Author a **JSON Schema** for your lesson format and validate every lesson file at build/publish time. This catches the most common authoring bugs — a step whose `type` has no registered renderer/evaluator, or whose `solution` shape doesn't match its type — **before** they become broken, ungradable widgets for a learner.

---

## 9. Per-Effect Implementation Guide (Photography Simulations)

**The single most important decision:** most camera effects map directly onto **chained CSS `filter` functions**, which are GPU-accelerated and the simplest, most reliable, most mobile-friendly technique. Per-pixel canvas/WebGL is only warranted when you need exact, physically-correct math or a draggable curve histogram.

### 9.1 The shared backbone — one `buildFilterString(params)` helper

CSS `filter` accepts a space-separated list applied in order:

```css
filter: brightness(1.2) contrast(1.1) saturate(0.8) blur(2px);
```

`brightness`, `contrast`, `saturate`, `hue-rotate`, `grayscale`, `invert`, `sepia`, and `blur` are **hardware-accelerated**; `drop-shadow` is the slow CPU-bound one to **avoid**. Baseline widely available since 2016. Build a single shared `buildFilterString({exposure, contrast, saturation, warmth})` helper that maps lesson sliders to one CSS filter string set on the photo's style — it re-renders instantly as sliders move, on mobile included.

### 9.2 Effect-by-effect — simplest reliable technique

| Effect | Recommended technique | Mechanics |
|---|---|---|
| **Exposure** | CSS `brightness()` (+ slight `contrast()`) | `brightness(1)` neutral, `1.5` = +50%, `0.5` darker, `0` black; linear multiplier. Add slight `contrast()` so over/under-exposure feels photographically real. Zero-cost. |
| **Depth of field / aperture** | CSS `blur()` + `mask-image` gradient | `blur(px)` = Gaussian std-dev in screen pixels; GPU-accelerated in Chrome/Safari. Stack a **sharp subject layer over a blurred background copy**, or use `mask-image` radial gradient to keep the subject crisp. Map f-number **inversely** to blur radius (f/1.8 → large blur, f/16 → ~0). |
| **Motion blur / shutter** | SVG `feGaussianBlur` with **two-value** `stdDeviation` | CSS `blur()` is always symmetric and **cannot** do directional blur. Use `<filter id="mblur"><feGaussianBlur stdDeviation="12,0"/></filter>` (first = horizontal, second = vertical), applied via `filter:url(#mblur)`. Drive from slider: slow shutter (1/15s) → `"16,0"`, fast (1/1000s) → `"0,0"`. |
| **ISO / grain** | Cheap **noise overlay** (pre-gen PNG, SVG `feTurbulence`, or tiled noise canvas) with `opacity` = ISO | Lay a monochrome noise layer over the image; animate via `translate()` with `steps()` timing for jitter. `feTurbulence` generates Perlin noise (`baseFrequency` = grain size, `numOctaves` = detail). |
| **White balance** | CSS `sepia()` + `hue-rotate()`/`saturate()` (approx) **or** canvas per-channel RGB multipliers (accurate) | Cheap warm: `sepia(0.3) saturate(1.4) hue-rotate(-10deg)`; cool: slight blue hue-rotate or overlay. Accurate: Kelvin → RGB → per-channel multipliers vs. 6500K (D65) reference, clamp to 255 (warmer = +red/−blue). |
| **Tone curve** | SVG `feComponentTransfer` (`table`) **or** canvas `getImageData` + 256-entry LUT | `feFuncR/G/B type="table"` with `tableValues` like `"0 0.3 0.8 1"` (an S-curve = contrast); interpolates input 0..1 to those outputs. Add `color-interpolation-filters="sRGB"` for Photoshop-like behavior. |

#### Critical per-effect caveats

- **`blur()` is the one filter with a performance cliff.** Large radii (>20px) on large areas tank framerate, and older/Firefox paths can fall back to slow software. **Cap max blur at ~15px** and don't animate the radius continuously on huge images, to stay 60fps on phones.
- **Motion blur is X-or-Y axis only**, not arbitrary angles. Pick a **horizontal pan scene** so the limitation is invisible.
- **ISO grain: do NOT regenerate full-image noise per frame** — generating full-resolution noise via canvas every frame can crash the browser. Use a pre-baked PNG, `feTurbulence`, or a small tiled canvas; scale `opacity` with ISO (ISO 100 ≈ 0.02, ISO 6400 ≈ 0.4) and grow grain size at high ISO. Couple it to a brightness lift so students learn the ISO↔noise↔brightness tradeoff.
- **Tone curve live editing:** rewriting `feFuncR/G/B tableValues` is cheaper/faster (GPU) for live dragging; the canvas LUT path gives exact control and lets you draw a live histogram.

### 9.3 Canvas is the escape hatch — but cache the source

Per-pixel canvas (`getImageData` → loop over `Uint8ClampedArray` → `putImageData`) gives exact control for any effect but runs on the **CPU/main thread**. The rule: **cache the pristine source `ImageData` once on image load; on every slider change recompute from that source — never re-read the modified canvas** (avoids cumulative drift and keeps dragging smooth). Default to CSS/SVG for live interactivity; reach for canvas only for exact scoring or histograms.

> `feColorMatrix` is a compact GPU alternative for saturation/hue/channel-mixing when you want one SVG filter chain (`feColorMatrix + feComponentTransfer + feGaussianBlur`) referenced once via `filter:url(#id)`, rather than awkwardly mixing CSS and SVG filters.

### 9.4 Compose by layering, not one monolithic pass

Architect each interactive photo as a small **layer stack** of absolutely-positioned elements, each GPU-composited and individually debuggable:

```
<PhotoStage>
  ├─ base image          (CSS color filters: exposure/contrast/saturation/WB)
  ├─ blurred-bg copy      (blur + mask-image)        — DoF
  ├─ noise overlay        (opacity = ISO)            — grain
  └─ SVG-filtered layer   (filter:url for motion/tone)
```

Each of the ~4–7 lessons reuses **one `<PhotoStage>` component** and just enables/parameterizes the layers it needs. Because layer params are plain JSON, **resume-after-logout is trivial**: rehydrate params → component renders identical state.

### 9.5 Scope WebGL out of the MVP

WebGL fragment shaders (glfx.js, regl, three.js) are the "real" way pro editors do these effects and would handle arbitrary-angle motion blur, true bokeh, and curves at high res — but they add significant complexity (shader code, context management, texture upload) for effects already covered by CSS + one SVG filter + a noise overlay. **Explicitly scope WebGL out**; note it as a future upgrade path for physically-accurate bokeh shape, angled motion blur, or large user-uploaded photos.

---

## 10. Concrete Lesson Designs (Chapter MVP)

| Lesson | Widget | Grading |
|---|---|---|
| **Exposure** | `brightness()` + slight `contrast()` slider with an exposure-meter; clipped-highlight/shadow detection from a downsampled `getImageData` histogram | Pure CSS preview; tiny canvas only for histogram readout |
| **Aperture / DoF** | f-number slider → inverse blur radius; sharp subject layer over blurred-bg copy with `mask-image` radial gradient | Validate the snapped f-stop value; cap blur ~15px |
| **Shutter speed** | Animate a moving subject; drive SVG `stdDeviation="X,0"` from both the slider and the subject's per-frame velocity (slow → big smear, fast → crisp) | Use a horizontal pan scene |
| **ISO** | Noise overlay (`feTurbulence` or PNG) with `opacity = f(ISO)` + grain growth, coupled to a brightness lift | "It's dark — raise ISO to expose, but watch the grain" |
| **White balance** | Tint the photo orange/blue + temperature slider | Cheap version: `sepia()`+`hue-rotate()`. Scored version: canvas per-channel RGB multipliers (warm = +R/−B), measure how close a sampled gray patch gets to neutral (R≈G≈B) |
| **Tone curve** | Draggable SVG curve editor (control points via `@use-gesture/react` on an SVG path) rewriting `feFuncR/G/B tableValues` live | "Make an S-curve for more contrast"; canvas LUT path draws a live histogram |
| **Exposure triangle (capstone)** | Three snap sliders (aperture f-stops, shutter speeds, ISO stops) driving a live preview whose brightness uses the **same function used to grade** | Grade on resulting **EV within tolerance**, not exact slider values, so multiple valid stop combinations are accepted |

Each widget emits correct/wrong to `/users/{uid}/attempts/{stepId}`. **Wrong-answer guidance:** since most answers are numeric slider targets, store a target range + a **directional hint** ("your background is too sharp — open the aperture wider / lower the f-number") and surface it when the submitted value is outside tolerance.

---

## 11. Recommended High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Firebase Hosting  (Vite dist/, SPA wildcard rewrite)        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  React SPA (Vite)                                            │
│                                                              │
│  AuthProvider ── signInAnonymously() → onAuthStateChanged    │
│     │            gate app on auth-loading; upgrade via       │
│     │            linkWithCredential()                        │
│     ▼                                                        │
│  Router ── reads /users/{uid}.resume → exact step           │
│     ▼                                                        │
│  LessonPlayer ── step index, attempts, hint ladder,         │
│     │            persistence (batched writes)               │
│     ▼                                                        │
│  StepRenderer ── registry dispatch on step.type             │
│     ▼                                                        │
│  *Step widgets ── PhotoStage layer stack                    │
│     │              (CSS filters / SVG filter / noise overlay)│
│     ▼                                                        │
│  evaluate(step, answer) ── pure, type-keyed, unit-tested    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  Cloud Firestore  (offline persistence + multi-tab cache)   │
│                                                              │
│  PUBLIC  /courses/{c}/chapters/{ch}/lessons/{l}  (read-only) │
│  PRIVATE /users/{uid}  (streak + resume pointer)            │
│          /users/{uid}/lessonProgress/{lessonId}            │
│          /users/{uid}/attempts/{stepId}                    │
│                                                              │
│  Rules: users/{uid}/{=**} → uid match; courses → public read │
└─────────────────────────────────────────────────────────────┘
```

**Data flow in one sentence:** anonymous sign-in → app routes to the `resume` pointer → `LessonPlayer` reads the public lesson JSON → `StepRenderer` renders typed widgets over a `PhotoStage` layer stack → answers are graded by a pure evaluator and written (batched, with `increment()`) to UID-keyed Firestore, which `onSnapshot` reflects optimistically.

---

## 12. Key Libraries

| Concern | Library | Notes |
|---|---|---|
| **Build/dev** | **Vite** (React) | Outputs `dist/`; pair with the SPA rewrite |
| **Backend** | **Firebase** (Auth, Firestore, Hosting) | v9+ modular SDK; `initializeFirestore` with `persistentLocalCache` |
| **Sliders (default)** | Native **`<input type="range">`** | Touch-friendly, accessible, zero-dependency; bind `onChange`/`onInput` directly to filter-string state |
| **Sliders (styled)** | **Radix UI Slider** or **MUI Slider** | For two-handle/vertical/ticked f-stop scales |
| **Drag / tap / pinch** | **@use-gesture/react** + **react-spring** | Custom drags: focal point, tone-curve control points (physics-based motion) |
| **Transitions / tap feedback** | **framer-motion** | Simpler `drag` prop; lesson transitions |
| **Sortable / draggable items** | **dnd-kit** | Only if a lesson needs drag-to-match/sort; 60fps with many items, good touch support |
| **Content validation** | **JSON Schema** (validate in CI) | Reject steps with unregistered `type` or mismatched `solution` shape |

> **Debounce guidance:** debounce only the expensive **canvas-based** lessons, **not** the CSS-filter ones (those re-render instantly).

---

## 13. Build-Order Recommendation (for the PRD)

1. **Auth + routing skeleton** — anonymous sign-in, `onAuthStateChanged` gate, resume routing.
2. **Firestore + rules** — content tree, per-user tree, the ~10-line ruleset, offline persistence at init.
3. **Lesson engine** — step schema, `StepRenderer` registry, pure `evaluate()`, `LessonPlayer` with hint ladder; JSON Schema validation in CI.
4. **`PhotoStage` + effects** — shared `buildFilterString`, layer stack, the 6–7 effect widgets (CSS first, SVG motion blur, noise overlay; canvas only for WB-scoring/histograms).
5. **Progress, attempts, streaks** — `increment()` counters, once-daily streak transaction, batched writes, optimistic `onSnapshot` UI.
6. **Account upgrade flow** — "Save your progress" modal, `linkWithCredential` with `auth/email-already-in-use` fallback, optional Google.
7. **Deploy** — `firebase.json` SPA rewrite, `npm run build`, `firebase deploy --only hosting`.

**Deferred (post-MVP):** Identity Platform anonymous cleanup / App Check; WebGL effect path; practice-mode (scaffold-stripped) step rendering; staging vs. production hosting targets.

---

## Sources

**Firebase Auth, Firestore, Hosting**
- https://firebase.google.com/docs/firestore/manage-data/structure-data
- https://firebase.google.com/docs/firestore/data-model
- https://firebase.google.com/docs/firestore/best-practices
- https://firebase.blog/posts/2023/07/best-practices-for-anonymous-authentication/
- https://firebase.google.com/docs/auth/web/anonymous-auth
- https://firebase.google.com/docs/auth/web/auth-state-persistence
- https://firebase.google.com/docs/firestore/manage-data/enable-offline
- https://medium.com/firebase-developers/patterns-for-security-with-firebase-per-user-permissions-for-cloud-firestore-be67ee8edc4a
- https://firebase.google.com/docs/firestore/security/rules-conditions
- https://firebase.google.com/docs/firestore/security/rules-query
- https://firebase.google.com/docs/firestore/solutions/counters
- https://firebase.blog/posts/2019/03/increment-server-side-cloud-firestore/
- https://firebase.google.com/docs/firestore/manage-data/transactions
- https://firebase.google.com/docs/firestore/quotas
- https://firebase.google.com/docs/firestore/understand-reads-writes-scale
- https://firebase.google.com/docs/hosting/full-config
- https://dev.to/this-is-learning/firebase-deploy-a-react-application-with-firebase-hosting-560j
- https://fireship.io/lessons/firestore-nosql-data-modeling-by-example/
- https://oneuptime.com/blog/post/2026-02-17-how-to-handle-firestore-10-write-per-second-document-limit/view

**Lesson engine & content schema**
- https://brilliant.org/help/using-brilliant/
- https://brilliant.org/about/
- https://blog.brilliant.org/when-almost-right-is-catastrophically-wrong-evals-for-ai-learning-games/
- http://json-quiz.github.io/json-quiz/spec/quiz.html
- https://www.imsglobal.org/spec/qti/v3p0/guide
- https://digitaliser.getmarked.ai/blog/complete-guide-to-qti/
- https://digitaliser.getmarked.ai/docs/api/question_schema/
- https://github.com/wingkwong/react-quiz-component
- https://www.npmjs.com/package/react-quiz-component

**Browser photography effects**
- https://developer.mozilla.org/en-US/docs/Web/CSS/filter
- https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComponentTransfer
- https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence
- https://tympanus.net/codrops/2015/04/08/motion-blur-effect-svg/
- https://www.viget.com/articles/film-grain-effect/
- https://github.com/jonas-pietzsch/camanjs-whitebalance
- https://github.com/licson/CanvasEffects
- https://bugzilla.mozilla.org/show_bug.cgi?id=1498291
- https://css-tricks.com/almanac/properties/f/filter/
- https://github.com/sarathsaleem/grained