# Consolidated Research Findings — Brilliant-Style Photography Learning App

**Date:** 2026-06-23 · **Status:** Research phase complete, ready for PRD.

This folder holds **two independent research efforts** that ran in parallel and **converged on nearly identical conclusions** — which is the strongest possible signal that the recommendation below is sound. This file ties them together.

---

## The convergent recommendation (both efforts agree)

| Decision | Recommendation | Confidence |
|---|---|---|
| **MVP concept** | **The Exposure Triangle** (aperture · shutter speed · ISO) — one chapter | Very high — both efforts picked it independently |
| **Why this concept** | It is the universally-agreed Chapter 1 of photography **and** a closed numeric system ("stops") — the single most browser-simulatable concept in the domain. Correctness is deterministic math, so wrong-answer guidance is exact. | Very high |
| **User persona** | Adult hobbyist (~25–45) "stuck in Auto," owns a mirrorless/DSLR, wants to understand their dials. Mobile-first, responsive. | Very high |
| **Lesson count** | ~6 interactive lessons, ~5–8 steps each, ~7–12 min per lesson | High |
| **Tech stack** | **React + Vite + Firebase** (Auth + Firestore + Hosting) | Very high |
| **Rendering** | CSS filters + one SVG filter + noise overlay (GPU-cheap, mobile-friendly). No WebGL for MVP. | High |
| **Core architecture** | Lessons authored as **JSON data** driven by a reusable step engine + one reusable `ExposureScene` simulation component | High |
| **The defining mechanic** | Brilliant's **"pretest, then teach"** loop: learner acts/predicts *before* the explanation; instant, non-punitive feedback; tiered hints on wrong answers; one new variable per step | Very high |

### Important correction both efforts surfaced
**Brilliant does not actually teach photography** — it is strictly STEM (math, science, CS, logic, AI). So this is **not** copying an existing Brilliant course. It is cloning Brilliant's *interaction model, pedagogy, and design language* and applying them to photography. The "one-for-one clone" is of the **experience**, not of any specific course.

---

## The 6 MVP lessons (from the workflow synthesis)

1. **What is Exposure?** — brightness = light collected; over/under-exposure. (Single brightness slider → hit a target.)
2. **Aperture & Depth of Field** — wider aperture = more light + blurrier background. (Live scene + aperture slider; the counterintuitive f-number inverse is the "aha.")
3. **Shutter Speed & Motion** — fast = freeze, slow = motion blur. (Moving subject + shutter slider; SVG directional blur.)
4. **ISO & Noise** — higher ISO brightens but adds grain; ISO amplifies, it doesn't collect light. (ISO slider + procedural grain overlay.)
5. **Stops — The Common Language** — +1 stop of any control brightens identically. (Three controls → one live brightness bar.)
6. **Equivalent Exposures** (capstone) — same brightness, different look; choose by creative intent. (Brightness locked; trade aperture↔shutter; DoF vs motion-blur visibly trade off.)

Optional 7th: a no-hints **Checkpoint** practice set pulling one problem from each lesson (mastery/spaced-review pattern).

---

## Design system (from the parallel effort's token extraction — real Brilliant CSS values)

- **Canvas:** white `#FFFFFF` / charcoal `#141414` (NOT navy). Cards `#1E1E1E` in dark.
- **Signature CTA / streak accent:** **pear `#D8E82E`** (electric yellow-green — the brand's hero color).
- **Correct:** green `#29CC57`. **Incorrect panel:** calm **gray `#383838`/`#E5E5E5` — deliberately NOT red.** Red is reserved for hard errors. Wrong answers feel encouraging, not punishing.
- **Layout:** single centered **432px** lesson column; one interactive at a time; generous whitespace.
- **Type:** CoFo Sans (custom geometric sans; use a free geometric analog like Inter/Geist). Body 16–18px, headings 600–700 weight.
- **Motion:** "game feel" — whimsical celebration flourishes on success, encouragement when struggling (ustwo's Rive animations). One satisfying celebration per lesson.

---

## File map

### `Research/` — parallel-session set (design + content depth)
- `00-RESEARCH-BRIEF.md` — project framing ("Aperture"), design-first thesis, bottom line
- `01-brilliant-pedagogy.md` — the "pretest then teach" learning model teardown
- `02-brilliant-ux-habit-loop.md` — product structure, UX flow, habit loop, streaks
- `03-brilliant-visual-design.md` — **extracted production design tokens** (colors, type, spacing, motion) ⭐
- `04-photography-curriculum.md` — canonical beginner teaching sequence + recommendation
- `05-photography-widgets.md` — catalog of browser-buildable interactive widgets
- `06-build-patterns.md` — React + Firebase 1-week solo MVP build playbook

### `Research/workflow-reports/` — workflow synthesis set (structure + tech depth)
- `00-RESEARCH-SUMMARY-and-MVP-recommendation.md` — **the decisive PRD seed** (persona, concept, 6 lessons table, in/out scope, data model, open questions) ⭐
- `01-brilliant-product-teardown.md` — structure, interaction catalogue, pedagogy, worked lesson walkthroughs
- `02-photography-domain-and-lessons.md` — per-topic content + interactive lesson designs
- `03-technical-build-guide.md` — Firebase data model, lesson-engine schema, per-effect simulation guide

---

## Next step → write the PRD

Both efforts recommend the same path: lock a few decisions, freeze the 6-lesson list, then write the PRD from the two `00-` summary documents. The genuine open decisions for a human call (from the workflow summary §8):
1. 6 lessons vs. 6 + a checkpoint for Wednesday?
2. Onboarding diagnostic for Wednesday, or drop everyone into lesson 1?
3. Anonymous-first auth (recommended) vs. force email up front?
4. Streak + auto-freeze in the MVP, or just XP + completion animation?
5. Scrollable lesson-path "gameboard" vs. a simple lesson list for Wednesday?

*(Recommended defaults: include checkpoint, skip diagnostic for Wed, anonymous-first auth, include streak+freeze, ship the gameboard.)*
