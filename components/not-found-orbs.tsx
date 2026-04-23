"use client"

import { useEffect, useRef } from "react"

/**
 * Playful 404 background — small orange orbs that flee the cursor.
 * Runs in a single canvas with requestAnimationFrame. Respects reduced motion.
 */
type Orb = { x: number; y: number; vx: number; vy: number; r: number; hue: number }

const ORB_COUNT = 14

export function NotFoundOrbs() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0, height = 0
    const orbs: Orb[] = []

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      width = rect.width; height = rect.height
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const initOrbs = () => {
      orbs.length = 0
      for (let i = 0; i < ORB_COUNT; i++) {
        orbs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          r: 10 + Math.random() * 18,
          hue: 20 + Math.random() * 20,
        })
      }
    }

    resize(); initOrbs()
    const onResize = () => { resize(); initOrbs() }
    window.addEventListener("resize", onResize, { passive: true })

    const mouse = { x: -9999, y: -9999, active: false }
    const parent = canvas.parentElement
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
      mouse.active = true
    }
    const onLeave = () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999 }
    parent?.addEventListener("mousemove", onMove, { passive: true })
    parent?.addEventListener("mouseleave", onLeave, { passive: true })

    let raf = 0
    const tick = () => {
      ctx.clearRect(0, 0, width, height)
      for (const o of orbs) {
        if (!reduced) {
          if (mouse.active) {
            const dx = o.x - mouse.x
            const dy = o.y - mouse.y
            const d2 = dx * dx + dy * dy
            const R = 180
            if (d2 < R * R && d2 > 0.01) {
              const d = Math.sqrt(d2)
              const force = (1 - d / R) * 1.8
              o.vx += (dx / d) * force
              o.vy += (dy / d) * force
            }
          }
          o.x += o.vx; o.y += o.vy
          o.vx *= 0.95; o.vy *= 0.95
          o.vx += (Math.random() - 0.5) * 0.05
          o.vy += (Math.random() - 0.5) * 0.05
          if (o.x < o.r) { o.x = o.r; o.vx = Math.abs(o.vx) }
          if (o.x > width - o.r) { o.x = width - o.r; o.vx = -Math.abs(o.vx) }
          if (o.y < o.r) { o.y = o.r; o.vy = Math.abs(o.vy) }
          if (o.y > height - o.r) { o.y = height - o.r; o.vy = -Math.abs(o.vy) }
        }
        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r)
        grad.addColorStop(0, `hsla(${o.hue}, 95%, 60%, 0.55)`)
        grad.addColorStop(0.6, `hsla(${o.hue}, 95%, 55%, 0.15)`)
        grad.addColorStop(1, `hsla(${o.hue}, 95%, 50%, 0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      parent?.removeEventListener("mousemove", onMove)
      parent?.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
