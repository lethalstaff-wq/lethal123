"use client"

import { useEffect } from "react"
import Lenis from "@studio-freight/lenis"

/**
 * Global butter-smooth scroll. Mounted once in root layout.
 *
 * Contract:
 * - Desktop / mouse-wheel only — disabled on touch devices (iOS native inertia is
 *   better than any JS smooth-scroll; Darkroom / Studio Freight's own sites do the same)
 * - Respects prefers-reduced-motion
 * - Uses lerp (frame-rate-independent interpolation) — premium default tuned after
 *   research into Linear, Stripe, Rauno Freiberg, and Awwwards winners
 * - [data-lenis-prevent] is auto-detected by Lenis's virtual-scroll event walker,
 *   so inner scroll containers (modals, command palette, media player) work natively
 *   — no JS config needed, only the attribute + CSS rule in globals.css
 * - Exposes lenis.scrollTo globally via window.__lenis for anchor/back-to-top
 */
export function LenisProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    if (mediaQuery?.matches) return
    const isTouch = window.matchMedia?.("(hover: none)").matches
    if (isTouch) return

    const lenis = new Lenis({
      // Why: 0.1 is the Lenis default and the premium sweet spot everyone lands on.
      // Per Timothy Ricks and multiple teardowns, lower values (0.06) feel "mushy"
      // and introduce visible trail at 60Hz (~1s to resolve 99% of target).
      // 0.1 resolves in ~7 frames @ 60Hz and ~14 @ 120Hz — fast enough to feel
      // responsive, slow enough to smooth the 16ms wheel-tick staircase.
      lerp: 0.1,

      // Why: enables the virtual wheel layer — the whole point of Lenis.
      smoothWheel: true,

      // Why: 1.0 is the default and what Linear / Stripe ship. Values <1 (we had
      // 0.85) make scrolling feel sluggish and frustrate power users who expect
      // their wheel/trackpad calibration to behave normally. Tuning here is the
      // #1 thing that makes a site feel "off" — leave it at 1.
      wheelMultiplier: 1.0,

      // Why: locks the virtual scroll to vertical only so horizontal trackpad
      // gestures pass through to the browser (preserves two-finger swipe-back
      // on macOS and lets horizontally-scrollable children work natively).
      gestureOrientation: "vertical",

      // Why: explicit false > implicit default for intent. iOS Safari and Android
      // Chrome ship inertial scroll that's hardware-calibrated per device — any
      // JS smoothing on top creates a "rubber band over rubber band" sensation.
      // This is also why we early-return on (hover: none) above; double safety.
      syncTouch: false,

      // Why: auto-recalculates scroll limits when the document resizes (image
      // loads, reveal animations expanding sections, modal open/close shifting
      // layout). On by default but declared explicitly since this codebase has
      // a lot of post-mount layout shifts from scroll-reveal + lazy content.
      autoResize: true,
    })

    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis

    // Note: @studio-freight/lenis@1.0.42 does not expose `autoRaf` (that ships
    // in the newer `lenis` package). A manual rAF loop is equivalent in cost —
    // the browser coalesces rAF callbacks regardless of source.
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
