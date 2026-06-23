# Photography Domain — Content & Interactive Lesson Design

## 1. Purpose & How to Read This Report

This document synthesizes domain research across the full beginner-to-advanced photography curriculum into a single reference for the team about to write a PRD and build a Brilliant-style interactive photography app. It establishes:

1. The **canonical teaching order** the entire field agrees on.
2. **Per-topic teachable content** for the four core domains (exposure triangle, composition, focus/metering, advanced).
3. A **catalogue of concrete hands-on interactive lesson designs** per topic — each as *mechanic → what the learner does → what they should learn*.
4. A focused **MVP scope recommendation**: the single best chapter, its 4–7 lessons in order, the target persona, and the rationale.

The through-line for the whole product: photography concepts are unusually well-suited to interactive learning because nearly every rule is a **concrete, parameterized function** that responds visibly to one slider or one dragged point. Each control has a single dominant, demonstrable side effect, and most "correct answers" are deterministic math — which means objective grading and precise wrong-answer guidance are computable, not subjective.

---

## 2. The Canonical Beginner Teaching Order

Every reputable beginner curriculum surveyed — B&H eXplora, Photography Life, StudioBinder, PetaPixel, Digital Photography School, and university/community-college "Photography 101" syllabi — converges on the **same arc**: technical control of the camera comes first, creative composition comes later, and gear/post-processing later still.

The representative UniversalClass *Photography 101* syllabus runs:

| Lessons | Topic | Stage |
|---|---|---|
| L1–L3 | Orientation / camera basics | Setup |
| **L4** | **Aperture & Shutter Speed** | **Exposure fundamentals (Chapter 1)** |
| **L5** | **Exposure** | **Exposure fundamentals** |
| L6 | Depth of Field | Exposure fundamentals |
| L7–L8 | Lenses / focal length | Optics |
| L9–L11 | Lighting | Light |
| L12+ | Filters / stability / post-processing | Gear & finishing |
| (late) | Composition | Creative |

The field-wide canonical order, distilled:

1. **The Exposure Triangle** (aperture, shutter speed, ISO) — universally treated as "Chapter 1" / "Step 1." Every other technical and creative decision depends on it.
2. **Focus & Metering** — how the camera decides *what's sharp* and *how bright*; the natural second technical pillar.
3. **Composition** — taught deliberately *late*, after technical control is mastered, because composition is a creative layer applied on top of a correctly captured frame.
4. **Advanced** — editing/color grading, astrophotography, sensors/optics theory. Depth topics for later chapters.

**Key scoping implication:** Do **not** mix composition or lighting into the MVP. The canonical order is explicit that exposure is taught alone, first. Composition and the advanced domains belong in the v2+ roadmap.

---

## 3. Per-Topic Content & Interactive Lesson Catalogue

### 3.1 The Exposure Triangle

#### Teachable content

The exposure triangle is the standard framework for how three controls combine to set image brightness. It is the strongest interactive candidate in the whole domain because **each control has one dominant, visually demonstrable side effect**:

| Control | Brightness role | Dominant visible side effect |
|---|---|---|
| **Aperture** (f-number) | Wider opening = more light | Depth of field / background blur |
| **Shutter speed** | Longer = more light | Motion blur vs. freeze |
| **ISO** | Higher = brighter output | Noise / grain |

**The "stop" is the atomic, unifying unit.** One stop = doubling or halving the light. Fstoppers reduces it to: *"Half as much, twice as much. That's it."* One stop brighter can come from ISO 100→200, **or** shutter 1/60→1/30, **or** aperture f/11→f/8. All three controls share this exact doubling/halving logic, which is what makes them interchangeable in brightness while differing in look.

**The standard stop ladders** (the literal data model for the sliders — discrete snap-to-stop positions, not continuous):

- **Aperture (full stops):** f/1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32
- **Shutter (doubling time):** 1/4000, 1/2000, 1/1000, 1/500, 1/250, 1/125, 1/60, 1/30, 1/15, 1/8, 1/4, 1/2, 1s, 2s, 4s
- **ISO (doubling):** 100, 200, 400, 800, 1600, 3200, 6400, 12800

