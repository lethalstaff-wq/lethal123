"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import {
  ChevronDown, ArrowRight,
  Shield, Wallet, Zap, Cpu, Fingerprint, LifeBuoy, RotateCcw, BookOpen,
  type LucideIcon,
} from "lucide-react"
import { SectionEyebrow } from "@/components/section-eyebrow"

type Faq = {
  Icon: LucideIcon
  tag: string
  q: string
  a: string
  link?: { label: string; href: string }
}

const faqs: Faq[] = [
  {
    Icon: Shield, tag: "Safety",
    q: "Is it safe to use?",
    a: "Yes. All products tested daily against the latest anti-cheat updates. 99.8% undetected rate. If detection occurs, we patch within 24 hours and extend subscriptions — no questions asked.",
    link: { label: "Browse products", href: "/products" },
  },
  {
    Icon: Wallet, tag: "Payment",
    q: "What payment methods?",
    a: "Bitcoin, Ethereum, Litecoin, USDT, and PayPal (Friends & Family). Crypto payments process instantly and confirm in minutes.",
    link: { label: "Checkout flow", href: "/cart" },
  },
  {
    Icon: Zap, tag: "Delivery",
    q: "How fast is delivery?",
    a: "Digital products are delivered instantly to your dashboard. DMA hardware ships within 24 hours worldwide, with full tracking and signed-for insurance.",
    link: { label: "Track an order", href: "/track" },
  },
  {
    Icon: Cpu, tag: "Hardware",
    q: "What DMA cards are supported?",
    a: "All major cards — 75T, 100T, M.2, ZDMA. Compatible with most modern Intel and AMD motherboards. Custom firmware available if your board isn't on the list.",
    link: { label: "Custom firmware", href: "/products/custom-dma-firmware" },
  },
  {
    Icon: Fingerprint, tag: "Spoofer",
    q: "Does the spoofer work after a HWID ban?",
    a: "Yes — we change hardware identifiers at the kernel level. You can play on a new account immediately after a hardware ban. Perm spoofer survives reboots; temp spoofer resets each boot.",
    link: { label: "Perm Spoofer", href: "/products/perm-spoofer" },
  },
  {
    Icon: LifeBuoy, tag: "Support",
    q: "What if something doesn't work?",
    a: "24/7 Discord support with average response under 5 minutes. If we can't get it running for you, full refund within 24 hours. No scripts. Real humans, every time.",
    link: { label: "Setup help", href: "/setup" },
  },
  {
    Icon: RotateCcw, tag: "Refunds",
    q: "Do you offer refunds?",
    a: "Yes. Full refund if a product doesn't work on your setup. Partial refunds for unused subscription time. Refund policy lives in our terms page.",
    link: { label: "Refund policy", href: "/terms" },
  },
  {
    Icon: BookOpen, tag: "Setup",
    q: "How do I set everything up?",
    a: "Step-by-step guides included with every purchase. Video tutorials for DMA. If you'd rather not read, we'll screen-share on Discord and walk you through it end-to-end.",
    link: { label: "Setup guide", href: "/setup" },
  },
]

type CardProps = {
  f: Faq
  index: number
  isOpen: boolean
  onToggle: () => void
}

