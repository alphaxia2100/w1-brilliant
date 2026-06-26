# Aperture — Handoff

**Updated:** 2026-06-25 (session 3) · **Stack:** Vite + React + Tailwind + Firebase (Auth + Firestore +
Hosting + **Functions**). All visuals are geometric SVG / pixel-art — no real photos.
**Read order:** `WORKING-PROTOCOL.md` (how we work — git *is* memory) → this file → `Factory/IMPROVEMENTS-LOG.md`
(the live loop) → `Redesign/PEDAGOGY-REDESIGN.md` (the approved direction) → the memory files.
**Rehydrate fast:** `./tools/git-memory.sh state` (where we are) · `loop` (iteration history) · `recall <term>` (the reasoning behind any past change).

> Everything below was verified against git + the code on 2026-06-25, not recalled. RE-READ a file
> before asserting its contents or editing it (stale mental models have caused real bugs here).

## ⚠️ Branch / push / deploy state — READ FIRST (three different states)
| Where | At | Contains |
|---|---|---|
| **GitHub `origin/main`** (pushed) | `0b64028` | 6 lessons + Google sign-in + pedagogy blueprint |
| **local `main`** (NOT pushed) | `c6b8061` | the above **+ the AI photo grader** |
| **local `lesson-factory`** (current, NOT pushed) | `7d0a98d` | main **+ 8 commits**: lesson factory, **L7 + L8**, cold-start onboarding, the improvement loop |
| **Deployed** `aperture-dac66.web.app` | ~`0b64028` | **6 lessons + Google login only.** The grader, L7/L8, and cold-start are NOT live. |

So: the branch has the newest work and is **unpushed + undeployed**. Decide whether to merge
`lesson-factory` → `main`, push, and redeploy. Nothing destructive has touched `main` or `origin`.

## TL;DR
The course is **10 lessons and growing** — Sky redirected (2026-06-25) to **CURRICULUM EXPANSION**
(more topics, broad lessons broken up, gaps filled; researched online → a 15-lesson / 6-module plan,
**content-first**, in `Factory/IMPROVEMENTS-LOG.md`). Also has an **AI photo grader**, **try-before-signup**
onboarding, a **lesson factory**, and the **BET** pedagogy primitive. `npm test` = **107/107 green**, build clean.

## The course now — 10 lessons (verified from `src/content/course.js`; `number` is derived from order)
| # | id | what it teaches |
|---|----|------|
| 1 | `exposure-triangle` | capture-light → aperture/shutter/ISO → balance → **reciprocity** → equivalent-exposure rank (9 beats) |
| 2 | `depth-of-field` | forward flower-bokeh, 4 levers, night-bokeh, synthesis keeper (8) |
| 3 | `shutter-motion` | **NEW (expansion 1).** shutter as a creative axis: blur=speed → freeze → rank by shutter → commit-keeper (5) |
| 4 | `metering` | histogram: spread · clip highs/lows · **blinkies** + dynamic range (backlit) · high-key snow · rank (7) |
| 5 | `white-balance` | **BET: predict where neutral is (snow), be wrong, correct** · cool/warm casts · **click-WB eyedropper** · creative warmth (5) |
| 6 | `rule-of-thirds` | thirds · lead-room · **leading lines** · horizon · keeper (6) |
| 7 | `composition-balance` | **NEW (expansion 2).** visual weight: counterbalance a heavy element · negative space · transfer · free keeper (5) |
| 8 | `light-direction` | reveal-form · backlight · hard/soft (now feathered) · **warmth** · flattering recipe · **dramatic** keeper (7) |
| 9 | `long-exposure-night` | **factory-made.** gather light over time; long exposure vs high ISO; moving subject → freeze (7) |
| 10 | `iso-and-noise` | **factory-made.** max-crank cost · the floor · expose-to-the-right · when-forced rank · keeper (6) |

**Expansion status:** 2 clean content-splits shipped (shutter, composition-balance); meter-fooled SKIPPED
(metering already covers it). **Everything left needs NEW SIM WORK** — Focus, Flash, Focal-length, and the
Portrait/Landscape genre capstones (sims are scene-specific). Next move = a sim decision; see the ledger's
KEY FINDING. Read `src/sim/DofBokeh.jsx` + `LightDirection.jsx` before building the next sim.

All predict-first, no multiple choice, calm feedback, success mints a polaroid keepsake.

## What's new this session (on `lesson-factory`, unless noted)
- **AI photo grader** (`/grade`, on `main` too): upload a photo → a Firebase callable function
  (`functions/gradePhoto`) sends it to **Claude vision (`claude-opus-4-8`)** with a json_schema and
  returns a grade on the six fundamentals + strengths/improvements + a "practice this next" lesson link.
  Key is a Secret Manager secret, never client-side. See `functions/index.js` + `src/pages/GradePage.jsx`.
- **Google sign-in** (on `main`/origin): `add-google-login` skill + the wiring; anon→Google linking keeps
  guest progress. `src/lib/firebase.js`, `src/store.jsx`, `src/pages/AuthPage.jsx`.
- **Cold-start onboarding** (branch): unguarded `/try` route lets a visitor play Lesson 1 with **no
  account** (store persistence no-ops without a user); sign-up CTA at the end. `src/pages/TryPage.jsx`.
  This **removed the Anonymous-sign-in dependency** the old guest button had.
