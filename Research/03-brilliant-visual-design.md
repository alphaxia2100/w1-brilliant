# Brilliant.org — Visual Design Language

A deep, source-grounded reconstruction. The standout finding: I extracted **Brilliant's actual production design tokens** directly from the live site's compiled CSS (a Chakra-UI-based system namespaced `--bits-*`, fonts `coFoBrilliantFont` / `coFoRobertFont`). Every hex value, font weight, radius, shadow, and easing curve below is real, pulled from `brilliant.org`'s shipped stylesheet — not inferred. Where something is qualitative (motion feel, illustration philosophy), I cite the design partners (Koto, ustwo, Rive) and label it.

---

## 1. The big picture: what makes it feel premium and simple

Brilliant's 2023–24 refresh (led by **Koto** with Brilliant's in-house team) pivoted the brand to read as "modern, cohesive, and engaging" with "fun, vitality, and levity" — they landed on **"a lighter, brighter color palette and a new pear color spectrum for use across primary CTAs and streaks"** and introduced a new mascot, **Koji** ("a sentient particle born from the Big Bang"), replacing the old Blorb (source: https://pcho.medium.com/a-brilliant-brand-refresh-4af021c11486).

The product feel is built on three load-bearing ideas:

1. **Learn by doing — one idea per screen.** No videos; everything is interactive. Lessons "start with the simplest version of an idea, minimizing cognitive load," and each problem gives "instant, custom feedback." This pedagogy *is* the layout system: a single centered column, one interactive at a time (source: https://brilliant.org/, https://screensdesign.com/showcase/brilliant-learn-by-doing).
2. **Game feel.** ustwo built a **"Game Feel North Star"** — "whimsical in-lesson flourishes that celebrate success" and "moments of encouragement when learners are struggling," plus a "Level Gameboard" and a "learning path page that showed clear direction and progression while maintaining the user's freedom of choice" (source: https://ustwo.com/work/brilliant/).
3. **Restraint everywhere else.** The marketing column maxes out at **1216px** (`--bits-sizes-container-lg/xl`), but reading/lesson content is deliberately narrow — **`--bits-sizes-container-sm/md: 432px`** and a prose measure of **`60ch`** (`--bits-sizes-prose`). That ~432px single column is the core "uncluttered, focused" device.

The premium feel comes from a tightly governed token system (a full 11-step ramp per hue, dual light/dark semantic mappings) applied with discipline: generous whitespace, few simultaneous colors, chunky tactile buttons, and motion that rewards rather than decorates.

---

## 2. Color palette (verified production hex values)

Brilliant uses an **11-step ramp (50→950) for each named hue**. The named hues are unusually fruit/food-forward, which is core to the brand personality: **pear, papaya, mint, cyan, teal** alongside conventional blue, green, purple, pink, orange, yellow, red, gray.

### Core neutrals & surfaces
| Token | Hex | Role |
|---|---|---|
| white | `#FFFFFF` | light-mode page background (`bg-primary`) |
| gray-50 | `#F8F8F8` | light secondary surface (`bg-secondary`) |
| gray-950 | `#141414` | **light-mode primary text**; also dark-mode page background |
| darkGray | `#1E1E1E` | **dark-mode elevated surface / cards** |
| darkGrayAlpha | `rgba(11,11,11,0.8)` | dark overlay scrim |
| black | `#000000` / white | `#FFFFFF` | inverse text pair |

Gray ramp: `#F8F8F8 #F2F2F2 #E5E5E5 #CCCCCC #B3B3B3 #999999 #666666 #4C4C4C #383838 #141414`.

**On the "dark navy" question — important correction:** Brilliant is *not* navy-themed. The marketing site is **light mode by default** (white background, near-black `#141414` text). The **lesson/app dark theme is true neutral charcoal**, not navy: page background `gray-950 #141414`, cards/elevated surfaces `darkGray #1E1E1E`, lesson overlay scrim `rgba(11,11,11,0.8)`. Blue exists as an *accent*, not as the ground. If you want the "calm dark learning canvas" feel, build it on **#141414 / #1E1E1E charcoal**, not navy.

### Brand & accent hues (full 500-step "brand" value shown; ramp endpoints in notes)
| Hue | 500 (brand) | Notes |
|---|---|---|
| **Blue** (primary CTA / links / promo) | `#456DFF` | text-link = blue-500; promo status = `#456DFF`; ramp `#F6F8FF`→`#080F28`; blue-400 `#7491FF`, blue-900 `#142563` |
| **Pear** (signature CTA/streak accent) | `#D8E82E` | the refresh's hero color; `#FBFDEA`→`#212400`; pear-400 `#E2EE62`, pear-600 `#BBCC00` |
| **Green** (success / correct) | `#29CC57` | success status; `#F4FCF7`→`#001F09` |
| **Mint** | `#5CF0B6` | soft secondary green |
| **Cyan** | `#82EDE6` | |
| **Teal** | `#2CB0A1` | (also a dedicated `border-quip` pair `#3E6A74`/`#AACFD7`) |
| **Purple** (iridescent / premium) | `#9D62FF` | purple-900 `#381D66` |
| **Pink** | `#FF6BD5` | pink-400 `#FF90E0` |
| **Orange** | `#FF8D23` | |
| **Papaya** (coral) | `#FF775C` | papaya-400 `#FF8871` |
| **Yellow** (warning) | `#F7C325` | warning status |
| **Red** (error / incorrect) | `#FF5D5D` | error status |

### Semantic status colors (the ones that matter for correct/incorrect)
- **Success / correct:** `--bits-colors-status-success: #29CC57` (green-500)
- **Error / incorrect:** `--bits-colors-status-error: #FF5D5D` (red-500)
- **Warning / "retryable":** `--bits-colors-status-warning: #F7C325` (yellow-500)
- **Promo / informational accent:** `--bits-colors-status-promo: #456DFF` (blue-500)

### Lesson feedback fills (these are the literal answer-feedback panel backgrounds)
These are defined as **light/dark pairs** — the single hardcoded hexes are the dark-theme values:
- **Correct:** dark `#00370F` (deep forest green) / light `green-200 #D4F5DD`
- **Incorrect:** `gray-900 #383838` (dark) / `gray-200 #E5E5E5` (light) — notably **neutral, not red**. The "you got it wrong" panel is calm gray, not alarming.
- **Retryable** ("close, try again"): `#403000` (dark amber) / `yellow-300 #FCE49D`
- Lesson overlay scrim: `rgba(11,11,11,0.8)`
- Progress-bar "incorrect" segment: `gray-700 #666666` (dark) / `whiteAlpha-800`

That incorrect = calm gray choice is a deliberate emotional decision (matches ustwo's "encouragement when struggling"). Red is reserved for hard error states, not wrong-answer feedback.

### The feel
**Calm-but-cheerful.** A near-monochrome canvas (white or `#141414` charcoal) with a single bright accent doing the work per screen. The fruit-named secondary palette (pear, papaya, mint) is what keeps it from feeling clinical — these are saturated, optimistic, slightly retro colors used sparingly as topic-coding and celebration, never as large fills. Koto's stated goal of "fun, vitality, and levity" is encoded directly in choosing *pear* (`#D8E82E`, an electric yellow-green) as the primary CTA color rather than a safe blue.

---

## 3. Typography

**Typefaces (from production `--bits-fonts-*`):**
- Body **and** heading: `'coFoBrilliantFont', 'coFoBrilliantFont Fallback', Arial, sans-serif` — a **custom cut of CoFo Sans** from Contrast Foundry. Per Koto, they "worked with Contrast Foundry to create a slightly custom version of the sans" (source: pcho.medium.com).
- A second face, `coFoRobertFont` (**CoFo Robert**, a chunky Clarendon-style slab serif), appears in the stack for editorial/marketing display headers.
- Mono: standard system stack `SFMono-Regular, Menlo, Monaco, Consolas, monospace` (used for code/numbers).

**About the faces (source: https://contrastfoundry.com/typeface/cofo-sans, /cofo-robert):**
- **CoFo Sans** — "harmony between rationality and emotion," "strong squareness of the shapes and a trace of industrial functionality." 7 weights: Hairline, Thin, Light, Regular, Medium, Bold, Black. That slight squareness is exactly what makes Brilliant's text feel modern and geometric rather than generic-humanist, and it visually rhymes with the wordmark's "rounds and squared off corners" and the geometric illustrations.
- **CoFo Robert** — a "chunky mechanical" Clarendon slab with "authoritative Romans and expressive Italics," 7 weights, plus decorative numerals/arrows/hands. Provides editorial warmth in marketing.

**Type scale (`--bits-fontSizes`, rem):** `2xs .625 · xs .75 · sm .875 · md 1.0 · lg 1.125 · xl 1.25 · 2xl 1.5 · 3xl 1.875 · 4xl 2.25 · 5xl 3 · 6xl 3.75 · 7xl 4.5 · 8xl 6 · 9xl 8`. A standard modular-ish ramp; body is `md` (16px), problem/lesson text typically `lg` (18px), section headings `2xl–4xl`, hero `5xl+`.

**Weights (`--bits-fontWeights`):** 100/200/300/400/500/600/700/800/900. In practice body runs **400–500**, with **600–700** for headings/buttons. Heavy weights are available but used sparingly.

**Line height & measure:** base `1.5`; tighter named steps `shorter 1.25`, `short 1.375`, plus rem steps (e.g. `lineHeights-6: 1.5rem`). **Reading measure capped at `60ch`** (`--bits-sizes-prose`) — a classic readability choice keeping lines in the optimal 45–75 character band.

**Letter spacing:** `tight -0.025em` / `tighter -0.05em` for large display headings (tightens big text), `wide 0.025em`→`widest 0.1em` for small all-caps labels.

**How the three text roles differ:** Headings use the same CoFo Sans as body (heading and body tokens are identical) but lean on **size + weight 600–700 + negative tracking** for hierarchy rather than a contrasting face — a deliberately quiet, unified voice. **Problem/lesson text** sits at a larger, comfortable 18px in the narrow 432px column for sustained reading. **Numbers and code** drop to the mono stack so digits in math problems align.

---

## 4. Spacing, layout & whitespace

- **Spacing scale (`--bits-space`):** 4px base unit (`space-1 = 0.25rem`) running 1→96 (0.25rem→24rem) plus `px = 1px`. Standard 4px-grid system.
- **Two content widths, deliberately:** marketing/dashboard up to **1216px** (`container-lg/xl`); **lesson and reading content at ~432px** (`container-sm/md`) with a **60ch** prose cap. This single narrow column is *the* mechanism for the "one thing per screen, uncluttered" feel — the screen is mostly whitespace framing one interactive.
- **Card-based composition:** courses, lessons, and challenges are surfaced as tiles/cards (ustwo's "lesson and challenge tiles, lesson detail tooltips, and progress trackers"). Cards carry the signature chunky shadow (next section) and live on a calm white/charcoal ground with generous gutters.
- **Radii (`--bits-radii`):** `sm .125rem (2px) · base .25rem (4px) · md .5rem (8px) · lg .75rem (12px) · xl 1rem (16px) · 2xl 1.25rem (20px) · 3xl 1.5rem (24px) · full 9999px`. Everything is rounded; buttons/tiles typically `lg–2xl` (12–20px), pills and avatars `full`.

---

## 5. Interactive widget aesthetics (the tactile, "game" look)

The signature look is the **chunky button/card with a hard offset bottom shadow** — no blur, a solid colored edge directly below the element so it reads like a physical key you can press. This is encoded in the shadow tokens:

- `--bits-shadows-card: 0px 2px 0px 0px var(--bits-colors-gray-300)` — resting card: a solid 2px lip below, zero blur.
- `--bits-shadows-cardActive: 0px 4px 0px 0px blackAlpha-200` — pressed/active state deepens the lip to 4px.
- `--bits-shadows-cardCompleted: 4px 4px 0px 0px green-800` and `cardCompletedActive: 6px 6px 0px 0px green-800` — a **completed** course card gets a hard green offset edge that grows on hover (the `courseCard-shadowCompletedXOffset` tokens are literally `4px`→`6px`). That solid colored 3D edge is the most recognizable Brilliant component detail.
- `--bits-shadows-planCardBase: 0px -6px 0px 0px rgba(0,0,0,0.15) inset` — pricing/plan cards get an inset bottom bevel.

So **draggables, multiple-choice tiles, and answer chips** all share: rounded corners (12–20px), a flat fill, a **solid (non-blurred) offset shadow** that makes them look pressable, and a state change to that shadow + fill on hover/active. Softer ambient blur shadows (`shadows-md: 0 0 25px rgba(0,0,0,.15)`, `lg`, `xl`, `2xl`) exist for modals/popovers/tooltips, but interactive controls favor the hard-edge style.

- **Selected / focus state:** `border-select` = `blue-500 #456DFF` (light) / `blue-700` (dark); focus ring `--bits-shadows-outline: 0 0 0 1px white, 0 0 0 3px blue-500` — a clean two-tone blue ring.
- **Check / Continue button (primary CTA):** blue-500 `#456DFF` or the pear accent, with white text (`text-onColor-primary: #FFFFFF`), large rounded corners, and the chunky bottom shadow that compresses on press. Disabled CTAs drop to `bg-disabled` (blackAlpha-100 / whiteAlpha-100).
- **Sliders / number lines / graphs:** rendered as part of interactives; per ScreensDesign, "interactive explanations allow users to explore solutions actively rather than just reading them." Drag handles use `full` radius (round) and the blue selection color; graph/path elements use **per-topic color coding** (each learning topic carries its own hue from the ramp — confirmed by Rive: "Animations are done in many color variants with multiple node types," "Each learning topic has its own color scheme").
- **Lesson progress bar:** segmented; active segment `whiteAlpha-300`, an incorrectly-answered segment goes `gray-700 #666666` — subtle, non-punitive.

---

## 6. Motion & micro-interactions

Brilliant runs much of its in-product motion through **Rive** (vector state machines shipped as identical files across iOS/Android/web — source: https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations).

**Verified production timing/easing tokens (`--bits-transition`):**
- Durations: `ultra-fast 50ms · faster 100ms · fast 150ms · normal 200ms · slow 300ms · slower 400ms · ultra-slow 500ms` (plus dramatic `easeIn/OutExpo 1.3s` for big hero moments).
- Easing curves:
  - `ease-out: cubic-bezier(0, 0, 0.2, 1)` — the default for entering elements
  - `ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)` (Material-standard)
  - `ease-in: cubic-bezier(0.4, 0, 1, 1)`
  - `easeOutExpo: cubic-bezier(0.16, 1, 0.3, 1)` — the **snappy, overshooting "pop"** used for celebratory/satisfying moments
  - `easeInExpo: cubic-bezier(0.7, 0, 0.84, 0)`
- Animated properties bundle (`transition-property-common`): `background-color, border-color, color, fill, stroke, opacity, box-shadow, transform` — i.e., buttons animate fill + shadow + transform together, which is what produces the "press" feel.

**Qualitative motion behaviors (sourced):**
- **Correct-answer celebration:** "in-lesson celebrations when learners enter the correct answer" and "whimsical in-lesson flourishes that celebrate success" — the correct-feedback panel snaps in (the deep-green `#00370F` / mint panel), paired with "satisfying animations and XP counters" on lesson completion (ustwo; ScreensDesign).
- **Streaks:** Rive Event triggers fire a celebration that's "seamlessly aligned with the increasing number count, making it feel more tied to a user's actions" — the count and animation are choreographed together rather than the animation playing independently.
- **Learning path:** animated colored nodes and connecting lines, per-topic color variants, with multiple node states.
- **Loading:** thematic **tangram-style** assembly animations instead of generic spinners, reinforcing the problem-solving identity (ScreensDesign).
- **Encouragement on struggle:** dedicated "moments of encouragement when learners are struggling" — motion is two-sided (reward success, soften failure), consistent with the calm-gray incorrect panel.
- Brilliant describes the *whole* loop as designed for delight: "the types of sounds, feedback, and haptics provided as you interact" — so motion is paired with audio and haptics on native.

I did **not** find explicit confirmation of confetti particles specifically; the documented celebrations are Rive vector flourishes + XP counters + streak animations. Treat "confetti" as a plausible member of that family, not a verified token.

---

## 7. Illustration & iconography style

- **System name: "PIX."** Koto describes the illustration approach as **"built from straight-edged line segments"** — a flat, geometric, constructivist style assembled from straight strokes (source: pcho.medium.com). This directly mirrors the typography's "strong squareness" and the wordmark's mix of "rounds and squared off corners."
- **Mascot Koji** — the friendly particle guide; mascots exist to "lower stakes for learners and act as a natural cheerleader." There's also a **Brilliant Cinematic Universe (BCU)** cast — "BCU characters and art were created by the Brilliant artists" (ustwo).
- **Feel:** friendly, flat, optimistic; bold flat fills from the fruit palette, minimal-to-no gradients on illustration, confident line work. Diagrams in lessons are drawn in the same flat geometric language and are *interactive* (manipulable diagrams, draggable data) rather than decorative.
- Earlier (2018) identity by The Studio leaned on **"Serious Playfulness,"** a 50+ pictogram set, and a logotype-as-bar-chart "smile in the mind" (source: https://bpando.org/2018/12/04/branding-brilliant/) — useful historical context, but the current geometric-line PIX system supersedes it.

---

## 8. Designer rebuild cheat-sheet

To recreate the look/feel:
- **Canvas:** light mode = white bg, `#141414` text. Dark/lesson mode = `#141414` page, `#1E1E1E` cards (charcoal, **not navy**), `rgba(11,11,11,0.8)` overlay scrim.
- **One accent per screen** drawn from a fruit-forward ramp; primary CTA = **pear `#D8E82E`** or **blue `#456DFF`**, white label text.
- **Type:** geometric square-ish sans (CoFo Sans surrogate: e.g. a squarish grotesque), 16px body / 18px problem text, 600–700 headings with slight negative tracking, code in mono, lines ≤60ch.
- **Layout:** ~432px single centered column for lessons, lots of whitespace, 4px spacing grid, 12–20px corner radii.
- **Components:** flat fills + **hard 2–6px solid offset bottom shadow** (no blur) that deepens on press; blue focus ring `0 0 0 1px #fff, 0 0 0 3px #456DFF`.
- **Feedback:** correct = green panel (`#00370F` dark / mint light), incorrect = **calm gray** (`#383838` / `#E5E5E5`), retry = amber.
- **Motion:** 150–300ms with `cubic-bezier(0,0,0.2,1)` for normal transitions; `cubic-bezier(0.16,1,0.3,1)` (expo-out overshoot) for celebratory pops; animate transform+shadow+fill together; choreograph counters with their animations.

---

### Sources
- Brilliant production CSS tokens — extracted directly from https://brilliant.org/ compiled stylesheet (`--bits-*` Chakra design system; fonts `coFoBrilliantFont`/`coFoRobertFont`). All hex/weight/radius/shadow/easing values above are from this.
- Brand refresh (Koto): https://pcho.medium.com/a-brilliant-brand-refresh-4af021c11486
- Game-feel / interaction design (ustwo): https://ustwo.com/work/brilliant/
- Motion/Rive: https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations
- UI teardown: https://screensdesign.com/showcase/brilliant-learn-by-doing
- Typefaces: https://contrastfoundry.com/typeface/cofo-sans and https://contrastfoundry.com/typeface/cofo-robert
- Historical 2018 identity: https://bpando.org/2018/12/04/branding-brilliant/
- Method/pedagogy: https://brilliant.org/

**Confidence notes / unverified items:** "navy theme" is a misconception — Brilliant is white-light + charcoal-dark, blue is only an accent (high confidence, from tokens). Specific confetti particle effects are not confirmed (the verified celebration set is Rive vector flourishes + XP counters + streak animation). The dark-theme hardcoded feedback hexes (`#00370F`, `#403000`) are confirmed; their light-mode counterparts map to ramp steps as shown.