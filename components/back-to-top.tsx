"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

export function BackToTop() {
  const [show, setShow] = useState(false)
  const [progress, setProgress] = useState(0) // 0..1

  useEffect(() => {
    const onScroll = () => {
      const visible = window.scrollY > 500
      setShow(visible)
      document.body.setAttribute("data-back-to-top", visible ? "true" : "false")
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollTop = () => {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (to: number) => void } }).__lenis
    if (lenis) lenis.scrollTo(0)
    else window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Ring math — circumference based progress
  const RADIUS = 22
  const CIRC = 2 * Math.PI * RADIUS
  const dashOffset = CIRC * (1 - progress)

  return (
    <button
      onClick={scrollTop}
      aria-label="Back to top"
      data-cursor="cta"
      data-cursor-label="Top"
      className={`cursor-cta fixed bottom-6 left-6 z-[70] group flex items-center justify-center w-12 h-12 rounded-full bg-black/80 backdrop-blur-xl border border-white/[0.10] text-white/55 hover:text-[#f97316] hover:-translate-y-0.5 hover:border-[#f97316]/50 hover:shadow-[0_10px_30px_rgba(249,115,22,0.3)] shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      {/* Progress ring SVG */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1.5"
        />
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke="url(#btt-grad)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.25s ease-out" }}
        />
        <defs>
          <linearGradient id="btt-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      <ArrowUp className="relative h-[18px] w-[18px] group-hover:-translate-y-0.5 transition-transform duration-300" />
    </button>
  )
}
