# BrainLift — Truthful, Simulation-First Learning

> Structured context for AI conversations. Built from the **Aperture** project (a Brilliant-grade,
> interactive photography course) as the primary-source case study, cross-checked against the
> learning-science literature. The repo itself — its git history, `Factory/IMPROVEMENTS-LOG.md`, and
> the 47-finding quality audit — is a load-bearing source here, not just code.

---

## Owners
- **Sky (Andrew Xia)** — `skyxiath@gmail.com` — author / maintainer
- *Build partner:* Claude (Aperture engine + audit), used as a tool, not a co-author of the POVs.

---

## Purpose

**Redefine what "an interactive lesson" is.** The belief: the best digital learning is not content
delivery wrapped in quizzes — it is a **truthful interactive simulation** where the learner *predicts*,
*acts*, *sees the real physical consequence*, and *keeps the result*. The central, underrated problem is
not pedagogy or content; it is **truth**: the simulation must not lie, and the hard part is that the lie
is nearly invisible — it hides in what the sim *renders*, not in what the prose *claims*, and standard
verification is blind to it.

This BrainLift exists to capture spiky, defensible points of view on **how to design and verify
simulation-first learning** that a generic model would not produce on its own.

### In Scope
- Simulation-first / "explorable" pedagogy: predict → act → see consequence → keep the artifact.
- **Correctness/truth of educational sims** — the gap between the claim and the render, and how to close it.
- Retrieval practice, spacing, and what makes a "review" actually a review.
- Adversarial verification of learning content (build, then attack your own work).
- The *feel* of learning moments (calm feedback, the keepsake) as load-bearing engineering, not polish.

### Out of Scope
- Generic LMS / content-management, video-lecture pedagogy, slide decks.
- Gamification as the *goal* (points/streaks/badges chasing engagement metrics rather than understanding).
- Using AI to *generate* the lessons wholesale, or RAG pipelines — this doc is direct context, and the
  insights below were forged by a human deciding, not by a model summarizing.

---

## DOK 4: Spiky Points of View

### SPOV 1 — In an educational simulation, the lie lives in the *render*, not the prose — and your test suite is structurally blind to it.
**Elaboration.** Every interactive lesson has *two* truth surfaces that drift independently: the **prose
claim** ("warm it back and the snow reads neutral") and the **rendered pixels** (the math that actually
colors the scene). They are written by different parts of the brain at different times, and nothing forces
them to agree. In Aperture, a 170-check automated gate — reachability, per-step invariants, monotonic
scene-math — passed at **100%** while *nine* lessons asserted things the sim never showed: a white-balance
beat told the learner "keep the golden glow" over an image the renderer kept net-**blue** (R−B ≈ −25
across the whole "accept" band, because the WB transform traded red↔blue but never touched green); a
"dramatic rim of light" beat accepted camera angles that rendered **zero** rim; a rack-focus beat called a
7.5px-blurred subject "tack sharp." The gate was *correct* and *useless* for this class of bug, because a
test suite checks **structure** (does a path exist? is the invariant held?), never **semantics** (is the
claim true of the pixels?). The actionable rule: **verify truth at the render/math layer** — sample the
actual output and re-derive the physics, don't eyeball the prose and don't trust green checkmarks. This is
the single highest-leverage idea in the document, and it generalizes far past photography: any sim that
teaches (physics, finance, biology) has this seam, and the seam is where the lies accumulate.

