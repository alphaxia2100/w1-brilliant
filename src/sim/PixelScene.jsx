import { useEffect, useRef } from 'react'
import { drawScene } from './scene.js'

// Renders a pixel-grid scene to a canvas. Pass the live effect params; it redraws
// whenever they change. `live` keeps re-drawing each frame (used for ISO grain shimmer).
export default function PixelScene({
  scene = 'landscape',
  N = 32,
  exposure = 0,
  iso = 0,
  aperture = null,
  motion = 0,
  progress = 1,
  size = 320,
  live = false,
  className = '',
  rounded = true,
}) {
  const ref = useRef(null)
  const raf = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const params = { scene, N, exposure, iso, aperture, motion, progress }

    const paint = () => {
      drawScene(ctx, params)
      if (live && iso > 0) raf.current = requestAnimationFrame(paint)
    }
    paint()
    return () => raf.current && cancelAnimationFrame(raf.current)
  }, [scene, N, exposure, iso, aperture, motion, progress, live])

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