**Aperture's counterintuitive inverse** — the #1 beginner stumbling block: **smaller f-number = wider opening = more light + shallower depth of field.** Concrete anchors: f/1.8–f/2.8 for a blurred-background portrait; f/11–f/16 for front-to-back-sharp landscapes. (Depth of field is also shortened by longer focal length and closer subject distance — good "advanced card" material, but keep aperture-vs-DoF as the core MVP lever.)

**Shutter speed thresholds:** ~1/500s starts to freeze fast motion; 1/1000s freezes most action; cars/birds-in-flight want 1/2000–1/4000s. Slow shutter smears motion; multi-second exposures make silky water. **Panning** (track the subject during a ~1/30–1/15s exposure) yields a sharp subject over a streaky background. A separate failure mode: the **reciprocal rule** — handhold at ≥ 1/focal-length (50mm → ~1/50s) to avoid *camera-shake* blur (whole-frame soft), distinct from subject motion blur (only the moving thing smears).

**ISO trade-off:** higher ISO brightens but adds noise; the lowest native/"base" ISO (typically 100–200) runs at zero amplification = cleanest. Two noise types: **luminance** (gray graininess, more acceptable) and **chrominance** (colored speckle/banding, less acceptable). A camera test anchor: ISO 3200 good, 6400 too noisy, 12800 visibly grainy on that body; modern full-frame can hold 3200–6400 clean enough for pro work.

**The single highest-value misconception to teach:** *digital ISO does not capture more light — it amplifies the already-captured signal.* Fstoppers' analogy: *"similar to the volume on a radio: the incoming signal doesn't get any stronger, it's just being played louder (amplified), static and all."* Noise is really driven by low signal (low light / underexposure), not by ISO per se. This reframes ISO as the **last-resort** control.

**Equivalent exposures / reciprocity:** many combinations give the same brightness but a different look. Worked example: from f/11, 1/500s, ISO 200, opening to f/5.6 (+2 stops) must be balanced by shutter to 1/2000s (−2 stops) to hold identical brightness. The pro mental model: **choose by creative intent first (aperture + shutter for the look), then complete exposure with ISO.**

**Why it's buildable cheaply:** every effect is a parametric transform of one base scene — background blur = SVG Gaussian blur radius; motion blur = horizontal smear/feGaussianBlur-on-X; noise = grain-overlay opacity + colored-speckle density; brightness = a single multiplier. No video, no image libraries; identical on mobile and desktop. State to persist is tiny: each control is an index into its stop ladder, and `exposureValue = sum of stop offsets`.

#### Interactive lesson catalogue

| Mechanic | What the learner does | What they should learn |
|---|---|---|
| **Stop-meter micro-widget** (+1 / −1 stop tapper, brightness bar doubles/halves) | Taps to add/subtract stops; watches the brightness bar double/halve | The "stop" is one shared unit across all three controls — the spine of the chapter and the scoring primitive everywhere |
| **Aperture / DoF slider** (snaps f/1.4…f/22; one drag couples three effects) | Drags toward f/1.4 → animated iris opens, scene brightens, **and** background blurs while foreground stays sharp | The counterintuitive inverse (smaller f-number = wider = more light + shallower DoF). Challenge: "creamy blurred background" passes at f ≤ f/2.8 |
| **Shutter Freeze-vs-Blur slider** (1/4000…1s; moving SVG subject) + **Panning toggle** | Drags to freeze or smear a runner/car; toggles panning to instead streak the background | Fast = freeze, slow = motion blur; panning is a creative special case. Challenges: "freeze the spinning wheel" (≥1/1000s); "silky waterfall" (≤1/4s) |
| **ISO Noise slider + radio-volume reveal** (100…12800) | Drags ISO; brightness *and* a luminance-grain + sparse-chroma-speckle layer both ramp up. Then a linked widget shows a fixed "signal" bar while only the amplifier and grain grow | Higher ISO = more grain; *ISO amplifies, it doesn't collect light*. Wrong-answer hint points at shadow speckle |
| **"Match the Exposure" reciprocity puzzle** (centerpiece; balance meter at 0) | System knocks one control off-balance (+2 stops); learner compensates with another to return net stops to 0 | Equivalent exposures: many combos, same brightness. Integer-stop math = exact grading. Escalate by locking ISO to force trade-off reasoning |
| **"Two photos, same brightness, different look"** reveal | Sees the same scene from two equivalent exposures (frozen + deep DoF vs. blurred + motion) and matches each to its creative intent | "Correct exposure" is not a single answer — the choice is creative |
| **Creative-brief capstone** (e.g., "bright midday: sharp landscape AND silky water") | Sets aperture (f/16) + shutter (1s) for the look, discovers overexposure, resolves it (base ISO / ND-filter card / tripod) | Intent-first workflow. Per-constraint rubric tells the learner *which* intent they violated ("water's silky but the foreground is soft — that's depth of field") |
| **Handholding / reciprocal-rule mini** (focal-length slider projects a "minimum safe shutter" line) | Picks a too-slow speed and sees whole-frame softness labeled "camera shake" | Not all blur is the same: camera shake (whole frame) ≠ subject motion blur (only the mover) |

