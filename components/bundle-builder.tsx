"use client"

import { useState } from "react"
import { X, ChevronRight, ChevronLeft, Wrench, Check, ShoppingCart, Sparkles } from "lucide-react"
import { PRODUCTS, formatPrice } from "@/lib/products"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"

type Step = "dma" | "firmware" | "cheat" | "spoofer" | "result"

interface Selections {
  hasDMA: boolean | null
  firmware: string | null
  cheat: string | null
  spoofer: string | null
}

function getProduct(id: string) {
  return PRODUCTS.find(p => p.id === id)
}

function getMinPrice(id: string): number {
  const p = getProduct(id)
  return p ? Math.min(...p.variants.map(v => v.priceInPence)) : 0
}

export function BundleBuilder() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<Step>("dma")
  const [selections, setSelections] = useState<Selections>({
    hasDMA: null, firmware: null, cheat: null, spoofer: null,
  })
  const { addItem } = useCart()

  const reset = () => {
    setStep("dma")
    setSelections({ hasDMA: null, firmware: null, cheat: null, spoofer: null })
  }

  const selectedIds = [selections.firmware, selections.cheat, selections.spoofer].filter(Boolean) as string[]
  const subtotal = selectedIds.reduce((sum, id) => sum + getMinPrice(id), 0)
  const discountPct = selectedIds.length >= 3 ? 10 : selectedIds.length >= 2 ? 5 : 0
  const discountAmount = Math.round(subtotal * discountPct / 100)
  const finalTotal = subtotal - discountAmount

  const addBundleToCart = () => {
    selectedIds.forEach(id => {
      const product = getProduct(id)
      if (!product) return
      const variant = product.variants[0]
      addItem({
        id: variant.id,
        name: variant.name,
        price: variant.priceInPence / 100,
        product_id: product.id,
        is_lifetime: variant.name.toLowerCase().includes("lifetime"),
        duration_days: null,
        created_at: "",
        product: {
          id: product.id,
          name: product.name,
          slug: product.id,
          description: product.description,
          category: product.category,
          image_url: product.image,
          image: product.image,
          created_at: "",
          updated_at: "",
        },
      })
    })
    toast.success(`${selectedIds.length} items added to cart`)
    setIsOpen(false)
    reset()
  }

  const goBack = () => {
    if (step === "firmware") setStep("dma")
    else if (step === "cheat") setStep("firmware")
    else if (step === "spoofer") setStep("cheat")
    else if (step === "result") setStep("spoofer")
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[88px] right-6 z-[79] flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-full bg-black/80 backdrop-blur-xl border border-[#f97316]/25 text-white/85 text-[13px] font-semibold shadow-[0_8px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#f97316]/55 hover:text-white hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(249, 115, 22, 0.26)] transition-all duration-300 group"
      >
        <Wrench className="h-4 w-4 text-[#f97316] group-hover:rotate-12 transition-transform" />
        Build a Bundle
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-black/95 backdrop-blur-xl border border-white/[0.10] shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_60px_rgba(249, 115, 22, 0.14)] overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-gradient-to-b from-[#f97316]/[0.04] to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f97316]/25 to-[#ea580c]/15 border border-[#f97316]/30 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_rgba(249, 115, 22, 0.26)]">
              <Wrench className="h-[18px] w-[18px] text-[#f97316]" style={{ filter: "drop-shadow(0 0 8px rgba(249, 115, 22, 0.85))" }} />
            </div>
            <div>
              <h3 className="font-display text-white font-bold text-[16px] tracking-tight">Bundle Builder</h3>
              <p className="text-[11px] text-white/55 font-medium">Pick your combo, save up to 10%</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} aria-label="Close bundle builder" className="p-2 rounded-full text-white/45 hover:text-white hover:bg-white/[0.06] transition-all">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">

          {step !== "dma" && step !== "result" && (
            <button onClick={goBack} className="flex items-center gap-1 text-[11px] text-white/45 hover:text-white/50 mb-4 transition-colors">
              <ChevronLeft className="h-3 w-3" /> Back
            </button>
          )}

          {/* Step 1: DMA */}
          {step === "dma" && (
            <div>
              <p className="text-[13px] font-semibold text-white/70 mb-4 uppercase tracking-[0.1em]">Do you have a DMA card?</p>
              <div className="space-y-2">
                {[
                  { val: true, label: "Yes, I have one", desc: "I'll pick firmware + cheat" },
                  { val: false, label: "No, I'll go software only", desc: "Skip firmware, pick cheats + spoofer" },
                ].map(opt => (
                  <button key={String(opt.val)} onClick={() => {
                    setSelections(prev => ({ ...prev, hasDMA: opt.val }))
                    setStep(opt.val ? "firmware" : "cheat")
                  }} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:border-[#f97316]/35 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_24px_rgba(249, 115, 22, 0.14)] transition-all duration-300 group">
                    <div>
                      <p className="text-[14px] font-bold text-white group-hover:text-[#f97316] transition-colors">{opt.label}</p>
                      <p className="text-[11px] text-white/45">{opt.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[#f97316] group-hover:translate-x-1 transition-all duration-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Firmware */}
          {step === "firmware" && (
            <div>
              <p className="text-[13px] font-semibold text-white/70 mb-4 uppercase tracking-[0.1em]">Pick firmware</p>
              <div className="space-y-2">
                {(() => {
                  const fw = getProduct("custom-dma-firmware")
                  if (!fw) return null
                  return fw.variants.map(v => (
                    <button key={v.id} onClick={() => {
                      setSelections(prev => ({ ...prev, firmware: "custom-dma-firmware" }))
                      setStep("cheat")
                    }} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:border-[#f97316]/35 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_24px_rgba(249, 115, 22, 0.14)] transition-all duration-300 group">
                      <div>
                        <p className="text-[14px] font-bold text-white group-hover:text-[#f97316] transition-colors">{v.name}</p>
                        <p className="text-[11px] text-white/45">{formatPrice(v.priceInPence)}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[#f97316] group-hover:translate-x-1 transition-all duration-300" />
                    </button>
                  ))
                })()}
                <button onClick={() => {
                  setSelections(prev => ({ ...prev, firmware: null }))
                  setStep("cheat")
                }} className="w-full p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-[11px] text-white/40 hover:text-white/70 transition-colors">
                  Skip firmware
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Cheat */}
          {step === "cheat" && (
            <div>
              <p className="text-[13px] font-semibold text-white/70 mb-4 uppercase tracking-[0.1em]">Pick a cheat</p>
              <div className="space-y-2">
                {PRODUCTS.filter(p => p.category === "cheat").map(p => (
                  <button key={p.id} onClick={() => {
                    setSelections(prev => ({ ...prev, cheat: p.id }))
                    setStep("spoofer")
                  }} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:border-[#f97316]/35 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_24px_rgba(249, 115, 22, 0.14)] transition-all duration-300 group">
                    <div>
                      <p className="text-[14px] font-bold text-white group-hover:text-[#f97316] transition-colors">{p.name}</p>
                      <p className="text-[11px] text-white/45">from {formatPrice(Math.min(...p.variants.map(v => v.priceInPence)))}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[#f97316] group-hover:translate-x-1 transition-all duration-300" />
                  </button>
                ))}
                <button onClick={() => {
                  setSelections(prev => ({ ...prev, cheat: null }))
                  setStep("spoofer")
                }} className="w-full p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-[11px] text-white/40 hover:text-white/70 transition-colors">
                  Skip cheat
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Spoofer */}
          {step === "spoofer" && (
            <div>
              <p className="text-[13px] font-semibold text-white/70 mb-4 uppercase tracking-[0.1em]">Add a spoofer?</p>
              <div className="space-y-2">
                {PRODUCTS.filter(p => p.category === "spoofer").map(p => (
                  <button key={p.id} onClick={() => {
                    setSelections(prev => ({ ...prev, spoofer: p.id }))
                    setStep("result")
                  }} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] hover:border-[#f97316]/35 hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_24px_rgba(249, 115, 22, 0.14)] transition-all duration-300 group">
                    <div>
                      <p className="text-[14px] font-bold text-white group-hover:text-[#f97316] transition-colors">{p.name}</p>
                      <p className="text-[11px] text-white/45">from {formatPrice(Math.min(...p.variants.map(v => v.priceInPence)))}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[#f97316] group-hover:translate-x-1 transition-all duration-300" />
                  </button>
                ))}
                <button onClick={() => {
                  setSelections(prev => ({ ...prev, spoofer: null }))
                  setStep("result")
                }} className="w-full p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-[11px] text-white/40 hover:text-white/70 transition-colors">
                  No spoofer needed
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Result */}
          {step === "result" && (
            <div>
              {selectedIds.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-white/40 mb-4">You didn't select anything</p>
                  <button onClick={reset} className="px-4 py-2 rounded-xl bg-[#f97316]/10 text-[#f97316] text-xs font-semibold hover:bg-[#f97316]/20 transition-colors">
                    Start Over
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[13px] font-semibold text-white/70 mb-4 uppercase tracking-[0.1em]">Your custom bundle</p>
                  <div className="space-y-2 mb-4">
                    {selectedIds.map(id => {
                      const p = getProduct(id)!
                      return (
                        <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.012] border border-white/[0.04]">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-500" />
                            <p className="text-sm font-semibold">{p.name}</p>
                          </div>
                          <p className="text-sm text-white/50">{formatPrice(getMinPrice(id))}</p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="space-y-2 border-t border-white/[0.06] pt-4 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discountPct > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-400 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Bundle discount ({discountPct}%)</span>
                        <span className="text-emerald-400">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-1">
                      <span>Total</span>
                      <span className="text-[#f97316]">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  <button onClick={addBundleToCart} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#f97316]/20 hover:shadow-[#f97316]/30">
                    <ShoppingCart className="h-4 w-4" />
                    Add Bundle to Cart
                  </button>

                  <button onClick={reset} className="w-full mt-2 py-2 text-[11px] text-white/45 hover:text-white/50 transition-colors">
                    Start over
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
