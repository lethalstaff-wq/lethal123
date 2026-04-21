"use client"

import { useState, useEffect, useCallback } from "react"
import { PRODUCTS } from "@/lib/products"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"

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
      <div className="relative w-[360px] max-w-[calc(100vw-3rem)]">
        {/* External dismiss — fully outside the card */}
        <button
          aria-label="Dismiss notification"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDismissed(true)
          }}
          className="absolute -top-2.5 -right-2.5 z-20 w-7 h-7 rounded-full bg-[#0a0a0a] border border-white/[0.20] text-white/65 hover:text-white hover:border-[#f97316]/50 hover:bg-[#f97316]/10 transition-all flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.55)]"
        >
          <span className="text-[14px] leading-none">×</span>
        </button>

        <Link
          href={`/products/${product.id}`}
          onClick={() => setDismissed(true)}
          className="group relative block rounded-2xl bg-[#0a0a0a] backdrop-blur-xl border border-white/[0.10] shadow-[0_18px_48px_rgba(0,0,0,0.55),0_0_30px_rgba(249,115,22,0.10)] hover:border-[#f97316]/35 hover:shadow-[0_24px_60px_rgba(0,0,0,0.6),0_0_50px_rgba(249,115,22,0.18)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/65 to-transparent pointer-events-none" />
          {/* Hover orange glow corner */}
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.18), transparent 70%)" }} />

          {/* Header bar — eyebrow + time */}
          <div className="relative flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/[0.05]">
            <div className="inline-flex items-center gap-1.5">
              <span className="relative flex items-center justify-center">
                <span className="absolute w-2 h-2 rounded-full bg-[#f97316]/45 animate-ping" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.7)]" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f97316]">New Order</span>
            </div>
            <span className="text-[11px] text-white/55 font-medium tabular-nums">{minutes}m ago</span>
          </div>

          {/* Body — image left, content right */}
          <div className="relative flex items-center gap-3 p-3.5">
            {/* Image — bigger, properly centered */}
            <div className="relative w-[72px] h-[72px] rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.015] border border-white/[0.08] overflow-hidden shrink-0 flex items-center justify-center">
              <Image
                src={product.image}
                alt={product.name}
                width={72}
                height={72}
                className="object-contain w-full h-full p-2 group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 relative z-[1]">
              <p className="font-display font-bold text-white text-[15px] truncate group-hover:text-[#f97316] transition-colors tracking-tight leading-tight">
                {product.name}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Verified
                </span>
                <span className="text-[11px] font-mono text-white/55 truncate">{email}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
