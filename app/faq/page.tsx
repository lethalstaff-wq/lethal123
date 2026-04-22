"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HelpCircle, ChevronDown, Search, ShieldCheck, Clock, MessageCircle, ExternalLink, ThumbsUp, ThumbsDown, ArrowRight, Link2, Zap, Sparkles, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { SectionEyebrow } from "@/components/section-eyebrow"

interface FAQItem {
  question: string
  answer: string
  category: string
  slug: string
}

// Small slugify helper so every Q has a stable #anchor for deep linking
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

const RAW_DATA: Omit<FAQItem, "slug">[] = [
  // Getting Started
  {
    category: "Getting Started",
    question: "How do I purchase a product?",
    answer: "Browse our products page, select the variant that fits your needs, add it to cart, and proceed to checkout. We accept Bitcoin, Ethereum, Litecoin, USDT (TRC-20/ERC-20), and PayPal (Friends & Family). After payment confirmation, you'll receive your license key and download link via email within minutes."
  },
  {
    category: "Getting Started",
    question: "How long does delivery take?",
    answer: "Digital products are delivered instantly after payment confirmation. Crypto payments require blockchain confirmations: Bitcoin needs 2 confirmations (~20 min), Litecoin ~5 min, USDT TRC-20 ~3 min. DMA firmware orders may take 24-48 hours as they require custom generation for your specific hardware."
  },
  {
    category: "Getting Started",
    question: "What payment methods do you accept?",
    answer: "We accept Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), USDT on TRC-20 and ERC-20 networks, and PayPal (Friends & Family). Cryptocurrency payments are processed instantly. PayPal orders may take up to 30 minutes for manual verification. We do not accept credit cards or bank transfers."
  },
  {
    category: "Getting Started",
    question: "Do I need any special hardware?",
    answer: "For software products (Spoofer, Fortnite External), you only need a Windows 10/11 PC. For DMA cheats (Blurred, Streck), you need a DMA card (we sell complete bundles with Captain DMA 100T-7th), a second PC or laptop, and a fuser or capture card."
  },
  // Spoofer
  {
    category: "Spoofer",
    question: "What does the HWID Spoofer do?",
    answer: "Our spoofer changes your hardware identifiers (HWID) that games and anti-cheats use to track bans. It spoofs: Disk serials, motherboard UUID, MAC addresses, SMBIOS data, GPU identifiers, and more. This allows you to play on a fresh identity after a hardware ban."
  },
  {
    category: "Spoofer",
    question: "What's the difference between Perm and Temp Spoofer?",
    answer: "Perm Spoofer makes permanent changes to your hardware identifiers that persist across reboots. Temp Spoofer applies changes only for the current session - when you restart, your original HWIDs return. Perm is more convenient, Temp is safer for some use cases."
  },
  {
    category: "Spoofer",
    question: "Will the spoofer remove my existing ban?",
    answer: "The spoofer doesn't remove bans - it changes your hardware identity so the game sees you as a new user. Your banned account remains banned, but you can create a new account and play without being flagged by your hardware."
  },
  // DMA Products
  {
    category: "DMA Products",
    question: "What is DMA cheating and why is it undetected?",
    answer: "DMA (Direct Memory Access) uses external hardware to read game memory from a separate computer. Since no software runs on your gaming PC, anti-cheats cannot detect it. The DMA card reads memory directly through PCIe, completely bypassing kernel-level anti-cheat protection."
  },
  {
    category: "DMA Products",
    question: "What hardware do I need for DMA?",
    answer: "You need: 1) A DMA card (Captain DMA 100T-7th recommended), 2) A second PC or laptop to run the cheat software, 3) A fuser or HDMI capture card. Our bundles include everything except the second PC."
  },
  {
    category: "DMA Products",
    question: "What's included in the DMA bundles?",
    answer: "Basic Bundle: Captain DMA card, EAC/BE firmware, Mini DP Fuser, 30-day Blurred license, Macku cheat. Advanced Bundle adds: Dichen D60 Fuser, Teensy with firmware, Slotted firmware, Quarterly Blurred. Elite Bundle: DC500 Fuser, Lifetime Blurred, full FaceIt/VGK emulation."
  },
  {
    category: "DMA Products",
    question: "What's the difference between Blurred and Streck?",
    answer: "Blurred is our premium DMA cheat supporting 6 games (Fortnite, Apex, Rust, PUBG, and more) with full radar, stream-proof overlay, and FaceIt/Vanguard bypass. Streck is a budget-friendly option for Fortnite and Apex with core ESP and aimbot. Both are undetected. Check the Compare page for detailed feature comparison."
  },
  // Firmware
  {
    category: "Firmware",
    question: "What games does the custom firmware support?",
    answer: "EAC/BE Emulated: All EasyAntiCheat and BattlEye games (Fortnite, Apex, Rust, etc). Slotted Edition: Same games with reduced detection overlap. FaceIt/VGK: Adds support for FaceIt anti-cheat and Valorant's Vanguard (VGK). Supports 75T, 100T, M.2, and ZDMA cards."
  },
  {
    category: "Firmware",
    question: "How do I get my firmware installed?",
    answer: "After purchase, download RustDesk and provide us your connection ID via Discord. Our team will remotely flash the firmware to your DMA card. The process takes 15-30 minutes. You'll need to be present to confirm actions on your PC."
  },
  {
    category: "Firmware",
    question: "What is a DNA ID and why do you need it?",
    answer: "Your DNA ID is a unique identifier for your specific DMA card. We use it to generate custom firmware that only works on your hardware. This prevents reselling and ensures maximum security. Follow our Knowledge Base guide to obtain your DNA ID."
  },
  // Technical
  {
    category: "Technical",
    question: "What are the system requirements?",
    answer: "Gaming PC: Windows 10/11 64-bit, disable Secure Boot and virtualization (VT-x) for spoofer. Second PC (DMA): Any Windows/Linux system with USB 3.0. Minimum 8GB RAM recommended. Specific requirements listed on each product page."
  },
  {
    category: "Technical",
    question: "The loader won't start, what should I do?",
    answer: "1) Run as Administrator, 2) Disable Windows Defender real-time protection, 3) Add exclusion for the loader folder, 4) Disable any other antivirus, 5) Ensure you're on Windows 10/11 64-bit, 6) Try compatibility mode for Windows 10. Contact Discord support if issues persist."
  },
  {
    category: "Technical",
    question: "Can I use a VPN with your products?",
    answer: "Yes, VPNs are recommended for additional privacy. For DMA setups, the VPN should run on your gaming PC. For software cheats, ensure the VPN doesn't interfere with the loader's connection. We recommend NordVPN or Mullvad with split tunneling enabled."
  },
  {
    category: "Technical",
    question: "How do I reset my HWID if I change PC?",
    answer: "Each license is tied to one HWID. If you change PC or reinstall Windows, contact us on Discord with your order ID for a free HWID reset. We allow 1-2 resets per month. For Blurred/Streck, use the in-loader reset option if available."
  },
  // Orders & Support
  {
    category: "Orders & Support",
    question: "How do I track my order status?",
    answer: "Visit the Track Order page and enter your Order ID (from confirmation email) or the email address you used. You'll see payment status, processing status, and download links once ready."
  },
  {
    category: "Orders & Support",
    question: "My payment hasn't been verified - what should I do?",
    answer: "Check that you sent the exact amount shown (including network fees on your end). Bitcoin needs 2 confirmations, Litecoin 6, USDT is usually instant. If it's been over 1 hour, open a Discord ticket with your Order ID and transaction hash (TXID)."
  },
  {
    category: "Orders & Support",
    question: "Do you offer refunds?",
    answer: "If a product doesn't work on your setup and our support team can't resolve it, we issue a full refund within 24 hours of purchase. For subscription products, we offer partial refunds for unused time. Open a ticket on Discord to request a refund."
  },
  {
    category: "Orders & Support",
    question: "How do I contact support?",
    answer: "Join our Discord server and open a ticket in the #support channel. Average response time is under 15 minutes during EU/US business hours. For urgent issues, tag @Staff in your ticket. Include your Order ID for faster help."
  },
  // Safety
  {
    category: "Safety",
    question: "Are your products safe and undetected?",
    answer: "Yes. We continuously update all products to maintain undetected status. Check our Status page for real-time detection status. DMA products are inherently undetectable due to hardware-level operation. Software products receive updates within 24-48 hours of any game patch."
  },
  {
    category: "Safety",
    question: "What happens if a product gets detected?",
    answer: "If detection occurs, we immediately work on an update (usually within 24 hours). We'll notify all users via Discord. If you get banned during a detection window that was our fault, we offer license extension or replacement at our discretion. Always check Status page before playing."
  },
  {
    category: "Safety",
    question: "How do you update products after game patches?",
    answer: "Our team monitors all supported games 24/7. When a patch drops, we test immediately and push updates within hours. Major anti-cheat updates may take 24-48 hours. Blurred and Streck have auto-update features. Spoofer updates are manual downloads from your license panel."
  },
]

