"use client"

import { useState, useEffect, useCallback } from "react"
import { Clock, X, ArrowRight } from "lucide-react"
import { PRODUCTS } from "@/lib/products"
import Link from "next/link"
import Image from "next/image"

// Masked emails — looks like real user data
const MASKED_EMAILS = [
  "koi***@yahoo.com",
  "arc***@gmail.com",
  "cam***@outlook.com",
  "jst***@gmail.com",
  "dex***@proton.me",
  "nit***@hotmail.com",
  "zer***@gmail.com",
  "blk***@yahoo.com",
  "rxn***@gmail.com",
  "mvp***@outlook.com",
  "hxc***@gmail.com",
  "fnx***@proton.me",
  "sky***@gmail.com",
  "drk***@yahoo.com",
  "ace***@gmail.com",
  "vex***@hotmail.com",
  "rog***@gmail.com",
  "zyn***@outlook.com",
  "phr***@gmail.com",
  "wrx***@proton.me",
  "kng***@gmail.com",
  "spc***@yahoo.com",
  "hex***@gmail.com",
  "ash***@outlook.com",
]

const TIME_LABELS = [
  "2 minutes ago",
  "5 minutes ago",
  "9 minutes ago",
  "14 minutes ago",
  "21 minutes ago",
  "33 minutes ago",
  "47 minutes ago",
]

interface Purchase {
  id: number
  email: string
  product: typeof PRODUCTS[number]
  time: string
}

function generatePurchase(id: number): Purchase {
  const email = MASKED_EMAILS[Math.floor(Math.random() * MASKED_EMAILS.length)]
  const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]
  const time = TIME_LABELS[Math.floor(Math.random() * TIME_LABELS.length)]
  return { id, email, product, time }
}

export function LivePurchases() {
  const [current, setCurrent] = useState<Purchase | null>(null)
  const [visible, setVisible] = useState(false)
  const [counter, setCounter] = useState(0)

  const showPurchase = useCallback(() => {
    const purchase = generatePurchase(counter)
    setCurrent(purchase)
    setVisible(true)
    setCounter((c) => c + 1)

    const hideTimer = setTimeout(() => {
      setVisible(false)
    }, 5000)

    return () => clearTimeout(hideTimer)
  }, [counter])

  useEffect(() => {
    const firstTimer = setTimeout(() => {
      showPurchase()
    }, 8000)

    return () => clearTimeout(firstTimer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!visible && counter > 0) {
      const delay = 25000 + Math.random() * 25000
      const timer = setTimeout(() => {
        showPurchase()
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [visible, counter, showPurchase])

  if (!current) return null

  return (
    <div
      className={`fixed bottom-6 left-6 z-[90] transition-all duration-500 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <div className="relative flex items-stretch gap-0 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/[0.10] shadow-[0_18px_48px_rgba(0,0,0,0.55),0_0_30px_rgba(249, 115, 22, 0.14)] w-[380px] max-w-[calc(100vw-3rem)] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent pointer-events-none" />
        {/* Close button — outside, top-right */}
        <button
          aria-label="Dismiss"
          onClick={() => setVisible(false)}
          className="absolute -top-2.5 -right-2.5 z-10 w-7 h-7 rounded-full bg-black border border-white/[0.20] text-white/65 hover:text-white hover:border-[#f97316]/50 hover:bg-[#f97316]/10 transition-all flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        >
          <span className="text-[14px] leading-none">×</span>
        </button>

        {/* Product image - clickable, full edge */}
        <Link
          href={`/products/${current.product.id}`}
          className="relative w-[88px] shrink-0 bg-gradient-to-br from-white/[0.04] to-white/[0.01] flex items-center justify-center group overflow-hidden"
        >
          <Image
            src={current.product.image}
            alt={current.product.name}
            width={88}
            height={88}
            className="object-contain w-full h-full p-3 group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-y-0 right-0 w-px bg-white/[0.08]" />
        </Link>

        {/* Content - clickable */}
        <Link href={`/products/${current.product.id}`} className="flex-1 min-w-0 p-3.5 pr-5 group">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/25">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              Verified
            </span>
            <span className="text-[10px] text-white/55 font-mono truncate">{current.email}</span>
          </div>
          <p className="font-display font-bold text-white text-[14px] truncate group-hover:text-[#f97316] transition-colors flex items-center gap-2 tracking-tight">
            {current.product.name}
            <ArrowRight className="h-3.5 w-3.5 text-[#f97316] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </p>
          <p className="text-[11px] text-white/55 mt-1.5 flex items-center gap-1.5 font-medium">
            <Clock className="h-3 w-3 text-[#f97316]/70" />
            {current.time}
          </p>
        </Link>
      </div>
    </div>
  )
}
