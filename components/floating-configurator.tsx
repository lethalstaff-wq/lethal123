"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, ChevronLeft, Gamepad2, ShieldOff, Cpu, Package, Sparkles, Monitor, CheckCircle2 } from "lucide-react"
import { PRODUCTS, formatPrice } from "@/lib/products"
import Image from "next/image"
import Link from "next/link"

type Step = "purpose" | "dma-check" | "game" | "budget" | "result"

interface Answers {
  purpose: string | null
  hasDMA: boolean | null
  game: string | null
  budgetMax: number
}

interface Recommendation {
  product: typeof PRODUCTS[number]
  variant: typeof PRODUCTS[number]["variants"][number]
  reason: string
}

function getReasonText(product: typeof PRODUCTS[number], answers: Answers): string {
  if (answers.purpose === "banned") {
    if (product.id === "perm-spoofer") return "One install — your banned HWID is gone forever"
    if (product.id === "temp-spoofer") return "Quick fix for alt accounts, clears on restart"
  }
  if (product.id === "fortnite-external") return "No DMA needed — single PC, zero FPS impact"
  if (product.id === "blurred") return "Premium DMA cheat — 6+ months undetected"
  if (product.id === "streck") return "Budget-friendly DMA cheat — great starter"
  if (product.id === "custom-dma-firmware") return "Unique build per order — no shared releases"
  if (product.category === "bundle") return "Complete setup — hardware + cheat + firmware included"
  if (product.popular) return "Most popular — trusted by thousands"
  return "Recommended for your setup"
}

function getBestVariant(product: typeof PRODUCTS[number], budgetMax: number) {
  // Find the most expensive variant that fits the budget (best value within budget)
  const affordable = product.variants.filter(v => v.priceInPence <= budgetMax)
  if (affordable.length === 0) return product.variants[0] // fallback to cheapest
  // Pick the most expensive affordable one (longest duration / lifetime)
  return affordable.reduce((best, v) => v.priceInPence > best.priceInPence ? v : best, affordable[0])
}

function getRecommendations(answers: Answers): Recommendation[] {
  if (!answers.purpose) return []

  let filtered = [...PRODUCTS]

  // Filter by purpose
  if (answers.purpose === "banned") {
    filtered = filtered.filter(p => p.category === "spoofer")
  } else if (answers.purpose === "cheats") {
    if (answers.hasDMA === false) {
      filtered = filtered.filter(p => p.category === "cheat" && !p.name.toLowerCase().includes("dma"))
    } else if (answers.hasDMA === true) {
      filtered = filtered.filter(p =>
        (p.category === "cheat" && p.name.toLowerCase().includes("dma")) ||
        p.category === "firmware"
      )
    } else {
      filtered = filtered.filter(p => p.category === "cheat")
    }
  } else if (answers.purpose === "firmware") {
    filtered = filtered.filter(p => p.category === "firmware")
  } else if (answers.purpose === "bundle") {
    filtered = filtered.filter(p => p.category === "bundle")
  }

  // Filter: at least one variant must be within budget
  filtered = filtered.filter(p =>
    p.variants.some(v => v.priceInPence <= answers.budgetMax)
  )

  // Sort: popular first, then by price
  filtered.sort((a, b) => {
    if (a.popular && !b.popular) return -1
    if (!a.popular && b.popular) return 1
    const aMin = Math.min(...a.variants.map(v => v.priceInPence))
    const bMin = Math.min(...b.variants.map(v => v.priceInPence))
    return aMin - bMin
  })

  return filtered.slice(0, 5).map(product => ({
    product,
    variant: getBestVariant(product, answers.budgetMax),
    reason: getReasonText(product, answers),
  }))
}

