"use client"

import { useEffect, useRef } from "react"

type Particle = {
  x: number; y: number
  vx: number; vy: number
  rot: number; vrot: number
  color: string
  size: number
  shape: "rect" | "circle"
  life: number
}

const COLORS = ["#f97316", "#fbbf24", "#ffffff", "#ea580c", "#fb923c"]

/**
 * Lightweight confetti burst. Call `fireConfetti({ x, y })` to emit a short
 * celebratory spray. Single reusable canvas mounted once at app-root.
 */
export function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const lastTickRef = useRef<number>(0)

  useEffect(() => {
    if (typeof window === "undefined") return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize, { passive: true })

    const startLoop = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(tick)
    }

    const onFire = (e: Event) => {
      const ce = e as CustomEvent<{ x: number; y: number; count?: number }>
      const { x = window.innerWidth / 2, y = window.innerHeight / 2, count = 70 } = ce.detail || {}
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI - Math.PI
        const speed = 4 + Math.random() * 6
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1) * 0.8,
          vy: Math.sin(angle) * speed,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.3,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 4 + Math.random() * 5,
          shape: Math.random() > 0.4 ? "rect" : "circle",
          life: 1,
        })
      }
      startLoop()
    }
    window.addEventListener("ls:confetti", onFire as EventListener)

    const tick = (now: number) => {
      const dt = Math.min(now - lastTickRef.current, 40)
      lastTickRef.current = now
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      const gravity = 0.35
      const drag = 0.985
      const arr = particlesRef.current
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i]
        p.vx *= drag
        p.vy = p.vy * drag + gravity
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vrot
        p.life -= 0.014
        if (p.life <= 0 || p.y > window.innerHeight + 40) {
          arr.splice(i, 1); continue
        }
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      ctx.globalAlpha = 1
      // Stop looping when there's nothing to draw — saves a full clear/frame forever.
      if (arr.length === 0) {
        rafRef.current = 0
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
      void dt
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
      window.removeEventListener("ls:confetti", onFire as EventListener)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen pointer-events-none z-[110]"
    />
  )
}

/** Fire a confetti burst at the given screen coordinates. */
export function fireConfetti(x: number, y: number, count = 70) {
  if (typeof window === "undefined") return
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
  window.dispatchEvent(new CustomEvent("ls:confetti", { detail: { x, y, count } }))
}
