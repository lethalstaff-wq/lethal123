"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Gift, Copy, Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

const POPUP_STORAGE_KEY = "lethal_welcome_popup"
const TIMER_STORAGE_KEY = "lethal_welcome_timer"
const TIMER_DURATION = 3 * 60 * 60 // 3 hours in seconds
const COUPON_CODE = "LETHAL"
const DISCOUNT = 10

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)

  useEffect(() => {
    // Check if already dismissed
    const dismissed = sessionStorage.getItem(POPUP_STORAGE_KEY)
    if (dismissed) return

    // Load or init timer from localStorage (persists across refreshes)
    const stored = localStorage.getItem(TIMER_STORAGE_KEY)
    if (stored) {
      const { expiresAt } = JSON.parse(stored)
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      if (remaining > 0) {
        setTimeLeft(remaining)
      } else {
        // Timer expired, reset it
        const newExpiry = Date.now() + TIMER_DURATION * 1000
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({ expiresAt: newExpiry }))
        setTimeLeft(TIMER_DURATION)
      }
    } else {
      const newExpiry = Date.now() + TIMER_DURATION * 1000
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({ expiresAt: newExpiry }))
      setTimeLeft(TIMER_DURATION)
    }

    // Show popup after a short delay
    const timer = setTimeout(() => setIsOpen(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    if (timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isOpen, timeLeft])

  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(COUPON_CODE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    sessionStorage.setItem(POPUP_STORAGE_KEY, "1")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl border border-white/[0.10] bg-black/95 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_60px_rgba(249, 115, 22, 0.26)] overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent pointer-events-none" />

        {/* Close */}
        <button aria-label="Close"
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full text-white/55 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#f97316]/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative p-8 pt-12 text-center">
          {/* Gift icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f97316]/30 to-[#ea580c]/15 border border-[#f97316]/40 flex items-center justify-center mx-auto mb-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_30px_rgba(249, 115, 22, 0.43)]">
            <Gift className="h-9 w-9 text-[#f97316]" style={{ filter: "drop-shadow(0 0 12px rgba(249, 115, 22, 0.85))" }} />
          </div>

          <h2 className="font-display text-3xl font-bold mb-1.5 tracking-tight">
            <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Welcome to </span>
            <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 16px rgba(249, 115, 22, 0.58))" }}>Lethal</span>
          </h2>
          <p className="text-[14px] text-white/65 mb-6">
            Exclusive offer just for you! Use this code at checkout.
          </p>

          {/* Discount badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-[12px] font-black tracking-wider mb-4 shadow-[0_4px_14px_rgba(249, 115, 22, 0.58)]">
            <span className="text-[14px]">⚡</span>
            {DISCOUNT}% OFF
          </div>

          {/* Coupon code */}
          <button
            type="button"
            onClick={handleCopy}
            className="relative w-full rounded-xl border-2 border-dashed border-[#f97316]/45 bg-[#f97316]/[0.05] px-6 py-5 cursor-pointer hover:border-[#f97316]/70 hover:bg-[#f97316]/[0.08] transition-all mb-6 group"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-bold tracking-[0.25em] text-white">{COUPON_CODE}</span>
              {copied ? (
                <Check className="h-5 w-5 text-emerald-400" />
              ) : (
                <Copy className="h-5 w-5 text-white/55 group-hover:text-[#f97316] transition-colors" />
              )}
            </div>
            {copied && (
              <p className="text-[11px] text-emerald-400 mt-1.5 font-semibold">Copied to clipboard!</p>
            )}
          </button>

          {/* Timer */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/55 mb-4 uppercase tracking-[0.15em] font-bold">
            <Clock className="h-3.5 w-3.5 text-[#f97316]" />
            <span>Offer expires in</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 mb-8">
            {[
              { value: hours, label: "HRS" },
              { value: minutes, label: "MIN" },
              { value: seconds, label: "SEC" },
            ].map((unit, i) => (
              <div key={unit.label} className="flex items-center gap-2.5">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-xl border border-white/[0.10] bg-gradient-to-b from-white/[0.06] to-white/[0.02] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <span className="font-display text-3xl font-black tabular-nums text-white">{String(unit.value).padStart(2, "0")}</span>
                  </div>
                  <span className="text-[9px] text-white/55 mt-1.5 uppercase tracking-[0.15em] font-bold">{unit.label}</span>
                </div>
                {i < 2 && <span className="text-2xl font-black text-[#f97316]/40 -mt-5">:</span>}
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            onClick={handleClose}
            className="w-full py-6 bg-gradient-to-br from-[#f97316] to-[#ea580c] hover:brightness-110 text-white font-bold text-[14px] rounded-xl shadow-[0_8px_24px_rgba(249, 115, 22, 0.46),inset_0_1px_0_rgba(255,255,255,0.08)] border-0 hover:scale-[1.02] transition-all"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}
