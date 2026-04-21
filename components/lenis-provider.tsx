"use client"

import { useEffect } from "react"
import Lenis from "@studio-freight/lenis"

/**
 * Global butter-smooth scroll. Mounted once in root layout.
 *
 * Contract:
 * - Desktop / mouse-wheel only — disabled on touch devices (iOS already has good inertial)
 * - Respects prefers-reduced-motion
 * - lerp 0.1 is the premium sweet spot
 * - Exposes lenis.scrollTo globally via window.__lenis for anchor links that need custom offsets
 */
export function LenisProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    if (mediaQuery?.matches) return
    const isTouch = window.matchMedia?.("(hover: none)").matches
    if (isTouch) return

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    })

    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      delete (window as unknown as { __lenis?: Lenis }).__lenis
    }
  }, [])

  return null
}
