"use client"

import { useEffect, useRef, useState } from "react"

type CursorMode = "default" | "cta" | "drag" | "text"

/**
 * Premium cursor system:
 * - Default: soft orange glow follower, amplifies on move
 * - CTA mode (data-cursor="cta"): enlarged ring + label tip
 * - Particle trail (rare: 4 px every 14 px of movement, max 10, fast decay)
 *
 * Auto-disabled on touch and reduced-motion.
 */
export function CursorEffects() {
  const [mode, setMode] = useState<CursorMode>("default")
  const [label, setLabel] = useState<string>("")
  const [enabled, setEnabled] = useState(false)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLDivElement | null>(null)
  const labelRef = useRef<HTMLDivElement | null>(null)
  const trailRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef(0)
  const posRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 })

  // Detect environment
  useEffect(() => {
    if (typeof window === "undefined") return
    const canHover = window.matchMedia?.("(hover: hover)").matches
    const noMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (canHover && !noMotion) {
      setEnabled(true)
      document.documentElement.classList.add("has-cursor-effects")
    }
    return () => {
      document.documentElement.classList.remove("has-cursor-effects")
    }
  }, [])

  // Main pointer + animation loop
  useEffect(() => {
    if (!enabled) return
    let trailIdx = 0
    let lastTrail = { x: 0, y: 0 }

    const onMove = (e: MouseEvent) => {
      posRef.current.tx = e.clientX
      posRef.current.ty = e.clientY

      // Trail: emit a dot every ~14px of movement
      const dx = e.clientX - lastTrail.x
      const dy = e.clientY - lastTrail.y
      if (dx * dx + dy * dy > 14 * 14) {
        const el = trailRefs.current[trailIdx % trailRefs.current.length]
        if (el) {
          el.style.left = `${e.clientX}px`
          el.style.top = `${e.clientY}px`
          el.style.opacity = "0.65"
          el.style.transform = "translate(-50%, -50%) scale(1)"
          setTimeout(() => {
            if (el) {
              el.style.opacity = "0"
              el.style.transform = "translate(-50%, -50%) scale(0.4)"
            }
          }, 120)
        }
        trailIdx++
        lastTrail = { x: e.clientX, y: e.clientY }
      }
    }

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const cta = target.closest?.("[data-cursor='cta'], .cursor-cta") as HTMLElement | null
      if (cta) {
        setMode("cta")
        setLabel(cta.getAttribute("data-cursor-label") || "")
        return
      }
      const text = target.closest?.("[data-cursor='text']") as HTMLElement | null
      if (text) {
        setMode("text")
        setLabel("")
        return
      }
      const drag = target.closest?.("[data-cursor='drag']") as HTMLElement | null
      if (drag) {
        setMode("drag")
        setLabel("drag")
        return
      }
      setMode("default")
      setLabel("")
    }

    const onLeave = () => setMode("default")

    window.addEventListener("mousemove", onMove, { passive: true })
    document.addEventListener("mouseover", onOver, { passive: true })
    document.addEventListener("mouseleave", onLeave)

    const tick = () => {
      const p = posRef.current
      // Ring lags behind (smooth chase)
      p.x += (p.tx - p.x) * 0.22
      p.y += (p.ty - p.y) * 0.22
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0) translate(-50%, -50%)`
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${p.tx.toFixed(2)}px, ${p.ty.toFixed(2)}px, 0) translate(-50%, -50%)`
      }
      if (labelRef.current && mode === "cta") {
        labelRef.current.style.transform = `translate3d(${p.tx.toFixed(2)}px, ${(p.ty + 42).toFixed(2)}px, 0) translate(-50%, 0)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseover", onOver)
      document.removeEventListener("mouseleave", onLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [enabled, mode])

  if (!enabled) return null

  const ringSize = mode === "cta" ? 64 : mode === "text" ? 30 : 28
  const ringBorder = mode === "cta" ? 2 : 1
  const ringColor = mode === "cta" ? "rgba(249, 115, 22, 0.9)" : "rgba(249, 115, 22, 0.35)"

  return (
    <>
      {/* Outer ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed z-[9999] top-0 left-0 hidden lg:block"
        style={{
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          border: `${ringBorder}px solid ${ringColor}`,
          transition: "width 220ms cubic-bezier(0.22,1,0.36,1), height 220ms cubic-bezier(0.22,1,0.36,1), border-color 220ms, background-color 220ms, box-shadow 220ms",
          mixBlendMode: "normal",
          willChange: "transform, width, height",
          background: mode === "cta" ? "rgba(249, 115, 22, 0.08)" : "transparent",
          boxShadow: mode === "cta" ? "0 0 40px rgba(249, 115, 22, 0.45)" : "0 0 0 transparent",
        }}
        aria-hidden="true"
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed z-[10000] top-0 left-0 hidden lg:block"
        style={{
          width: mode === "cta" ? 0 : 5,
          height: mode === "cta" ? 0 : 5,
          borderRadius: "50%",
          background: "#f97316",
          boxShadow: "0 0 8px #f97316",
          transition: "width 180ms, height 180ms",
          willChange: "transform",
        }}
        aria-hidden="true"
      />
      {/* CTA label under cursor */}
      {mode === "cta" && label ? (
        <div
          ref={labelRef}
          className="pointer-events-none fixed z-[9999] top-0 left-0 hidden lg:block"
          aria-hidden="true"
        >
          <div className="px-2.5 py-1 rounded-full bg-[#f97316] text-white text-[10px] font-bold uppercase tracking-[0.15em] shadow-[0_4px_16px_rgba(249,115,22,0.6)]">
            {label}
          </div>
        </div>
      ) : null}
      {/* Subtle particle trail */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el
          }}
          className="pointer-events-none fixed z-[9998] top-0 left-0 hidden lg:block"
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#fb923c",
            opacity: 0,
            boxShadow: "0 0 6px #f97316",
            transition: "opacity 240ms ease-out, transform 240ms ease-out",
          }}
          aria-hidden="true"
        />
      ))}
    </>
  )
}
