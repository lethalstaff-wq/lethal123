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
      className={`fixed bottom-6 left-6 z-[70] p-3.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/[0.10] text-white/55 hover:border-[#f97316]/40 hover:text-[#f97316] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(249,115,22,0.18)] shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <ArrowUp className="h-[18px] w-[18px]" />
    </button>
  )
}