function FaqCard({ f, index, isOpen, onToggle }: CardProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Cursor-follow spotlight (same mechanic as product cards / testimonials)
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${e.clientX - r.left}px`)
    el.style.setProperty("--my", `${e.clientY - r.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`spotlight-card group relative rounded-2xl border overflow-hidden transition-[border-color,background-color,box-shadow,transform] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen
          ? "border-[#f97316]/35 bg-white/[0.025] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7),0_0_60px_-25px_rgba(249,115,22,0.35)]"
          : "border-white/[0.06] bg-white/[0.015] hover:border-[#f97316]/22 hover:bg-white/[0.025] hover:-translate-y-[1px]"
      }`}
    >
      {/* Top accent hairline + halo — only when open */}
      {isOpen && (
        <>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/80 to-transparent z-[1]" />
          <div className="absolute top-0 left-1/4 right-1/4 h-[6px] bg-gradient-to-b from-[#f97316]/35 to-transparent blur-md pointer-events-none z-[1]" />
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 80% 55% at 20% 100%, rgba(249,115,22,0.09), transparent 65%)",
            }}
          />
        </>
      )}

      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        data-cursor="cta"
        data-cursor-label={isOpen ? "Close" : "Open"}
        className="cursor-cta relative z-[2] flex items-center gap-5 w-full px-6 py-5 text-left"
      >
        {/* Icon bubble — glass + ring */}
        <span
          className={`relative shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-400 ${
            isOpen
              ? "bg-[#f97316]/[0.10] text-[#f97316]"
              : "bg-white/[0.03] text-white/55 group-hover:text-[#f97316]/85"
          }`}
          style={{
            boxShadow: isOpen
              ? "inset 0 0 0 1px rgba(249,115,22,0.35), 0 0 24px -6px rgba(249,115,22,0.45)"
              : "inset 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          <f.Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
        </span>

        {/* Title cluster */}
        <span className="flex-1 min-w-0">
          <span
            className={`block text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors ${
              isOpen ? "text-[#f97316]/85" : "text-white/35 group-hover:text-white/45"
            }`}
          >
            {String(index + 1).padStart(2, "0")} &middot; {f.tag}
          </span>
          <span
            className="block mt-1.5 font-display text-[17px] sm:text-[18px] font-semibold tracking-[-0.012em] leading-[1.25]"
            style={
              isOpen
                ? {
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,1), rgba(210,210,220,0.85))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }
                : undefined
            }
          >
            <span className={isOpen ? "" : "text-white/80 group-hover:text-white transition-colors"}>
              {f.q}
            </span>
          </span>
        </span>

        {/* Chevron — elegant, rotates */}
        <span
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-400 ${
            isOpen
              ? "bg-[#f97316]/[0.14] text-[#f97316] rotate-180"
              : "bg-white/[0.03] text-white/50 group-hover:text-[#f97316]/80"
          }`}
          style={{
            boxShadow: isOpen
              ? "inset 0 0 0 1px rgba(249,115,22,0.30)"
              : "inset 0 0 0 1px rgba(255,255,255,0.07)",
          }}
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2} />
        </span>
      </button>

      {/* Answer */}
      <div
        className="grid relative z-[2] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pl-[5.25rem] pr-6 pb-6">
            <div className="relative pl-5">
              <span className="absolute left-0 top-1.5 bottom-1.5 w-px bg-gradient-to-b from-[#f97316]/70 via-[#f97316]/20 to-transparent" />
              <p className="text-[14.5px] text-white/70 leading-[1.85] mb-4">{f.a}</p>
              {f.link && (
                <Link
                  href={f.link.href}
                  data-cursor="cta"
                  data-cursor-label={f.link.label}
                  className="cursor-cta inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-[#f97316]/90 bg-[#f97316]/[0.06] border border-[#f97316]/20 hover:bg-[#f97316]/[0.12] hover:border-[#f97316]/35 hover:text-[#fbbf24] transition-all"
                >
                  {f.link.label}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="relative py-32 lg:py-40 px-6 sm:px-10 z-10 overflow-hidden">
      {/* Ambient orange orb — matches hero/services vibe */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 35%, rgba(249,115,22,0.07), transparent 65%)",
        }}
      />

      <div className="relative max-w-[840px] mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <SectionEyebrow number="06" label="FAQ" />
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[0.95] mb-5">
            <span
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Common{" "}
            </span>
            <span
              style={{
                background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))",
              }}
            >
              Questions
            </span>
          </h2>
          <p className="text-white/45 text-[14.5px] max-w-md mx-auto leading-relaxed">
            The answers that come up every day. Still curious? We're in Discord.
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <FaqCard
              key={i}
              f={f}
              index={i}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </div>

        {/* Discord helper */}
        <div className="mt-10 flex items-center justify-center gap-3 text-[13px]">
          <span className="text-white/40">Didn't find your answer?</span>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 text-[#f97316] font-semibold hover:text-[#fbbf24] transition-colors"
          >
            Ask on Discord
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </section>
  )
}