---

### 3.2 Composition

#### Teachable content

Composition is the creative layer, taught after technical control. It decomposes into a set of discrete, gradeable placement rules — each a natural drag-the-token or tap-the-feature widget over a curated image.

- **Rule of thirds:** two horizontal + two vertical lines form a nine-cell grid with **four power points** at the intersections. Off-center placement there reads with more energy than centering.
- **Horizon placement:** belongs on the upper or lower third line, not the middle. High horizon emphasizes foreground; low horizon emphasizes sky; a centered horizon splits the frame and feels static.
- **Lead room (the most gradeable beginner mechanic):** leave most of the frame open in the direction the subject faces/moves. Subject ~one third, open space the rest, on the gaze side. Too little space feels cramped.
- **Phi grid / golden ratio:** the same idea with an uneven ~62/38 division, shifting subject lines slightly inward of even thirds; connects to the golden spiral whose tight coil holds the subject.
- **Leading lines:** real features (roads, rails, rivers, stairs, fences) that pull the eye toward the subject; ideally begin in the foreground; a lower angle strengthens them.
- **Framing:** surround the subject with scene elements (archways, windows, branches) as borders for depth and context; combines well with leading lines.
- **Symmetry — the documented exception to thirds:** reflections, tunnels, hallways, façades favor centering. Three types: vertical, horizontal, radial.
- **Visual balance:** distribute visual weight (large/bright/detailed objects draw the eye) across the frame; asymmetrical balance counterweights the subject with a smaller opposite element.
- **Negative space ↔ fill-the-frame:** opposite ends of one dial — isolate a subject in empty space, or crop in close to surface detail.
- **Point of view & combining rules:** low angles add drama and strengthen lines; rules often combine and contradict, with intent deciding. Existing apps already validate the draggable-grid-overlay + token model.

#### Interactive lesson catalogue

| Mechanic | What the learner does | What they should learn |
|---|---|---|
| **Thirds-grid drag** | Drops a subject token; graded by distance to the nearest of four intersections; hint fires when centered | Power points beat the center |
| **Draggable horizon line** (snaps to upper/lower third) | Drags the horizon off-center; wrong-answer guidance when centered | Horizon placement directs emphasis (foreground vs. sky) |
| **Lead-room slider** | Slides a facing subject so open space sits on the gaze side | Leave room in the direction the subject faces |
| **Phi-grid toggle + drag** | Switches thirds ↔ phi grid on one image, then drops onto the phi intersection using the real 62/38 numbers | Golden-ratio division vs. even thirds |
| **Tap-the-leading-lines** | Taps lines that lead *to* the subject vs. distractors that exit the frame | Leading lines guide the eye inward; mobile-friendly, grades instantly |
| **Framing crop-picker** | Picks the crop that uses an archway/window to frame the subject (or drags a frame around it) | Foreground elements add depth and context |
| **Symmetry "when to break"** | Picks centered over off-center for a reflection scene; reveal explains why | Centered symmetry is the documented exception |
| **Balance-scale metaphor** | Drags a secondary object to level a tilt caused by an off-center subject | Visual weight must be distributed across the frame |
| **Negative-space ↔ fill dial** | One zoom slider from "float in space" to "fill the frame"; picks the crop matching the stated goal | These are two ends of one compositional dial |
| **POV swap + intent capstone** | Swaps point of view; an intent-scored capstone validates the overlay + draggable-token model on curated images | Rules combine and contradict; intent decides |

---

### 3.3 Focus, Metering & Core Camera Mechanics

#### Teachable content

