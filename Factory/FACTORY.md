# The Lesson Factory

An autonomous pipeline that produces **new lessons in the Aperture house style** — predict-first,
no multiple choice, distinct-facet, felt-not-numeric — rendered through the *existing* engine, and
proven correct before a human ever looks at them. Built to run without per-lesson human input.

## Why it works: it composes proven primitives, then tests against the real engine
New lessons use ONLY the engine's existing step kinds (`capture`, `slider-sim`, `bokeh`, `motion`,
`light-direction`, `compose`, `eyedropper`, `triangle`, `rank`, `intro`) and scenes — so anything the
factory emits is immediately renderable and gate-checkable. No new sims are generated autonomously
(that's where art quality and correctness risk live).

## The two loops (the heart of the ask)

**1. Correctness loop (automated, test-driven).**
`verify-lesson.mjs` is a standalone harness that imports the *real* engine math (`scene.js`,
`bokehMath.js`, `composeEval.js`) and runs the same invariants the shipped gate enforces on a single
candidate lesson:
- every checked beat **fails at its start** and is **reachable** within its control's range,
- every pixel scene used renders **finite** (no NaN),
- plus structural guards: **predict-first** (no opening intro), **no multiple choice**, valid step
  kinds + scenes, feedback present, ends on an active keeper, ≥4 interactive beats.

Each builder agent writes its lesson to `generated/<id>.lesson.mjs`, runs
`node Factory/verify-lesson.mjs <file>`, reads any `✗`, fixes, and **re-runs until it prints `PASS`**.
The test is the engine itself, so "green" means it will actually drop into `course.js` and pass `npm test`.

**2. Quality loop (adversarial, loop-until-clean).**
A passing lesson is then judged by a max-power **Sky-critic** against the house bar (substance, distinct
facets, predict-first, no MC, felt goals, craft-truth, distinct from the six existing lessons). If it's
not clean, a fixer applies the must-fixes and re-greens the harness. Bounded to keep it converging.

## Pipeline
`lesson-factory.workflow.mjs` (run via the Workflow tool):
1. **Capability + Topics** — read the real engine, confirm kinds/scenes, propose 4–6 *distinct* new
   lesson topics that the engine can render truthfully.
2. **Build** (per topic, parallel) — design → generate the `.lesson.mjs` → **correctness loop** to green.
3. **Critique** (per topic) — **quality loop**: Sky-critic → fix → re-verify.
4. **Synthesize** — which lessons were delivered (passed both loops) vs rejected, and what the loops caught.

## Running it
```bash
# from the Workflow tool:
Workflow({ scriptPath: "Factory/lesson-factory.workflow.mjs" })
```
Output lands in `Factory/generated/*.lesson.mjs`. Each is a self-contained, gate-green lesson object.

## Integrating a delivered lesson into the live course
1. Move the lesson object into `src/content/course.js` (append to `lessons`), giving it a real `number`.
2. `npm test` (the real gate auto-discovers it) → must stay green.
3. `npm run build`, then walk it live in the browser (desktop + 375px) — the final, human-in-the-loop check.

The factory guarantees *buildable + on-spec*; the live walk is the last mile, exactly as for hand-built lessons.
