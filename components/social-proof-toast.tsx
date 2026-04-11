"use client"

import { useState, useEffect, useCallback } from "react"
import { PRODUCTS } from "@/lib/products"
import Link from "next/link"
import Image from "next/image"

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

const MINUTES = [2, 4, 6, 8, 10, 14, 21]

function seededPick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]
}

export function SocialProofToast() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [product, setProduct] = useState(PRODUCTS[0])
  const [minutes, setMinutes] = useState(2)
  const [dismissed, setDismissed] = useState(false)

  const showNotification = useCallback(() => {
    const now = Date.now()
    const seed = Math.floor(now / 30000)
    setEmail(seededPick(MASKED_EMAILS, seed))
    setProduct(seededPick(PRODUCTS, seed * 13 + 7))
    setMinutes(seededPick(MINUTES, seed * 3 + 2))
    setDismissed(false)
    setVisible(true)

    const hideTimer = setTimeout(() => setVisible(false), 5500)
    return () => clearTimeout(hideTimer)
  }, [])

  useEffect(() => {
    const initialDelay = 8000 + Math.random() * 7000
    const firstTimer = setTimeout(showNotification, initialDelay)

    const interval = setInterval(() => {
      showNotification()
    }, 28000 + Math.random() * 20000)

    return () => {
      clearTimeout(firstTimer)
      clearInterval(interval)
    }
  }, [showNotification])

  const isShown = visible && !dismissed

  return (
    <div
      className={`fixed top-20 right-6 z-[80] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isShown
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-[calc(100%+2rem)] pointer-events-none"
      }`}
    >
      <Link
        href={`/products/${product.id}`}
        onClick={() => setDismissed(true)}
        className="group relative flex items-center gap-3 p-2.5 pr-5 rounded-xl bg-black/80 backdrop-blur-md border border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:border-white/[0.1] transition-all duration-300 w-[300px]"
      >
        {/* Product image */}
        <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/[0.06] group-hover:ring-[#f97316]/30 transition-all">
          <Image
            src={product.image}
            alt={product.name}
            width={44}
            height={44}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-mono text-white/25 truncate">{email}</p>
          <p className="text-[13px] font-semibold text-white/90 truncate mt-0.5 group-hover:text-[#f97316] transition-colors">
            {product.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-[10px] text-emerald-400/60 font-medium">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              Verified
            </span>
            <span className="text-[10px] text-white/15">{minutes}m ago</span>
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDismissed(true)
          }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#222] border border-white/[0.1] text-white/30 hover:text-white/70 transition-all flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100"
        >
          ×
        </button>
      </Link>
    </div>
  )
}
