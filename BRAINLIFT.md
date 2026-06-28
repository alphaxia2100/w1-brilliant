# BrainLift — Aperture

## Owners
- Andrew Xia (Sky)
- Built with Claude (wrote and audited most of the app)

## Purpose

Aperture: a one-week, Brilliant-style photography course (exposure, light, composition), judged on the
learning experience, not the photos.

It's an application project, not research — clone what makes Brilliant work (learn by doing) and apply
known learning science to a new subject. Most principles below are borrowed (marked). The non-obvious
one: an interactive lesson can lie to the learner in a way tests can't catch.

### In Scope
- Predict → act → see the real consequence *immediately* → keep the result.
- Transfer: keeping a skill tied to the principle (works on a phone and a camera), not one device's UI.
- A teaching sim's correctness: does the render match the claim?
- Retrieval and spacing — what makes a review a real review.
- Checking your own content: build it, then try to break it.

### Out of Scope
- Original learning-science research (applying it, not making it).
- LMS / video-lecture / slide pedagogy.
- Gamification as the goal (streaks, leaderboards) — Aperture has none.
- Photography expertise — the subject is just a vehicle.

## DOK 4 — Spiky POVs

**SPOV 1 — In a teaching sim, the lie is in the pixels, not the text, and tests won't see it.**
A lesson has two truths that drift apart: what the prose says ("warm it back and the snow reads neutral")
and what the sim draws. Aperture's test suite passed 100% while nine lessons claimed things the render
never showed. Tests check structure (does a path exist?), not meaning (is the claim true of the pixels?) —
so verify truth at the render layer, not the prose or a green check.

**SPOV 2 — A review that helps you isn't a review, and the help hides in the instrument.**
Retrieval only works if the answer comes from memory, unaided. The obvious leak is a hint button; the
sneaky one is a readout that turns green the instant the answer is right — looks helpful, but you just
nudge until it goes green. A review can show the state (a histogram, the colors), never the verdict.
Enforced as a test so it stays gone.

**SPOV 3 — Copy the behavior, not the look: a deliberately low-fi sim transfers, a photoreal one doesn't.**
The doing has to translate *immediately* — turn the aperture and the background blurs right now — because a
skill is built by the consequence you cause, not by a description of it. But skills transfer far less than
people assume: a learner binds what they learn to the surface details they practiced on, and far transfer
is rare (transfer of learning; Barnett & Ceci). Abstract representations transfer better than perceptually
rich ones (Kaminski et al.). So Aperture renders in pixel art, not photos, on purpose. The learner sees the
real change (wide aperture → blurred background) without gluing it to one camera's exact screen — so it
carries to a phone's pro mode *and* a real camera, instead of "where was that button on the thing I
practiced on." Low fidelity is a transfer feature, not a budget compromise.

**SPOV 4 — Predict-first beats multiple choice. (Established Brilliant practice.)**
Multiple choice tests whether you can spot the answer in a list, not whether you can do the thing.
Aperture has zero multiple choice; every check is a real action with a visible consequence. A committed
wrong guess sticks better than picking from options — but only if being wrong feels safe (calm feedback,
no red), or honest guessing stops.

**SPOV 5 — You can't find your own lies. Build, then attack. (A work habit, not a learning claim.)**
"It works" only proves the thing did what its author imagined. The truth-bugs above were caught by a
separate pass built to *disprove* the work — not the author, not the gate. What makes it work: different
lenses (color, physics, screen-reader catch different things) and defaulting to "prove this is NOT a bug."

## Experts

**Bret Victor**
- Who: Interface researcher; "Explorable Explanations," "Learnable Programming."
- Focus: Representations that make the consequence of every choice immediately visible.
- Why follow: Root of SPOV 1 — the prose/pixel gap is that promise broken.
- Where: https://worrydream.com

**Andy Matuschak**
- Who: Tools-for-thought researcher; co-creator of Quantum Country.
- Focus: Spaced-repetition memory systems; why most media builds no memory.
- Why follow: Behind SPOV 2 — retrieval + spacing as the mechanism; a comfortable review teaches nothing.
- Where: https://andymatuschak.org

**Robert Goldstone · Kaminski, Sloutsky & Heckler**
- Who: Cognitive scientists studying concreteness, abstraction, and transfer.
- Focus: Whether concrete or abstract representations carry to new problems.
- Why follow: Backs SPOV 3 — idealized/abstract representations transfer better; perceptual detail binds a skill to its surface.
- Where: Kaminski, Sloutsky & Heckler (2008), *Science* 320(5875).

**Brown, Roediger & McDaniel — *Make It Stick***
- Who: Cognitive scientists (and Roediger & Karpicke, 2006).
- Focus: Testing effect, spacing, interleaving, desirable difficulties.
- Why follow: Evidence under SPOV 2/4 — effortful beats fluent; comfort is the warning sign.
- Where: https://www.makeitstick.com/

**Brilliant.org**
- Who: Active-learning platform for math/science/CS.
- Focus: Problem-first, interactive "learn by doing."
- Why follow: The model Aperture clones; SPOV 3 is theirs.
- Where: https://brilliant.org