The unifying insight: **the camera is a "dumb averaging machine."** Autofocus picks ONE plane of sharpness; the light meter assumes every scene averages to **18% middle gray**. Both assumptions are systematically and *predictably* wrong — which is exactly what makes them teachable through cause-and-effect simulation. The strongest lessons make the wrong assumption visible, let the learner feel the failure, then hand them the corrective tool.

**Focus — two independent axes:**

- **AF mode (whether it locks or tracks):** *AF-S / One-Shot* focuses once on half-press, then **locks** — if the subject moves, it goes soft. *AF-C / AI-Servo* re-focuses continuously while half-pressed (more battery). AF-A/AI-Focus auto-switches.
- **AF-area mode (where in the frame):** single-point (one selected point, central points fastest), dynamic-area (9/21/51 pts with fallback), zone/group, auto-area (camera chooses via distance, motion, eye-detection). Teach mode and area as **two separate dials** so learners don't conflate them.

**Focus-and-recompose & cosine error:** focus on a center point, then rotate to recompose — and the plane of sharp focus swings **rearward by (1−cosθ) × subject distance**. The subject ends up behind the shifted plane and goes soft. Worst with wide-angle (large swing), wide aperture (razor-thin DoF), and close subjects; negligible with telephoto, small apertures, or deep DoF. Often misdiagnosed as a lens "back-focus" defect.

**Hyperfocal distance:** the closest focus distance that still keeps infinity acceptably sharp. Focus there and **everything from HALF that distance to infinity is acceptably sharp** — the maximum possible DoF. Example: focus at 10.5 m → sharp from 5.2 m to infinity. (Bonus myth-buster: the "1/3 in front, 2/3 behind" DoF rule only holds at one specific distance — the front fraction slides from ~1/2 at close focus down to 0 at the hyperfocal distance.)

**Metering:**