### SPOV 2 — A *committed, wrong* prediction teaches more than a correct answer. Design for the productive failure.
**Elaboration.** Most edtech is built to *minimize* learner error — smooth ramps, generous hints, guide
them to the right answer. This optimizes the wrong variable. Durable intuition forms when a learner stakes
a **falsifiable prediction**, is **wrong**, and feels the gap. Aperture's strongest primitive (the "BET":
*see → bet → be wrong*) freezes the scene, makes the learner drag a marker to commit a prediction with no
live preview, *locks it*, and only then reveals how far past their guess reality actually sat. The error is
the lesson, and it sticks precisely because the learner **owned the wrong mental model** before it broke.
This is "desirable difficulty" (Make It Stick) made concrete: the friction is the point. The corollary,
SPOV 2b: **never let the interface leak the answer before the commitment.** A live-updating slider lets a
learner nudge their way to the green band without ever forming a hypothesis — that's *recognition*
disguised as understanding. Freeze first; commit; then reveal.

### SPOV 3 — Multiple choice and free exploration are both dead-ends for *skill*. Only the live-consequence loop builds intuition.
**Elaboration.** Multiple choice tests **recognition** (can you pick the right one from a list?) and is
trivially gamed by elimination; it teaches the shape of a test, not the feel of a craft. Pure free-play
("here are the controls, explore!") fails the opposite way — no commitment, no stakes, no falsification, so
nothing consolidates. The loop that works for a *skill* is narrow and specific: **predict → act on a real
control → see the truthful consequence rendered → keep the result.** Aperture has **zero** multiple-choice
questions across 21 lessons by design; ranking and direct manipulation replace it. The deep reason: skills
live in the sensorimotor / intuitive system, and that system only updates from *consequences it caused*,
not from *propositions it selected*. If your learning product still has a 4-option radio button as its core
interaction, you are teaching trivia about the skill, not the skill.

### SPOV 4 — You cannot trust the builder — human or AI — to find the truth-bugs in their own work. Correctness requires an adversarial second pass that defaults to *refuting*.
**Elaboration.** The builder and the builder's tests share the builder's blind spots; "I tested it, it
works" certifies only that the code did what the author *imagined*. The fix is a **separate, adversarial
pass whose job is to disprove**. In Aperture this was a 63-agent audit running diverse "lenses"
(optics-truth, pedagogy, accessibility, copy) where every finding was then handed to an independent
verifier instructed to **refute it by default**. Result: 64 findings → **47 confirmed, 4 refuted** — and
the four it killed were plausible-sounding bugs that didn't survive contact with the actual code. Two
disciplines make this work: (1) **diversity of lens** beats redundancy — three identical reviewers find
the same things; a colorblind lens, a screen-reader lens, and a physics lens find *different* things; and
(2) **refute-by-default** is the guardrail against confabulation — an agent (or person) asked "is this a
bug?" will rationalize a yes; asked "prove this is *not* a bug," it actually reads the code. Build, then
attack. The attack is not optional and it is not the same as the build.

### SPOV 5 — A "review" that offers hints is a lie about learning. Spaced retrieval only counts if recall is unaided.
**Elaboration.** Retrieval practice — the single most robust finding in the science of learning (Roediger &
Karpicke) — only fires when the learner reconstructs the answer **from memory, unaided**. The instant you
add a hint ladder, a live cue, or a "show why," you've converted *recall* into *recognition* and the
spacing benefit evaporates. The trap is that helpful-hints-everywhere is *good UX inside a lesson*, so it
leaks into the review by default. Aperture shipped six chapter "Reviews" that advertised "no hints" while
the engine quietly served the full lesson hint ladder *and* live directional feedback — they were lessons
wearing a review's badge. Real reviews must **strip the scaffolding**: one calm "not quite, try again,"
fresh scenes the learner hasn't memorized, and no live tell. If your review feature is comfortable, it
isn't a review.

### SPOV 6 — The artifact you let a learner *keep* is your real rubric. Reward only honest success.
**Elaboration.** Every "keep this" moment — a saved result, a trophy, a streak, a generated certificate —
is an *implicit definition of "good."* Learners optimize for the artifact, not your stated objective. So
the artifact has to be earned by the thing you actually want. Aperture mints a Polaroid "keeper" on a
successful shot — but two metering lessons *ask the learner to deliberately ruin the photo* (blow the
highlights to feel clipping). The engine happily filed those ruined frames as "★ keepers," teaching the
exact opposite of the lesson. The fix (`noKeeper` on deliberately-bad-outcome beats) is small; the
principle is large: **audit every artifact your product hands out and ask "what does keeping this teach?"**
A reward for a mistake teaches the mistake.

