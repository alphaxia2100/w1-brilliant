// Composition scoring — felt, not numeric. Pure + node-importable (tested in checks.mjs).
// pos is { x, y } in 0..100 frame coordinates.

export const THIRDS = [
  { x: 33.33, y: 33.33 },
  { x: 66.66, y: 33.33 },
  { x: 33.33, y: 66.66 },
  { x: 66.66, y: 66.66 },
]
const hypot = (a, b) => Math.sqrt(a * a + b * b)

export function composeEval(target, pos) {
  if (target.kind === 'leadroom') {
    // A subject that faces/looks one way needs space AHEAD of the gaze ("lead room").
    const facing = target.facing || 'right'
    const ahead = facing === 'right' ? 100 - pos.x : pos.x
    const ok = ahead >= 60
    return { ok, cue: ok ? 'room to move into' : 'boxed in — no space ahead' }
  }
  if (target.kind === 'leadinglines') {
    // Lines in the scene converge on a point; place the subject where they LEAD the eye.
    const conv = target.point || { x: 66.66, y: 38 }
    const d = hypot(conv.x - pos.x, conv.y - pos.y)
    const ok = d < (target.band || 12)
    return { ok, cue: ok ? 'right where the lines lead — the eye lands on the subject' : 'follow the lines to where they meet, and put the subject there' }
  }
  if (target.kind === 'balance') {
    // A fixed heavy element sits in the frame; place YOUR subject so the visual weight
    // balances — the centre of mass of the two sits near the middle, and they're on
    // opposite sides (a real counterweight, not stacked next to the anchor).
    const a = target.anchor || { x: 25, y: 50 }
    const midX = (a.x + pos.x) / 2
    const midY = (a.y + pos.y) / 2
    const balanced = hypot(midX - 50, midY - 50) < (target.band || 10)
    const apart = hypot(pos.x - a.x, pos.y - a.y) > 34
    const ok = balanced && apart
    return { ok, cue: ok ? 'balanced — the weight settles across the frame' : !apart ? 'put it OPPOSITE the heavy element, not beside it' : 'not level yet — shift it so the two weights balance around the centre' }
  }
  if (target.kind === 'negativespace') {
    // Isolate the subject in a sea of empty space: push it well past a third, toward a
    // side, so most of the frame is intentional emptiness (more extreme than rule-of-thirds).
    const offX = Math.min(pos.x, 100 - pos.x) // distance to nearest L/R edge
    const ok = offX >= 8 && offX <= 25 && Math.abs(pos.x - 50) > 18
    return { ok, cue: ok ? 'isolated — the empty space makes the subject sing' : 'give it room: push the subject far to one side and let the rest of the frame fall away' }
  }
  if (target.kind === 'composefree') {
    // Open keeper: EITHER balance the weight OR isolate with negative space — both valid.
    const b = composeEval({ kind: 'balance', anchor: target.anchor, band: target.band }, pos)
    const n = composeEval({ kind: 'negativespace' }, pos)
    const ok = b.ok || n.ok
    return { ok, cue: ok ? (b.ok ? 'balanced — the frame settles' : 'isolated — the empty space carries it') : 'your call: balance the heavy element, or push your subject out into empty space' }
  }
  if (target.kind === 'horizon') {
    const onThird = Math.min(Math.abs(pos.y - 33.33), Math.abs(pos.y - 66.66)) < (target.band || 9)
    const bisecting = Math.abs(pos.y - 50) < 8
    return { ok: onThird && !bisecting, cue: bisecting ? 'cutting it in half — static' : onThird ? 'a third of sky — it breathes' : 'find a third' }
  }
  // thirds (default): on a power point, not dead-center
  const band = target.band || 13
  const d = Math.min(...THIRDS.map((p) => hypot(p.x - pos.x, p.y - pos.y)))
  const centered = hypot(50 - pos.x, 50 - pos.y) < 13
  return { ok: d < band, cue: d < band ? 'on a power point — alive' : centered ? 'dead-center — static' : 'keep going' }
}
