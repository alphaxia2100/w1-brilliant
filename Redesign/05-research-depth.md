I have everything I need. I have a robust, multi-source evidence base spanning explorable-explanation design, PhET's research-validated principles, prediction/pretesting learning science, productive failure and contrasting cases, the optics of the lessons themselves, and the limitations of existing photography simulators. Now let me synthesize the full report mapping principles onto each of the 9 lessons.

---

# Deep vs. Shallow Interactive Lessons — Research & Redesign for "Aperture" (the 9 photography lessons)

## Part 0 — What I'm working from

I read the project itself before researching. The actual shipped lesson set lives in `/Users/sky/Developer/Work/Alpha AI/Week 1 Brilliant/src/content/course.js` — **9 lessons** (the PRD's table only lists 6; the code is ahead of it). Every one currently follows the identical three-beat shape:

> `intro` (a paragraph of text) → **one** `slider-sim`/`capture`/`triangle`/`compose` step whose `check()` is "did you hit the target?" → **one** `predict` multiple-choice.

That shape is *competent but shallow*. The slider step is a **"drive the number to where the green zone is"** task, and the explanation is delivered as prose in the `intro` before the learner has done anything. Below I establish, from sources, what separates a genuinely-educational interactive from a gamified one, then redesign each of the 9 lessons against those principles. The recurring failure mode I'm fixing: **hitting a target is not the same as understanding the mechanism that moves the target.**

---

## Part 1 — The principles (what the research says makes an interactive teach the WHY)

### 1. The defining line: "science communication with interactivity added," not "a game with science added"

The cleanest definition of the genre comes from the explorable-explanations literature. An explorable explanation is "an interactive computer simulation of a given concept… along with some form of guidance," and what distinguishes it from an isolated widget is that it "deliberately guide[s] the attention of their audience towards particular phenomena within the simulation" (source: https://en.wikipedia.org/wiki/Explorable_explanation). Crucially, the field defines itself *in opposition* to gamification: explorables "come at educational games from the opposite direction: instead of 'games, but with science communication added,' they're 'science communication, but with interactivity added'… the focus is on understanding concepts, not on engagement mechanics like points or competition" (source: https://grokipedia.com/page/explorable_explanation). And unlike gamification, explorables "may involve no rewards whatsoever" (source: https://en.wikipedia.org/wiki/Explorable_explanation).

**Diagnostic for our app:** a shallow lesson is identifiable because its *reward loop* (green pop, XP) is doing the motivational work, and the manipulation is just the button you press to earn it. A deep lesson is one where the manipulation *is* the explanation — where you could strip out the XP entirely and the learner would still have understood something. The PRD already half-knows this ("XP + completion only," no streaks), but the *steps themselves* still treat the slider as a lock to pick rather than a system to probe.

### 2. The manipulation must expose **cause-and-effect in a system**, not a single answer

Bret Victor's foundational argument: passive text shows "the author's argument, and nothing else… We form questions, but can't answer them. We consider alternatives, but can't explore them." The fix is the **reactive document** — letting the reader "play with the author's assumptions and analyses, and see the consequences," so text becomes "an environment to think in" rather than "information to be consumed" (sources: https://worrydream.com/ExplorableExplanations/, https://en.wikipedia.org/wiki/Explorable_explanation). The design corollary, repeated across the genre: "an explorable explanation usually works best to explain a system, a model, a network of cause-and-effect" (source: https://grokipedia.com/page/explorable_explanation).

The opposite — the trap our lessons fall into — is also documented: "interactive articles often remain limited, with users typically following predefined storylines and unable to freely manipulate inputs or explore alternative scenarios" (source: https://grokipedia.com/page/explorable_explanation). A `check: (f) => f <= 2.8` slider *is* a predefined storyline with one acceptable input. The slider has more states than the lesson lets you reason about.

**Principle:** turn each "hit the target" into "discover the rule." The target should *emerge* from a relationship the learner traces, not be a green zone they slide into.

### 3. **Multiple linked representations** — the single most-cited PhET principle

PhET (the most research-validated interactive-science library, "Silver Validation," demonstrated gains in conceptual understanding, problem-solving, lab skills, and attitudes) is built on representations that are *linked and update together*: "users… coordinate across representations such as physical representations, graphs, numbers, vectors, and text," which "helps users see the invisible elements like atoms, molecules, and electric fields" (source: https://edutechwiki.unige.ch/en/PhET_interactive_simulations). As the learner manipulates, "responses are immediately animated to effectively illustrate cause-and-effect relationships as well as multiple linked representations including motion of objects, graphs, and number readouts" (source: same). The learning-science backing: "multiple external representations… can substantially facilitate the learning and understanding of science concepts" (source: https://www.physport.org/methods/method.cfm?G=PhET&S=4).

**Principle:** when the learner drags the aperture slider, *more than the photo should move.* The f-number, the physical iris diameter, a "light let in" bar, and the depth-of-field band should all move in lockstep. Linking the abstract symbol (f/2.8) to the physical cause (a wide hole) to the consequence (bright + shallow focus) is exactly how you teach the *why* instead of the *what*. Our PRD's `PixelScene` engine plus SVG overlays can do this; the *content* just doesn't ask for it yet.

### 4. **Implicit scaffolding** — guide through the interface, not through paragraphs

PhET's signature move is "implicit scaffolding through interactive simulation design," producing "guidance without feeling guided" — constraints "embedded in the interface itself rather than through explicit instructions," with "minimal text" (sources: https://www.physport.org/methods/method.cfm?G=PhET&S=4). This is the same instinct as the PRD's own failure test ("if a screen has a paragraph instead of a knob, we've failed") — but our lessons currently violate it: every lesson *opens* with an `intro` of two prose sentences that **tell the learner the answer before they touch anything.** Lesson 2's intro literally says "that's where the twist is" before the learner has met the twist.

**Principle:** demote the explanatory prose. The interface should set up the discovery (limit the slider, label the ends, animate the iris) so the learner *infers* the rule, and the text confirms it *after*.

### 5. **Predict-before-reveal — but only the kind that produces surprise**

The pretesting/prediction literature is strong and specific. Predicting before instruction works because of **surprise**: making an incorrect prediction and then seeing the right answer "triggers a 'surprise response' (measured via pupil dilation)" that "leads to enhanced attention and consequently to better encoding," and "the degree of surprise co-related positively with learning gains" (sources: https://pmc.ncbi.nlm.nih.gov/articles/PMC8642250/, https://www.biointeractive.org/professional-learning/educator-voices/using-predictions-enhance-learning). Critically — **the prediction must come first.** "Predictions are elicited *before* teaching a topic, whereas other forms of retrieval practice ask students to recall material that has already been learned" (source: https://www.biointeractive.org/...). And even low-confidence guesses help, "provided that timely feedback is given" (source: same).

**This is where our lessons most clearly invert the science.** Today the order is: `intro` (tell them the rule) → slider (do it) → `predict` (quiz them on the rule they were already told). That's a *post-test*, not a pretest — it can't generate surprise, because we already spoiled the answer. The high-value misconceptions our content names (f-numbers are backwards; high ISO is forbidden; the three controls are independent) are *exactly* the cases where surprise-driven learning pays off most ("science curricula should leverage prediction's surprise-generation potential, particularly when misconceptions predominate," source: https://pmc.ncbi.nlm.nih.gov/articles/PMC8642250/).

**Principle:** move the prediction to the *front* of every lesson, before any explanation, and design it so a beginner's intuition is *wrong* — then let the manipulation be the reveal. Reverse the beats: **predict → manipulate (surprise) → confirm.**

### 6. **Productive failure & contrasting cases** — let them struggle and compare before you tell

Kapur's productive-failure research: having learners attempt a problem *before* instruction produces "better conceptual knowledge" than direct instruction, with a meta-analytically "significant, moderate effect in favor of problem-solving followed by instruction." The mechanism is that struggling "triggers a global awareness of knowledge gaps, which can prime them to better understand the subsequent instruction" (sources: https://www.cse.iitk.ac.in/users/se367/14/Readings/papers/kapur-14_productive-failure-in-learning-math.pdf, https://journals.sagepub.com/doi/10.3102/00346543211019105). And **contrasting cases** "highlight the deep features" — by "comparing problem datasets," learners "notice that certain features matter," and applying a solution across contrasting cases "provides feedback regarding specific gaps" (source: https://onlinelibrary.wiley.com/doi/10.1111/cogs.12107).

**Principle:** the deepest version of a photography lesson isn't "set the slider to the right value." It's "here are two photos that differ — figure out *which control* produced the difference, and *why*." Comparison is what isolates the variable in the learner's mind. Several of our lessons (DoF, motion, equivalent exposures) are *natively* contrasting-case problems and are currently being taught as single-slider targets, throwing away their best pedagogical asset.

### 7. Use interactivity *only where it earns its place* — and know its limits

Two practitioner cautions worth honoring. From explorable-explanation design: "Don't try to explain everything with something interactive; use interactivity only when interactivity works best, and supplement it with text and images" (source: https://blog.ncase.me/explorable-explanations/). And specific to our domain, simulators have known limits: "since all images are graphics only, over-exposure & under-exposure conditions, noise, diffraction and out-of-focus areas are not the exact representation of what is achieved in the field" (source: https://photographyicon.com/camera-simulator/), and they're "a supplement, not a replacement — real photography involves composition, timing, light reading… that simulators cannot replicate" (source: https://www.adorama.com/alc/9-online-camera-simulators-to-help-your-photography-skill/). The whole CameraSim family validates the *appetite* and the *slider mechanics* but, as the project's own research already noted, "none wrap it in… guided, predict-first, single-concept, instant-feedback pedagogy. That's the gap to fill."

**Principle:** our edge over CameraSim is not a better simulator — it's the *pedagogical scaffolding around* the simulator (predict-first, isolate-one-variable, linked representations, contrast). Don't try to out-sim CameraSim; out-*teach* it.

### The shallow-vs-deep scorecard (summary)

| Axis | Shallow / gamified | Deep / explorable |
|---|---|---|
| What moves | One slider → photo brightness; green zone | Slider → photo + symbol + physical cause + consequence, all linked |
| Role of reward | XP/green-pop drives engagement | Manipulation itself is the payoff; reward is optional |
| Order of teaching | Tell rule → do → quiz on rule (post-test) | Predict (wrong) → manipulate (surprise) → confirm rule |
| Success condition | Hit the target value | Discover/articulate the relationship; explain *why* |
| Misconception | Stated in prose | *Provoked, then refuted by the learner's own action* |
| Comparison | None — one scene, one variable | Contrasting cases isolate the deep feature |
| Text | Front-loaded paragraph | Minimal; confirms after the doing |

---

## Part 2 — Redesigning the 9 lessons

For each: the **current** step shape (from `course.js`), the **mechanism it should teach (the WHY)**, and a **deeper interaction** built from the principles above. I flag which principle each leans on. I keep these buildable on the existing engine (PixelScene effects, sliders, SVG overlays, the `predict` step type) — these are *content/step-design* changes, not a rewrite.

---

### Lesson 1 — "A photo is collected light" (`collected-light`)
**Now:** intro → `capture` (open shutter, land marker in green exposure band) → predict (which change gathers more light).
**The WHY:** a photo is an *accumulation* of light over time; "correct" is a *target fill*, not maximum brightness; one *stop* = a doubling.

**Deeper interaction — "Watch the bucket fill, and find your own target."**
- **Predict-first (P5):** before any text, show a black frame and ask *"When is the photo 'done'? Tap when it looks right."* No green zone shown. The learner taps — almost everyone taps too late (chasing brightness) or too early. *That* is the productive-failure moment (P6): their intuition "brighter = better" is provoked.
- **Linked representations (P3):** as light pours in, run **three synchronized readouts**: the pixel scene filling, a vertical "light collected" bar, and a **histogram building in real time** (this also pre-seeds Lesson 7). The learner *sees* highlights clip — the histogram spikes against the right wall — at the exact moment the photo "washes out." Brightness, accumulation, and clipping become one linked event instead of three facts.
- **The reveal (P2/P5):** replay *their* tap vs. the on-target capture side by side. The surprise: the on-target frame is *darker* than where their instinct said to stop, yet it retains detail their bright one lost. Now drop the one sentence: "correct exposure is a target, not a maximum."
- **Teach the stop as a manipulable, not a sentence (P3):** replace the static "one stop = double" prose with a tiny **doubling toggle** — a "+1 stop / −1 stop" button that visibly *doubles or halves the fill bar* and slides the histogram one zone. The learner clicks +1, +1, +1 and watches the bar double each time. They *generate* the doubling rule by operating it (generation effect, source: https://pmc.ncbi.nlm.nih.gov/articles/PMC8642250/).

---

### Lesson 2 — "Aperture: the size of the hole" (`aperture-hole`)
**Now:** intro (says "that's where the twist is" — spoils it) → slider-sim "make it as bright as you can with aperture" (check f ≤ 2) → predict (f/2 vs f/16).
**The WHY:** the f-number is a *fraction* (focal length ÷ diameter), so the big number is the small hole. This is the #1 beginner trap and the canonical surprise.

**Deeper interaction — "Let your wrong guess collide with the iris."**
- **Kill the spoiler intro (P4/P5):** do *not* say "here's the twist." Open cold with the prediction: *"To let in MORE light, drag toward f/1.4 or toward f/16?"* Most beginners pick f/16 (big number = big hole). They commit. This is the high-confidence-wrong prediction the hypercorrection literature says produces the *largest* learning gain (source: https://pmc.ncbi.nlm.nih.gov/articles/PMC8642250/).
- **Surprise via linked iris (P3/P5):** when they drag toward f/16, the **SVG iris physically closes** and the scene *darkens* — the opposite of their prediction. The contradiction is visual and immediate; that's the pupil-dilation surprise moment, not a "wrong" buzzer.
- **Explain with the cause, made manipulable (P2):** reveal *why* by linking the symbol to its meaning — show the fraction live: a "1 / [diameter]" readout, or a literal **pizza-slice graphic** where f/2 is half a pizza and f/16 is a sliver, *driven by the same slider*. As they drag, fraction, pizza slice, iris diameter, and brightness all move together. The "backwards numbers" stop being arbitrary because the learner sees the denominator.
- **Better success condition (P2):** instead of `check: f ≤ 2`, ask them to **rank**: drag three unlabeled apertures into "most light → least light" order. Ranking forces them to use the *relationship*, not just find the bright end.

---

### Lesson 3 — "Aperture's secret job: depth of field" (`depth-of-field`)
**Now:** intro → slider-sim "blur the background" (check f ≤ 2.8) → predict (landscape, which aperture).
**The WHY:** a lens focuses *one plane*; off-plane points project a *circle* instead of a point (the circle of confusion), and a *wider* hole makes that circle *bigger* → more blur. This is genuinely *why* aperture changes focus, and it's currently taught as "wide = blurry, magic."

**Deeper interaction — "Trace the light cone, don't just slide to blurry."**
- **Contrasting cases first (P6):** show two finished portraits side by side — same subject, one creamy background, one sharp background. Ask: *"What's different, and what changed it?"* Offer mechanism options (closer subject / wider hole / longer lens). Beginners often say "they zoomed" or "better camera." Provoke the gap before explaining.
- **Make the optics the manipulable, not the result (P2/P3):** the deep move is a **second linked representation**: a simple ray diagram beside the scene. As the aperture slider widens, show the **light cone from a background point fanning wider → landing as a fat blur circle** on the sensor; narrow it and the circle shrinks to a dot. The learner is no longer sliding to "blurry"; they're watching *why* the blur grows. PhET's whole thesis is exactly this — make the invisible mechanism visible alongside the visible effect (source: https://edutechwiki.unige.ch/en/PhET_interactive_simulations). Optics confirmed by the circle-of-confusion sources (https://en.wikipedia.org/wiki/Circle_of_confusion, https://photographylife.com/what-is-depth-of-field).
- **Guard the misconception the content already worries about (P6):** the PRD note warns against "DoF is aperture-only." Add a *third* control briefly — a **subject-distance** mini-slider — and a contrasting case: "same f/2.8, subject far vs. near." The learner discovers blur also depends on distance, so they don't over-attribute everything to the f-number. (Keep it as a single short comparison, per P7 — don't turn it into a sandbox.)
- **Decouple from L2 deliberately (P3):** brightness is auto-held here (the code already does this), which is correct — it isolates the variable. Make that *explicit* on screen: a small "brightness: locked" chip, so the learner registers that aperture has *two* jobs and we've frozen one.

---

### Lesson 4 — "Shutter speed: freeze or blur time" (`shutter-speed`)
**Now:** intro → slider-sim "freeze the subject" (check v ≤ 1) → predict (waterfall, which speed).
**The WHY:** the shutter is open for a *duration*; anything that moves *during* that window smears across the frame proportional to how far it traveled. Freeze vs. blur is the same mechanism, not two rules. Also: subject blur ≠ camera shake.

**Deeper interaction — "Smear is distance × time."**
- **Predict-first with a twist (P5):** open with a moving subject and ask *"To freeze the runner, do you want the shutter open for a long time or a short time?"* — but the richer prediction is the *waterfall* case framed as a trap: *"Is blur always a mistake?"* The content's own misconception ("blur is always wrong") is best provoked by making the learner *want* blur.
- **Linked time representation (P3):** alongside the smear, show a **shutter-open timeline bar** and the subject's **travel arrow**. As the slider slows, the timeline lengthens, the arrow grows, and the smear lengthens *in proportion* — three linked views of one fact ("smear length ∝ shutter duration"). Now "freeze" and "silky water" are visibly the *same* law at two ends, not two memorized outcomes.
- **The contrasting case that kills the deepest myth (P6):** the **tripod/handheld toggle** (already in the PRD as a CameraSim-style mechanic) becomes a *contrast experiment*, not decoration: at the *same* slow shutter, toggle handheld → the *whole frame* smears (shake); tripod → only the *subject* smears (motion). Two cases, same setting, different blur — the learner discovers that subject-motion blur and camera-shake are different phenomena. That's a deep feature no "slide to freeze" target can teach.
- **Better success condition (P2):** instead of one "make it sharp" target, give *two* goals back-to-back on the same scene — "freeze it" then "make it silky" — so they operate *both* directions of the relationship and can't just memorize "fast = correct."

---

### Lesson 5 — "ISO: brightness at a cost" (`iso-noise`)
**Now:** intro → slider-sim "raise ISO until you can see the scene" (check ISO ≥ 1600) + loupe → predict (third lever after aperture/shutter).
**The WHY:** ISO *amplifies the signal you already collected* — it does **not** collect more light. So it brightens *and* amplifies the noise floor with it. The trade-off (more visible the deeper into shadow you go) is the whole point, and "high ISO is forbidden" is the myth to break.

**Deeper interaction — "Amplification, not collection — and the cost is in the shadows."**
- **Disambiguate the mechanism up front (P2):** the most important *why* here is that ISO is categorically different from aperture/shutter — they change *how much light is collected*; ISO changes *how loud you turn up what you already have*. Make this a **linked-representation contrast**: a "light collected" bar (unchanged by ISO) next to a "signal amplified" bar (grows with ISO) next to a "noise" bar (grows with ISO). The learner sees the collected-light bar *stay flat* while ISO climbs — the visceral proof that ISO ≠ more light. This single linked view corrects the deepest ISO misconception, which prose can't.
- **Surprise prediction (P5):** *"You're in a dark room. Turning up ISO — does it gather more light, or just amplify what's there?"* Most beginners say "more light." The flat collected-light bar refutes them.
- **The cost, made discoverable not stated (P3):** keep the **zoom-loupe** but make it the experiment: ask the learner to *find where the noise lives* by dragging the loupe. They discover it's worst in the **shadows** (the code already weights noise into shadows). Discovering "noise hides in the dark parts" beats being told.
- **Break the "high ISO forbidden" myth with a contrasting trade-off (P6):** present the real working-photographer choice as two finished shots — "clean but motion-blurred (ISO too low, shutter too slow)" vs. "slightly grainy but sharp (ISO raised)." Ask *which is the keeper?* The lesson lands that a usable noisy shot beats a clean missed one — ISO is a tool, the third resort, not a sin.

---

### Lesson 6 — "The triangle: balance the three" (`the-triangle`) — the hero
**Now:** intro → `triangle` (balance three controls so the meter sits level) → predict (equivalent exposures, what differs).
**The WHY:** all three controls feed *one* quantity (total light / stops), so they're *interchangeable for exposure* — but each carries a *different creative side effect*. Therefore many settings give the *same brightness* ("equivalent exposures") but a *different look*. This is the synthesis; it's also the lesson most at risk of becoming "three sliders, go play" (the sandbox the PRD explicitly rejects).

**Deeper interaction — "Same light, different look: trade, don't just balance."**
- **One shared currency, made literal (P3):** the deep idea is that aperture/shutter/ISO are all denominated in *stops*. Show a single **"total light" meter** fed by three tributary gauges. When the learner moves any control by one stop, its tributary changes by exactly one stop and the master meter moves by one — *and a compensating control must give one back* to re-level. The "balance scale stays level only when the math balances" (PRD's instinct) becomes a linked-representation truth, not a black box.
- **Reframe success from "balance" to "equivalent-exposure trade" (P2/P6):** balancing a meter is still a target task. The *deep* task is the **contrasting case**: lock the brightness as solved, then say *"keep the exposure identical, but make the background blurrier"* — forcing the learner to *open aperture AND compensate elsewhere*, and watch the **look change while the brightness bar doesn't move.** Then "...now make the same-brightness shot freeze motion instead." They produce two equivalent exposures with their own hands and *see* that "same brightness ≠ same photo." That is the entire concept, discovered.
- **Constraint puzzles, not free play (P7):** the PRD's "dim sports game, shutter pinned at 1/1000s, fix the darkness" is exactly right — a *constraint* turns the sandbox back into a problem with a reasoned path (open aperture → if maxed, raise ISO → accept grain). Keep one creative side-effect visible per move (blur/motion/grain) so every compensation is a *trade-off with consequences*, never a neutral knob.
- **Predict-first surprise (P5):** before solving, ask *"If two photos are equally bright, are they the same photo?"* Beginners say yes. The trade experiment refutes it.

---

### Lesson 7 — "Metering: read the light" (`metering`)
**Now:** intro → slider-sim "adjust exposure so the histogram isn't clipped" (check `wellMetered`) + live histogram → predict (spike on the right = blown highlights).
**The WHY:** the histogram is a *count of pixels per brightness level* — an objective instrument that tells you what your eyes (which adapt) can't. Clipping = lost, unrecoverable detail at an edge. This lesson is *already* the closest to deep (it has a genuine linked representation — the histogram). Push it further.

**Deeper interaction — "The histogram is the camera's truth-teller."**
- **Lean into the already-present linked representation (P3):** it's strong that dragging exposure moves *both* the scene and the histogram. Make the linkage unmistakable by **highlighting the clipped pixels in the scene itself** (e.g., blown highlights blink) at the moment the histogram piles against an edge. Now "spike at the edge" and "that white sky has no detail" are the *same* event in two views — the core of multiple-representation learning (source: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9849893/).
- **Predict-against-your-eyes (P5/P6):** show a scene that *looks* fine but is actually clipped (e.g., a bright snow scene the eye accepts). Ask *"Is this well exposed?"* — most say yes. The histogram reveals the clipped highlights they couldn't see. That gap between perception and instrument is the surprise that makes the histogram feel *necessary* rather than decorative. (This is the "gray snow / gray polar bear" metering trap the project's research already flagged — it presupposes triangle fluency, which by L7 the learner has.)
- **Contrasting cases (P6):** three thumbnails — under, correct, over — each with its histogram. Ask the learner to *match histogram to photo.* Matching forces them to read the *shape* (bunched left / spread / bunched right), not just slide to a green zone.

---

### Lesson 8 — "White balance: the color of light" (`white-balance`)
**Now:** intro → slider-sim "cool down the orange cast until natural" (check |temp| < 0.15) → predict (warm bulbs → set WB cooler).
**The WHY:** light *has a color temperature*; white balance applies the *opposite* color to neutralize a cast so neutrals read neutral. The mechanism is *additive cancellation* (add blue to kill orange), and the trap is that the eye *auto-corrects* casts that the sensor records faithfully.

**Deeper interaction — "Cancel the cast by adding its opposite."**
- **Make the cancellation visible, not just the result (P2/P3):** the deep *why* is color *opposition*. Add a linked **color-wheel / two-headed bias indicator** beside the scene showing the current cast (orange) and the correction being added (blue). As the learner cools the slider, the indicator shows blue being added to *cancel* orange toward neutral gray. They see *why* "cooler fixes orange" — it's not arbitrary, it's complementary cancellation.
- **Give a reference target the eye can't fake (P3):** include a **known-neutral object** in the scene (a white shirt / gray card) and a tiny **color-picker readout** of its RGB. The success condition becomes "make the gray actually read gray (R≈G≈B)," an *objective* anchor — the same instrument-over-perception lesson as the histogram, applied to color. This beats "until it looks natural," which is subjective and eye-fooled.
- **Predict-first surprise (P5/P6):** show the *same scene* under tungsten vs. shade and ask *"Is the camera broken, or is the light a different color?"* Most beginners blame the camera. Revealing that *light itself* is colored — and the eye hides it — is the surprise. Then the contrasting pair (warm cast needs cooling; blue cast needs warming) teaches the bidirectional rule, not a one-way fact.

---

### Lesson 9 — "Composition: the rule of thirds" (`rule-of-thirds`)
**Now:** intro → `compose` (drag subject onto a power point) → predict (why off-center).
**The WHY:** this is the one lesson with **no single correct answer** — and the research flagged composition as the *weakest* fit for crisp instant feedback precisely because "interaction tends to be subjective… with no single correct answer." The honest deep move is to teach it as a *guideline that changes feel*, not a target with one right cell. The current `check` ("did you land on an intersection?") risks teaching the *opposite* of the real lesson (that thirds is a law).

**Deeper interaction — "Feel the difference, don't hit the dot."**
- **Contrasting cases are the whole lesson here (P6):** instead of "drag to the power point," show the **same subject placed dead-center vs. on a third, side by side**, and ask *"which feels more dynamic — and can you say why?"* Comparison is what surfaces the deep feature (balance, negative space, gaze room). This matches both the contrasting-cases evidence (https://onlinelibrary.wiley.com/doi/10.1111/cogs.12107) and the domain reality that composition is judged, not measured.
- **Manipulate, then narrate the consequence (P2):** keep the drag, but as the subject moves, **show negative space / gaze direction respond** (e.g., if the subject faces left, leaving space on the left feels cramped; space ahead feels open). The learner discovers that *placement interacts with what's in the frame* — not that one cell is "correct." Accept a *range* of good placements, not a single point.
- **Frame it explicitly as a guideline (P4/P7):** the predict question should *break* the rule's authority: *"A subject dead-center is always wrong — true or false?"* (False.) This corrects the misconception the rigid `check` could instill. Per P7, this is a place to use *less* simulation and more curated comparison — interactivity earns its place in the *contrast*, not in a pixel-perfect target.

---

## Part 3 — Cross-cutting changes (apply to all 9)

1. **Reverse the beat order to predict → manipulate → confirm.** Every lesson currently front-loads an `intro` that spoils the answer, then quizzes it. The learning science says the prediction must come *first* to generate surprise (sources: https://pmc.ncbi.nlm.nih.gov/articles/PMC8642250/, https://www.biointeractive.org/...). Demote the `intro` prose to a *post-manipulation confirmation*, and promote `predict` to step 1. This is a content reorder, not an engine change.

2. **Add a second linked representation to every sim step.** A slider that moves only the photo is a one-representation widget. Add the symbol + physical cause + consequence in lockstep (iris diameter, fraction, light cones, histogram, stops meter, color-cancellation wheel). This is the highest-leverage, most-cited deep-learning move (PhET, sources above) and the PixelScene + SVG architecture already supports it.

3. **Replace "hit the target" `check()`s with relationship tasks where possible.** Rank-order, match-the-pair, "produce two equivalent results," "find where the effect lives" — all force the learner to use the *relationship* rather than slide into a green zone (cause-and-effect over predefined-storyline, source: https://grokipedia.com/page/explorable_explanation).

4. **Use contrasting cases for the comparison-native lessons** (DoF, motion vs. shake, equivalent exposures, metering, white balance, composition). Two cases that differ in one deep feature teach the variable better than one slider hitting one value (source: https://onlinelibrary.wiley.com/doi/10.1111/cogs.12107).

5. **Keep interactivity disciplined (P7).** Don't let L6 become a sandbox or L9 become a pixel-target; supplement with curated comparison and minimal text where that teaches better. Our differentiator vs. CameraSim is the *pedagogical wrapper*, not simulator fidelity (sources: https://photographyicon.com/camera-simulator/, https://www.adorama.com/alc/9-online-camera-simulators-to-help-your-photography-skill/).

6. **One thing the app already gets right:** calm-gray (not red) wrong-answer feedback, no streaks, XP-only. That aligns with the explorable ethos that the *manipulation*, not the reward mechanic, should carry the learning ("explorables… may involve no rewards whatsoever," source: https://en.wikipedia.org/wiki/Explorable_explanation). Preserve it.

---

## Sources

- Explorable explanation (definition, vs. games/gamification, guided discovery) — https://en.wikipedia.org/wiki/Explorable_explanation · https://grokipedia.com/page/explorable_explanation
- Bret Victor, *Explorable Explanations* (reactive documents, active reading, text as environment) — https://worrydream.com/ExplorableExplanations/
- Nicky Case, on disciplined use of interactivity — https://blog.ncase.me/explorable-explanations/
- PhET design principles (multiple linked representations, implicit scaffolding, cause-and-effect, validation) — https://www.physport.org/methods/method.cfm?G=PhET&S=4 · https://edutechwiki.unige.ch/en/PhET_interactive_simulations
- Multiple representations facilitate science learning — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9849893/
- Predicting as a learning strategy (surprise, prediction error, generation effect, when it does/doesn't help) — https://pmc.ncbi.nlm.nih.gov/articles/PMC8642250/ · https://link.springer.com/article/10.3758/s13423-021-01904-1
- Using predictions to enhance learning (practitioner techniques, predict-before-teaching) — https://www.biointeractive.org/professional-learning/educator-voices/using-predictions-enhance-learning
- Productive failure & contrasting cases (problem-solving-before-instruction, deep features) — https://www.cse.iitk.ac.in/users/se367/14/Readings/papers/kapur-14_productive-failure-in-learning-math.pdf · https://onlinelibrary.wiley.com/doi/10.1111/cogs.12107 · https://journals.sagepub.com/doi/10.3102/00346543211019105
- Depth-of-field optics / circle of confusion (the "why" behind aperture blur) — https://en.wikipedia.org/wiki/Circle_of_confusion · https://photographylife.com/what-is-depth-of-field · https://www.cambridgeincolour.com/tutorials/depth-of-field.htm
- Camera-simulator landscape & limits (CameraSim et al.; "supplement, not replacement"; graphics-only caveats) — https://www.adorama.com/alc/9-online-camera-simulators-to-help-your-photography-skill/ · https://photographyicon.com/camera-simulator/ · https://www.camerasim.com/original-camerasim
- Teaching photography by understanding-vs-memorizing (expert intuition from mechanism) — https://digital-photography-school.com/approach-to-learning-photography/ · https://learningmole.com/guide-to-teaching-photography-basics-tips/

**Files referenced:** the live lesson definitions are in `/Users/sky/Developer/Work/Alpha AI/Week 1 Brilliant/src/content/course.js` (9 lessons, each `intro → sim → predict`); product framing in `/Users/sky/Developer/Work/Alpha AI/Week 1 Brilliant/PRD.md`; prior research in `/Users/sky/Developer/Work/Alpha AI/Week 1 Brilliant/Research/04-photography-curriculum.md` and `/Users/sky/Developer/Work/Alpha AI/Week 1 Brilliant/Research/CONSOLIDATED-FINDINGS.md`. Note: the PRD §4 table lists only 6 lessons but the shipped course has 9 (adds Metering, White Balance, Rule of Thirds) — worth reconciling.