## DOK 3 — Insights

**Truth & verification (→ SPOV 1, 5)**
- Two truth surfaces (claim, render); "correct" means they agree, and the lies live in the gap.
- A green test suite is necessary, nowhere near sufficient — structure ≠ truth, and truth needs an adversarial pass.

**Reviews & retrieval (→ SPOV 2)**
- "Unaided" is fragile: feedback that helps inside a lesson is poison in a review, and sneaks in by default.
- Spacing is cheap and the exact schedule barely matters; that you space and retrieve matters more.

**Transfer (→ SPOV 3)**
- Skills bind to surface features and far transfer is rare — a photoreal sim risks teaching "this app," not "aperture."
- Stripping detail (pixel art) keeps the skill about the principle, so it carries across devices (phone and camera).

**The loop (→ SPOV 4)**
- The consequence must be immediate and caused by the learner's own action — that coupling, not a description, is what builds the skill.
- Calm feedback is load-bearing: if wrong feels like failure, honest prediction stops.

## DOK 2 — Knowledge Tree

### Active / simulation-first learning
**Bret Victor, "Explorable Explanations" / "Ladder of Abstraction."**
- DOK 1 — Facts: A reader should be able to play with the author's model and watch outcomes change live. Static media "can't answer a question."
- DOK 2 — Summary: Understanding comes from manipulating a truthful model — the thing the prose/pixel gap betrays.
- Link: https://worrydream.com/LadderOfAbstraction/

**Nicky Case, explorables.**
- DOK 1 — Facts: Small interactive sims ("Parable of the Polygons," "Evolution of Trust") build systems intuition in minutes.
- DOK 2 — Summary: A tiny *honest* model beats exposition; the honesty does the work.
- Link: https://ncase.me

### Retrieval & spacing
**Roediger & Karpicke (2006), "Test-Enhanced Learning."**
- DOK 1 — Facts: Tested learners retained much more after a delay than restudiers. The restudy group rated itself *more* confident.
- DOK 2 — Summary: Unaided retrieval, not rereading, drives memory; confidence is a false signal.
- Link: https://journals.sagepub.com/doi/abs/10.1111/j.1467-9280.2006.01693.x

**Cepeda et al. (2008), spacing study.**
- DOK 1 — Facts: The optimal review gap grows with how long you want to remember. Too-short gaps cost more than too-long ones. ~1 day was optimal for ~1-week retention.
- DOK 2 — Summary: Backs Aperture's expanding [1, 3, 7, 16, 35]-day schedule; the exact numbers are approximate on purpose.
- Link: https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf

**Brown / Roediger / McDaniel, *Make It Stick*.**
- DOK 1 — Facts: "Desirable difficulties" (spacing, interleaving, testing) strengthen retention; fluency and rereading create an illusion of knowing.
- DOK 2 — Summary: The license for "let them commit and be wrong on purpose."
- Link: https://www.makeitstick.com/

### Transfer & abstraction
**Kaminski, Sloutsky & Heckler (2008), "The Advantage of Abstract Examples in Learning Math."**
- DOK 1 — Facts: Learners taught a concept with abstract symbols transferred it to a new domain; learners taught with concrete, perceptually-rich examples did not.
- DOK 2 — Summary: Concreteness binds knowledge to surface features; abstraction frees it to transfer — the rationale for pixel art over photos. (→ SPOV 3.)
- Link: https://doi.org/10.1126/science.1154659

**Barnett & Ceci (2002), "When and where do we apply what we learn? A taxonomy for far transfer."**
- DOK 1 — Facts: Far transfer (to new contexts or domains) is rare and not the default outcome of learning a skill.
- DOK 2 — Summary: Can't assume a skill learned on one device shows up on another — design for transfer. (→ SPOV 3.)
- Link: https://doi.org/10.1037/0033-2909.128.4.612

### Truth of educational sims (Aperture's own logs)
**WB audit (`Factory/IMPROVEMENTS-LOG.md`, commit `6c3bc82`).**
- DOK 1 — Facts: The white-balance math moved red and blue but never green, so a green-dominant scene couldn't render neutral. It measured net-blue at the rewarded "neutral" point, yet beats claimed "reads neutral." Fixed by moving to achromatic scenes.
- DOK 2 — Summary: A confident claim sitting on a render that contradicts it — caught only by measuring pixels. The canonical SPOV 1 case.
- Link: https://github.com/alphaxia2100/w1-brilliant/blob/6c3bc82/Factory/IMPROVEMENTS-LOG.md

**Gate + reviews (`Redesign/checks.mjs`, commit `5a50ecb`).**
- DOK 1 — Facts: The gate passed 100% while nine prose/pixel divergences were live. After the hint ladder was stripped, three review views still turned green at the grading threshold.
- DOK 2 — Summary: Structure-checking ≠ truth-checking; "no live tell" only held once it became an asserted check (`leaksLiveTell`). SPOV 1 + 2.
- Link: https://github.com/alphaxia2100/w1-brilliant/blob/5a50ecb/Redesign/checks.mjs