const FAQ_DATA: FAQItem[] = RAW_DATA.map(d => ({ ...d, slug: slugify(d.question) }))

// Categories in display order
const CATEGORY_ORDER = ["Getting Started", "Spoofer", "DMA Products", "Firmware", "Technical", "Orders & Support", "Safety"]

// Top 3 "quick answers" — most-asked by volume
const QUICK_ANSWER_SLUGS = [
  slugify("How long does delivery take?"),
  slugify("What payment methods do you accept?"),
  slugify("Are your products safe and undetected?"),
]

const QUICK_ICONS: Record<string, typeof Zap> = {
  [slugify("How long does delivery take?")]: Clock,
  [slugify("What payment methods do you accept?")]: Sparkles,
  [slugify("Are your products safe and undetected?")]: ShieldCheck,
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [openSlugs, setOpenSlugs] = useState<Set<string>>(new Set())
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, "yes" | "no">>({})
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  // Deep-link support: open + scroll to the question matching window.location.hash
  useEffect(() => {
    if (typeof window === "undefined") return
    const applyHash = () => {
      const raw = window.location.hash.replace(/^#/, "")
      if (!raw) return
      const match = FAQ_DATA.find(f => f.slug === raw)
      if (match) {
        setSelectedCategory("All")
        setOpenSlugs(prev => {
          const next = new Set(prev)
          next.add(match.slug)
          return next
        })
        // Defer scroll so the DOM has the expanded item
        requestAnimationFrame(() => {
          const el = document.getElementById(`faq-${match.slug}`)
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
        })
      }
    }
    applyHash()
    window.addEventListener("hashchange", applyHash)
    return () => window.removeEventListener("hashchange", applyHash)
  }, [])

  const toggleSlug = useCallback((slug: string) => {
    setOpenSlugs(prev => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }, [])

  const copyDeepLink = useCallback((slug: string) => {
    if (typeof window === "undefined") return
    const url = `${window.location.origin}${window.location.pathname}#${slug}`
    try {
      navigator.clipboard?.writeText(url)
      setCopiedSlug(slug)
      window.history.replaceState(null, "", `#${slug}`)
      setTimeout(() => setCopiedSlug(prev => (prev === slug ? null : prev)), 1600)
    } catch {
      // clipboard may be blocked — fall back to updating hash
      window.history.replaceState(null, "", `#${slug}`)
    }
  }, [])

  // Counts per category — stable base (ignores search) so the sidebar reads clean.
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { All: FAQ_DATA.length }
    for (const f of FAQ_DATA) map[f.category] = (map[f.category] ?? 0) + 1
    return map
  }, [])

  // Search-aware counts per category — used for reactive counter in input
  const filteredFAQ = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return FAQ_DATA.filter(item => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
      const matchesSearch = !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [searchQuery, selectedCategory])

  // Group filtered by category for desktop right pane headings
  const grouped = useMemo(() => {
    const out: Array<{ category: string; items: FAQItem[] }> = []
    const bucket: Record<string, FAQItem[]> = {}
    for (const item of filteredFAQ) {
      if (!bucket[item.category]) bucket[item.category] = []
      bucket[item.category].push(item)
    }
    for (const cat of CATEGORY_ORDER) {
      if (bucket[cat]?.length) out.push({ category: cat, items: bucket[cat] })
    }
    return out
  }, [filteredFAQ])

  const quickAnswers = useMemo(
    () => QUICK_ANSWER_SLUGS.map(slug => FAQ_DATA.find(f => f.slug === slug)!).filter(Boolean),
    []
  )

  const searchActive = searchQuery.trim().length > 0
  const resultCount = filteredFAQ.length

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-14 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <Breadcrumbs items={[{ label: "FAQ" }]} />
          <div className="max-w-2xl mx-auto text-center">
            <SectionEyebrow label="Help Center" />
            <div className="relative h-px w-44 mx-auto mb-7 bg-white/[0.05] overflow-hidden">
              <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#f97316]/70 to-transparent" style={{ animation: "heroScan 4s ease-in-out infinite" }} />
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Common </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>Questions</span>
            </h1>
            <p className="text-[17px] text-white/55 max-w-xl mx-auto leading-relaxed mb-8">
              Find answers to common questions about our products and services
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/55 pointer-events-none" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl text-white placeholder:text-white/55 focus:outline-none focus:ring-2 focus:ring-[#f97316]/50"
                aria-label="Search questions"
              />
            </div>
            {/* Reactive counter */}
            <div className="h-5 mt-3 text-[12px] font-semibold tracking-wide" aria-live="polite">
              {searchActive ? (
                resultCount > 0 ? (
                  <span className="text-white/60">
                    <span className="text-[#f97316] font-bold">{resultCount}</span> {resultCount === 1 ? "answer matches" : "answers match"} <span className="text-white/85">&ldquo;{searchQuery.trim()}&rdquo;</span>
                  </span>
                ) : (
                  <span className="text-white/55">No answers match <span className="text-white/85">&ldquo;{searchQuery.trim()}&rdquo;</span></span>
                )
              ) : (
                <span className="text-white/35">{FAQ_DATA.length} answers across {CATEGORY_ORDER.length} topics</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Answers — hero row */}
      {!searchActive && (
        <section className="pb-10">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#f97316]" />
                  <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#f97316]/80">Quick answers</span>
                </div>
                <span className="hidden sm:block text-[11px] text-white/35 tracking-wide">Most-asked, straight to the point</span>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {quickAnswers.map(item => {
                  const Icon = QUICK_ICONS[item.slug] ?? HelpCircle
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => {
                        setSelectedCategory("All")
                        setOpenSlugs(prev => { const n = new Set(prev); n.add(item.slug); return n })
                        requestAnimationFrame(() => {
                          const el = document.getElementById(`faq-${item.slug}`)
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
                        })
                      }}
                      className="group text-left relative rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.035] hover:border-[#f97316]/25 transition-all p-5 overflow-hidden"
                    >
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-[#f97316]" />
                        </div>
                        <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#f97316]/80">{item.category}</span>
                      </div>
                      <div className="text-[14px] font-semibold text-white/90 leading-snug tracking-tight mb-2">{item.question}</div>
                      <div className="text-[12.5px] text-white/55 leading-relaxed line-clamp-2">{item.answer}</div>
                      <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#f97316]/80 group-hover:text-[#f97316] transition-colors">
                        Read answer <ArrowRight className="h-3 w-3" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Two-pane layout */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[240px_minmax(0,1fr)] gap-10">

            {/* Mobile category chips (hidden on lg+) */}
            <div className="lg:hidden -mx-4 px-4 overflow-x-auto">
              <div className="flex gap-2 pb-1 min-w-max">
                {["All", ...CATEGORY_ORDER].map(cat => {
                  const active = selectedCategory === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold tracking-tight transition-all border",
                        active
                          ? "bg-[#f97316] text-white border-[#f97316] shadow-[0_4px_14px_rgba(249,115,22,0.4)]"
                          : "bg-white/[0.02] text-white/70 border-white/[0.08] hover:border-[#f97316]/30 hover:text-white"
                      )}
                    >
                      <span>{cat}</span>
                      <span className={cn(
                        "text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-md",
                        active ? "bg-white/20 text-white" : "bg-white/[0.05] text-white/50"
                      )}>{categoryCounts[cat] ?? 0}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Desktop sticky sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#f97316]/80">Topics</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/[0.08] to-transparent" />
                </div>
                <nav className="flex flex-col gap-1" aria-label="FAQ categories">
                  {["All", ...CATEGORY_ORDER].map(cat => {
                    const active = selectedCategory === cat
                    const count = categoryCounts[cat] ?? 0
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "group flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold tracking-tight transition-all border",
                          active
                            ? "bg-gradient-to-br from-[#f97316]/15 to-white/[0.01] border-[#f97316]/30 text-white shadow-[0_8px_24px_rgba(249,115,22,0.12)]"
                            : "bg-transparent border-white/[0.04] text-white/60 hover:bg-white/[0.025] hover:border-white/[0.08] hover:text-white/90"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full transition-all",
                            active ? "bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.8)]" : "bg-white/20 group-hover:bg-white/40"
                          )} />
                          {cat}
                        </span>
                        <span className={cn(
                          "text-[10.5px] font-mono tabular-nums px-1.5 py-0.5 rounded-md tracking-tight",
                          active ? "bg-[#f97316]/20 text-[#f97316]" : "bg-white/[0.04] text-white/45"
                        )}>{count}</span>
                      </button>
                    )
                  })}
                </nav>

                {/* Helper box */}
                <div className="mt-6 p-4 rounded-xl border border-white/[0.06] bg-white/[0.015]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-[#5865F2]" />
                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/70">Still stuck?</span>
                  </div>
                  <p className="text-[12px] text-white/50 leading-relaxed mb-3">
                    Our Discord team replies in under 15 minutes.
                  </p>
                  <Link
                    href="https://discord.gg/lethaldma"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#f97316] hover:text-[#fbbf24] transition-colors"
                  >
                    Open a ticket <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Right pane — grouped accordion */}
            <div className="min-w-0">
              {grouped.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01]">
                  <HelpCircle className="h-10 w-10 text-white/25 mx-auto mb-4" />
                  <p className="text-white/55 text-[14px] mb-4">No questions found matching your search.</p>
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedCategory("All") }}
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#f97316] hover:text-[#fbbf24] transition-colors"
                  >
                    Reset filters <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="space-y-10">
                  {grouped.map(group => (
                    <div key={group.category}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#f97316]/80">{group.category}</span>
                        <span className="text-[10.5px] font-mono tabular-nums text-white/35">{group.items.length} {group.items.length === 1 ? "question" : "questions"}</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/[0.08] to-transparent" />
                      </div>
                      <div className="space-y-3">
                        {group.items.map(item => {
                          const isOpen = openSlugs.has(item.slug)
                          return (
                            <div
                              key={item.slug}
                              id={`faq-${item.slug}`}
                              className={cn(
                                "scroll-mt-32 rounded-2xl border overflow-hidden transition-all duration-300",
                                isOpen
                                  ? "border-[#f97316]/30 bg-gradient-to-br from-[#f97316]/[0.06] to-white/[0.015] shadow-[0_18px_50px_rgba(0,0,0,0.4),0_0_40px_rgba(249,115,22,0.14)]"
                                  : "border-white/[0.06] bg-white/[0.015] hover:border-[#f97316]/20 hover:bg-white/[0.03] hover:-translate-y-0.5"
                              )}
                            >
                              <button
                                onClick={() => toggleSlug(item.slug)}
                                aria-expanded={isOpen}
                                aria-controls={`faq-${item.slug}-panel`}
                                className="w-full flex items-center justify-between p-5 text-left cursor-pointer gap-3"
                              >
                                <div className="flex items-start gap-4 min-w-0 flex-1">
                                  <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all",
                                    isOpen
                                      ? "bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-[0_4px_14px_rgba(249,115,22,0.58)]"
                                      : "bg-[#f97316]/10 border border-[#f97316]/20"
                                  )}>
                                    <HelpCircle className={cn("h-4 w-4 transition-colors", isOpen ? "text-white" : "text-[#f97316]")} />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="block text-[11px] uppercase tracking-[0.2em] font-bold text-[#f97316]/80 mb-0.5">{item.category}</span>
                                    <h3 className={cn("font-bold tracking-tight transition-colors text-[15px] leading-snug", isOpen ? "text-white" : "text-white/85")}>{item.question}</h3>
                                  </div>
                                </div>
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                                  isOpen ? "bg-[#f97316]/20 border border-[#f97316]/40" : "bg-white/[0.04] border border-white/[0.06]"
                                )}>
                                  <ChevronDown className={cn(
                                    "h-4 w-4 shrink-0 transition-all",
                                    isOpen ? "rotate-180 text-[#f97316]" : "text-white/55"
                                  )} />
                                </div>
                              </button>

                              <div
                                id={`faq-${item.slug}-panel`}
                                role="region"
                                className="grid transition-all duration-500"
                                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                              >
                                <div className="overflow-hidden">
                                  <div className="px-5 pb-5 pl-[4.5rem]">
                                    <div className="h-px bg-gradient-to-r from-[#f97316]/30 via-white/[0.05] to-transparent mb-4" />
                                    <p className="text-white/65 leading-relaxed mb-4 text-[14px]">{item.answer}</p>
                                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06]">
                                      <span className="text-[12px] text-white/65 font-semibold">Was this helpful?</span>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setHelpfulVotes(prev => ({ ...prev, [item.slug]: "yes" })) }}
                                        className={cn(
                                          "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all",
                                          helpfulVotes[item.slug] === "yes" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-white/[0.04] text-white/55 border border-white/[0.08] hover:border-emerald-500/30 hover:text-emerald-400"
                                        )}
                                      >
                                        <ThumbsUp className="h-3 w-3" /> Yes
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setHelpfulVotes(prev => ({ ...prev, [item.slug]: "no" })) }}
                                        className={cn(
                                          "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all",
                                          helpfulVotes[item.slug] === "no" ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-white/[0.04] text-white/55 border border-white/[0.08] hover:border-red-500/30 hover:text-red-400"
                                        )}
                                      >
                                        <ThumbsDown className="h-3 w-3" /> No
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); copyDeepLink(item.slug) }}
                                        className={cn(
                                          "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ml-auto",
                                          copiedSlug === item.slug
                                            ? "bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30"
                                            : "bg-white/[0.04] text-white/55 border border-white/[0.08] hover:border-[#f97316]/30 hover:text-[#f97316]"
                                        )}
                                        aria-label="Copy link to this question"
                                        title="Copy link to this question"
                                      >
                                        {copiedSlug === item.slug ? (
                                          <><CheckCircle2 className="h-3 w-3" /> Link copied</>
                                        ) : (
                                          <><Link2 className="h-3 w-3" /> Copy link</>
                                        )}
                                      </button>
                                      {helpfulVotes[item.slug] === "no" && (
                                        <Link href="https://discord.gg/lethaldma" target="_blank" className="inline-flex items-center gap-1 text-[11px] text-[#f97316] font-bold hover:text-[#fbbf24] transition-colors">
                                          Ask on Discord <ArrowRight className="h-3 w-3" />
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/track" className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.02] transition-all hover:border-[#f97316]/30">
                <Clock className="h-8 w-8 text-[#f97316] mb-4" />
                <h3 className="font-bold text-white mb-2">Track Order</h3>
                <p className="text-sm text-white/55">Check your order status and download products</p>
              </Link>

              <Link href="/status" className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.02] transition-all hover:border-[#f97316]/30">
                <ShieldCheck className="h-8 w-8 text-emerald-500 mb-4" />
                <h3 className="font-bold text-white mb-2">Status Page</h3>
                <p className="text-sm text-white/55">View real-time detection status of products</p>
              </Link>

              <Link href="https://discord.gg/lethaldma" target="_blank" className="group p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.02] transition-all hover:border-[#f97316]/30">
                <MessageCircle className="h-8 w-8 text-[#5865F2] mb-4" />
                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                  Discord Support
                  <ExternalLink className="h-4 w-4 text-white/55" />
                </h3>
                <p className="text-sm text-white/55">Get help from our support team</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
