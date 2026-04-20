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
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/10 overflow-hidden animate-fade-in-up">
        {/* Close */}
        <button aria-label="Close"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-primary/20 blur-3xl rounded-full" />

        <div className="relative p-8 pt-10 text-center">
          {/* Gift icon */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Gift className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold mb-1">
            {"Welcome to "}
            <span className="text-primary">Lethal Solutions</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Exclusive offer just for you! Use this code at checkout.
          </p>

          {/* Discount badge */}
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4">
            {DISCOUNT}% OFF
          </div>

          {/* Coupon code */}
          <div
            onClick={handleCopy}
            className="relative mx-auto max-w-xs rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-6 py-4 cursor-pointer hover:border-primary/60 transition-colors mb-6 group"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-bold tracking-widest text-foreground">{COUPON_CODE}</span>
              {copied ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
            {copied && (
              <p className="text-[10px] text-green-400 mt-1">Copied to clipboard!</p>
            )}
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-6">
            <Clock className="h-3.5 w-3.5" />
            <span>This offer expires in:</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-8">
            {[
              { value: hours, label: "Hours" },
              { value: minutes, label: "Minutes" },
              { value: seconds, label: "Seconds" },
            ].map((unit, i) => (
              <div key={unit.label} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-xl border border-border/60 bg-card/80 flex items-center justify-center">
                    <span className="text-2xl font-bold font-mono">{String(unit.value).padStart(2, "0")}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1.5">{unit.label}</span>
                </div>
                {i < 2 && <span className="text-xl font-bold text-muted-foreground -mt-5">:</span>}
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            onClick={handleClose}
            className="w-full py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}
