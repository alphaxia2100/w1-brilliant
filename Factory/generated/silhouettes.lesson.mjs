// L7 — SILHOUETTES (shape against light)
// The ONE new idea L1–L6 do not already own: a silhouette is made by EXPOSURE, not by
// adding light. You expose for the brilliant background and let the SUBJECT crush to
// black on purpose — then you pick a profile that still reads with zero inner detail.
// L6 taught WHERE light comes from (and named "silhouette"); this lesson is the lever
// L6 never touched — the exposure that turns a backlit subject into a black graphic.
//
// One continuous subject: the lone tree on the ridge. You meet it as a murky grey lump
// (B1), crush IT to black with exposure (B1), learn which subjects survive that crush
// (B3), study the bright RIM that lines its edge (B4), and finally author the keeper by
// exposing for the sky to drop the SAME subject to a black graphic shape (B5). Every
// beat is the same act on the same subject — not three unrelated props.
//
// Predict-first surprise: to "see" the dark subject the learner expects to BRIGHTEN the
// frame. The opposite is true — pulling exposure DOWN to protect the sky is what creates
// the silhouette. That exposure-for-the-background move is this lesson's whole spine,
// and it is the move the KEEPER asks for — not a re-swing of the L6 light.

export default {
  id: 'silhouettes',
  number: 7,
  title: 'Silhouettes: shape against light',
  blurb: 'Expose for the bright sky — and let the subject fall to black on purpose.',
  steps: [
    // BEAT 1 — predict by doing on the ACTUAL SUBJECT. The backlit scene now renders a
    // discrete lone tree against the brilliant sky: at the start it's a murky grey lump
    // you can just read. The SURPRISE is that you don't brighten to reveal it — you pull
    // exposure DOWN to protect the sky, and the TREE crushes to solid black. That is the
    // lever L6 never touched (L6 was direction), and it acts on a real subject on screen.
    {
      kind: 'slider-sim',
      scene: 'backlit',
      prompt:
        'That lone tree against the sky is a murky grey lump right now — neither bright nor black, just flat. Turn it into a strong, graphic silhouette. Set the exposure for the shot you want.',
      control: { min: -2.5, max: 1.5, step: 0.1, start: 0.6 },
      toParams: (v) => ({ exposure: v }),
      format: (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + ' EV',
      label: 'Exposure',
      ends: ['darker', 'brighter'],
      ariaLabel: 'Exposure compensation',
      check: (v) => v <= -0.3,
      feedback: {
        correct:
          'Surprise: you made the silhouette not by ADDING light to reveal the tree, but by taking light AWAY. You exposed for the bright sky and let the tree crush to solid black. A silhouette is made with EXPOSURE, not with more light.',
        stages: [
          'Brightening only turns the murky grey tree into a brighter grey — it never goes black, and it blows the sky out. Which way protects the bright sky and darkens the tree?',
          'Pull the exposure DOWN until the tree reads solid black against the bright sky, then take the shot.',
        ],
      },
    },
    // BEAT 2 — confirm the spine. Names the inversion (meter for background, not subject)
    // WITHOUT conceding the move is the same as the metering lesson; here the dark shape
    // is the deliberate goal, framed around this subject.
    {
      kind: 'intro',
      title: 'Expose for the light, not the subject',
      body: [
        'Normally you meter for your subject so it lands mid-bright. A silhouette inverts that: you meter for the BRIGHT background instead, and let the subject fall all the way to black. The dark shape is the goal, not a mistake to rescue.',
        'Once the subject is pure black it has no tone of its own — so everything now depends on the two things you control next: the SHAPE of its outline, and the bright RIM the backlight draws along its edge.',
      ],
    },
    // BEAT 3 — transfer: with zero inner detail, the only thing left is the OUTLINE.
    // Not every subject silhouettes — choose one that reads from its profile alone.
    // The tree the learner just crushed is the strongest of these — continuity holds.
    {
      kind: 'rank',
      prompt:
        'Crushed to black, a subject has no inner detail — only its outline. Order these by how well each reads as a silhouette from its profile alone — strongest first.',
      scale: ['reads instantly', 'reads as a blob'],
      items: [
        { label: 'Lone tree on a ridge · clear gaps of sky' },
        { label: 'Person, arms at sides · solid but plain' },
        { label: 'Crowd overlapping · shapes merge' },
      ],
      solution: [0, 1, 2],
      feedback: {
        correct:
          'With no inner detail, the edge carries the entire photo. The lone tree against open sky reads instantly — those gaps of sky between its branches are what make it; overlapping bodies merge into one unreadable blob. Pick a subject with a distinct profile and clear separation from its neighbours.',
        stages: [
          'No inner detail means the only thing left is the outline. Which subject has the most distinct, separated profile?',
          'Most readable: clear gaps and a spiky edge (the tree). Least: shapes that overlap and merge (the crowd).',
        ],
      },
    },
    // BEAT 4 — the RIM, the one thing a flat exposure can't show, so we isolate it on a
    // clean backlit subject. LightDirection now genuinely feathers the rim: a hard source
    // draws a thin crisp line; a big soft source spreads it into a broad, blurred halo.
    // The width grows ~8x and a Gaussian blur softens it — the change is plainly visible,
    // and it matches what the feedback claims (no longer a hollow interaction).
    {
      kind: 'light-direction',
      control: 'soft',
      fixed: { angle: 170 },
      prompt:
        'Same idea, one subject lit from directly behind so its edge catches a bright rim. Change the SIZE of that light source and watch the rim. Make it a thin, crisp line that traces the edge precisely.',
      start: { soft: 1 },
      check: ({ soft }) => soft <= 0.25,
      feedback: {
        correct:
          'A hard backlight (the sun, a bare bulb) draws a thin, crisp rim that traces the edge precisely. A big, soft source (an overcast sky) spreads it into a broad, glowing halo. The black shape is identical either way — only the rim that lines it changes.',
        stages: [
          'A big, soft source spreads the rim into a wide, blurred glow. Which way makes the source smaller and harder?',
          'Push the source toward the hard end until the rim narrows to a crisp line, then take the shot.',
        ],
      },
    },
    // BEAT 5 — KEEPER: author the thing THIS lesson uniquely taught — exposing for the
    // sky to crush the chosen subject (the tree) to a black graphic shape. This is the
    // B1 move, NOT a re-swing of the L6 light, so the unique spine appears in the keeper.
    // The kept artifact is the backlit tree silhouette the learner has worked with all
    // lesson — one continuous subject, one continuous act.
    {
      kind: 'slider-sim',
      scene: 'backlit',
      keeper: true,
      prompt:
        'Frame your keeper. Expose for the brilliant sky so the tree drops all the way to a clean black graphic against it — the silhouette you came here to make. Then take the shot to keep it.',
      control: { min: -2.5, max: 1.5, step: 0.1, start: 0.8 },
      toParams: (v) => ({ exposure: v }),
      format: (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + ' EV',
      label: 'Exposure',
      ends: ['darker', 'brighter'],
      ariaLabel: 'Exposure compensation',
      check: (v) => v <= -0.6,
      feedback: {
        correct:
          'That is the whole craft in one frame: you exposed for the light, not the subject, and the tree fell to a clean black shape against the bright sky — its readable profile doing all the work. You destroyed the detail on purpose, and the photo is stronger for it.',
        stages: [
          'A silhouette comes from protecting the bright sky, not from lifting the subject. Which way takes light away?',
          'Pull the exposure well DOWN until the tree is a solid black graphic against the sky, then take the shot.',
        ],
      },
    },
  ],
}
