"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

// Floating "back to top" button — appears after scrolling past the fold
// so readers on long pages (apply, reviews, guides, changelog) get a quick
// escape hatch.
export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-[45] group w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.012))",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 12px 28px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.9)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <ArrowUp
        className="h-4 w-4 text-white/60 group-hover:text-white/90 transition-colors"
        strokeWidth={2.2}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "rgba(255,255,255,0.04)",
        }}
      />
    </button>
  )
}
