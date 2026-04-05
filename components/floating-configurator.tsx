"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, Gamepad2, ShieldOff, Cpu, Package, Sparkles, Wand2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PRODUCTS, formatPrice } from "@/lib/products"
import Image from "next/image"
import Link from "next/link"

type Step = "start" | "game_select" | "dma_check" | "spoofer_type" | "firmware_type" | "bundle_level" | "result"

interface State {
  step: Step
  category: string | null
  game: string | null
  hasDma: boolean | null
  resultProducts: typeof PRODUCTS
  resultTitle: string
}

const GAMES = ["Fortnite", "Rust", "Valorant", "CS2", "PUBG", "Apex Legends", "R6 Siege", "GTA", "Other"]

const INITIAL: State = {
  step: "start",
  category: null,
  game: null,
  hasDma: null,
  resultProducts: [],
  resultTitle: "",
}

function filterProducts(ids: string[]) {
  return PRODUCTS.filter(p => ids.includes(p.id))
}

export function FloatingConfigurator() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<State>(INITIAL)
  const [isVisible, setIsVisible] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  const reset = () => setState(INITIAL)
  const open = () => { setIsOpen(true); setHasInteracted(true) }

  const goResult = (ids: string[], title: string) => {
    setState(prev => ({ ...prev, step: "result", resultProducts: filterProducts(ids), resultTitle: title }))
  }

  // ── Category handlers ──
  const selectCategory = (cat: string) => {
    if (cat === "cheat") setState(prev => ({ ...prev, step: "game_select", category: cat }))
    else if (cat === "spoofer") setState(prev => ({ ...prev, step: "spoofer_type", category: cat }))
    else if (cat === "firmware") setState(prev => ({ ...prev, step: "firmware_type", category: cat }))
    else if (cat === "bundle") setState(prev => ({ ...prev, step: "bundle_level", category: cat }))
    else if (cat === "all") goResult(PRODUCTS.map(p => p.id), "All Products")
  }

  const selectGame = (game: string) => {
    setState(prev => ({ ...prev, game, step: "dma_check" }))
  }

  const selectDmaCheck = (hasDma: boolean) => {
    if (hasDma) {
      goResult(["blurred", "streck"], "DMA Cheats")
    } else {
      if (state.game === "Fortnite" || state.game === "Other") {
        goResult(["fortnite-external"], "Software Cheats")
      } else {
        goResult(["fortnite-external", "blurred", "streck"], "Available Cheats")
      }
    }
  }

  const selectSpooferType = (type: string) => {
    if (type === "banned") goResult(["perm-spoofer"], "Permanent Fix")
    else if (type === "temp") goResult(["temp-spoofer"], "Temporary Solution")
    else goResult(["perm-spoofer", "temp-spoofer"], "Spoofer Options")
  }

  const selectFirmwareType = (type: string) => {
    if (type === "eac") goResult(["custom-dma-firmware"], "EAC / BE Firmware")
    else if (type === "slotted") goResult(["custom-dma-firmware"], "Slotted Edition")
    else goResult(["custom-dma-firmware"], "Full Anti-Cheat Bypass")
  }

  const selectBundleLevel = (level: string) => {
    if (level === "new") goResult(["dma-basic"], "Starter Setup")
    else if (level === "mid") goResult(["dma-advanced"], "Most Popular")
    else goResult(["dma-elite"], "No Compromises")
  }

  const goBack = () => {
    if (state.step === "game_select" || state.step === "spoofer_type" || state.step === "firmware_type" || state.step === "bundle_level") {
      setState(INITIAL)
    } else if (state.step === "dma_check") {
      setState(prev => ({ ...prev, step: "game_select" }))
    } else if (state.step === "result") {
      // go back to category-specific step
      if (state.category === "cheat") setState(prev => ({ ...prev, step: state.hasDma !== null ? "dma_check" : "game_select" }))
      else if (state.category === "spoofer") setState(prev => ({ ...prev, step: "spoofer_type" }))
      else if (state.category === "firmware") setState(prev => ({ ...prev, step: "firmware_type" }))
      else if (state.category === "bundle") setState(prev => ({ ...prev, step: "bundle_level" }))
      else reset()
    }
  }

  if (!isVisible) return null

  const stepNum = state.step === "start" ? 1 : state.step === "result" ? 3 : 2

  return (
    <>
      {/* Floating Button */}
      <div className={`fixed bottom-6 right-6 z-[80] transition-all duration-500 ${isOpen ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100"}`}>
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
        {!hasInteracted && (
          <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 rounded-lg bg-card border border-border/50 text-xs font-medium whitespace-nowrap shadow-lg animate-fade-in-up opacity-0" style={{ animationDelay: "3s", animationFillMode: "forwards" }}>
            Need help choosing?
            <div className="absolute top-full right-5 w-2 h-2 bg-card border-r border-b border-border/50 rotate-45 -translate-y-1" />
          </div>
        )}
      </div>

      {/* Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative w-full sm:w-[420px] sm:max-h-[85vh] max-h-[90vh] rounded-t-3xl sm:rounded-2xl border border-white/10 bg-[#0c0c0e] shadow-2xl overflow-hidden flex flex-col animate-fade-in-up" style={{ animationDuration: "0.3s" }}>
            {/* Progress */}
            <div className="h-1 bg-white/5">
              <div className="h-full bg-gradient-to-r from-[#EF6F29] to-[#FF8C42] transition-all duration-500 rounded-r-full" style={{ width: `${(stepNum / 3) * 100}%` }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#EF6F29]/20 to-[#FF8C42]/10">
                  <Wand2 className="h-5 w-5 text-[#EF6F29]" />
                </div>
                <div>
                  <h3 className="font-bold">Product Finder</h3>
                  <p className="text-xs text-white/40">Step {stepNum} of 3</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/10 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 pt-0 overflow-y-auto flex-1">
              {state.step !== "start" && (
                <button onClick={goBack} className="text-xs text-white/30 hover:text-white mb-3 flex items-center gap-1 transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
              )}

              {/* Step: Start */}
              {state.step === "start" && (
                <div className="space-y-2">
                  <p className="text-sm text-white/50 mb-4">What are you looking for?</p>
                  {[
                    { id: "cheat", label: "Game Cheats", desc: "ESP, aimbot, DMA cheats", icon: Gamepad2 },
                    { id: "spoofer", label: "HWID Spoofer", desc: "Unban & protect your PC", icon: ShieldOff },
                    { id: "firmware", label: "DMA Firmware", desc: "Custom anti-cheat bypass", icon: Cpu },
                    { id: "bundle", label: "Full DMA Setup", desc: "Hardware + software combo", icon: Package },
                    { id: "all", label: "Show Everything", desc: "Browse all products", icon: Sparkles },
                  ].map((opt) => (
                    <button key={opt.id} onClick={() => selectCategory(opt.id)} className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-white/[0.06] hover:border-[#EF6F29]/40 hover:bg-[#EF6F29]/[0.04] transition-all group">
                      <div className="p-2.5 rounded-lg bg-white/[0.04] group-hover:bg-[#EF6F29]/10 transition-colors">
                        <opt.icon className="h-5 w-5 text-white/50 group-hover:text-[#EF6F29] transition-colors" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm">{opt.label}</p>
                        <p className="text-xs text-white/30">{opt.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/15 group-hover:text-[#EF6F29] transition-all" />
                    </button>
                  ))}
                </div>
              )}

              {/* Step: Game Select */}
              {state.step === "game_select" && (
                <div className="space-y-2">
                  <p className="text-sm text-white/50 mb-4">Which game do you play?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {GAMES.map((game) => (
                      <button key={game} onClick={() => selectGame(game)} className="p-3 rounded-xl border border-white/[0.06] hover:border-[#EF6F29]/40 hover:bg-[#EF6F29]/[0.04] transition-all text-center group">
                        <p className="text-xs font-semibold group-hover:text-[#EF6F29] transition-colors">{game}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: DMA Check */}
              {state.step === "dma_check" && (
                <div className="space-y-2">
                  <p className="text-sm text-white/50 mb-4">Do you have DMA hardware?</p>
                  {[
                    { yes: true, label: "Yes, I have a DMA card", desc: "Show DMA cheats (Blurred, Streck)" },
                    { yes: false, label: "No, software only", desc: "Show external/software cheats" },
                  ].map((opt) => (
                    <button key={String(opt.yes)} onClick={() => selectDmaCheck(opt.yes)} className="w-full flex items-center gap-3.5 p-4 rounded-xl border border-white/[0.06] hover:border-[#EF6F29]/40 hover:bg-[#EF6F29]/[0.04] transition-all group">
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm">{opt.label}</p>
                        <p className="text-xs text-white/30">{opt.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/15 group-hover:text-[#EF6F29] transition-all" />
                    </button>
                  ))}
                </div>
              )}

              {/* Step: Spoofer Type */}
              {state.step === "spoofer_type" && (
                <div className="space-y-2">
                  <p className="text-sm text-white/50 mb-4">What do you need?</p>
                  {[
                    { type: "banned", label: "Banned — need to play again", desc: "Permanent HWID change. One-time fix." },
                    { type: "temp", label: "Temp / alt account use", desc: "Session-based. Resets on reboot." },
                    { type: "both", label: "Not sure — show both", desc: "Compare perm vs temp side by side" },
                  ].map((opt) => (
                    <button key={opt.type} onClick={() => selectSpooferType(opt.type)} className="w-full flex items-center gap-3.5 p-4 rounded-xl border border-white/[0.06] hover:border-[#EF6F29]/40 hover:bg-[#EF6F29]/[0.04] transition-all group">
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm">{opt.label}</p>
                        <p className="text-xs text-white/30">{opt.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/15 group-hover:text-[#EF6F29] transition-all" />
                    </button>
                  ))}
                </div>
              )}

              {/* Step: Firmware Type */}
              {state.step === "firmware_type" && (
                <div className="space-y-2">
                  <p className="text-sm text-white/50 mb-4">What anti-cheats need bypass?</p>
                  {[
                    { type: "eac", label: "EAC / BattlEye", desc: "Fortnite, Rust, Apex — £20", price: "£20" },
                    { type: "slotted", label: "EAC/BE Slotted (better stealth)", desc: "Enhanced emulation — £450", price: "£450" },
                    { type: "all", label: "Everything (FaceIt, VGK too)", desc: "Full bypass including Vanguard — £975", price: "£975" },
                  ].map((opt) => (
                    <button key={opt.type} onClick={() => selectFirmwareType(opt.type)} className="w-full flex items-center gap-3.5 p-4 rounded-xl border border-white/[0.06] hover:border-[#EF6F29]/40 hover:bg-[#EF6F29]/[0.04] transition-all group">
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm">{opt.label}</p>
                        <p className="text-xs text-white/30">{opt.desc}</p>
                      </div>
                      <span className="text-xs font-bold text-[#EF6F29] shrink-0">{opt.price}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step: Bundle Level */}
              {state.step === "bundle_level" && (
                <div className="space-y-2">
                  <p className="text-sm text-white/50 mb-4">What&apos;s your experience level?</p>
                  {[
                    { level: "new", label: "New to DMA", desc: "Basic Bundle — perfect starter kit", price: "£425" },
                    { level: "mid", label: "Some experience", desc: "Advanced Bundle — most popular choice", price: "£675", popular: true },
                    { level: "pro", label: "Want the absolute best", desc: "Elite Bundle — no compromises", price: "£1,500" },
                  ].map((opt) => (
                    <button key={opt.level} onClick={() => selectBundleLevel(opt.level)} className={`w-full flex items-center gap-3.5 p-4 rounded-xl border transition-all group ${opt.popular ? "border-[#EF6F29]/30 bg-[#EF6F29]/[0.04]" : "border-white/[0.06] hover:border-[#EF6F29]/40 hover:bg-[#EF6F29]/[0.04]"}`}>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{opt.label}</p>
                          {opt.popular && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#EF6F29]/15 text-[#EF6F29] font-bold">POPULAR</span>}
                        </div>
                        <p className="text-xs text-white/30">{opt.desc}</p>
                      </div>
                      <span className="text-xs font-bold text-[#EF6F29] shrink-0">{opt.price}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step: Results */}
              {state.step === "result" && (
                <div className="space-y-3">
                  <p className="text-sm text-white/50">
                    {state.resultTitle} — <span className="text-[#EF6F29] font-bold">{state.resultProducts.length}</span> {state.resultProducts.length === 1 ? "match" : "matches"}
                  </p>
                  <div className="space-y-2">
                    {state.resultProducts.map((product) => {
                      const minPrice = Math.min(...product.variants.map(v => v.priceInPence))
                      return (
                        <Link key={product.id} href={`/products/${product.id}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3.5 p-3 rounded-xl border border-white/[0.06] hover:border-[#EF6F29]/40 hover:bg-[#EF6F29]/[0.04] transition-all group">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-white/[0.02]">
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm truncate group-hover:text-[#EF6F29] transition-colors">{product.name}</p>
                              {product.popular && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#EF6F29]/15 text-[#EF6F29] font-bold shrink-0">HOT</span>}
                            </div>
                            <p className="text-xs text-[#EF6F29] font-bold mt-0.5">from {formatPrice(minPrice)}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-white/15 group-hover:text-[#EF6F29] transition-all flex-shrink-0" />
                        </Link>
                      )
                    })}
                  </div>
                  {state.resultProducts.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-white/40 text-sm mb-4">No products match.</p>
                      <Button onClick={reset} variant="outline" size="sm" className="rounded-xl">Start Over</Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                {state.step !== "start" && (
                  <button onClick={reset} className="text-xs text-white/30 hover:text-white transition-colors">Start over</button>
                )}
                <Link href="/products" onClick={() => setIsOpen(false)} className="text-xs text-white/30 hover:text-[#EF6F29] transition-colors ml-auto">
                  Browse all products →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