### SPOV 7 — "Depth vs. breadth" is the wrong axis. Teach *breadth of depth*.
**Elaboration.** The usual framing forces a false choice: cover many topics shallowly, or one topic deeply.
Both fail — the shallow survey builds no intuition, and the single deep dive doesn't transfer. The move is
**many topics, each taught to mastery through one tight interactive loop.** Aperture's arc collapsed the
entire exposure triangle into *one* deep lesson (not three shallow ones), then repeated that "one topic,
one mastery loop" pattern across 21 lessons in 6 chapters. The unit of curriculum design is not "the
syllabus" and not "the one perfect lesson" — it's the *repeatable deep loop* you can run on topic after
topic. Calm, non-punishing feedback is the enabling condition (SPOV 7b): the predict-first method only
works if it's psychologically safe to be wrong, so the "wrong" state must read as *try-again* (warm), not
*failure* (punishing) — that's an engineering requirement of the method, not a niceness.

---

## Experts

### Bret Victor
- **Who:** Interface researcher / designer; ex-Apple; "Dynamicland."
- **Focus:** Explorable Explanations; representations that make consequences *immediately visible*
  ("Up and Down the Ladder of Abstraction," "Learnable Programming," "Kill Math").
- **Why follow:** The intellectual root of SPOV 1 & 3 — his thesis that a good representation lets you
  *see* the effect of every choice is exactly what an honest learning sim must deliver (and exactly what
  the prose/pixel divergence violates).
- **Where:** https://worrydream.com

### Nicky Case
- **Who:** Indie creator of interactive "explorables."
- **Focus:** Playful, simulation-driven understanding of hard systems ("Parable of the Polygons,"
  "The Evolution of Trust," and the explorabl.es community).
- **Why follow:** Living proof of SPOV 3 — that direct manipulation of a truthful little model teaches
  systems thinking better than any lecture or quiz.
- **Where:** https://ncase.me · https://explorabl.es

### Andy Matuschak
- **Who:** Researcher on tools for thought; ex-Khan Academy.
- **Focus:** Why media fails to build memory ("Why books don't work"), spaced-repetition memory systems,
  the "mnemonic medium" (Quantum Country, with Michael Nielsen).
- **Why follow:** The backbone of SPOV 5 — his work on retrieval and durable memory is why "a review with
  hints is a lie" is not an opinion but a mechanism.
- **Where:** https://andymatuschak.org · https://quantum.country

### Brown, Roediger & McDaniel — *Make It Stick* (and Roediger & Karpicke, 2006)
- **Who:** Cognitive scientists; authors of *Make It Stick: The Science of Successful Learning*.
- **Focus:** Retrieval practice (the "testing effect"), spacing, interleaving, **desirable difficulties**,
  and the **illusions of knowing** that rereading/fluency create.
- **Why follow:** The empirical foundation under SPOV 2 and SPOV 5 — difficulty done right is what makes
  learning durable; comfort is the warning sign.
- **Where:** *Make It Stick* (Harvard University Press, 2014); Roediger & Karpicke, "Test-Enhanced
  Learning," *Psychological Science* (2006).

### Brilliant.org
- **Who:** Active-learning platform for math/science/CS.
- **Focus:** Problem-first, interactive, "learn by doing" lessons — the product north-star Aperture
  emulates and stress-tests.
- **Why follow:** The best mainstream existence proof that interactive-first beats lecture-first at scale;
  studying where it's strong (and where it falls back to multiple choice) sharpens SPOV 3.
- **Where:** https://brilliant.org

