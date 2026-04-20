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
      <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground mb-1">Cookie Notice</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use cookies to improve your experience. By continuing, you agree to our{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </div>
          <button aria-label="Close" onClick={decline} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={accept}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={decline}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border/50 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
