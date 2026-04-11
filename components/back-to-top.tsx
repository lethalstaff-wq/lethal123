"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

export function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const visible = window.scrollY > 500
      setShow(visible)
      document.body.setAttribute("data-back-to-top", visible ? "true" : "false")
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <button
      onClick={scrollTop}
      aria-label="Back to top"
      className={`fixed bottom-6 left-6 z-[70] p-3.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/[0.06] text-white/20 hover:border-white/[0.1] hover:text-white/50 hover:-translate-y-0.5 transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}
