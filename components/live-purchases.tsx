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
      <div className="relative flex items-center gap-4 p-4 pr-6 rounded-2xl bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl w-[380px]">
        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Product image - clickable */}
        <Link
          href={`/products/${current.product.id}`}
          className="relative flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-colors group"
        >
          <Image
            src={current.product.image}
            alt={current.product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Content - clickable */}
        <Link href={`/products/${current.product.id}`} className="flex-1 min-w-0 pr-6 group">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-mono text-white/70">{current.email}</span>
          </div>
          <p className="font-bold text-primary text-base truncate group-hover:text-primary/80 transition-colors flex items-center gap-2">
            {current.product.name}
            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </p>
          <p className="text-xs text-white/40 mt-1.5 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {current.time}
          </p>
        </Link>
      </div>
    </div>
  )
}