### Daniel Willingham (supporting)
- **Who:** Cognitive psychologist; *Why Don't Students Like School?*
- **Focus:** "Memory is the residue of thought" — you remember what you *think about*, not what you're
  exposed to.
- **Why follow:** One-line justification for the whole predict-first thesis: design the *thinking*, and the
  memory follows.
- **Where:** http://www.danielwillingham.com

---

## DOK 3: Insights

**On truth & verification (→ SPOV 1, 4):**
- **Insight A.** A learning sim has two independently-authored truth surfaces — the *claim* and the
  *render* — and correctness is the assertion that they agree. Almost all "bugs that teach a lie" live in
  the gap, so verification must sample the render, not read the prose.
- **Insight B.** Automated gates and semantic truth are *orthogonal*. Gates verify reachability and
  invariants (cheap, automatable, necessary); semantic truth ("is this claim true of the pixels?")
  requires re-deriving the underlying model. A green suite is necessary and nowhere near sufficient.
- **Insight C.** Verification must be *adversarial and diverse-lens*. Redundant reviewers share blind
  spots; a refute-by-default verifier with a distinct lens (physics, colorblindness, screen-reader) finds
  the class the builder is structurally unable to see. (In practice: 4 of 64 findings were confabulations
  the refutation step caught.)

**On the learning loop (→ SPOV 2, 3, 6):**
- **Insight D.** Committed-then-falsified prediction outperforms a correct answer because the learner
  *owns* the broken model. Recognition (multiple choice, nudging a live slider) never produces this; it
  lets the learner reach the target without forming a hypothesis.
- **Insight E.** Skills update from *consequences the learner caused*, not *propositions they selected* —
  which is why the core interaction must be a real control with a truthful, immediate consequence, not a
  radio button.
- **Insight F.** Any "keep this" artifact is an implicit rubric the learner will optimize toward; therefore
  the artifact must be gated on the exact behavior you want, and "reward the deliberately-wrong move" is a
  silent anti-lesson.

**On retention & curriculum (→ SPOV 5, 7):**
- **Insight G.** Retrieval practice only fires unaided; the helpful-hint UX that's correct *inside* a
  lesson is *poison* in a review, and it leaks in by default unless the engine explicitly suppresses it.
- **Insight H.** The reusable unit of curriculum design is the *deep loop*, not the syllabus and not the
  one perfect lesson — "breadth of depth" means running the same mastery loop across many topics.
- **Insight I.** Calm, non-punishing feedback is a *precondition* of predict-first, not a cosmetic: if
  being wrong feels like failure, learners stop making real predictions and the method collapses.

---

## DOK 2: Knowledge Tree

### Category 1 — Active / simulation-first learning
**Subcategory 1.1 — Explorable explanations**
- **Source: Bret Victor, "Explorable Explanations" / "Up and Down the Ladder of Abstraction."**
  - DOK 1 — Facts:
    - Argues a reader should be able to *play* with the author's model and see outcomes change live.
    - Frames static media as "you can't ask it a question."
  - DOK 2 — Summary: Understanding comes from manipulating a truthful model and watching consequences —
    the design target for every Aperture sim, and the thing the prose/pixel gap betrays.
  - Link: https://worrydream.com/LadderOfAbstraction/
- **Source: Nicky Case, explorables.**
  - DOK 1 — Facts: Small interactive simulations (segregation, trust) produce systems intuition in minutes.
  - DOK 2 — Summary: A tiny, *honest* model beats exposition; honesty of the model is what does the work.
  - Link: https://ncase.me

### Category 2 — Memory, retrieval & desirable difficulty
**Subcategory 2.1 — The testing effect & spacing**
- **Source: Roediger & Karpicke (2006), "Test-Enhanced Learning."**
  - DOK 1 — Facts:
    - Learners who were *tested* retained markedly more after a delay than learners who *restudied*.
    - The restudy group felt *more* confident — an illusion of mastery.
  - DOK 2 — Summary: Effortful unaided retrieval, not re-exposure, drives durable memory — and confidence
    is an unreliable signal of it. (→ SPOV 5; Insight G.)
