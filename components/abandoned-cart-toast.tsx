"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/lib/cart-context"
import { ShoppingCart, X } from "lucide-react"
import Link from "next/link"

export function AbandonedCartToast() {
  const { itemCount } = useCart()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (itemCount === 0) return
    const shown = sessionStorage.getItem("cart_toast_shown")
    if (shown) return

    const timer = setTimeout(() => {
      setShow(true)
      sessionStorage.setItem("cart_toast_shown", "1")
    }, 3000)
    return () => clearTimeout(timer)
  }, [itemCount])

  if (!show || itemCount === 0) return null

  return (
    <div className="fixed bottom-6 left-6 z-[85] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/85 backdrop-blur-xl border border-[#f97316]/25 shadow-[0_18px_48px_rgba(0,0,0,0.55),0_0_30px_rgba(249, 115, 22, 0.22)] max-w-[340px] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent pointer-events-none" />
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f97316]/25 to-[#ea580c]/15 border border-[#f97316]/35 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_rgba(249, 115, 22, 0.26)]">
          <ShoppingCart className="h-[18px] w-[18px] text-[#f97316]" style={{ filter: "drop-shadow(0 0 8px rgba(249, 115, 22, 0.85))" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-white">You have <span className="text-[#f97316] tabular-nums">{itemCount}</span> item{itemCount > 1 ? "s" : ""} in cart</p>
          <Link href="/cart" className="inline-flex items-center gap-1 text-[12px] text-[#f97316] font-semibold hover:text-[#fbbf24] transition-colors mt-0.5" onClick={() => setShow(false)}>
            Complete your order
            <span className="transition-transform inline-block group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
        <button aria-label="Dismiss" onClick={() => setShow(false)} className="p-1.5 rounded-full text-white/55 hover:text-white hover:bg-white/[0.06] transition-all">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
