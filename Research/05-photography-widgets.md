# Interactive Photography Widget Catalog (Brilliant-style)

A catalog of browser-buildable interactive widgets that teach beginner photography hands-on: **you do something, you see the result instantly.** Each is grounded in research on existing simulators and Brilliant's design philosophy, with build-difficulty flags.

---

## Research foundation (what already exists, and why it works)

**CameraSim Exposure Contraption** — the standout reference for the exposure triangle. It deliberately rejects the static "triangle" diagram in favor of *a physical scale that literally balances light*. You adjust an external light source (bright daylight → dim indoor), then balance ISO ("a light multiplier"), aperture, and shutter speed; the scale **tips visibly**: balanced = correct exposure, tipped one way = overexposed, the other = underexposed (source: https://www.camerasim.com/exposure-contraption). This balance-as-physical-object metaphor is the single best idea to steal.

**CameraSim Original** — manipulates focal length, subject distance, a tripod toggle, and moving subjects, then renders a real photograph with improvement suggestions. Every setting was shot on a real Canon Rebel T4i + EF 16-35mm f/2.8L so results are physically accurate, not faked (source: https://www.adorama.com/alc/9-online-camera-simulators-to-help-your-photography-skill/, https://www.camerasim.com/original-camerasim).

**Canon "Outside of Auto" / Play** — three-stage progression: **Learn → Play → Challenge**. You manipulate aperture/shutter/ISO in Manual, Tv, or Av modes against a real scene, then *snap* and see the result; it explicitly frames exposure as "a balancing act between Aperture, Shutter Speed and ISO — if you change one, you might need to adjust the others" (source: https://www.canon.ca/CanonOutsideOfAuto/play, https://nofilmschool.com/2013/06/canon-virtual-dslr-site-basic-photography). The Learn→Play→Challenge arc maps perfectly onto Brilliant's pretest-then-discover model.

**DOF Simulator (dofsimulator.net)** — the depth-of-field gold standard. Separate sliders for sensor size, focal length, f-number, focus distance, and background distance. It renders human silhouettes at varying distances against a background photo with a depth scale in meters, and crucially applies blur *to the model itself* — "ears, nose and face are blurred depending on the calculated depth of field" — plus computed background-blur values and bokeh with selectable diaphragm-blade counts (source: https://dofsimulator.net/en/). It's more than a beginner needs, but the focus-plane visualization is the thing to borrow.

**Be The Camera (bethecamera.com)** — open-source realtime HTML5 simulator; lets you compare camera/lens tiers and see noise + bokeh differences (source: https://bethecamera.com/, https://www.adorama.com/alc/...). Useful proof that this class of widget is buildable in plain HTML5/canvas.

**Photography Mapped (photography-mapped.com/interact.html)** — dropdown-driven; outputs a generated photo with over/under-exposure, depth-of-field, and noise indicators (source: https://www.adorama.com/alc/...). (The page itself returned 403 to my fetch, so I'm relying on the Adorama summary rather than first-hand confirmation of its current UI.)

**Lens Field-of-View Sim (toolkitgen.com/tool/focal_length_sim)** — visualizes how focal length and sensor crop change framing for Full Frame / APS-C / MFT (source: https://toolkitgen.com/tool/focal_length_sim). **Crucial physics caveat from research:** *perspective compression is a function of distance, not focal length* — a 200mm lens just lets you stand farther away, and it's the distance that flattens the background (source: https://www.35mmc.com/24/08/2020/monkeying-around-with-focal-length-and-perspective-by-sroyon-mukherjee/, https://edwardpeck.com/2023/08/06/field-of-view-distortion-and-compression/). Any focal-length widget must separate these two or it will teach a popular myth.

**Brilliant's design DNA** (to make these *feel* like Brilliant, not like a calculator):
- Lessons "manipulate, experiment, and discover *why*… so the understanding actually sticks"; they **pretest before teaching** — let the learner try before revealing the procedure (source: https://nibble-app.com/blog/is-brilliant-worth-it).
- Each lesson = **one single concept**, with immediate feedback after every action (source: https://brilliant.org/help/using-brilliant/).
- Built with **Rive state machines** so interactions feel responsive and animated transitions between states need little engineering; celebrations are "seamlessly aligned" to the user's action, and paths are **color-coded by topic** (source: https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations).
- The ustwo redesign centered on "whimsical in-lesson flourishes that celebrate success" while striking "the right balance between fun and concentration," because "play can reduce the anxiety associated with tackling unfamiliar concepts" (source: https://ustwo.com/work/brilliant/).

**Design principles I'm carrying into every widget below:** one concept per widget; let the learner act *before* explaining; instant visual feedback on every drag; a tiny celebratory state-change at the "aha"; restrained, topic-color-coded palette; numbers visible but secondary to the picture.

---

## The widgets

Difficulty legend: 🟢 Easy (an afternoon: SVG/CSS + sliders) · 🟡 Medium (canvas/blur compositing or layered art) · 🔴 Hard (physically-accurate rendering or photo asset pipeline).

---

### 1. Aperture / f-stop

#### Widget 1A — "The Iris" (aperture → depth of field) 🟡
- **Teaches:** wide aperture (low f-number) = shallow depth of field / blurred background; narrow aperture (high f-number) = deep DOF / sharp throughout.
- **Manipulates:** one big slider labeled `f/1.4 … f/22`. Optional: a second control to set subject distance.
- **Sees in real time:** a scene with a clear foreground subject (a coffee cup, a face) and a busy background (string lights / foliage — chosen because bokeh reads beautifully there). As the slider moves toward f/1.4, the background **blurs and the highlights bloom into soft circles**; toward f/22 everything snaps sharp. A small mechanical iris graphic (overlapping aperture blades, SVG) opens and closes in sync — directly echoing DOF Simulator's selectable blade count and CameraSim's real bokeh (source: https://dofsimulator.net/en/).
- **Aha moment:** "The *smaller* number gives me the *blurrier*, more 'professional' background." The inverted f-number relationship is the #1 beginner stumbling block; coupling the shrinking aperture-blade animation to a *growing* blur makes the inversion physical.
- **Build notes:** Two approaches. Cheapest (🟢-leaning): pre-render 6–8 background images at increasing CSS `blur()` radii and cross-fade — but blur radius interpolates poorly. Better (🟡): canvas with a real Gaussian/stack blur on the background layer keyed to f-number, foreground kept crisp; fake bokeh by drawing soft radial-gradient discs where highlight pixels exceed a threshold. Truly accurate per-pixel circle-of-confusion is 🔴 and unnecessary for beginners.

#### Widget 1B — "Same brightness, different blur" (aperture's second job) 🟡
- **Teaches:** aperture controls *both* DOF *and* brightness, and the two are entangled.
- **Manipulates:** the same f-stop slider, but with a toggle: **"Auto-balance exposure: ON/OFF."**
- **Sees in real time:** with auto-balance OFF, opening up to f/1.4 blurs the background *and* blows the image bright; closing to f/22 makes it sharp *and* dark. With auto-balance ON, the shutter speed silently compensates so brightness stays constant while only the blur changes.
- **Aha moment:** "Aperture isn't just a 'blur knob' — it's also a 'brightness knob,' which is why I can't change it for free." This is the bridge into the exposure triangle.
- **Build notes:** Brightness is a cheap CSS/canvas `brightness()` multiplier layered on top of Widget 1A's blur engine, so build 1A first and 1B is mostly a toggle + linked counter-adjustment.

---

### 2. Shutter speed

#### Widget 2A — "Freeze or Flow" (shutter → motion blur) 🟡
- **Teaches:** fast shutter freezes motion; slow shutter creates motion blur / light trails.
- **Manipulates:** slider `1/4000s … 1s` (log scale). A scene picker helps: waterfall, runner, car at night, ceiling fan.
- **Sees in real time:** a looping animated subject. At 1/4000 a single crisp frame; as you slow down, the moving element **smears into a motion trail** (waterfall turns silky, car headlights stretch into ribbons, fan blades dissolve into a disc). A "shutter curtain" graphic flashes open for a duration proportional to the setting.
- **Aha moment:** "Motion blur is a *creative choice I dial in*, not a mistake." The silky-waterfall reveal is the delight beat — pure Brilliant "surprise and delight" (source: https://rive.app/blog/...).
- **Build notes:** 🟡. Honest approach: composite N sampled frames of the moving sprite with decreasing opacity, where N scales with exposure time (this *is* what motion blur physically is — accumulated light over time). Canvas with `globalAlpha` accumulation, or pre-render a few trail sprites and pick by shutter band. Animation state transitions are exactly what Rive-style state machines are for (source: https://rive.app/blog/...).

#### Widget 2B — "Shutter as a light valve" (shutter → brightness) 🟢
- **Teaches:** longer shutter = more light = brighter image.
- **Manipulates:** the shutter slider, motion held constant (static scene).
- **Sees in real time:** image brightness rises smoothly as the shutter slows; a filling "bucket of light" gauge fills proportionally to exposure time.
- **Aha moment:** "Time is one of the three ways to gather light." Pairs with 1B and 3B so all three triangle members are introduced as *light-gathering siblings*.
- **Build notes:** 🟢. Just a CSS `brightness()` multiplier + an SVG fill gauge. Trivial; build this early as a warm-up.

---

### 3. ISO

#### Widget 3A — "Turning up the gain" (ISO → brightness vs noise) 🟡
- **Teaches:** raising ISO brightens the image but adds grain/noise; it amplifies signal *and* noise.
- **Manipulates:** ISO slider `100 … 25600` (stops).
- **Sees in real time:** a dim indoor scene. Sliding ISO up brightens it, but past ~1600 visible **grain crawls in**, shadows get speckled and colors muddy. A 100% zoom-loupe inset magnifies a shadow patch so the noise is unmistakable (mirrors Be The Camera's noise comparison across gear tiers — source: https://bethecamera.com/).
- **Aha moment:** "ISO is free brightness — but I pay for it in grain." The loupe makes invisible noise visible; that's the whole lesson.
- **Build notes:** 🟡. Brightness = cheap multiply. Noise = canvas pixel pass adding Gaussian/random noise with amplitude scaling with ISO (concentrate it in the shadows for realism by weighting inversely to pixel luminance). The loupe is a second small canvas sampling a region at higher scale. Effective and not hard.

#### Widget 3B — "Why not always ISO 100?" (a constrained choice) 🟢
- **Teaches:** in low light you're *forced* to trade noise for a usable shutter speed.
- **Manipulates:** a single goal — "get a sharp handheld shot of this dim room" — with ISO and shutter linked.
- **Sees in real time:** keep ISO 100 → shutter must crawl to 1/4s → handheld shake blur. Raise ISO → shutter speeds up → sharp, but grainy.
- **Aha moment:** "There's no free lunch — every setting forces a compromise somewhere." This is the emotional setup for the triangle.
- **Build notes:** 🟢 once 3A and 2A exist; it's a scripted scenario reusing their renderers.

---

### 4. The exposure triangle (the centerpiece)

#### Widget 4A — "The Light Balance" (the balancing act) 🟡 — *the hero widget*
- **Teaches:** exposure stays constant if you compensate one setting when you change another; the three settings are interchangeable stops of light with *different side effects*.
- **Manipulates:** three draggable sliders (aperture, shutter, ISO), each marked in **stops**, plus an ambient-light control (daylight → dim). Directly modeled on the CameraSim Exposure Contraption (source: https://www.camerasim.com/exposure-contraption) and Canon's "change one, adjust the others" framing (source: https://www.canon.ca/CanonOutsideOfAuto/play).
- **Sees in real time:** a **physical balance scale / seesaw** as the central visual. Available light sits on one pan; your three settings (as stacked weights) on the other. Move aperture up a stop and the beam tilts toward overexposure (and the preview photo blows out + the background sharpens); the learner must drag another slider down a stop to re-level the beam. When balanced, the beam locks level with a satisfying snap and the photo reads "correctly exposed." The preview *also* shows the side-effects changing even when brightness doesn't (blur, motion, grain all shift).
- **Aha moment:** "I changed the look completely — but the *brightness never moved*." Seeing identical exposure with wildly different blur/motion/grain is the core insight of the whole course. The tilting beam makes "one stop up here = one stop down there" viscerally obvious (the Contraption's exact thesis — source: https://www.camerasim.com/exposure-contraption).
- **Build notes:** 🟡. The physics is simple arithmetic: exposure value `EV = log2(aperture²) + log2(1/shutter) − log2(ISO/100)`; keep total constant and the beam reads the delta from target. The scale is SVG with a rotation transform driven by EV error — cheap and expressive. The preview reuses the blur (1A), motion (2A), and noise (3A) engines, so **build the four single-concept widgets first, then compose them here.** That composition is the only moderately tricky part.

#### Widget 4B — "Reciprocity puzzle" (a Brilliant-style challenge) 🟢
- **Teaches:** equivalent exposures — many setting combinations give the same brightness.
- **Manipulates:** given a "correct" baseline, the learner is challenged: "Keep the same brightness but **freeze the bird**" → they must trade stops correctly (faster shutter, so open aperture or raise ISO to match).
- **Sees in real time:** instant pass/fail — beam levels and a checkmark celebration when the math balances and the goal (frozen bird) is met; otherwise the photo is wrong-brightness or still blurry.
- **Aha moment:** "I can *target a look* and back into the settings." This is Brilliant's Challenge tier (Canon's Learn→Play→**Challenge** arc — source: https://nofilmschool.com/2013/06/...) and its pretest-before-procedure philosophy (source: https://nibble-app.com/blog/is-brilliant-worth-it).
- **Build notes:** 🟢 as a thin scenario layer over 4A.

---

### 5. Metering / correct exposure (histogram)

#### Widget 5A — "Read the Mountain" (live histogram) 🟡
- **Teaches:** the histogram maps tones left (shadows) → right (highlights); a shoved-left graph = underexposed, shoved-right = overexposed; spikes against either wall = **clipping** (lost detail) (source: https://digital-photography-school.com/how-to-read-and-use-histograms/, https://capturetheatlas.com/how-to-read-a-histogram-in-photography/).
- **Manipulates:** a single exposure slider (or reuse the triangle).
- **Sees in real time:** the photo brightens/darkens while a **live histogram slides left/right beneath it**. When highlights clip, those blown areas **flash red** on the photo and a spike pins to the histogram's right wall; crushed shadows **flash blue** and pin left — exactly the clipping-preview convention from the research (source: https://photofocus.com/software/how-to-read-a-histogram-underexposed-overexposed-or-just-right/).
- **Aha moment:** "The graph isn't abstract — that red blinking sky *is* the spike hitting the wall." Linking the on-photo clipping warning to the histogram edge is the lesson.
- **Build notes:** 🟡. Computing a real histogram from canvas pixels is straightforward (`getImageData`, bucket luminance into 256 bins, draw as bars). Clipping overlay = mark pixels at 0 or 255. Genuinely buildable and very satisfying.

#### Widget 5B — "Just Right?" (metering judgment) 🟢
- **Teaches:** there's a target exposure, and the meter needle / "0 EV" is the goal — but tricky scenes (snow, backlight) fool the meter.
- **Manipulates:** drag exposure to center a meter needle at "0"; then a snow scene reveals that "0" actually looks gray, so you must over-expose to make snow white.
- **Aha moment:** "The meter is a *suggestion*, not the truth." A sophisticated beat that rewards replay.
- **Build notes:** 🟢, layered on 5A's renderer plus a needle SVG.

---

### 6. Composition — Rule of Thirds

#### Widget 6A — "Drag to the Power Points" 🟢 — *easiest delightful win*
- **Teaches:** placing the subject on a thirds-line intersection ("power point") is more dynamic than dead-center (source: https://digital-photography-school.com/rule-of-thirds/, https://ixdf.org/literature/article/rule-of-thirds-examples).
- **Manipulates:** **drag** the subject (a hot-air balloon, a lone tree) anywhere on a photo; a 3×3 grid overlays the frame.
- **Sees in real time:** the four intersection points glow faintly; as the dragged subject nears one, it **snaps with a soft magnetic pull**, the point lights up, and a "composition score" / tasteful checkmark appears. Drag back to center and the frame feels static — a subtle "meh" state (greyed grid) communicates it without scolding.
- **Aha moment:** "Off-center just *looks better* — and now I feel the pull." The magnetic snap *is* the teaching; it trains the eye kinesthetically.
- **Build notes:** 🟢. Pure SVG/CSS: a draggable element, a static grid overlay, distance-to-nearest-intersection math for snap + glow. No rendering pipeline. **Build this first as the morale-boosting proof of concept.** Drag-snap-celebrate is textbook Brilliant "celebration aligned to the user's action" (source: https://rive.app/blog/...).

#### Widget 6B — "Horizon & headroom" (lines on thirds) 🟢
- **Teaches:** put horizons on the upper/lower third (not the middle); leave looking-room/headroom.
- **Manipulates:** drag the horizon line up/down; drag a portrait subject's eye-line.
- **Sees in real time:** centered horizon = "static" tag; horizon on lower third = sky-dominant "open" feel with a thumbs-up; eyes on the upper-third line lights up.
- **Aha moment:** "Where I put the *line* matters as much as where I put the *subject*."
- **Build notes:** 🟢, same engine as 6A.

---

### 7. Focal length / zoom

#### Widget 7A — "Zoom vs. Field of View" 🟡
- **Teaches:** longer focal length = narrower field of view = more magnification (source: https://toolkitgen.com/tool/focal_length_sim).
- **Manipulates:** focal-length slider `16mm … 400mm`; optional sensor-size toggle (FF / APS-C / MFT) to show crop factor.
- **Sees in real time:** a wide master scene with a **crop rectangle that shrinks and enlarges** as focal length climbs, and a live preview of just that crop filling the frame. The sensor toggle shows the crop box jump (APS-C ≈ 1.5×) for the same lens.
- **Aha moment:** "Zooming is just *cropping into a wider view* — and a crop sensor crops it further." Demystifies "equivalent focal length."
- **Build notes:** 🟡-leaning-🟢 if you cheat with one ultra-wide high-res source image and CSS-crop/scale into it. A genuine multi-photo asset set (à la CameraSim's real-shot library — source: https://www.camerasim.com/original-camerasim) is 🔴 in effort but most realistic.

#### Widget 7B — "The Compression Myth" (perspective vs. focal length) 🔴 — *highest payoff, hardest to do right*
- **Teaches:** background "compression" comes from **camera distance, not focal length** — telephoto only *lets* you stand farther back (source: https://www.35mmc.com/24/08/2020/monkeying-around-with-focal-length-and-perspective-by-sroyon-mukherjee/, https://edwardpeck.com/2023/08/06/field-of-view-distortion-and-compression/).
- **Manipulates:** a **single linked control** that simultaneously walks the camera backward *and* zooms in to keep the subject the *same size* in frame (the dolly-zoom rig — source: https://en.wikipedia.org/wiki/Dolly_zoom). Plus a "decouple" toggle to cheat and see them separately.
- **Sees in real time:** the subject stays a constant size while the **background dramatically grows and flattens** as you back away + zoom in (and looms/recedes when decoupled) — the Vertigo effect. A bird's-eye mini-map shows the camera physically moving back.
- **Aha moment:** "It was never the lens — it was *where I stood*." This corrects the most pervasive beginner/intermediate myth; almost no beginner tool nails it, so it's a genuine differentiator.
- **Build notes:** 🔴. Honest version needs either a 3D scene (Three.js — the dolly-zoom-in-Three.js pattern is documented: https://medium.com/@gianluca.lomarco/from-perspective-to-orthographic-camera-in-three-js-with-dolly-zoom-vertigo-effect-96de89c3a07b) or a captured photo sequence at matched subject-size. A 2D parallax-layer fake (foreground fixed, background scaled per distance) is a 🟡 approximation that conveys 80% of the insight at 20% of the cost — recommended starting point.

---

## Build-order recommendation (easiest → hardest, dependency-aware)

| Order | Widget | Difficulty | Why this order |
|---|---|---|---|
| 1 | **6A Drag to Power Points** | 🟢 | Pure SVG/CSS, no render pipeline — fastest delightful win to validate the feel. |
| 2 | **2B Shutter light-valve**, **3B ISO forced-choice**, **6B Horizon** | 🟢 | Brightness multiplier + gauges; reuse 6A engine. |
| 3 | **1A The Iris**, **2A Freeze or Flow**, **3A Turning up the Gain** | 🟡 | Build the three core render engines (blur / motion-accumulation / noise). Everything else composes from these. |
| 4 | **1B**, **5A Read the Mountain**, **5B**, **7A Zoom vs FOV** | 🟡 | Layer toggles, histogram, and crop on the engines above. |
| 5 | **4A The Light Balance** + **4B Reciprocity puzzle** | 🟡 | The hero widget — only buildable cleanly once 1A/2A/3A engines exist to feed its preview. |
| 6 | **7B The Compression Myth** | 🔴 | Save for last; ship a 2D parallax approximation first, upgrade to Three.js dolly-zoom later. |

**Hardest to do *well*:** 7B (compression — needs 3D or matched photo sequence to be honest) and 1A bokeh (real circle-of-confusion). **Easiest delightful:** 6A and 2B. **Highest teaching ROI relative to effort:** 4A (the balance scale) and 5A (live clipping histogram).

---

## Sources

- CameraSim Exposure Contraption — https://www.camerasim.com/exposure-contraption
- CameraSim Original — https://www.camerasim.com/original-camerasim
- Canon "Outside of Auto" / Play — https://www.canon.ca/CanonOutsideOfAuto/play ; https://nofilmschool.com/2013/06/canon-virtual-dslr-site-basic-photography ; https://www.popphoto.com/news/2013/04/canons-outside-auto-lets-you-play-virtual-dslr/
- 9 Online Camera Simulators (Adorama) — https://www.adorama.com/alc/9-online-camera-simulators-to-help-your-photography-skill/
- DOF Simulator — https://dofsimulator.net/en/
- Be The Camera (open-source HTML5) — https://bethecamera.com/
- Andersen Images Exposure Simulator — http://www.andersenimages.com/tutorials/exposure-simulator/
- Photography Mapped — https://photography-mapped.com/interact.html (note: returned HTTP 403 to my fetch; mechanics here are from the Adorama summary, not first-hand verification)
- Lens Field-of-View Sim — https://toolkitgen.com/tool/focal_length_sim
- Focal length vs. perspective (compression myth) — https://www.35mmc.com/24/08/2020/monkeying-around-with-focal-length-and-perspective-by-sroyon-mukherjee/ ; https://edwardpeck.com/2023/08/06/field-of-view-distortion-and-compression/
- Dolly zoom (Vertigo effect) — https://en.wikipedia.org/wiki/Dolly_zoom ; Three.js dolly-zoom implementation — https://medium.com/@gianluca.lomarco/from-perspective-to-orthographic-camera-in-three-js-with-dolly-zoom-vertigo-effect-96de89c3a07b
- Histograms / clipping — https://digital-photography-school.com/how-to-read-and-use-histograms/ ; https://capturetheatlas.com/how-to-read-a-histogram-in-photography/ ; https://photofocus.com/software/how-to-read-a-histogram-underexposed-overexposed-or-just-right/
- Rule of thirds — https://digital-photography-school.com/rule-of-thirds/ ; https://ixdf.org/literature/article/rule-of-thirds-examples
- Brilliant design philosophy — https://nibble-app.com/blog/is-brilliant-worth-it ; https://brilliant.org/help/using-brilliant/ ; https://ustwo.com/work/brilliant/ ; https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations

**Verification caveats:** Specifics for the Exposure Contraption and Photography Mapped come from their description pages / the Adorama roundup rather than hands-on inspection (the Contraption page describes its concept without exposing full UI code; Photography Mapped's interact page blocked automated fetch). Brilliant uses Rive state machines and color-coded, single-concept lessons per its own/partner write-ups; I did not find a public Brilliant photography course, so the "Brilliant-style" framing is an application of its documented design principles, not a claim that such a course exists.