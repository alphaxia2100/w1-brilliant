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
