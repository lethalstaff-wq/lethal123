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
        className={`fixed bottom-6 right-6 z-[80] flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-2xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 group ${
          isOpen ? "opacity-0 pointer-events-none scale-90" : "opacity-100"
        }`}
      >
        <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
        Need help choosing?
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-white/[0.08] bg-[#0c0c0e] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 fade-in duration-300">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px]">Product Finder</h3>
                  <p className="text-[11px] text-white/30">Step {currentStepNum} of {totalSteps}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-white/25 hover:text-white hover:bg-white/[0.06] transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-white/[0.04]">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(currentStepNum / totalSteps) * 100}%` }}
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
                        className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] hover:border-primary/30 hover:bg-primary/[0.03] transition-all group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-white/[0.04] group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                          <opt.icon className="h-4 w-4 text-white/40 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold group-hover:text-primary transition-colors">{opt.label}</p>
                          <p className="text-[11px] text-white/25">{opt.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all" />
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
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] hover:border-primary/30 hover:bg-primary/[0.03] transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <Cpu className="h-4 w-4 text-white/40 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">Yes, I have DMA hardware</p>
                        <p className="text-[11px] text-white/25">Show DMA cheats & firmware</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all" />
                    </button>
                    <button
                      onClick={() => selectDMA(false)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] hover:border-primary/30 hover:bg-primary/[0.03] transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <Monitor className="h-4 w-4 text-white/40 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">No, single PC only</p>
                        <p className="text-[11px] text-white/25">Show external cheats (no extra hardware)</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all" />
                    </button>
                    <button
                      onClick={() => { setAnswers(prev => ({ ...prev, hasDMA: null })); setStep("budget") }}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] hover:border-primary/30 hover:bg-primary/[0.03] transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <Sparkles className="h-4 w-4 text-white/40 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">Not sure / show both</p>
                        <p className="text-[11px] text-white/25">We'll show all options</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all" />
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
                        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/[0.06] hover:border-primary/30 hover:bg-primary/[0.03] transition-all group"
                      >
                        <div>
                          <p className="text-sm font-semibold group-hover:text-primary transition-colors">{range.label}</p>
                          <p className="text-[11px] text-white/25">{range.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all" />
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
                            className="block rounded-xl border border-white/[0.06] hover:border-primary/30 overflow-hidden transition-all group"
                          >
                            {i === 0 && (
                              <div className="bg-primary/[0.06] border-b border-primary/10 px-3.5 py-1.5">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" /> Best match
                                </p>
                              </div>
                            )}
                            <div className="flex items-center gap-3 p-3.5">
                              <div className="w-11 h-11 rounded-lg overflow-hidden border border-white/[0.06] flex-shrink-0 bg-white/[0.02]">
                                <Image src={rec.product.image} alt={rec.product.name} width={44} height={44} className="object-cover w-full h-full" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{rec.product.name}</p>
                                  {rec.product.popular && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold shrink-0">HOT</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-white/25 truncate">{rec.variant.name} — {rec.reason}</p>
                              </div>
                              <p className="text-sm font-bold text-primary shrink-0">{formatPrice(rec.variant.priceInPence)}</p>
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
                          className="text-[11px] text-primary/60 hover:text-primary transition-colors"
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
                      <button onClick={reset} className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
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
