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
        className="fixed bottom-20 right-6 z-[79] flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.08] text-white/70 text-sm font-semibold hover:bg-white/[0.1] hover:text-white hover:-translate-y-0.5 transition-all duration-300"
      >
        <Wrench className="h-4 w-4" />
        Build a Bundle
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-white/[0.08] bg-[#0c0c0e] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-[15px]">Bundle Builder</h3>
              <p className="text-[11px] text-white/30">Pick your combo, save up to 10%</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-white/25 hover:text-white hover:bg-white/[0.06] transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">

          {step !== "dma" && step !== "result" && (
            <button onClick={goBack} className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 mb-4 transition-colors">
              <ChevronLeft className="h-3 w-3" /> Back
            </button>
          )}

          {/* Step 1: DMA */}
          {step === "dma" && (
            <div>
              <p className="text-sm text-white/50 mb-4">Do you have a DMA card?</p>
              <div className="space-y-2">
                {[
                  { val: true, label: "Yes, I have one", desc: "I'll pick firmware + cheat" },
                  { val: false, label: "No, I'll go software only", desc: "Skip firmware, pick cheats + spoofer" },
                ].map(opt => (
                  <button key={String(opt.val)} onClick={() => {
                    setSelections(prev => ({ ...prev, hasDMA: opt.val }))
                    setStep(opt.val ? "firmware" : "cheat")
                  }} className="w-full flex items-center justify-between p-4 rounded-xl border border-white/[0.06] hover:border-amber-500/30 hover:bg-amber-500/[0.03] transition-all group">
                    <div>
                      <p className="text-sm font-semibold group-hover:text-amber-400 transition-colors">{opt.label}</p>
                      <p className="text-[11px] text-white/25">{opt.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-amber-500/50 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Firmware */}
          {step === "firmware" && (
            <div>
              <p className="text-sm text-white/50 mb-4">Pick firmware</p>
              <div className="space-y-2">
                {(() => {
                  const fw = getProduct("custom-dma-firmware")
                  if (!fw) return null
                  return fw.variants.map(v => (
                    <button key={v.id} onClick={() => {
                      setSelections(prev => ({ ...prev, firmware: "custom-dma-firmware" }))
                      setStep("cheat")
                    }} className="w-full flex items-center justify-between p-4 rounded-xl border border-white/[0.06] hover:border-amber-500/30 hover:bg-amber-500/[0.03] transition-all group">
                      <div>
                        <p className="text-sm font-semibold group-hover:text-amber-400 transition-colors">{v.name}</p>
                        <p className="text-[11px] text-white/25">{formatPrice(v.priceInPence)}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-amber-500/50 transition-all" />
                    </button>
                  ))
                })()}
                <button onClick={() => {
                  setSelections(prev => ({ ...prev, firmware: null }))
                  setStep("cheat")
                }} className="w-full p-3 rounded-xl border border-white/[0.04] text-[11px] text-white/25 hover:text-white/50 transition-colors">
                  Skip firmware
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Cheat */}
          {step === "cheat" && (
            <div>
              <p className="text-sm text-white/50 mb-4">Pick a cheat</p>
              <div className="space-y-2">
                {PRODUCTS.filter(p => p.category === "cheat").map(p => (
                  <button key={p.id} onClick={() => {
                    setSelections(prev => ({ ...prev, cheat: p.id }))
                    setStep("spoofer")
                  }} className="w-full flex items-center justify-between p-4 rounded-xl border border-white/[0.06] hover:border-amber-500/30 hover:bg-amber-500/[0.03] transition-all group">
                    <div>
                      <p className="text-sm font-semibold group-hover:text-amber-400 transition-colors">{p.name}</p>
                      <p className="text-[11px] text-white/25">from {formatPrice(Math.min(...p.variants.map(v => v.priceInPence)))}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-amber-500/50 transition-all" />
                  </button>
                ))}
                <button onClick={() => {
                  setSelections(prev => ({ ...prev, cheat: null }))
                  setStep("spoofer")
                }} className="w-full p-3 rounded-xl border border-white/[0.04] text-[11px] text-white/25 hover:text-white/50 transition-colors">
                  Skip cheat
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Spoofer */}
          {step === "spoofer" && (
            <div>
              <p className="text-sm text-white/50 mb-4">Add a spoofer?</p>
              <div className="space-y-2">
                {PRODUCTS.filter(p => p.category === "spoofer").map(p => (
                  <button key={p.id} onClick={() => {
                    setSelections(prev => ({ ...prev, spoofer: p.id }))
                    setStep("result")
                  }} className="w-full flex items-center justify-between p-4 rounded-xl border border-white/[0.06] hover:border-amber-500/30 hover:bg-amber-500/[0.03] transition-all group">
                    <div>
                      <p className="text-sm font-semibold group-hover:text-amber-400 transition-colors">{p.name}</p>
                      <p className="text-[11px] text-white/25">from {formatPrice(Math.min(...p.variants.map(v => v.priceInPence)))}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-amber-500/50 transition-all" />
                  </button>
                ))}
                <button onClick={() => {
                  setSelections(prev => ({ ...prev, spoofer: null }))
                  setStep("result")
                }} className="w-full p-3 rounded-xl border border-white/[0.04] text-[11px] text-white/25 hover:text-white/50 transition-colors">
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
                  <button onClick={reset} className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors">
                    Start Over
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-white/50 mb-4">Your custom bundle</p>
                  <div className="space-y-2 mb-4">
                    {selectedIds.map(id => {
                      const p = getProduct(id)!
                      return (
                        <div key={id} className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
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
                      <span className="text-primary">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  <button onClick={addBundleToCart} className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20">
                    <ShoppingCart className="h-4 w-4" />
                    Add Bundle to Cart
                  </button>

                  <button onClick={reset} className="w-full mt-2 py-2 text-[11px] text-white/25 hover:text-white/50 transition-colors">
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
