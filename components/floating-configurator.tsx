"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, Gamepad2, ShieldOff, Cpu, Package, Sparkles, Wand2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PRODUCTS, formatPrice } from "@/lib/products"
import Image from "next/image"
import Link from "next/link"

type Step = "purpose" | "budget" | "result"
type Purpose = "cheat" | "spoofer" | "firmware" | "bundle" | "all"

interface Answers {
  purpose: Purpose | null
  budgetMax: number
}

const PURPOSE_OPTIONS = [
  { id: "cheat" as Purpose, label: "Game Cheats", description: "DMA cheats for FN, Rust, Apex", icon: Gamepad2, categories: ["cheat"] },
  { id: "spoofer" as Purpose, label: "HWID Spoofer", description: "Unban & protect your PC", icon: ShieldOff, categories: ["spoofer"] },
  { id: "firmware" as Purpose, label: "DMA Firmware", description: "Custom anti-cheat bypass", icon: Cpu, categories: ["firmware"] },
  { id: "bundle" as Purpose, label: "Full DMA Setup", description: "Hardware + software combo", icon: Package, categories: ["bundle"] },
  { id: "all" as Purpose, label: "Show Everything", description: "Browse all products", icon: Sparkles, categories: ["cheat", "spoofer", "firmware", "bundle"] },
]

const BUDGET_RANGES = [
  { min: 0, max: 5000, label: "Under £50", emoji: "💰" },
  { min: 0, max: 10000, label: "Under £100", emoji: "💎" },
  { min: 0, max: 25000, label: "Under £250", emoji: "👑" },
  { min: 0, max: 99999999, label: "Any Budget", emoji: "∞" },
]

function getRecommendations(answers: Answers) {
  if (!answers.purpose) return []
  const purposeOption = PURPOSE_OPTIONS.find(p => p.id === answers.purpose)
  const categories = purposeOption?.categories || []

  const filtered = PRODUCTS.filter(p => {
    const categoryMatch = categories.includes(p.category)
    if (!categoryMatch) return false
    const minPrice = Math.min(...p.variants.map(v => v.priceInPence))
    return minPrice <= answers.budgetMax
  })

  const sorted = [...filtered].sort((a, b) => {
    if (a.popular && !b.popular) return -1
    if (!a.popular && b.popular) return 1
    const aMin = Math.min(...a.variants.map(v => v.priceInPence))
    const bMin = Math.min(...b.variants.map(v => v.priceInPence))
    return aMin - bMin
  })

  return sorted.slice(0, 6)
}

