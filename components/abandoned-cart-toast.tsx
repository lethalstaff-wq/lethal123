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
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/40 shadow-2xl max-w-[320px]">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <ShoppingCart className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">You have {itemCount} item{itemCount > 1 ? "s" : ""} in cart</p>
          <Link href="/cart" className="text-xs text-primary hover:underline" onClick={() => setShow(false)}>
            Complete your order →
          </Link>
        </div>
        <button onClick={() => setShow(false)} className="p-1 text-white/30 hover:text-white/60">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