- **Core assumption:** reflective meters push every scene toward 18% middle gray. They can't tell "this scene is supposed to be bright" from "this is overexposed."
- **Three modes with concrete coverage:** matrix/evaluative (~1000+ zones, weighted toward the active AF point), center-weighted (~60–80% center), spot (~2–3% at the AF point; partial ~6–10%).
- **The signature failures:** snow underexposes to dingy gray; a black subject overexposes to gray. **Fix = exposure compensation in EV:** +1 to +2 EV for snow (~+1.7 if snow fills 80% of frame), −1 to −2 EV for dark/low-key scenes. EC works in Aperture/Shutter Priority (it shifts the meter's target) and does nothing in full Manual.
- **Histogram:** x-axis = tone 0 (pure black) → 255 (pure white); y-axis = pixel count at each tone. Left-bunched = under, right-bunched = over. There is **no single "correct" shape** — a night shot *should* be left-heavy.
- **Clipping:** a spike jammed against the right edge = blown highlights (pure 255, no detail); against the left = blocked shadows (pure 0). Recovery is mechanical: clipped right → reduce exposure; clipped left → increase, until no data hugs the edge.
- **Tie-in:** on modern bodies the **spot meter reads from the active AF point**, linking the focus and metering units in one capstone.

**Implementation note:** model every lesson around one shared scene-state object `{ focusDistance, aperture, exposureEV, meterMode, subjectDepths[] }` and derive blur, exposure, and histogram from it via pure functions, so widgets reuse the same physics and persistence is a state snapshot + correct flag.

#### Interactive lesson catalogue

| Mechanic | What the learner does | What they should learn |
|---|---|---|
| **AF-S vs AF-C tracking sim** | Toggles the mode as a subject animates across the frame; in AF-S the plane stays pinned and the subject blurs, in AF-C blur stays zero | Lock-once vs. track-continuously; the cleanest binary in the unit |
| **"Tap-to-focus" depth sim** (3 subjects at different depths + aperture/DoF slider) | Taps a subject to set the focus plane; other objects blur by their depth distance | WHERE you focus decides what's sharp. Hint: "you focused on the mountain — your subject is soft" |
| **Cosine-error top-down diagram** (bird's-eye SVG + recompose handle + aperture slider) | Focuses center, drags to recompose; the focal plane swings back off the subject; widens aperture to see when it matters | *When* focus-and-recompose fails: harmless at f/11, ruins the shot at f/1.8 |
| **Hyperfocal slider** (0 m → ∞ strip, live "sharp zone" band) | Drags focus distance; at the hyperfocal sweet spot the band snaps to half-distance → infinity | Maximum depth of field; the memorable "half-distance to infinity" rule |
| **Myth-buster DoF graph** | Drags focus from close to hyperfocal; an animated bar shows the front-of-subject DoF fraction sliding from ~1/2 to 0 | The "1/3–2/3 always" rule is false |
| **Metering-mode overlay toggle** (one backlit portrait; Matrix/Center/Spot) | Toggles modes; each overlays its metered region and recomputes exposure toward 18% gray | Spot nails the face; matrix blows out the bright background |
| **"Rescue the snow" EV slider** (−3 to +3 EV; mirrored black-cat scene) | Dials EV until muddy-gray snow turns clean white (target +1 to +2); inverse for the black cat (−1 to −2) | The meter's middle-gray pull, and exposure compensation as the override. Directional hints ("still too gray — add more") |
| **Live histogram + exposure slider** (256 bins) | Drags exposure; histogram slides in real time; an edge spike flashes red on clipping | x-axis = tone, y-axis = pixel count; clipping = lost detail with an obvious fix |
| **"Match the histogram" challenge** | Maps a histogram shape to the photo that produced it (or vice versa) | Reinforces the tone/count model and clipping without free text |
| **Focus + spot-meter capstone** | Places the focus point on a bright vs. dark part of the subject and watches sharpness AND exposure change together | Ties focus and metering together; rewards completing both units |

---

### 3.4 Advanced (Editing / Color, Astrophotography, Sensors)

#### Teachable content

These are depth topics best saved for **later chapters** after an exposure-triangle MVP. Each is governed by a small set of concrete, parameterized rules that respond visibly to a slider or dragged point.

**Editing / color (the richest):**

- **Tone curve** is literally an input→output brightness graph: x = original brightness (black left → white right), y = adjusted output (black bottom → white top). Default = straight diagonal. Drag a point up to brighten that tonal range, down to darken. A **drag-the-point widget by nature.**
- **S-curve** = contrast: pull the shadow point below the diagonal *and* the highlight point above it. An inverted S flattens/fades. Gives a crisp, checkable "correct answer."
- **Per-channel R/G/B curves** push color into tonal regions (raise the blue shadow end → teal shadows; lower the blue highlight end → warm highlights) — the basis of cinematic color grading; reuses the same curve component with a channel parameter.
- **White balance** = two orthogonal axes: temperature (Kelvin, blue↔yellow) and tint (green↔magenta). Counterintuitively, in editing you **raise the Kelvin number to warm** the image. Fixed *before* color grading.
- **HSL** targets one color band's hue, saturation, and luminance independently (e.g., deepen the blue sky without touching skin tones).
- **Masking** enables local edits: linear/radial gradients (center 100% → feathered edge), brushes, and luminance-range (0–30 = shadows only) / color-range masks.

**Astrophotography (driven by exact formulas):**

- **500 rule:** max shutter (s) = 500 / (cropFactor × focalLength). FF 24mm → ~20.8s; Canon APS-C (1.6×) 50mm → 6.25s; MFT (2.0×) 50mm → 5s.
- **NPF rule (more accurate):** shutter (s) = (35 × aperture + 30 × pixelPitch) / focalLength, where pixelPitch(µm) = (sensorWidth_mm / horizontalPixels) × 1000. For 24mm f/2.8 on a D750 (5.97µm): ~11.5s — versus the 500 rule's ~21s. Higher-MP sensors trail sooner.
- **Sky rotation:** stars sweep **15°/hour** (sidereal day ~23h56m). Stars near the celestial pole (Polaris) trace tiny circles; equatorial stars trace the longest arcs.
- **Star trails by stacking:** shoot 100+ short frames (e.g., 30s, ISO 400–800, f/2.8, 14mm) and merge. **SNR improves ~with √N** because signal adds coherently while random noise averages out.
- **Bortle scale (Class 1–9):** quantifies light pollution; bright (urban) skies flood the sensor, so the strategy flips to many short subs and more total integration.

**Sensors (tie it together):**

- **Crop factor** multiplies focal length for field of view **AND** f-number for equivalent depth of field: FF 1.0×, Nikon/Sony APS-C 1.5×, Canon APS-C 1.6×, MFT 2.0×. A 50mm on a 1.6× body frames like 80mm FF; MFT 45mm f/1.8 ≈ FF 90mm f/3.6.
- **Larger photosites gather more light** = lower noise. A handy equivalence: smaller-sensor ISO × cropFactor² ≈ FF ISO for similar noise (MFT ISO 200 ≈ FF ISO 800 look).

#### Interactive lesson catalogue

| Mechanic | What the learner does | What they should learn |
|---|---|---|
| **Tone-curve playground** (image + draggable SVG anchors → live 256-LUT remap) | Drags anchor points; for the challenge, makes a flat image "pop" | The input→output mapping; an S-curve = contrast. Hint: "you dragged both points up — pull the dark end DOWN" |
| **Channel-curve color grade** (R/G/B toggle on the same widget) | Adds teal to shadows + warmth to highlights | Per-channel curves shift color by tonal region |
| **White-balance dual-slider** (temp 3000–9000K + tint) | Drags to neutralize a gray card to a target | Temperature vs. tint are separable; raising Kelvin warms (the counterintuitive trap) |
| **HSL selective-color** (8 color-band rows) | Deepens the blue sky without shifting skin tones | Targeted hue/sat/luminance per color |
| **500-rule vs NPF comparator** (focal length / aperture / MP / sensor inputs + star field) | Adjusts inputs; both formulas compute live; stars smear past the limit | Why high-res modern sensors need shorter exposures |
| **Star-trail simulator** (exposure-time slider, per-star declination) | Drags exposure time; pinpoints rotate into arcs around the on-screen pole | 15°/hour; arc length scales with distance from the pole |
| **Stacking / SNR widget** (frames 1→300 + Bortle slider) | Adds frames to clean a grainy starfield; raises Bortle to wash out detail | SNR ~ √N; cities need many short subs |
| **Crop-factor framing visualizer** (nested sensor rectangles + DoF-equivalence panel) | Picks a sensor; sees the smaller frame and the FF-equivalent focal length + aperture | Crop factor multiplies focal length AND f-number |
| **Sensor-size noise demo** (sensor + ISO → simulated grain) | Matches noise levels across sensors using ISO × cropFactor² | Bigger photosites = cleaner images |
| **Radial / luminance masking lesson** | Drags a feathered radial mask and brightens only inside; uses a 0–30 luminance range to lift only shadows | Good editing is local, not global |

**Shared advanced architecture:** one reusable `ImageAdjustLayer` (canvas + per-pixel transform + optional alpha mask) and one reusable `DraggableGraph` (SVG points + spline) power the curve, channel-curve, and masking lessons; store each lesson's parameter set in Firebase and gate completion on a per-lesson validator.

---

## 4. MVP Scope Recommendation

### 4.1 The chapter: **"The Exposure Triangle — Get Off Auto"**

Build exactly one chapter, and make it the Exposure Triangle. This is not an arbitrary pick — it is the field's universally agreed-upon "Chapter 1," so it will feel authoritative to any photographer who evaluates the app. It is also the **single most simulatable concept in the browser**: a closed numeric system (integer-stop math → deterministic grading and precise hints) where each control produces an immediate, visible, animatable consequence (background blur, motion blur, grain, brightness). Polished web simulators (CameraSim, Canon's Exposure Simulator, dofsimulator.net) already prove the interaction model works; our differentiators are lesson-scoping, single-variable-at-a-time progression, mobile-first controls, wrong-answer guidance, and progress persistence — exactly what those standalone sandboxes lack.

Scope discipline: keep composition, lighting, and all advanced domains **out** of the MVP. The canonical order teaches exposure alone, first — depth over breadth.

### 4.2 Target persona

**The adult hobbyist stuck in Auto.** Well-documented across manual-mode guides: someone (~25–45 — new parent, traveler, recent mirrorless/DSLR buyer) who bought a good interchangeable-lens camera, settled for Auto because Manual is "intimidating," and is motivated to **get off Auto and understand their dials**. Tone should be reassuring, concrete, and goal-framed around manual control — not aimed at teens or pros. Aperture Priority is the field's recognized confidence-building transitional mode and a good framing device.

### 4.3 The 6 lessons, in order

Sequenced **isolate-one-variable-first, then integrate** — with aperture taught first because it has the most physically intuitive mechanic (the iris literally opening/closing, the eye-pupil analogy).

| # | Lesson | Core mechanic | What the learner should walk away with |
|---|---|---|---|
| 1 | **What Is Exposure?** | A "bucket/pupil fills with light" meter; one brightness slider to hit a target | Over- vs. under-exposed; brightness is the goal all three controls serve |
| 2 | **Aperture & Depth of Field** | Animated iris (pupil analogy) + slider f/1.4…f/16; background blur changes live | The counterintuitive inverse; "make the background blurry" / "keep everything sharp" |
| 3 | **Shutter Speed & Motion** | Moving subject + slider 1/1000…1/15; fast = frozen, slow = motion trail | "Freeze the action," then "blur the waterfall" |
| 4 | **ISO & Noise** | Dim scene + ISO slider 100…6400; brightens but adds an animated grain overlay | Brighten a night shot while keeping it "clean enough"; ISO is the last resort |
| 5 | **Stops — The Common Language** | Live meter; learner makes three *different* moves that each add exactly one stop | +1 stop of ISO, shutter, OR aperture brightens identically — the shared unit |
| 6 | **Equivalent Exposures — Your First Manual Decision** | Brightness LOCKED; a single "creative slider" trades aperture for shutter in equal/opposite stops while DoF and motion blur visibly trade off; capstone "shoot this sports scene" | Same brightness, different photo — the creative choice. The chapter's biggest "aha" and the strongest differentiator from a static text-and-quiz competitor |

### 4.4 Build & grading architecture (MVP)

- **One reusable `ExposureScene` component** rendering an SVG/canvas scene driven by `{ apertureStop, shutterStop, isoStop }`. Pure functions map: stop-sum → brightness multiplier; aperture index → background blur (SVG `feGaussianBlur` stdDeviation); shutter index → motion-blur trail length; ISO index → grain-overlay opacity. Every lesson reuses this one widget with different sliders enabled/locked. Asset-light, identical on mobile and desktop.
- **Deterministic grading:** each task is `{ targetEV, lockedSettings, goalProperty (shallowDOF | frozenMotion | cleanImage), tolerance }`. A submission is correct if `|EV − targetEV| ≤ tolerance` AND the goal condition holds.
- **Wrong-answer guidance from the same stop math:** if underexposed → "Your photo is N stops too dark — open the aperture, slow the shutter, or raise ISO." If brightness is right but the creative goal fails → axis-specific hint ("Bright enough, but the background is still sharp — open toward f/2.8").
- **Mobile-first controls:** large stepped sliders that snap to real stop values with the setting label on the thumb ("f/5.6", "1/250s", "ISO 400"), plus tap-to-step ±1-stop buttons; the scene sits above the controls for live feedback.
- **Defaults seed scenes at the taught "safe" baseline:** ISO 100, f/8, 1/125s — so changes are framed as deltas from a sensible correct photo, reducing overwhelm.
- **Firebase persistence:** Auth for login; Firestore doc per user `{ userId, chapter:'exposure-triangle', lessons:{ lessonId:{ status, attempts, bestStopError, completedAt } }, lastLessonId }`. Because correctness is computed from deterministic stop math, the only state to persist is per-lesson status + a resume pointer — lightweight and offline-tolerant. On resume, route to `lastLessonId` and restore checkmarks.
- **Keep OUT of the 4–7:** an Aperture-Priority-vs-Manual toggle and a free-play sandbox are good post-completion stretch rewards, but should not dilute the focused guided chapter.

### 4.5 Rationale, in one paragraph

The Exposure Triangle is simultaneously the field's canonical foundation, the most numerically tractable concept (every answer is integer-stop math, so grading and hints are objective), and the most visually rich (four independent animatable effects from three sliders on a single reusable scene). It maps perfectly onto a documented, motivated persona with a concrete goal ("get off Auto"). It de-risks the build (the simulator pattern is proven) while leaving clear room to out-differentiate existing sandboxes through guided, single-variable lessons with deterministic feedback and persistence. Composition, focus/metering, and the advanced domains are fully specified above and ready to become v2+ chapters once this MVP validates the interaction model.

---

## Sources

**Exposure triangle**
- https://photographylife.com/what-is-exposure-triangle
- https://fstoppers.com/education/exposure-triangle-understanding-how-aperture-shutter-speed-and-iso-work-together-72878
- https://fstoppers.com/education/can-we-just-kill-exposure-triangle-already-392790
- https://iceland-photo-tours.com/articles/photography-tutorials/the-exposure-triangle-aperture-iso-shutter-speed-explained
- https://www.icelandaurora.com/photo-tutorials/what-is-the-truth-behind-noise-high-iso/
- https://www.picturecorrect.com/iso-and-noise-explained-for-photographers/
- https://www.slrlounge.com/iso-aperture-shutter-speed-a-cheat-sheet-for-beginners/
- https://photographylife.com/what-is-iso-in-photography
- https://photographylife.com/what-is-depth-of-field
- https://digital-photography-school.com/understanding-depth-field-beginners/
- https://www.photopills.com/articles/depth-of-field-guide
- https://www.masterclass.com/articles/beginners-guide-to-exposure-triangle-in-photography
- https://www.adobe.com/creativecloud/photography/technique/motion-blur.html
- https://www.canon.ge/get-inspired/tips-and-techniques/capturing-motion/
- https://www.nikonusa.com/en/learn-and-explore/a/tips-and-techniques/capturing-or-freezing-motion-in-photos.html

**Canonical teaching order & MVP**
- https://www.studiobinder.com/blog/what-is-the-exposure-triangle-explained/
- https://petapixel.com/exposure-triangle/
- https://www.bhphotovideo.com/explora/photography/tips-and-solutions/understanding-exposure-part-1-the-exposure-triangle
- https://www.universalclass.com/i/course/photography101/syllabus.htm
- https://www.camerasim.com/original-camerasim
- https://niredonahue.com/beginners-exposure-triangle-photography-guide/
- https://www.digitalcameraworld.com/photography/photo-technique/im-a-photography-expert-heres-how-i-learned-the-exposure-triangle-and-how-i-use-it-to-shoot-in-manual-mode
- https://digital-photography-school.com/shoot-manual-mode-cheat-sheet-beginners/
- https://www.lightstalking.com/rule-of-equivalent-exposure/
- https://shootitwithfilm.com/understanding-reciprocal-exposures-and-the-exposure-triangle/
- https://dofsimulator.net/en/
- https://stowmarketanddistrictcameraclub.onesuffolk.net/assets/BSEPS/Basics-of-Photography-for-Beginners.pdf

**Composition**
- https://en.wikipedia.org/wiki/Rule_of_thirds
- https://photographylife.com/the-rule-of-thirds
- https://www.myposter.com/magazin/golden-ratio-photography/
- https://en.wikipedia.org/wiki/Lead_room

**Focus & metering**
- https://www.cambridgeincolour.com/tutorials/hyperfocal-distance.htm
- https://capturetheatlas.com/focus-modes/
- https://www.photoworkout.com/metering-modes/
- https://www.creative-photographer.com/exposure-lesson-5-read-camera-histogram/
- https://photographylife.com/hyperfocal-distance-explained
- https://photographylife.com/focus-and-recompose-technique
- https://fstoppers.com/education/heres-why-focusing-and-recomposing-photographs-fails-168567
- https://digital-photography-school.com/the-problem-with-the-focus-recompose-method/
- https://fstoppers.com/gear/what-exposure-compensation-actually-does-and-when-need-it-901069
- https://www.bhphotovideo.com/explora/photography/tips-and-solutions/how-to-expose-for-snow-properly
- https://digital-photography-school.com/how-to-read-and-use-histograms/
- https://www.photoblog.com/learn/photography-histogram/
- https://en.wikipedia.org/wiki/Hyperfocal_distance

**Advanced (editing / astro / sensors)**
- https://astrobackyard.com/the-500-rule/
- https://www.lightstalking.com/npf-rule/
- https://blog.frame.io/2017/09/20/beginners-guide-to-color-curves/
- https://earthsky.org/astronomy-essentials/what-are-star-trails/
- https://www.cambridgeincolour.com/tutorials/digital-camera-sensor-size.htm
- https://helpx.adobe.com/lightroom-classic/help/image-tone-color.html
- https://helpx.adobe.com/lightroom-classic/help/masking.html
- https://mastinlabs.com/blogs/photoism/how-to-use-luminosity-and-color-range-masks-in-lightroom
- https://www.digitalcameraworld.com/tutorials/photography-cheat-sheet-color-temperature-and-the-kelvin-scale
- https://photographylife.com/500-rule-vs-npf-rule
- https://northrup.photo/gear-basics/camera-body-features/sensor-size-crop-factor/
- https://fstoppers.com/education/understanding-how-sensor-size-affects-depth-field-312599