- **Source: Brown/Roediger/McDaniel, *Make It Stick*.**
  - DOK 1 — Facts: "Desirable difficulties" strengthen learning; fluency/rereading create "illusions of
    knowing"; interleaving beats blocked practice.
  - DOK 2 — Summary: Difficulty, designed-in, is the mechanism — the empirical license for the BET's
    "be wrong on purpose." (→ SPOV 2.)
- **Source: Andy Matuschak, "Why books don't work."**
  - DOK 1 — Facts: Most readers retain little because the medium demands no retrieval; memory systems +
    the mnemonic medium add spaced recall into the reading itself.
  - DOK 2 — Summary: Build retrieval *into* the medium; a passive pass teaches nothing durable.
  - Link: https://andymatuschak.org/books

### Category 3 — Truth / correctness of educational media (the underrated category)
**Subcategory 3.1 — The claim ≠ the render**
- **Source: Aperture white-balance audit (primary source; `Factory/IMPROVEMENTS-LOG.md` #7, commit `6c3bc82`).**
  - DOK 1 — Facts:
    - The WB transform scaled red and blue but never green; a green-dominant "seascape" scene therefore
      *could not* render neutral, yet beats claimed "reads neutral" / "keep the golden glow."
    - Numerically: at the rewarded "neutral" point the image measured R−B ≈ −70 (strongly blue).
    - Fix = move the beats to achromatic scenes (snow/room), verified R−B −12 (neutral) / +40→+68 (gold).
  - DOK 2 — Summary: A confident, well-written prose claim sat on top of a render that contradicted it; the
    only way to catch it was to *compute the pixels*. Canonical instance of SPOV 1.

**Subcategory 3.2 — Gates are blind to semantics**
- **Source: Aperture gate + audit (primary source; `Redesign/checks.mjs`, audit run 2026-06-26).**
  - DOK 1 — Facts:
    - 170/170 automated checks passed while 9 confirmed prose/pixel divergences existed.
    - A 63-agent adversarial audit found 64 issues; 47 confirmed, 4 refuted by a refute-by-default pass.
  - DOK 2 — Summary: Structure-checking and truth-checking are different jobs; the second needs an
    adversarial, diverse-lens pass. (→ SPOV 4; Insights B, C.)

### Category 4 — The learning loop & its artifacts
**Subcategory 4.1 — Predict-first & keepers**
- **Source: Aperture engine (primary source; `src/engine/LessonPlayer.jsx`, `steps.jsx`).**
  - DOK 1 — Facts:
    - The BET primitive freezes the scene, forces a locked prediction with no live preview, then reveals.
    - "Keeper" Polaroids were minting on beats that *instructed* the learner to ruin the shot until gated.
    - Reviews were serving the full hint ladder + live cue despite advertising "no hints."
  - DOK 2 — Summary: The three biggest pedagogy bugs were all the *loop* leaking its own integrity —
    answer-leak, reward-for-mistake, hint-in-review. (→ SPOV 2, 5, 6.)

### Category 5 — Operating principles (meta; how this knowledge was actually produced)
**Subcategory 5.1 — Verify the claim; use the tools relentlessly**
- **Source: Aperture working protocol (primary source; `WORKING-PROTOCOL.md`, git history).**
  - DOK 1 — Facts:
    - "Verify the claim, don't trust the prose" was the single most repeated correction.
    - Git was used as durable memory (structured commits + a running improvement ledger) to stay on track.
    - Live, end-to-end verification (drive the real deployed app) preceded every "done."
  - DOK 2 — Summary: The truth-first POVs above are downstream of a work *discipline*: re-derive before you
    assert, attack before you ship, and keep durable external memory so the discipline survives context loss.