export function FloatingConfigurator() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<Step>("purpose")
  const [answers, setAnswers] = useState<Answers>({ purpose: null, budgetMax: 99999999 })
  const [recommendations, setRecommendations] = useState<typeof PRODUCTS>([])
  const [isVisible, setIsVisible] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handlePurposeSelect = (purpose: Purpose) => {
    setAnswers(prev => ({ ...prev, purpose }))
    setStep("budget")
  }

  const handleBudgetSelect = (max: number) => {
    const newAnswers = { ...answers, budgetMax: max }
    setAnswers(newAnswers)
    setRecommendations(getRecommendations(newAnswers))
    setStep("result")
  }

  const reset = () => {
    setStep("purpose")
    setAnswers({ purpose: null, budgetMax: 999999 })
    setRecommendations([])
  }

  const open = () => {
    setIsOpen(true)
    setHasInteracted(true)
  }

  if (!isVisible) return null

  const stepNumber = step === "purpose" ? 1 : step === "budget" ? 2 : 3

  return (
    <>
      {/* Floating Button — magic wand with pulse ring */}
      <div className={`fixed bottom-6 right-6 z-[80] transition-all duration-500 ${isOpen ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100"}`}>
        {/* Pulse ring for attention (only before first interaction) */}
        {!hasInteracted && (
          <span className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping" style={{ animationDuration: "2.5s" }} />
        )}
        <button
          onClick={open}
          className="relative p-4 rounded-2xl bg-gradient-to-br from-[#EF6F29] to-[#FF8C42] text-white shadow-lg shadow-[#EF6F29]/30 hover:shadow-xl hover:shadow-[#EF6F29]/40 hover:scale-110 active:scale-95 transition-all duration-300 group"
          aria-label="Find Your Perfect Product"
        >
          <Wand2 className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
        </button>
        {/* Tooltip */}
        {!hasInteracted && (
          <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 rounded-lg bg-card border border-border/50 text-xs font-medium whitespace-nowrap shadow-lg animate-fade-in-up opacity-0" style={{ animationDelay: "3s", animationFillMode: "forwards" }}>
            Need help choosing?
            <div className="absolute top-full right-5 w-2 h-2 bg-card border-r border-b border-border/50 rotate-45 -translate-y-1" />
          </div>
        )}
      </div>

      {/* Slide-in Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative w-full sm:w-[420px] sm:max-h-[85vh] max-h-[90vh] rounded-t-3xl sm:rounded-2xl border border-white/10 bg-[#0c0c0e] shadow-2xl overflow-hidden flex flex-col animate-fade-in-up" style={{ animationDuration: "0.3s" }}>
            {/* Header with progress */}
            <div className="flex-shrink-0">
              {/* Progress bar */}
              <div className="h-1 bg-white/5">
                <div
                  className="h-full bg-gradient-to-r from-[#EF6F29] to-[#FF8C42] transition-all duration-500 rounded-r-full"
                  style={{ width: `${(stepNumber / 3) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#EF6F29]/20 to-[#FF8C42]/10">
                    <Wand2 className="h-5 w-5 text-[#EF6F29]" />
                  </div>
                  <div>
                    <h3 className="font-bold">Product Finder</h3>
                    <p className="text-xs text-white/40">Step {stepNumber} of 3</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 pt-0 overflow-y-auto flex-1">
              {/* Step 1: Purpose */}
              {step === "purpose" && (
                <div className="space-y-2">
                  <p className="text-sm text-white/50 mb-4">What are you looking for?</p>
                  {PURPOSE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handlePurposeSelect(option.id)}
                      className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-white/[0.06] hover:border-[#EF6F29]/40 hover:bg-[#EF6F29]/[0.04] transition-all group"
                    >
                      <div className="p-2.5 rounded-lg bg-white/[0.04] group-hover:bg-[#EF6F29]/10 transition-colors">
                        <option.icon className="h-5 w-5 text-white/50 group-hover:text-[#EF6F29] transition-colors" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm">{option.label}</p>
                        <p className="text-xs text-white/30">{option.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/15 group-hover:text-[#EF6F29] group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Budget */}
              {step === "budget" && (
                <div className="space-y-2">
                  <button onClick={() => setStep("purpose")} className="text-xs text-white/30 hover:text-white mb-3 flex items-center gap-1 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <p className="text-sm text-white/50 mb-4">What&apos;s your budget?</p>
                  {BUDGET_RANGES.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => handleBudgetSelect(range.max)}
                      className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-white/[0.06] hover:border-[#EF6F29]/40 hover:bg-[#EF6F29]/[0.04] transition-all group"
                    >
                      <span className="text-lg w-8 text-center">{range.emoji}</span>
                      <span className="font-semibold text-sm flex-1 text-left">{range.label}</span>
                      <ChevronRight className="h-4 w-4 text-white/15 group-hover:text-[#EF6F29] group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3: Results */}
              {step === "result" && (
                <div className="space-y-3">
                  <button onClick={reset} className="text-xs text-white/30 hover:text-white mb-2 flex items-center gap-1 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> Start over
                  </button>

                  {recommendations.length > 0 ? (
                    <>
                      <p className="text-sm text-white/50">
                        Found <span className="text-[#EF6F29] font-bold">{recommendations.length}</span> {recommendations.length === 1 ? "match" : "matches"}
                      </p>
                      <div className="space-y-2">
                        {recommendations.map((product) => {
                          const minPrice = Math.min(...product.variants.map(v => v.priceInPence))
                          return (
                            <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3.5 p-3 rounded-xl border border-white/[0.06] hover:border-[#EF6F29]/40 hover:bg-[#EF6F29]/[0.04] transition-all group"
                            >
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-white/[0.02]">
                                <Image src={product.image} alt={product.name} fill className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm truncate group-hover:text-[#EF6F29] transition-colors">{product.name}</p>
                                  {product.popular && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#EF6F29]/15 text-[#EF6F29] font-bold shrink-0">HOT</span>
                                  )}
                                </div>
                                <p className="text-xs text-[#EF6F29] font-bold mt-0.5">from {formatPrice(minPrice)}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-white/15 group-hover:text-[#EF6F29] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                            </Link>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/40 text-sm mb-4">No products in that range.</p>
                      <Button onClick={reset} variant="outline" size="sm" className="rounded-xl">Try Again</Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t border-white/[0.06]">
              <Link
                href="/products"
                onClick={() => setIsOpen(false)}
                className="block text-center text-xs text-white/30 hover:text-[#EF6F29] transition-colors"
              >
                Or browse all products →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
