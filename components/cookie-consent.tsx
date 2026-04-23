"use client"

import { useState, useEffect } from "react"
import { Shield, X } from "lucide-react"
import Link from "next/link"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent")
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted")
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={`fixed bottom-20 md:bottom-6 right-6 z-[80] max-w-sm transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
      <div className="relative rounded-2xl border border-white/[0.10] bg-black/90 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.55),0_0_40px_rgba(249, 115, 22, 0.14)] p-5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent pointer-events-none" />
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f97316]/25 to-[#ea580c]/15 border border-[#f97316]/30 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_rgba(249, 115, 22, 0.26)]">
            <Shield className="h-[18px] w-[18px] text-[#f97316]" style={{ filter: "drop-shadow(0 0 8px rgba(249, 115, 22, 0.72))" }} />
          </div>
          <div className="flex-1">
            <p className="font-display text-[14px] font-bold text-white mb-1 tracking-tight">Cookie Notice</p>
            <p className="text-[12px] text-white/65 leading-relaxed">
              We use cookies to improve your experience. By continuing, you agree to our{" "}
              <Link href="/privacy" className="text-[#f97316] font-semibold hover:text-[#fbbf24] transition-colors">Privacy Policy</Link>.
            </p>
          </div>
          <button aria-label="Dismiss cookie notice" onClick={decline} className="p-1.5 rounded-full text-white/55 hover:text-white hover:bg-white/[0.06] transition-all">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={accept}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white text-[12px] font-bold hover:brightness-110 hover:scale-[1.02] transition-all shadow-[0_4px_14px_rgba(249, 115, 22, 0.46),inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            Accept All
          </button>
          <button
            onClick={decline}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.10] bg-white/[0.025] text-[12px] font-bold text-white/65 hover:text-white hover:border-white/[0.20] hover:bg-white/[0.05] transition-all"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
