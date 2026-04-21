"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Subtle cursor follow-dot. Native cursor stays visible — this adds a small
 * orange glow that trails the pointer. Desktop + no-reduced-motion only.
 * Kept intentionally minimal so it never fights the native cursor.
 */
export function CursorEffects() {
  const [enabled, setEnabled] = useState(false)
  const dotRef = useRef<HTMLDivElement | null>(null)
  const posRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const rafRef = useRef(0)

  useEffect(() => {
    if (typeof window === "undefined") return
    const canHover = window.matchMedia?.("(hover: hover)").matches
    const noMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (canHover && !noMotion) setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const onMove = (e: MouseEvent) => {
      posRef.current.tx = e.clientX
      posRef.current.ty = e.clientY
    }
    window.addEventListener("mousemove", onMove, { passive: true })

    const tick = () => {
      const p = posRef.current
      p.x += (p.tx - p.x) * 0.2
      p.y += (p.ty - p.y) * 0.2
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0) translate(-50%, -50%)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed z-[9999] top-0 left-0 hidden lg:block"
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(249,115,22,0.35) 0%, transparent 70%)",
        filter: "blur(2px)",
        willChange: "transform",
      }}
      aria-hidden="true"
    />
  )
}
