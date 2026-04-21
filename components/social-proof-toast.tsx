"use client"

import { useState, useEffect, useCallback } from "react"
import { PRODUCTS } from "@/lib/products"
import Link from "next/link"
import Image from "next/image"

const MASKED_EMAILS = [
  "koi***@yahoo.com", "arc***@gmail.com", "cam***@outlook.com", "jst***@gmail.com",
  "dex***@proton.me", "nit***@hotmail.com", "zer***@gmail.com", "blk***@yahoo.com",
  "rxn***@gmail.com", "mvp***@outlook.com", "hxc***@gmail.com", "fnx***@proton.me",
  "sky***@gmail.com", "drk***@yahoo.com", "ace***@gmail.com", "vex***@hotmail.com",
  "rog***@gmail.com", "zyn***@outlook.com", "phr***@gmail.com", "wrx***@proton.me",
  "kng***@gmail.com", "spc***@yahoo.com", "hex***@gmail.com", "ash***@outlook.com",
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
    const interval = setInterval(() => showNotification(), 28000 + Math.random() * 20000)
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
        className="group relative flex items-center gap-3 p-3 pr-4 rounded-xl bg-gradient-to-br from-[#0c0c0c] via-[#0a0a0a] to-[#0c0a08] border border-white/[0.10] shadow-[0_12px_36px_rgba(0,0,0,0.55),0_0_24px_rgba(249,115,22,0.06)] hover:border-[#f97316]/35 hover:shadow-[0_16px_44px_rgba(0,0,0,0.6),0_0_36px_rgba(249,115,22,0.18)] transition-all duration-300 w-[300px] overflow-hidden"
      >
        {/* Subtle orange left accent strip */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#f97316]/70 to-transparent pointer-events-none" />
        {/* Product image */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-white/[0.06] to-white/[0.015] border border-white/[0.08] flex items-center justify-center">
          <Image
            src={product.image}
            alt={product.name}
            width={48}
            height={48}
            className="object-contain w-full h-full p-1.5 group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#f97316]">New Order</span>
            <span className="text-white/30">·</span>
            <span className="text-[10px] text-white/55 font-medium tabular-nums">{minutes}m ago</span>
          </div>
          <p className="text-[13px] font-bold text-white truncate group-hover:text-[#f97316] transition-colors leading-tight">
            {product.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              Verified
            </span>
            <span className="text-[10px] font-mono text-white/55 truncate">{email}</span>
          </div>
        </div>

        {/* Dismiss */}
        <button
          aria-label="Dismiss notification"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDismissed(true)
          }}
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full text-white/45 hover:text-white hover:bg-white/[0.10] transition-all flex items-center justify-center text-[12px] leading-none"
        >
          ×
        </button>
      </Link>
    </div>
  )
}
