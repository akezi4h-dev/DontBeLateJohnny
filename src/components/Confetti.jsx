import { useEffect, useRef } from 'react'

/**
 * Full-screen canvas confetti burst. Plays once then calls onDone.
 *
 * Props:
 *   onDone — called when the animation finishes (use to unmount)
 */
export default function Confetti({ onDone }) {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const COLORS = [
      '#FF2D55', '#FF9F0A', '#30D158', '#64D2FF',
      '#BF5AF2', '#FFD60A', '#FF6B9D', '#50E3C2',
    ]

    const cx = canvas.width  / 2
    const cy = canvas.height * 0.52

    // Generate particles bursting from center
    const particles = Array.from({ length: 90 }, () => ({
      x:        cx + (Math.random() - 0.5) * 50,
      y:        cy,
      vx:       (Math.random() - 0.5) * 18,
      vy:       Math.random() * -16 - 3,
      size:     Math.random() * 7 + 3,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      spin:     (Math.random() - 0.5) * 12,
      isRect:   Math.random() > 0.45,
    }))

    let frame = 0
    let raf

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      for (const p of particles) {
        p.x        += p.vx
        p.y        += p.vy
        p.vy       += 0.42          // gravity
        p.vx       *= 0.988         // air resistance
        p.rotation += p.spin

        const alpha = Math.max(0, 1 - frame / 75)
        ctx.globalAlpha = alpha
        ctx.fillStyle   = p.color

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)

        if (p.isRect) {
          ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      }

      if (frame < 85) {
        raf = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        onDone?.()
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, []) // intentionally run once on mount

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
    />
  )
}
