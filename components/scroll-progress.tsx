"use client"

import { useEffect, useState } from "react"

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[101] pointer-events-none h-[2px]"
    >
      <div
        className="h-full origin-left transition-transform duration-75 ease-out"
        style={{
          transform: `scaleX(${progress / 100})`,
          background: "linear-gradient(90deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)",
          boxShadow: "0 0 12px rgba(249, 115, 22, 0.8), 0 0 4px rgba(249, 115, 22, 0.85)",
        }}
      />
    </div>
  )
}
