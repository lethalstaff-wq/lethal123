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
        className="group relative flex items-center gap-3 p-3 pr-5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/[0.10] shadow-[0_18px_48px_rgba(0,0,0,0.55),0_0_30px_rgba(249,115,22,0.10)] hover:border-[#f97316]/35 hover:shadow-[0_24px_60px_rgba(0,0,0,0.6),0_0_50px_rgba(249,115,22,0.18)] hover:-translate-y-0.5 transition-all duration-300 w-[340px] overflow-hidden"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent pointer-events-none" />
        {/* Hover orange glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.18), transparent 70%)" }} />

        {/* Product image */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/[0.10] group-hover:ring-[#f97316]/40 transition-all bg-white/[0.03]">
          <Image
            src={product.image}
            alt={product.name}
            width={48}
            height={48}
            className="object-contain w-full h-full p-1 group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 relative z-[1]">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#f97316]">New Order</span>
            <span className="text-white/25">·</span>
            <span className="text-[10px] text-white/55 font-medium">{minutes}m ago</span>
          </div>
          <p className="text-[14px] font-bold text-white truncate mt-0.5 group-hover:text-[#f97316] transition-colors font-display tracking-tight">
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
            <span className="text-[10px] text-white/35">·</span>
            <span className="text-[10px] font-mono text-white/45 truncate">{email}</span>
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
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black border border-white/[0.15] text-white/55 hover:text-white hover:border-[#f97316]/40 transition-all flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 shadow-md"
        >
          ×
        </button>
      </Link>
    </div>
  )
}
