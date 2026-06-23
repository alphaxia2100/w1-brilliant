I now have everything needed: the physics, the math, the format/CoC nuance, the gold-standard explainers, and the learning-science principles. Here is the research report.

---

# Teaching Depth of Field and Basic Lens Optics Interactively

A research brief covering (1) the four factors that control DoF and how each changes the blur, (2) the standard side-view lens diagram, (3) the best existing interactive explainers and what makes them work, and (4) concrete, buildable widget designs for a 2D/SVG canvas.

---

## 1. The physics: what DoF actually is

Depth of field (DoF) is **the range of subject distances that appears acceptably sharp** in the final image. Sharpness falls off gradually, not abruptly — there is a single plane of perfect focus and a zone around it that the eye cannot distinguish from sharp (source: https://www.cambridgeincolour.com/tutorials/depth-of-field.htm).

The whole concept rests on one geometric idea: a lens focuses a point in the scene to a point only if that point sits exactly on the **focal plane**. Points nearer or farther project not to a point on the sensor but to a small **disc** — the blur spot. When that disc is small enough that a viewer perceives it as a point, the subject is "in focus." The threshold disc diameter is the **circle of confusion (CoC)** (source: https://leimao.github.io/blog/Depth-of-Field/).

So DoF = the span of distances over which the blur disc stays smaller than the CoC. Every "factor" below is just a lever on how fast the blur disc grows as you move away from the focal plane, or on how big a disc the viewer tolerates.

### The governing equations (worth showing learners as the "engine")

Thin-lens equation (the root of everything):
$$\frac{1}{f} = \frac{1}{u} + \frac{1}{v}$$
where f = focal length, u = subject (object) distance, v = image distance (source: https://leimao.github.io/blog/Depth-of-Field/).

Near and far limits of acceptable focus (N = f-number, c = CoC, u = focus distance):
$$u_{near} = \frac{f^2 u}{f^2 + cN(u-f)}, \qquad u_{far} = \frac{f^2 u}{f^2 - cN(u-f)}$$

Total DoF, and the useful simplified form valid when the subject is much closer than the hyperfocal distance:
$$\text{DOF} = u_{far} - u_{near} \approx \frac{2u^2 N c}{f^2}$$
This single approximation is the best teaching tool of all: it shows DoF grows with the **square of distance** (u²), grows linearly with **f-number** (N) and **CoC** (c), and shrinks with the **square of focal length** (f²) (source: https://leimao.github.io/blog/Depth-of-Field/; source: https://en.wikipedia.org/wiki/Depth_of_field).

Hyperfocal distance (the focus distance that makes everything from H/2 to infinity sharp):
$$H = \frac{f^2}{Nc} + f \approx \frac{f^2}{Nc}$$
Focus at H and the near limit becomes H/2 and the far limit becomes ∞ (source: https://en.wikipedia.org/wiki/Hyperfocal_distance; source: https://nationalcalculatorauthority.com/hyperfocal-distance-calculator).

---

## 2. The FOUR factors and how each changes the blur

### Factor 1 — Aperture (f-number N)
- **Effect:** Wider aperture (smaller f-number, e.g. f/1.8) → **shallower** DoF. Narrower aperture (larger f-number, e.g. f/16) → **deeper** DoF (source: https://www.cambridgeincolour.com/tutorials/depth-of-field.htm).
- **Why (the blur mechanism to animate):** The aperture is the base of the light cone converging onto the sensor. A wide aperture is a fat cone, so just behind/in front of focus the cone has already spread into a large disc. A narrow aperture is a skinny cone that stays under the CoC over a much longer span. DoF is directly proportional to N in the simplified equation (source: https://leimao.github.io/blog/Depth-of-Field/).
- **This is the cleanest factor to teach first** because changing it does *not* change framing — only blur — so cause and effect are isolated.

### Factor 2 — Subject-to-camera distance (u)
- **Effect:** Closer subject → **shallower** DoF; farther subject → **deeper** DoF. This is the strongest lever of all because DoF scales with **u²** (source: https://leimao.github.io/blog/Depth-of-Field/).
- **Why:** Move closer and the cone geometry behind the subject diverges much faster relative to the subject; the blur disc crosses the CoC threshold over a tiny distance span.
- **Asymmetry to teach:** DoF is *not* centered on the subject. The zone behind the subject is always larger than the zone in front. At normal distances this is the familiar "roughly 1/3 in front, 2/3 behind"; the ratio runs from 1:1 at extreme macro toward 1:∞ at the hyperfocal distance (source: https://en.wikipedia.org/wiki/Depth_of_field).

### Factor 3 — Focal length (f) — teach this carefully, it is the famous trap
- **Naive effect:** From a *fixed camera position*, a longer lens (e.g. 200mm) gives visibly **shallower** DoF than a short lens (e.g. 24mm); DoF goes as 1/f² (source: https://leimao.github.io/blog/Depth-of-Field/).
- **The nuance that distinguishes a correct explainer from a wrong one:** "focal length actually has no impact on actual depth of field… contrary to popular belief" *when you keep the subject the same size in the frame*. If you back up with the long lens so the subject fills the frame the same way (constant magnification), the total DoF is **virtually identical** across focal lengths at the same f-number (source: https://photographylife.com/depth-of-field-myths-the-biggest-misconceptions; source: https://www.cambridgeincolour.com/tutorials/depth-of-field.htm). Formally, "for a given size of the subject's image in the focal plane, the same f-number on any focal length lens will give the same depth of field" — what matters is the ratio u/f, i.e. **magnification** (source: https://en.wikipedia.org/wiki/Depth_of_field).
- **Why long lenses still *look* shallower:** they magnify the background, enlarging the already-out-of-focus blur discs, so the *background* looks more dissolved even though the in-focus zone depth is the same (source: https://photographylife.com/depth-of-field-myths-the-biggest-misconceptions).
- **Teaching consequence:** A good widget must let learners toggle between "fixed position" and "constant framing (re-frame)" modes — otherwise it will teach the myth. This is the single highest-value pedagogical decision in the whole topic.

### Factor 4 — Sensor / format size (via the circle of confusion)
- **CoC is set by the format.** The acceptable blur on the sensor must enlarge to a fixed acceptable blur in the final viewed print, so smaller sensors get a smaller CoC. The standard rule is **CoC ≈ diagonal / 1500** (cinema/photo standard) or the Zeiss **d/1730**. For full-frame (43.3 mm diagonal) that's ~**0.029 mm** (d/1500) or ~0.025 mm (Zeiss); APS-C is roughly **0.018–0.020 mm** (source: https://www.toolsforfilm.com/tools/circle-of-confusion; source: https://www.watchprosite.com/photography/using-the-zeiss-formula-to-understand-the-circle-of-confusion/1278.1127636.8608906/).
- **The counterintuitive truth (another myth-trap):** holding focal length and aperture fixed, a *smaller* sensor gives *shallower* DoF, because the smaller CoC tolerates less blur (source: https://en.wikipedia.org/wiki/Depth_of_field). But that is not how people shoot. In practice you change lens/distance to keep the same field of view, and then **larger formats give shallower DoF** for the same picture — the everyday "full-frame has more background blur than a phone" experience. The correct statement: "if focal length adjusts to maintain the original field of view while keeping aperture constant, DOF" changes with format because of the CoC and required magnification (source: https://en.wikipedia.org/wiki/Depth_of_field).
- **Teaching consequence:** Format belongs in the model as *the thing that sets CoC and required reframing*, not as an independent blur knob. Pair it with an "equivalent picture" mode just like focal length.

**Summary table to put in the widget UI:**

| Change | DoF | Scaling in DOF ≈ 2u²Nc/f² | Teaching caveat |
|---|---|---|---|
| Open aperture (smaller N) | shallower | ∝ N | cleanest, no reframing |
| Move closer (smaller u) | shallower | ∝ u² (strongest) | zone is ~1/3 front, 2/3 back |
| Longer focal length (fixed spot) | shallower | ∝ 1/f² | *vanishes* if you reframe to same magnification |
| Larger format (same picture) | shallower | via larger c + reframing | counterintuitive at fixed f & N |

---

## 3. The standard side-view lens diagram

Every credible explainer draws the same canonical side view along the optical axis. From left to right:

1. **Subject / object** as a point or arrow at distance **u** from the lens, on the **optical axis** (horizontal centerline).
2. **The light cone:** rays leave the subject point, fill the full **aperture** (the lens diameter actually used), and converge on the far side. The base of the cone = aperture; its half-angle controls how fast blur grows (source: https://leimao.github.io/blog/Depth-of-Field/; source: https://www.imajtrek.com/new_page_10.htm).
3. **The lens** (a vertical lens-shaped symbol) at the origin, with **focal points F** marked at distance f on each side.
4. **The sensor / image plane** at image distance **v** on the right, where the cone tip lands. If the subject is on the focal plane, the cone converges exactly to a point on the sensor; otherwise it lands as a disc — the **blur spot**.
5. **The focal plane** (the in-focus plane in object space) and, bracketing it, the **near limit** and **far limit** of acceptable focus — two vertical lines. Everything between them is "the depth of field." Show them **asymmetric**: nearer to the subject in front, farther behind (source: https://en.wikipedia.org/wiki/Depth_of_field).
6. **Two extra cones (the money shot):** draw the cone from a near point and from a far point. Each forms a blur disc on the sensor. The near/far limits are exactly where those discs equal the **circle of confusion** drawn as a small reference segment on the sensor (source: https://leimao.github.io/blog/Depth-of-Field/).

This single annotated diagram contains all four factors: aperture = cone width; distance = where the subject sits; focal length = where F and the convergence are; CoC = the tolerance segment on the sensor whose size is set by format.

---

## 4. Existing interactive explainers to emulate, and why they work

### A. Bartosz Ciechanowski — "Cameras and Lenses" (the gold standard)
URL: https://ciechanow.ski/cameras-and-lenses/
- **Progressive scaffolding:** photons → pinhole camera → single lens → aperture → focus → depth of field/bokeh. Each section reuses the previous mental model rather than introducing isolated facts (source: https://ciechanow.ski/cameras-and-lenses/).
- **Many small, single-variable demos** rather than one big control panel. A pinhole demo varies only pinhole diameter and sensor distance; a lens demo varies only focal length; a DoF demo varies aperture and object distance. This isolates cause and effect.
- **Animated ray tracing + draggable 3D view** ("drag around the demo to see it from other directions") so learners connect the abstract side-view rays to a physical 3D scene.
- Praised as "among the best examples of their type"; readers finish able to reason about aperture and DoF (source: https://flowingdata.com/2020/12/08/interactive-explainer-for-how-cameras-and-lenses-work/; source: https://petapixel.com/2020/12/23/this-page-is-a-fantastic-primer-on-how-cameras-and-lenses-work/).
- **Emulate:** the "one concept, one demo, one or two sliders" decomposition; ray animation; the build-up sequence.

### B. DOFSimulator.net (the best dedicated DoF tool)
URL: https://dofsimulator.net/en/
- **Real-time coupled views:** a **side-view diagram** (camera, subject, background, trees, human figures to scale, DoF zone shaded) sits next to a **resulting sample photo** that re-blurs live as you drag. Changing any control updates both simultaneously — direct manipulation with immediate feedback (source: https://dofsimulator.net/en/; source: https://nofilmschool.com/2015/03/learn-power-depth-field-free-online-simulator).
- **Controls map exactly to the four factors:** aperture (f-number), focal length, **sensor size (camera database)**, subject distance, plus background distance and framing.
- **Numeric readouts:** total DoF range, near/far limits, **CoC value**, **hyperfocal distance**, diffraction warning at small apertures, and a blur-in-megapixels figure.
- **Basic vs Advanced modes** = progressive disclosure (hide complexity until asked).
- **Emulate:** the side-diagram + sample-image pairing; the live numeric panel; basic/advanced toggle.

### C. PhET "Geometric Optics" (the physics-classroom standard)
URL: https://phet.colorado.edu/en/simulations/geometric-optics
- Draggable object and screen; adjustable focal length, index of refraction, radius of curvature; live refracted rays and image formation. Built on PhET's research-backed design: "intuitive controls such as sliders and click-and-drag manipulation" with "repeated manipulations and observations" (source: https://phet.colorado.edu/en/simulations/geometric-optics; source: https://phet.colorado.edu/assets/virtual-workshop/Active_Learning_with_PhET.pdf).
- **Emulate:** draggable scene objects (don't make everything a slider); choosing a concrete icon (pencil, penguin) as the "object" lowers the abstraction barrier.

### D. Canon "Outside of Auto" exposure simulator (beginner framing)
URL: https://www.canon.ca/CanonOutsideOfAuto/play
- Shows aperture changing both exposure *and* DoF; **saves the last three shots side-by-side** for comparison; on-screen exposure meter mimics a real camera (source: https://www.canon.ca/CanonOutsideOfAuto/play; source: https://www.adorama.com/alc/9-online-camera-simulators-to-help-your-photography-skill/).
- **Emulate:** the "pin/compare last N shots" pattern — a powerful way to make a change *legible* by contrast.

### What the learning-science literature says these tools get right
- **Direct manipulation + immediate visual feedback** keeps a "continuous flow of interaction" and aids comprehension (source: https://arxiv.org/pdf/1908.00679).
- **Immediate feedback beats delayed feedback** for germane (useful) cognitive load and achievement (source: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8696276/).
- **Minimize extraneous load via progressive disclosure**, clear visual hierarchy, and removing clutter; add interactivity (zoom/filter/drill-down) without crowding the main view (source: https://datafloq.com/how-cognitive-load-impacts-data-visualization-effectiveness/; source: https://www.turningdataintowisdom.com/content/files/2025/05/data-visualization-design-guide-1.html).
- **Mayer's multimedia principles** — coherence, signaling, **spatial contiguity** (put labels next to the thing they describe) — apply directly: keep the readout next to the diagram element it explains (source: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12668483/).
- **"Minimal but non-zero" guidance** maximizes engagement; let learners explore but seed them with prompts/challenges (source: https://phet.colorado.edu/assets/virtual-workshop/Active_Learning_with_PhET.pdf; source: https://arxiv.org/pdf/1607.04588).

---

## 5. Concrete, buildable widget designs (2D / SVG canvas)

A shared three-panel layout works for all of these and is implementable with plain SVG + a little JS. The three panels stay coupled by one shared state object `{f, N, u, sensorDiagonal, bgDistance}` and a single `recompute()` that drives all panels on every slider input.

```
┌──────────────────────────────────────────────────────────────┐
│  CONTROLS (sliders)        │  SIDE-VIEW DIAGRAM (SVG)          │
│  Aperture  N  f/1.4 ─●──   │   subject  lens  sensor           │
│  Distance  u  1.5 m ──●─   │      •====[ ]====| <- cones+DoF   │
│  Focal len f  50mm ─●──    │   [near|========|far] shaded      │
│  Format    [FF ▾]          │                                   │
│  Mode  ◉ fixed spot        ├───────────────────────────────────┤
│        ○ same framing      │  RESULT IMAGE (SVG, live blur)    │
│  READOUTS: DoF 0.21 m      │   sharp subject + blurred bg      │
│  near 1.43 / far 1.64      │                                   │
│  CoC 0.029mm  H 60 m       │                                   │
└──────────────────────────────────────────────────────────────┘
```

### Core math to wire in (all four factors live here)
```js
// units: mm internally, display in m where natural
const c = sensorDiagonal / 1500;            // circle of confusion (d/1500)
const H = (f*f)/(N*c) + f;                   // hyperfocal distance
const uNear = (f*f*u) / (f*f + c*N*(u - f)); // near limit
const uFar  = (f*f*u) / (f*f - c*N*(u - f)); // far limit (→∞ if denom<=0)
const dof   = uFar - uNear;
// background blur disc diameter on sensor for an object at distance s:
// (drives the result-image blur radius)
const blur = (f*f / (N*(u - f))) * Math.abs(s - u) / s;
```
Sources for these formulas: https://leimao.github.io/blog/Depth-of-Field/ ; https://en.wikipedia.org/wiki/Depth_of_field ; https://en.wikipedia.org/wiki/Hyperfocal_distance ; CoC rule https://www.toolsforfilm.com/tools/circle-of-confusion.

### Widget 1 — "The Light Cone" (teach the mechanism first; one factor at a time)
- SVG side view: optical axis as a horizontal line; subject point on the left; lens as an ellipse at center with focal points F marked; sensor as a vertical bar on the right.
- Draw **three cones** in three colors: from the subject (converges to a point on the sensor), from a near point, and from a far point (each lands as a disc). Draw the **CoC** as a fixed short segment on the sensor.
- **Only two controls:** aperture slider (changes cone fatness) and a draggable subject (changes u). As the discs grow past the CoC segment, shade the near/far limits in object space red.
- Pedagogy: isolates the blur-disc-vs-CoC idea — the conceptual heart — before any numbers (mirrors Ciechanowski's single-variable demos).

### Widget 2 — "Four Factors Playground" (the DOFSimulator-style coupled trio)
- Full three-panel layout above. Sliders for N, u, f; dropdown for format (FF / APS-C / m43 / phone, which sets `sensorDiagonal` and thus `c`).
- **Side-view panel:** shade the DoF zone between `uNear` and `uFar`; mark the subject; show the asymmetry (more zone behind). Put each readout *next to* its diagram element (spatial contiguity): CoC label on the sensor, near/far labels on the limit lines.
- **Result-image panel:** a simple SVG scene — a sharp subject card plus several background shapes (circles/letters) whose Gaussian-blur `stdDeviation` is set by the `blur(s)` formula per object. Use SVG `<feGaussianBlur>` driven live. Render bokeh as discs so wide apertures show classic out-of-focus highlights.
- **The myth-proofing toggle (critical):** a radio switch `fixed spot` vs `same framing`. In `same framing`, when f or format changes, automatically adjust u to hold magnification (`m = f/(u−f)` constant) and rescale the result image so the subject stays the same size. Learners then *see* that DoF barely moves with focal length under constant framing — teaching the correct concept, not the myth (source: https://photographylife.com/depth-of-field-myths-the-biggest-misconceptions; source: https://en.wikipedia.org/wiki/Depth_of_field).
- Progressive disclosure: hide format, hyperfocal, and diffraction warning behind an "Advanced" expander (Basic/Advanced like DOFSimulator).

### Widget 3 — "Compare Shots" (make change legible by contrast)
- Borrow Canon's pin pattern: a "Pin this shot" button snapshots the current result image + its settings into a strip of up to 3 thumbnails. Learners flip aperture from f/1.8 to f/16, pin each, and see the DoF zone and background blur side by side with the numeric DoF underneath each (source: https://www.canon.ca/CanonOutsideOfAuto/play).

### Widget 4 — "Hyperfocal challenge" (guided, minimal-but-non-zero guidance)
- Same engine, but a task prompt: "Make the fence (3 m) AND the mountains (∞) both sharp." A live check turns green when `uNear ≤ 3 m` and `uFar = ∞`, nudging learners to discover focusing at H. Provides the light guidance the research recommends (source: https://phet.colorado.edu/assets/virtual-workshop/Active_Learning_with_PhET.pdf).

### Implementation notes / correctness guardrails
- **Use `<input type="range">` for sliders, draggable `<circle>`/`<rect>` for scene objects** (PhET-style direct manipulation) — don't force everything into sliders (source: https://arxiv.org/pdf/1908.00679).
- **Update both diagram and image on every `input` event** (not `change`) for immediate feedback (source: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8696276/).
- **Handle `uFar = ∞`:** when `f² − cN(u−f) ≤ 0`, the far limit is infinity — clamp the diagram arrow to the edge and label it "∞."
- **Keep aperture as a stepped slider on real f-stops** (1.4, 2, 2.8, 4, 5.6, 8, 11, 16) so the steps match photography reality.
- **Always show the CoC explicitly** and tie it to the format dropdown; this is what makes the fourth factor honest rather than hand-wavy.
- **Label units and put numbers beside their geometry** (spatial contiguity), and keep one consistent color per factor across all three panels (consistency reduces load) (source: https://www.turningdataintowisdom.com/content/files/2025/05/data-visualization-design-guide-1.html).

---

## Key sources

- Cambridge in Colour — DoF tutorial: https://www.cambridgeincolour.com/tutorials/depth-of-field.htm
- Lei Mao — DoF math (thin lens, near/far, DOF derivation): https://leimao.github.io/blog/Depth-of-Field/
- Wikipedia — Depth of field (sensor size, magnification, asymmetry, CoC standards): https://en.wikipedia.org/wiki/Depth_of_field
- Wikipedia — Hyperfocal distance: https://en.wikipedia.org/wiki/Hyperfocal_distance
- Photography Life — DoF myths (focal length / sensor nuance): https://photographylife.com/depth-of-field-myths-the-biggest-misconceptions
- Tools for Film — Circle of confusion (d/1500): https://www.toolsforfilm.com/tools/circle-of-confusion
- Zeiss formula discussion (d/1730): https://www.watchprosite.com/photography/using-the-zeiss-formula-to-understand-the-circle-of-confusion/1278.1127636.8608906/
- Ciechanowski — Cameras and Lenses (gold-standard interactive): https://ciechanow.ski/cameras-and-lenses/ ; review: https://flowingdata.com/2020/12/08/interactive-explainer-for-how-cameras-and-lenses-work/ ; https://petapixel.com/2020/12/23/this-page-is-a-fantastic-primer-on-how-cameras-and-lenses-work/
- DOFSimulator.net: https://dofsimulator.net/en/ ; review: https://nofilmschool.com/2015/03/learn-power-depth-field-free-online-simulator
- PhET Geometric Optics: https://phet.colorado.edu/en/simulations/geometric-optics ; Active Learning with PhET: https://phet.colorado.edu/assets/virtual-workshop/Active_Learning_with_PhET.pdf
- Canon Outside of Auto: https://www.canon.ca/CanonOutsideOfAuto/play ; camera simulators roundup: https://www.adorama.com/alc/9-online-camera-simulators-to-help-your-photography-skill/
- Direct manipulation / immediate feedback: https://arxiv.org/pdf/1908.00679 ; https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8696276/
- Cognitive load & visualization design: https://datafloq.com/how-cognitive-load-impacts-data-visualization-effectiveness/ ; https://www.turningdataintowisdom.com/content/files/2025/05/data-visualization-design-guide-1.html
- Multimedia learning / Mayer principles: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12668483/
- DoF geometry/light cone reference: https://www.imajtrek.com/new_page_10.htm