export function FloatingConfigurator() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<Step>("purpose")
  const [answers, setAnswers] = useState<Answers>({
    purpose: null, hasDMA: null, game: null, budgetMax: 99999999
  })
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  const totalSteps = answers.purpose === "cheats" ? 4 : 3
  const currentStepNum =
    step === "purpose" ? 1 :
    step === "dma-check" ? 2 :
    step === "game" ? 3 :
    step === "budget" ? (answers.purpose === "cheats" ? 3 : 2) :
    totalSteps

  const goBack = () => {
    if (step === "dma-check") setStep("purpose")
    else if (step === "game") setStep("dma-check")
    else if (step === "budget") {
      if (answers.purpose === "cheats") {
        setStep("dma-check")
      } else setStep("purpose")
    }
    else if (step === "result") setStep("budget")
  }

  const reset = () => {
    setStep("purpose")
    setAnswers({ purpose: null, hasDMA: null, game: null, budgetMax: 99999999 })
    setRecommendations([])
  }

  const selectPurpose = (p: string) => {
    setAnswers(prev => ({ ...prev, purpose: p }))
    if (p === "cheats") {
      setStep("dma-check")
    } else {
      setStep("budget")
    }
  }

  const selectDMA = (has: boolean) => {
    setAnswers(prev => ({ ...prev, hasDMA: has }))
    setStep("budget")
  }

  const selectBudget = (max: number) => {
    const newAnswers = { ...answers, budgetMax: max }
    setAnswers(newAnswers)
    setRecommendations(getRecommendations(newAnswers))
    setStep("result")
  }

  if (!isVisible) return null

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[80] flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-full bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-[13px] font-bold shadow-[0_8px_28px_rgba(249, 115, 22, 0.51)] hover:shadow-[0_12px_36px_rgba(249, 115, 22, 0.72)] hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95 transition-all duration-300 group ${
          isOpen ? "opacity-0 pointer-events-none scale-90" : "opacity-100"
        }`}
      >
        <Sparkles className="h-4 w-4 text-white group-hover:rotate-12 transition-transform" />
        Need help choosing?
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-black/95 backdrop-blur-xl border border-white/[0.10] shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_60px_rgba(249, 115, 22, 0.14)] overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 fade-in duration-300">

            {/* Decorative top glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-gradient-to-b from-[#f97316]/[0.04] to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f97316]/25 to-[#ea580c]/15 border border-[#f97316]/30 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_rgba(249, 115, 22, 0.26)]">
                  <Sparkles className="h-[18px] w-[18px] text-[#f97316]" style={{ filter: "drop-shadow(0 0 8px rgba(249, 115, 22, 0.85))" }} />
                </div>
                <div>
                  <h3 className="font-display text-white font-bold text-[16px] tracking-tight">Product Finder</h3>
                  <p className="text-[11px] text-white/55 font-medium">Step {currentStepNum} of {totalSteps}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} aria-label="Close" className="p-2 rounded-full text-white/45 hover:text-white hover:bg-white/[0.06] transition-all">
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-white/[0.05] relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#f97316] to-[#fbbf24] transition-all duration-500"
                style={{ width: `${(currentStepNum / totalSteps) * 100}%`, boxShadow: "0 0 12px rgba(249, 115, 22, 0.85)" }}
              />
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1">

              {/* STEP 1: Purpose */}
              {step === "purpose" && (
                <div>
                  <p className="text-sm text-white/50 mb-4">What do you need?</p>
                  <div className="space-y-2">
                    {[
                      { id: "banned", icon: ShieldOff, label: "I got HWID banned", desc: "Spoofer to unban your hardware" },
                      { id: "cheats", icon: Gamepad2, label: "Game cheats", desc: "ESP, aimbot, DMA cheats" },
                      { id: "firmware", icon: Cpu, label: "DMA firmware", desc: "Custom firmware for your DMA card" },
                      { id: "bundle", icon: Package, label: "Complete DMA setup", desc: "Hardware + cheat + firmware" },
                      { id: "all", icon: Sparkles, label: "Show everything", desc: "Browse all products" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => selectPurpose(opt.id)}
                        className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:border-[#f97316]/35 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_24px_rgba(249, 115, 22, 0.14)] transition-all duration-300 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] group-hover:bg-gradient-to-br group-hover:from-[#f97316]/25 group-hover:to-[#ea580c]/15 group-hover:border-[#f97316]/30 border border-white/[0.06] flex items-center justify-center transition-all duration-300">
                          <opt.icon className="h-[18px] w-[18px] text-white/55 group-hover:text-[#f97316] group-hover:scale-110 transition-all duration-300" style={{ filter: "drop-shadow(0 0 0 transparent)" }} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-[14px] font-bold text-white group-hover:text-[#f97316] transition-colors">{opt.label}</p>
                          <p className="text-[11px] text-white/45 mt-0.5">{opt.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[#f97316] group-hover:translate-x-1 transition-all duration-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: DMA Check (only for cheats) */}
              {step === "dma-check" && (
                <div>
                  <button onClick={goBack} className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 mb-4 transition-colors">
                    <ChevronLeft className="h-3 w-3" /> Back
                  </button>
                  <p className="text-sm text-white/50 mb-4">Do you have a DMA card?</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => selectDMA(true)}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:border-[#f97316]/35 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_24px_rgba(249, 115, 22, 0.14)] transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] group-hover:bg-gradient-to-br group-hover:from-[#f97316]/25 group-hover:to-[#ea580c]/15 group-hover:border-[#f97316]/30 border border-white/[0.06] flex items-center justify-center transition-all duration-300">
                        <Cpu className="h-[18px] w-[18px] text-white/55 group-hover:text-[#f97316] group-hover:scale-110 transition-all duration-300" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[14px] font-bold text-white group-hover:text-[#f97316] transition-colors">Yes, I have DMA hardware</p>
                        <p className="text-[11px] text-white/45 mt-0.5">Show DMA cheats & firmware</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[#f97316] group-hover:translate-x-1 transition-all duration-300" />
                    </button>
                    <button
                      onClick={() => selectDMA(false)}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:border-[#f97316]/35 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_24px_rgba(249, 115, 22, 0.14)] transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] group-hover:bg-gradient-to-br group-hover:from-[#f97316]/25 group-hover:to-[#ea580c]/15 group-hover:border-[#f97316]/30 border border-white/[0.06] flex items-center justify-center transition-all duration-300">
                        <Monitor className="h-[18px] w-[18px] text-white/55 group-hover:text-[#f97316] group-hover:scale-110 transition-all duration-300" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[14px] font-bold text-white group-hover:text-[#f97316] transition-colors">No, single PC only</p>
                        <p className="text-[11px] text-white/45 mt-0.5">Show external cheats (no extra hardware)</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[#f97316] group-hover:translate-x-1 transition-all duration-300" />
                    </button>
                    <button
                      onClick={() => { setAnswers(prev => ({ ...prev, hasDMA: null })); setStep("budget") }}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:border-[#f97316]/35 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_24px_rgba(249, 115, 22, 0.14)] transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] group-hover:bg-gradient-to-br group-hover:from-[#f97316]/25 group-hover:to-[#ea580c]/15 group-hover:border-[#f97316]/30 border border-white/[0.06] flex items-center justify-center transition-all duration-300">
                        <Sparkles className="h-[18px] w-[18px] text-white/55 group-hover:text-[#f97316] group-hover:scale-110 transition-all duration-300" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[14px] font-bold text-white group-hover:text-[#f97316] transition-colors">Not sure / show both</p>
                        <p className="text-[11px] text-white/45 mt-0.5">We'll show all options</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[#f97316] group-hover:translate-x-1 transition-all duration-300" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Budget */}
              {step === "budget" && (
                <div>
                  <button onClick={goBack} className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 mb-4 transition-colors">
                    <ChevronLeft className="h-3 w-3" /> Back
                  </button>
                  <p className="text-sm text-white/50 mb-4">What's your budget?</p>
                  <div className="space-y-2">
                    {[
                      { max: 2500, label: "Under £25", desc: "Budget picks" },
                      { max: 10000, label: "Under £100", desc: "Most popular range" },
                      { max: 50000, label: "Under £500", desc: "Premium options" },
                      { max: 200000, label: "Under £2,000", desc: "Full setups & bundles" },
                      { max: 99999999, label: "Any budget", desc: "Show me everything" },
                    ].map((range) => (
                      <button
                        key={range.label}
                        onClick={() => selectBudget(range.max)}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:border-[#f97316]/35 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_24px_rgba(249, 115, 22, 0.14)] transition-all duration-300 group"
                      >
                        <div>
                          <p className="text-[14px] font-bold text-white group-hover:text-[#f97316] transition-colors">{range.label}</p>
                          <p className="text-[11px] text-white/45 mt-0.5">{range.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[#f97316] group-hover:translate-x-1 transition-all duration-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Results */}
              {step === "result" && (
                <div>
                  {recommendations.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <p className="text-sm font-semibold text-white/70">
                          {recommendations.length} {recommendations.length === 1 ? "match" : "matches"} found
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        {recommendations.map((rec, i) => (
                          <Link
                            key={rec.product.id}
                            href={`/products/${rec.product.id}?variant=${rec.variant.id}`}
                            onClick={() => setIsOpen(false)}
                            className="block rounded-xl bg-white/[0.012] border border-white/[0.04] hover:border-white/[0.08] overflow-hidden transition-all group"
                          >
                            {i === 0 && (
                              <div className="bg-[#f97316]/[0.06] border-b border-[#f97316]/10 px-3.5 py-1.5">
                                <p className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" /> Best match
                                </p>
                              </div>
                            )}
                            <div className="flex items-center gap-3 p-3.5">
                              <div className="w-11 h-11 rounded-lg overflow-hidden border border-white/[0.04] flex-shrink-0 bg-white/[0.012]">
                                <Image src={rec.product.image} alt={rec.product.name} width={44} height={44} className="object-cover w-full h-full" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-bold truncate group-hover:text-[#f97316] transition-colors">{rec.product.name}</p>
                                  {rec.product.popular && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f97316]/10 text-[#f97316] font-bold shrink-0">HOT</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-white/25 truncate">{rec.variant.name} — {rec.reason}</p>
                              </div>
                              <p className="text-sm font-bold text-[#f97316] shrink-0">{formatPrice(rec.variant.priceInPence)}</p>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.04]">
                        <button onClick={reset} className="text-[11px] text-white/25 hover:text-white/50 transition-colors">
                          Start over
                        </button>
                        <Link
                          href="/products"
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] text-[#f97316]/60 hover:text-[#f97316] transition-colors"
                        >
                          Browse all products →
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
                        <Package className="h-5 w-5 text-white/15" />
                      </div>
                      <p className="text-sm text-white/40 mb-1">Nothing in this range</p>
                      <p className="text-[11px] text-white/20 mb-4">Try a higher budget</p>
                      <button onClick={reset} className="px-4 py-2 rounded-xl bg-[#f97316]/10 text-[#f97316] text-xs font-semibold hover:bg-[#f97316]/20 transition-colors">
                        Start Over
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}
