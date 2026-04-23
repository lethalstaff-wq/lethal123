"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { ArrowRight, X, Sparkles } from "lucide-react"

type Step = {
  title: string
  body: string
  hint: string
  action?: string
}

const STEPS: Step[] = [
  {
    title: "Welcome to Lethal",
    body: "5-second tour. No signups, no bloat — just the essentials.",
    hint: "You can always dismiss with Esc.",
  },
  {
    title: "Quick search anywhere",
    body: "Press ⌘K / Ctrl+K to search products, pages, and your recent visits.",
    hint: "Also opens from the Search button in the navbar.",
    action: "Try ⌘K",
  },
  {
    title: "Keyboard power-mode",
    body: "Press ? to see all shortcuts. g h → home, g p → products, g r → reviews.",
    hint: "Inspired by Linear / Arc.",
    action: "Press ?",
  },
  {
    title: "Your cart is instant",
    body: "Crypto or PayPal. License delivered to your inbox in under 60 seconds.",
    hint: "All products include lifetime Discord support.",
    action: "Got it",
  },
]

const KEY = "ls_onboarding_done"

export function OnboardingTour() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (pathname !== "/") return
    try {
      const done = typeof window !== "undefined" && window.localStorage.getItem(KEY) === "1"
      if (done) return
    } catch { /* noop */ }
    const t = setTimeout(() => setShow(true), 2400)
    return () => clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    if (!show) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "Enter" || e.key === "ArrowRight") next()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, step])

  const close = () => {
    setShow(false)
    try { window.localStorage.setItem(KEY, "1") } catch { /* noop */ }
  }
  const next = () => {
    if (step >= STEPS.length - 1) close()
    else setStep((s) => s + 1)
  }

  if (!show) return null
  const s = STEPS[step]
  const pct = ((step + 1) / STEPS.length) * 100

  return (
    <div className="fixed bottom-6 right-6 z-[85] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300" data-lenis-prevent>
      <div className="relative rounded-2xl border border-white/[0.10] bg-[#0a0a0a]/95 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_40px_rgba(249,115,22,0.16)] overflow-hidden">
        {/* Orange top accent + step progress */}
        <div className="h-[2px] bg-white/[0.04] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#fbbf24] via-[#f97316] to-[#ea580c] transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%`, boxShadow: "0 0 10px rgba(249,115,22,0.7)" }}
          />
        </div>

        <button
          onClick={close}
          aria-label="Dismiss tour"
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/55 hover:bg-white/[0.10] hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="p-5 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#f97316]/12 border border-[#f97316]/30">
              <Sparkles className="h-3.5 w-3.5 text-[#f97316]" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              {step + 1} / {STEPS.length}
            </span>
          </div>
          <h3 className="font-display text-[17px] font-bold text-white tracking-tight mb-2">{s.title}</h3>
          <p className="text-[13px] text-white/65 leading-[1.55] mb-3">{s.body}</p>
          <p className="text-[11px] text-white/35 italic mb-4">{s.hint}</p>

          <div className="flex items-center gap-2 justify-between">
            <button
              onClick={close}
              className="text-[11px] text-white/40 hover:text-white/70 transition-colors"
            >
              Skip tour
            </button>
            <button
              onClick={next}
              data-cursor="cta"
              className="cursor-cta press-spring inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-[12px] text-white shadow-[0_0_20px_rgba(249,115,22,0.35)]"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              {s.action ?? (step === STEPS.length - 1 ? "Finish" : "Next")}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
