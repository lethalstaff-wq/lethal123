"use client"

import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function StickyCTA() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 800)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <Link
      href="/products"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`group fixed bottom-6 right-6 z-40 hidden md:inline-flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold text-[14px] shadow-[0_0_40px_rgba(249, 115, 22, 0.58)] backdrop-blur-xl transition-all duration-300 ${show ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-3 scale-90 pointer-events-none"}`}
      style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
    >
      <span>View Products</span>
      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  )
}
