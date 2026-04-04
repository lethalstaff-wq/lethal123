"use client"

import { useState, useEffect } from "react"
import { Settings, X, ChevronRight, Gamepad2, ShieldOff, Cpu, Package, Sparkles } from "lucide-react"
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
  { id: "cheat" as Purpose, label: "Game Cheats", description: "DMA cheats for games", icon: Gamepad2, categories: ["cheat"] },
  { id: "spoofer" as Purpose, label: "Spoofer / Unban", description: "HWID spoofer solutions", icon: ShieldOff, categories: ["spoofer"] },
  { id: "firmware" as Purpose, label: "Firmware", description: "Custom DMA firmware", icon: Cpu, categories: ["firmware"] },
  { id: "bundle" as Purpose, label: "Full Setup", description: "Complete bundles", icon: Package, categories: ["bundle"] },
  { id: "all" as Purpose, label: "Show All", description: "Browse everything", icon: Sparkles, categories: ["cheat", "spoofer", "firmware", "bundle"] },
]

const BUDGET_RANGES = [
  { min: 0, max: 5000, label: "Under £50" },
  { min: 0, max: 10000, label: "Under £100" },
  { min: 0, max: 25000, label: "Under £250" },
  { min: 0, max: 99999999, label: "Any Budget" },
]

function getRecommendations(answers: Answers) {
  // If no purpose selected, return empty
  if (!answers.purpose) return []
  
  const purposeOption = PURPOSE_OPTIONS.find(p => p.id === answers.purpose)
  const categories = purposeOption?.categories || []
  
  // Filter products
  const filtered = PRODUCTS.filter(p => {
    // Check category - "all" purpose includes everything
    const categoryMatch = categories.length === 0 || categories.includes(p.category)
    if (!categoryMatch) return false
    
    // Get minimum price from variants
    const minPrice = Math.min(...p.variants.map(v => v.priceInPence))
    
    // Check if within budget (budgetMax is in pence)
    return minPrice <= answers.budgetMax
  })
  
  // Sort by popularity first, then by price
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
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500)
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

  if (!isVisible) return null

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[80] p-4 rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 hover:scale-110 transition-all duration-300 group ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        aria-label="Product Finder"
      >
        <Settings className="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c0c0e] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Product Finder</h3>
                  <p className="text-sm text-white/50">Find your perfect match</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {step === "purpose" && (
                <div className="space-y-3">
                  <p className="text-sm text-white/60 mb-4">What are you looking for?</p>
                  {PURPOSE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handlePurposeSelect(option.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/10 transition-colors">
                        <option.icon className="h-5 w-5 text-white/60 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-sm text-white/40">{option.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              )}

              {step === "budget" && (
                <div className="space-y-3">
                  <button onClick={() => setStep("purpose")} className="text-sm text-white/40 hover:text-white mb-2 flex items-center gap-1">
                    <ChevronRight className="h-4 w-4 rotate-180" /> Back
                  </button>
                  <p className="text-sm text-white/60 mb-4">What&apos;s your budget?</p>
                  {BUDGET_RANGES.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => handleBudgetSelect(range.max)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <span className="font-semibold">{range.label}</span>
                      <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              )}

              {step === "result" && (
                <div className="space-y-4">
                  <button onClick={reset} className="text-sm text-white/40 hover:text-white mb-2 flex items-center gap-1">
                    <ChevronRight className="h-4 w-4 rotate-180" /> Start Over
                  </button>
                  
                  {recommendations.length > 0 ? (
                    <>
                      <p className="text-sm text-white/60">Found {recommendations.length} products for you:</p>
                      <div className="space-y-3">
                        {recommendations.map((product) => {
                          const minPrice = Math.min(...product.variants.map(v => v.priceInPence))
                          return (
                            <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                            >
                              <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                                <Image src={product.image} alt={product.name} fill className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold truncate group-hover:text-primary transition-colors">{product.name}</p>
                                  {product.popular && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium flex-shrink-0">Popular</span>
                                  )}
                                </div>
                                <p className="text-sm text-primary font-bold">
                                  from {formatPrice(minPrice)}
                                </p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </Link>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/50 mb-4">No products match this budget. Try a higher budget!</p>
                      <Button onClick={reset} variant="outline">Try Different Options</Button>
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
