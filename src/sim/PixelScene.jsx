import { useEffect, useRef } from 'react'
import { drawScene } from './scene.js'
import { useReducedMotion } from '../components/useReducedMotion.js'

// Renders a pixel-grid scene to a canvas. Pass the live effect params; it redraws
// whenever they change. `live` keeps re-drawing each frame (used for ISO grain shimmer).
export default function PixelScene({
  scene = 'landscape',
  N = 32,
  exposure = 0,
  iso = 0,
  aperture = null,
  motion = 0,
  temp = 0,
  baseTemp = 0,
  progress = 1,
  crop = null,
  size = 320,
  live = false,
  blinkies = false,
  blinkOn = false,
  className = '',
  rounded = true,
}) {
  const ref = useRef(null)
  const raf = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const params = { scene, N, exposure, iso, aperture, motion, temp, baseTemp, progress, crop, blinkies, blinkOn }

    let frame = 0
    const paint = () => {
      // Live ISO shimmers (seed varies per frame); a static render is deterministic
      // (noiseSeed 0) so a saved shot re-renders identically every time.
      drawScene(ctx, { ...params, noiseSeed: live && iso > 0 && !reduced ? frame++ : 0 })
      if (live && iso > 0 && !reduced) raf.current = requestAnimationFrame(paint)
    }
    paint()
    return () => raf.current && cancelAnimationFrame(raf.current)
  }, [scene, N, exposure, iso, aperture, motion, temp, baseTemp, progress, live, blinkies, blinkOn, size, reduced, crop?.cx, crop?.cy, crop?.cells])

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className={`pixelated block ${rounded ? 'rounded-tile' : ''} ${className}`}
      style={{ width: '100%', maxWidth: size, aspectRatio: '1 / 1', height: 'auto' }}
      aria-hidden="true"
    />
  )
}