- **The lesson factory** (branch, `Factory/`): see below.
- **The improvement loop** (branch, `Factory/IMPROVEMENTS-LOG.md`): see below — it's mid-run.

## Pending USER actions (Firebase console / billing — can't be done from code)
1. **Grader (to go live):** enable **Blaze** plan → `firebase functions:secrets:set ANTHROPIC_API_KEY`
   → `firebase deploy --only functions`. The grader UI degrades gracefully until then.
2. **Google sign-in:** enable Google in Firebase → Authentication → Sign-in method (else the button
   returns a friendly "not enabled yet").
3. **Anonymous sign-in:** no longer needed — cold-start `/try` replaced it.
4. **Deploy the new work:** after merging the branch, `npm run deploy` (Hosting + rules). The live site
   is still the 6-lesson version.

## The lesson factory (`Factory/`, docs in `Factory/FACTORY.md`)
Autonomous pipeline that generates NEW lessons in the house style, composing ONLY existing engine
primitives (so output is renderable + gate-checkable). **Two loops:**
- **Correctness loop (automated):** `Factory/verify-lesson.mjs` imports the real engine and runs the gate's
  invariants (fails-at-start, reachable, finite scenes) + structural guards (predict-first, no MC, valid
  kinds, ends-on-keeper) on a candidate. Builder agents loop write→verify→fix until `PASS`.
- **Quality loop (adversarial):** a Sky-critic judges each passing lesson (substance, distinctness,
  craft-truth) and a fixer re-greens. Run via `Workflow({scriptPath: "Factory/lesson-factory.workflow.mjs"})`.
- **First run:** 4 candidates, all PASSED correctness, 0 cleared the critic on first pass (the bar working).
  L7 + L8 were salvaged + shipped after human fixes + live verification. Raw candidates in
  `Factory/generated/`. `shutter-motion` (fabricated panning) + `silhouettes` (see Parked, below) remain.
- **To integrate a delivered lesson:** move the object into `course.js` (real `number`, drop dup consts) →
  `npm test` → build → **walk it live** (the gate can't see prose/pixel divergence — eyeball it).

## The improvement loop (`Factory/IMPROVEMENTS-LOG.md` — the live ledger)
A self-paced research → revise → verify → commit → log → reschedule loop (peer authority). 3 iterations
done: **#1 L7**, **#2 L8**, **#3 rejected silhouettes + cold-start**, **#4 the "BET" primitive** (a 4-lens
critic caught a truth blocker + 4 majors, all fixed), **#5 DIRECTION PIVOT → curriculum expansion** (Sky
wants breadth: more topics, broad lessons split, gaps filled — researched online → a 15-lesson/6-module
content-first plan; shipped lesson 1/5 "Shutter speed & motion" as L3). **⚠️ No cron/wakeup active
(2026-06-25)** — not auto-firing. **NEXT: keep building the content-first list** — Composition II →
meter-fooled → Portrait → Landscape (all buildable now), per the DIRECTION block in the ledger. Backlog (meatier now): BET slice →
shutter-motion redesign (needs a panning sim) → free-play Studio. Parked: silhouettes.

## How to run / verify
- **Dev:** `npm run dev` → :5173 (Claude_Preview MCP server "aperture"). **Gate:** `npm test` (107/107).
  **Build:** `npm run build`. **Deploy:** `npm run deploy`. **Functions deps:** `cd functions && npm install`.
- **Verify a lesson:** full beat walkthrough in the UI, mobile 375 + desktop, test wrong paths, confirm the
  keepsake matches the lesson. **Preview gotcha:** the `capture` beat's rAF exposure animation can stall in
  the headless preview (not a bug — it's shipped in L1 and runs in a real browser); slider-sim beats are fine.

## Open / next (prioritized)
1. **Merge + push + deploy decision (YOU):** `lesson-factory` (8 lessons + grader + cold-start + factory)
   is unpushed/undeployed. Merge to `main`, push, redeploy when you're happy.
2. **Grader go-live (YOU):** Blaze + API-key secret + `firebase deploy --only functions`, then walk a real
   photo through it live (the live Claude call is the one thing not yet exercised end-to-end).
3. **Improvement loop:** continues autonomously (iteration #4 scheduled). Let it run or steer it.
4. **Pedagogy blueprint** (`Redesign/PEDAGOGY-REDESIGN.md`): the bigger SEE→BET→BE-WRONG rebuild; the BET
   slice (iter #4) is the first piece.

## Honest notes
- **Verify in-engine before trusting a quantitative claim.** The factory's quality loop + a node sweep
  caught a *false* lesson (silhouettes — the backlit scene physically can't make a black subject against a
  bright sky) and real check-band bugs in L8. The automated gate keeps passing prose/pixel divergence — the
  live/engine check is the load-bearing last mile.
- **Distinctness watch:** ISO-on-night now appears in L1/L7/L8 (each a distinct facet, like exposure recurs)
  — note before adding a 4th. Logged in the ledger.
- **Nothing is pushed past `0b64028`.** The grader (on `main`) and all branch work await your push/deploy.
- The dev system: skills (`.claude/skills/aperture-lesson`, `add-google-login`; `~/.claude/skills/`
  shimmering-personas, what-would-sky-do), memory (`.../memory/`), the factory, and the improvement-loop
  ledger. Read for SPIRIT, not letter.
