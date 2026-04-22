"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Premium custom cursor: precise orange dot + lagged ring with gradient stroke.
 * On hover over interactive elements the ring expands and fills softly.
 * Native cursor hidden globally via `html.custom-cursor-active` class.
 */
export function CursorEffects() {
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [hidden, setHidden] = useState(true)
  const [pressing, setPressing] = useState(false)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLDivElement | null>(null)
  const auraRef = useRef<HTMLDivElement | null>(null)
  const posRef = useRef({ x: 0, y: 0, rx: 0, ry: 0 })
  const rafRef = useRef(0)

  useEffect(() => {
    if (typeof window === "undefined") return
    const canHover = window.matchMedia?.("(hover: hover)").matches
    const noMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (canHover && !noMotion) {
      setEnabled(true)
      document.documentElement.classList.add("custom-cursor-active")
    }
    // In fullscreen, our fixed-position cursor is outside the fullscreen element
    // and gets clipped — restore the native cursor there and hide ours.
    const onFs = () => {
      const fs = !!document.fullscreenElement
      if (fs) document.documentElement.classList.add("cursor-in-fullscreen")
      else document.documentElement.classList.remove("cursor-in-fullscreen")
    }
    document.addEventListener("fullscreenchange", onFs)
    return () => {
      document.documentElement.classList.remove("custom-cursor-active")
      document.documentElement.classList.remove("cursor-in-fullscreen")
      document.removeEventListener("fullscreenchange", onFs)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const onMove = (e: MouseEvent) => {
      posRef.current.x = e.clientX
      posRef.current.y = e.clientY
      if (hidden) setHidden(false)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
      }
      if (auraRef.current) {
        auraRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
      }
    }
    const onLeave = () => setHidden(true)
    const onEnter = () => setHidden(false)
    const onDown = () => setPressing(true)
    const onUp = () => setPressing(false)

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (!t) return
      const interactive = t.closest('a, button, [data-cursor], [role="button"], input, textarea, select, label')
      setHovering(!!interactive)
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("mouseover", onOver, { passive: true })
    window.addEventListener("mousedown", onDown, { passive: true })
    window.addEventListener("mouseup", onUp, { passive: true })
    document.addEventListener("mouseleave", onLeave)
    document.addEventListener("mouseenter", onEnter)

    const tick = () => {
      const p = posRef.current
      // Softer lerp on the ring so it trails more visibly
      p.rx += (p.x - p.rx) * 0.17
      p.ry += (p.y - p.ry) * 0.17
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${p.rx.toFixed(2)}px, ${p.ry.toFixed(2)}px, 0) translate(-50%, -50%)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseover", onOver)
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("mouseup", onUp)
      document.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mouseenter", onEnter)
      cancelAnimationFrame(rafRef.current)
    }
  }, [enabled, hidden])

  if (!enabled) return null

  return (
    <>
      {/* Soft aura — radial orange glow that instantly follows the cursor */}
      <div
        ref={auraRef}
        className="pointer-events-none fixed top-0 left-0 z-[9997] hidden lg:block"
        style={{
          width: hovering ? 140 : 80,
          height: hovering ? 140 : 80,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.22) 0%, transparent 65%)",
          opacity: hidden ? 0 : 1,
          transition: "opacity 0.25s ease, width 0.35s cubic-bezier(0.22,1,0.36,1), height 0.35s cubic-bezier(0.22,1,0.36,1)",
          filter: "blur(4px)",
          willChange: "transform",
        }}
        aria-hidden="true"
      />

      {/* Precise inner dot — no lag, 1:1 with cursor */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden lg:block"
        style={{
          width: pressing ? 4 : hovering ? 6 : 5,
          height: pressing ? 4 : hovering ? 6 : 5,
          borderRadius: "50%",
          background: "#fbbf24",
          boxShadow: "0 0 10px rgba(251,191,36,0.9), 0 0 18px rgba(249,115,22,0.6)",
          opacity: hidden ? 0 : 1,
          transition: "opacity 0.2s ease, width 0.2s ease, height 0.2s ease, background 0.25s ease",
          willChange: "transform",
        }}
        aria-hidden="true"
      />

      {/* Outer ring — lags behind, has gradient stroke via conic background + mask */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] hidden lg:block"
        style={{
          width: pressing ? 28 : hovering ? 62 : 38,
          height: pressing ? 28 : hovering ? 62 : 38,
          borderRadius: "50%",
          background: hovering
            ? "conic-gradient(from 0deg, rgba(249,115,22,0.95), rgba(251,191,36,0.9), rgba(249,115,22,0.95))"
            : "conic-gradient(from 0deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25), rgba(255,255,255,0.55))",
          WebkitMask: "radial-gradient(circle, transparent 55%, black 57%, black 100%)",
          mask: "radial-gradient(circle, transparent 55%, black 57%, black 100%)",
          opacity: hidden ? 0 : 1,
          transition: "opacity 0.22s ease, width 0.28s cubic-bezier(0.22,1,0.36,1), height 0.28s cubic-bezier(0.22,1,0.36,1), background 0.3s ease",
          willChange: "transform, width, height",
          animation: hovering ? "cursorSpin 2.4s linear infinite" : "cursorSpin 5s linear infinite",
        }}
        aria-hidden="true"
      />

      <style jsx global>{`
        @keyframes cursorSpin {
          from { filter: hue-rotate(0deg); }
          to { filter: hue-rotate(20deg); }
        }
      `}</style>
    </>
  )
}
