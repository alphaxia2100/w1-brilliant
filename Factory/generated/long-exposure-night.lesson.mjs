// L7 — LONG EXPOSURE: PAINTING WITH TIME
// When there's barely any light, you don't crank ISO — you hold the shutter open and
// let light PILE UP over seconds. Time becomes the lever. A still night scene drinks
// in enough light to glow cleanly; a moving subject can't, which is when ISO wins.
//
// Distinct from L1 (quick daylight capture-to-target) and L3 (histogram metering):
// this pushes gather-light-over-time to its low-light extreme on the NIGHT scene and
// pays off WHEN long exposure beats high ISO (static subject) vs when it doesn't (motion).

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
const ISO_STOPS = [100, 200, 400, 800, 1600, 3200, 6400, 12800]
const isoToExposure = (iso) => clamp(Math.log2(iso / 100) * 0.4, 0, 2.8)
const isoToNoise = (iso) => clamp(Math.log2(iso / 100) * 22, 0, 150)

export default {
  id: 'long-exposure-night',
  number: 7,
  title: 'Long exposure: painting with time',
  blurb: 'When the light runs out, let time do the gathering.',
  steps: [
    // BEAT 1 — predict by doing: a fast shutter simply can't drink enough light here
    {
      kind: 'capture',
      scene: 'night',
      prompt:
        "It's nearly black out here, and the shutter's at its fastest — take the shot and you get almost nothing. A normal quick snap simply can't drink enough light from a night this dark. So stop snapping and start GATHERING: drag the shutter time open, hold it longer and longer, and watch the dead-black scene slowly fill until it glows in the green.",
      start: -3,
      targetExp: { min: 1.2, max: 1.8 },
      feedback: {
        correct:
          "There it is. A normal, fast shutter could never drink enough light from a scene this dark — you had to hold it open and let the light PILE UP over time. Time is the lever tonight.",
      },
    },
    // BEAT 2 — confirm: light is cumulative; on a dark scene, time replaces brightness
    {
      kind: 'intro',
      scene: 'night',
      title: 'Light piles up over time',
      body: [
        'A photo is light gathered over time. In daylight a sliver of a second is plenty. In the dark, that same sliver gathers almost nothing — so you keep the shutter open for whole seconds and let the light accumulate.',
        'That is a long exposure: trading TIME for the light the scene is too dark to give you all at once.',
      ],
    },
    // BEAT 3 — A/B the SAME night brightness: long shutter (clean) vs ISO (grainy)
    {
      kind: 'slider-sim',
      scene: 'night',
      prompt:
        "You already lit this same night cleanly with a long shutter. Now reach that SAME brightness the impatient way — no waiting, just ISO. Crank it up to match that glow, then look hard at the loupe and compare what you got.",
      control: { stops: ISO_STOPS, start: 0 },
      toParams: (iso) => ({ exposure: isoToExposure(iso), iso: isoToNoise(iso) }),
      format: (iso) => 'ISO ' + iso,
      label: 'ISO',
      ends: ['ISO 100 · clean', 'ISO 12800 · noisy'],
      ariaLabel: 'ISO sensitivity',
      loupe: { cx: 4, cy: 25, cells: 6 },
      // The long-exposure glow lives in mean-brightness band 1.2–1.8 (beats 1/7).
      // Only ISO 1600 lands the ISO path's brightness back in that band (~0.42 mean).
      // Gate on the brightness MATCH, not just on noise: overshoot (3200+) blows past
      // the glow, undershoot (≤800) never reaches it. Both must fail with a direction hint.
      check: (iso) => {
        const exp = isoToExposure(iso)
        return exp >= 1.2 && exp <= 1.8
      },
      feedback: {
        correct:
          'Same brightness as the long exposure — but look at the difference. The shutter version was clean; this one is crawling with grain. That is the whole point: identical glow, two prices. The long shutter gathered MORE real light; ISO only amplified the little you had, noise and all. When you can afford the time, time wins.',
        stages: [
          'The goal is to MATCH the brightness of the long exposure you already shot — not just to brighten the scene. Nudge the ISO toward that exact glow, no brighter.',
          'Watch the brightness, not only the dial: too dim and you haven\'t reached the long-exposure glow yet — push ISO UP; too bright and you blew past it — ease ISO DOWN. Land it ON the glow, then study the grain in the loupe.',
        ],
      },
    },
    // BEAT 4 — confirm the contrast: clean light vs amplified noise → so why ever use ISO?
    {
      kind: 'intro',
      scene: 'night',
      title: 'Real light beats amplified light',
      body: [
        'You just saw it side by side: same brightness, two very different images. A long exposure collects MORE real light, so the image is clean. High ISO just turns up the volume on the faint signal you already have — and the static hiss, the grain, comes up with it.',
        'But holding the shutter open for whole seconds has a price: anything that moves during those seconds smears. That includes the CAMERA — handhold a multi-second shot and your own tiny shake blurs the entire frame, so a long exposure always rides on a tripod, the camera locked dead still.',
        'So why would anyone ever reach for ISO? Because a long exposure needs EVERYTHING still — and the next shot is about to break that.',
      ],
    },
    // BEAT 5 — the catch: a long exposure needs a STILL subject. Moving subject → freeze it.
    {
      kind: 'motion',
      prompt:
        "A car is racing through your night scene — so the long-exposure trick is off the table. With the SUBJECT moving, you have to choose: trade time for light, or keep it crisp? Make the call — set the shutter for a sharp car, then take the shot.",
      start: 6,
      check: (si) => si <= 1,
      feedback: {
        correct:
          "That was the decision, not just the dial. A long exposure needs EVERYTHING still — both the camera (on its tripod) AND the subject. The moment the subject moves, you can no longer pay for light with time, so you flip the trade: spend a fast shutter to freeze it, and buy back the lost light with ISO. Static scene → long exposure. Moving subject → fast shutter + ISO.",
        stages: [
          'You can\'t hold the shutter open for a moving subject — so which lever are you choosing instead? Push it toward less time.',
          'A moving subject forces the fast end: pick the tiniest slice of time, then take the shot.',
        ],
      },
    },
    // BEAT 6 — transfer: which night scenes call for a long exposure (most static / longest first)?
    {
      kind: 'rank',
      prompt:
        'Order these night shots by how LONG you should hold the shutter — the one that wants the longest exposure first.',
      scale: ['hold it open for minutes', 'freeze in an instant'],
      items: [
        { label: 'Star trails — sky wheeling over a still ridge' },
        { label: 'A calm, empty city skyline' },
        { label: 'A dog sprinting across a dark yard' },
      ],
      solution: [0, 1, 2],
      feedback: {
        correct:
          "Right. Nothing moving but the slow-turning stars? Hold it open for minutes. A still skyline? Seconds. But the sprinting dog won't sit still for any of it — that one demands a fast shutter, and ISO to pay for the light. Match the shutter to what's moving.",
        stages: [
          'The stiller the scene, the longer you can keep the shutter open to gather light.',
          'Stars and a still skyline can soak up time; a sprinting dog cannot — order longest-hold to instant.',
        ],
      },
    },
    // BEAT 7 — keeper: author the clean long-exposure night shot yourself
    {
      kind: 'capture',
      scene: 'night',
      prompt:
        'Your keeper. Camera locked on its tripod, nothing moving in the frame — dead still all around, and dark. No shortcuts. Drag the shutter time out until the night drinks in enough light to glow cleanly in the green, then take the shot.',
      start: -2.5,
      targetExp: { min: 1.2, max: 1.8 },
      feedback: {
        correct:
          'A clean, glowing night — built from time, not noise. That is painting with time: when the light runs out, you stop cranking ISO and let the shutter gather it, second by second. The shot is yours to keep.',
      },
    },
  ],
}
