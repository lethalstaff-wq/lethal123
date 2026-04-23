"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Clock, Zap, Bug, Shield, Sparkles, ChevronDown, Filter, RefreshCw, Rss, Mail, Check, BellRing, Sparkle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { SectionEyebrow } from "@/components/section-eyebrow"

interface ChangelogEntry {
  version: string
  date: string
  product: string
  type: "feature" | "fix" | "security" | "improvement" | "patch"
  changes: string[]
}

// Realistic changelog from April 2025 to present
const CHANGELOG_DATA: ChangelogEntry[] = [
  // April 2026 — latest
  {
    version: "4.4.0",
    date: "2026-04-20",
    product: "Perm Spoofer",
    type: "feature",
    changes: [
      "New TPM 2.0 emulation layer — survives full OS reinstall",
      "Kernel driver re-signed under refreshed EV cert",
      "Ryzen 7000 / 9000 series compatibility fixes",
      "Spoof now applies within 4 seconds (down from ~9s)",
    ]
  },
  {
    version: "5.0.0",
    date: "2026-04-15",
    product: "Custom DMA Firmware",
    type: "feature",
    changes: [
      "Major firmware rewrite — v5 signature scheme",
      "Updated for Vanguard (VGK) v2.14 signature format",
      "Fixed rare DMA controller reset on Ryzen 7000-series boards",
      "EAC emulation now survives game restart without reload",
      "Reduced firmware flash time by 35%",
      "New signed build for Captain DMA 100T-7th",
    ]
  },
  {
    version: "4.3.1",
    date: "2026-04-09",
    product: "Blurred DMA Cheat",
    type: "patch",
    changes: [
      "Quickfix for Fortnite v40.20 patch (movement delta)",
      "Memory offset refresh for Valorant 8.07",
      "Fixed ESP flicker on ultrawide displays",
    ]
  },
  {
    version: "4.3.0",
    date: "2026-04-02",
    product: "Custom DMA Firmware",
    type: "patch",
    changes: [
      "Hotfix for Fortnite v40.10 (Chapter 7 Season 2: Showdown, April Fools patch)",
      "Updated EAC emulation signatures",
      "Improved memory read stability during lobby transitions",
    ]
  },
  {
    version: "4.2.5",
    date: "2026-03-29",
    product: "Blurred DMA Cheat",
    type: "improvement",
    changes: [
      "FPS overhead reduced by 40% — runs smoother on mid-range second PCs",
      "New radar overlay with 3D terrain rendering",
      "Improved aimbot prediction for OG map rotations",
    ]
  },
  // March 2026
  {
    version: "4.2.1",
    date: "2026-03-28",
    product: "Blurred DMA Cheat",
    type: "patch",
    changes: [
      "Updated for Fortnite v34.10 patch",
      "Fixed aimbot prediction for new movement system",
      "Optimized ESP rendering performance by 15%",
      "Added new bone priority settings for Chapter 6"
    ]
  },
  {
    version: "2.9.0",
    date: "2026-03-25",
    product: "Fortnite External",
    type: "patch",
    changes: [
      "Compatibility update for v34.10",
      "Improved anti-screenshot bypass",
      "Fixed triggerbot delay inconsistency",
      "New softaim curves added"
    ]
  },
  {
    version: "1.0.0",
    date: "2026-03-25",
    product: "Website",
    type: "feature",
    changes: [
      "Full website redesign — new orange brand theme",
      "Updated product cards, pricing section, and checkout flow",
      "New product finder wizard and comparison page",
    ]
  },
  {
    version: "3.5.2",
    date: "2026-03-20",
    product: "Perm Spoofer",
    type: "improvement",
    changes: [
      "Enhanced SMBIOS spoofing algorithm",
      "Added support for new Intel 15th gen motherboards",
      "Improved registry cleaning for EAC traces",
      "Fixed rare issue with disk serial persistence"
    ]
  },
  {
    version: "4.2.0",
    date: "2026-03-15",
    product: "Blurred DMA Cheat",
    type: "patch",
    changes: [
      "Updated for Fortnite v34.00 Season 2 launch",
      "New weapon configs for mythic items",
      "Improved vehicle ESP with driver indicators",
      "Added Chapter 6 Season 2 POI support"
    ]
  },
  {
    version: "5.1.0",
    date: "2026-03-10",
    product: "Custom DMA Firmware",
    type: "improvement",
    changes: [
      "Improved memory read speeds by 20%",
      "Enhanced scatter read optimization",
      "Better stability on high-refresh setups",
      "Updated EAC emulation signatures"
    ]
  },
  // February 2026
  {
    version: "1.8.5",
    date: "2026-02-28",
    product: "Streck DMA Cheat",
    type: "patch",
    changes: [
      "Updated for Fortnite v33.40 patch",
      "Fixed aimbot FOV visualization",
      "Improved bone selection accuracy",
      "Optimized CPU usage on second PC"
    ]
  },
  {
    version: "2.8.5",
    date: "2026-02-22",
    product: "Fortnite External",
    type: "patch",
    changes: [
      "Compatibility update for v33.40",
      "New prediction algorithm for building edits",
      "Fixed rare crash on game exit",
      "Updated memory offsets"
    ]
  },
  {
    version: "4.1.5",
    date: "2026-02-15",
    product: "Blurred DMA Cheat",
    type: "patch",
    changes: [
      "Updated for Fortnite v33.30 patch",
      "Improved aimbot smoothing at long range",
      "Fixed ESP distance calculation",
      "New radar overlay position options"
    ]
  },
  {
    version: "3.5.0",
    date: "2026-02-10",
    product: "Perm Spoofer",
    type: "security",
    changes: [
      "Updated kernel driver for Windows 11 24H2",
      "New GPU serial spoofing method",
      "Improved TPM bypass compatibility",
      "Enhanced trace cleaning module"
    ]
  },
  {
    version: "5.0.5",
    date: "2026-02-05",
    product: "Custom DMA Firmware",
    type: "security",
    changes: [
      "Updated for EAC February detection wave",
      "Improved config space emulation",
      "New stealth mode for VGK games",
      "Better USB controller handling"
    ]
  },
  // January 2026
  {
    version: "4.1.0",
    date: "2026-01-28",
    product: "Blurred DMA Cheat",
    type: "patch",
    changes: [
      "Updated for Fortnite v33.20 patch",
      "New aim smoothing algorithm",
      "Improved visibility checks accuracy",
      "Fixed item ESP not showing chests"
    ]
  },
  {
    version: "1.8.0",
    date: "2026-01-22",
    product: "Streck DMA Cheat",
    type: "patch",
    changes: [
      "Compatibility update for v33.20",
      "New radar hack with 3D rendering",
      "Improved aimbot target selection",
      "Better performance on older CPUs"
    ]
  },
  {
    version: "2.8.0",
    date: "2026-01-15",
    product: "Fortnite External",
    type: "patch",
    changes: [
      "Updated for v33.10 hotfix",
      "Fixed softaim stuttering issue",
      "New config import/export system",
      "Improved injection stability"
    ]
  },
  {
    version: "3.4.5",
    date: "2026-01-10",
    product: "Temp Spoofer",
    type: "improvement",
    changes: [
      "Faster spoofing initialization",
      "Added new NIC spoofing method",
      "Improved compatibility with RGB software",
      "Fixed issue with specific ASUS boards"
    ]
  },
  {
    version: "5.0.0",
    date: "2026-01-05",
    product: "Custom DMA Firmware",
    type: "feature",
    changes: [
      "Major firmware rewrite for 2026",
      "40% faster DMA read speeds",
      "New IOMMU bypass method",
      "Improved FaceIt compatibility"
    ]
  },
  // December 2025
  {
    version: "4.0.5",
    date: "2025-12-28",
    product: "Blurred DMA Cheat",
    type: "patch",
    changes: [
      "Updated for Fortnite Winterfest patch",
      "New snow biome ESP colors",
      "Fixed aimbot not targeting snowman items",
      "Holiday event support"
    ]
  },
  {
    version: "2.7.5",
    date: "2025-12-22",
    product: "Fortnite External",
    type: "patch",
    changes: [
      "Winterfest 2025 compatibility update",
      "Fixed prediction for holiday items",
      "New festive overlay theme",
      "Performance improvements"
    ]
  },
  {
    version: "3.4.0",
    date: "2025-12-15",
    product: "Perm Spoofer",
    type: "security",
    changes: [
      "Updated for BattlEye December signatures",
      "New motherboard serial spoofing",
      "Improved EFI variable handling",
      "Better Windows 11 compatibility"
    ]
  },
  {
    version: "1.7.5",
    date: "2025-12-10",
    product: "Streck DMA Cheat",
    type: "patch",
    changes: [
      "Updated for Chapter 6 Season 1 patch",
      "New weapon database",
      "Improved aimbot accuracy",
      "Fixed radar not showing vehicles"
    ]
  },
  {
    version: "4.8.5",
    date: "2025-12-05",
    product: "Custom DMA Firmware",
    type: "improvement",
    changes: [
      "Optimized for new DMA card revisions",
      "Improved Captain 100T-8th support",
      "Better error handling",
      "Reduced firmware flash time"
    ]
  },
  // November 2025
  {
    version: "4.0.0",
    date: "2025-11-25",
    product: "Blurred DMA Cheat",
    type: "feature",
    changes: [
      "Chapter 6 Season 1 launch update",
      "Complete POI database update",
      "New map ESP with all locations",
      "Improved weapon handling for new guns"
    ]
  },
  {
    version: "2.7.0",
    date: "2025-11-20",
    product: "Fortnite External",
    type: "feature",
    changes: [
      "Chapter 6 compatibility update",
      "New aimbot prediction system",
      "Updated for all new weapons",
      "Fresh offsets for new season"
    ]
  },
  {
    version: "3.3.5",
    date: "2025-11-15",
    product: "Temp Spoofer",
    type: "improvement",
    changes: [
      "Faster cleanup on exit",
      "New MAC address generation",
      "Improved game detection",
      "Fixed rare crash on AMD systems"
    ]
  },
  {
    version: "1.7.0",
    date: "2025-11-10",
    product: "Streck DMA Cheat",
    type: "feature",
    changes: [
      "Chapter 6 ready update",
      "New ESP box styles",
      "Improved triggerbot timing",
      "Better config system"
    ]
  },
  {
    version: "4.8.0",
    date: "2025-11-05",
    product: "Custom DMA Firmware",
    type: "security",
    changes: [
      "Updated for EAC November detection wave",
      "New emulation patterns",
      "Improved stealth features",
      "Better VGK bypass"
    ]
  },
  {
    version: "0.5.0",
    date: "2025-11-01",
    product: "Website",
    type: "improvement",
    changes: [
      "Black Friday sale preparation",
      "Elite Bundle price adjustment announced",
      "New Discord support ticket system"
    ]
  },
  // October 2025
  {
    version: "3.9.5",
    date: "2025-10-28",
    product: "Blurred DMA Cheat",
    type: "patch",
    changes: [
      "Updated for Fortnitemares 2025",
      "New Halloween ESP themes",
      "Fixed aimbot not targeting zombies",
      "Event item support"
    ]
  },
  {
    version: "2.6.5",
    date: "2025-10-22",
    product: "Fortnite External",
    type: "patch",
    changes: [
      "Fortnitemares compatibility update",
      "New Halloween overlay",
      "Fixed prediction for event items",
      "Performance optimizations"
    ]
  },
  {
    version: "3.3.0",
    date: "2025-10-15",
    product: "Perm Spoofer",
    type: "feature",
    changes: [
      "New disk serial generation algorithm",
      "Added SSD trim support",
      "Improved boot time spoofing",
      "Better anti-trace on shutdown"
    ]
  },
  {
    version: "1.6.5",
    date: "2025-10-10",
    product: "Streck DMA Cheat",
    type: "patch",
    changes: [
      "Updated for v32.00 hotfix",
      "Fixed aimbot jitter issue",
      "Improved bone targeting",
      "New config presets"
    ]
  },
  {
    version: "4.7.5",
    date: "2025-10-05",
    product: "Custom DMA Firmware",
    type: "improvement",
    changes: [
      "Optimized memory scatter reads",
      "Improved Captain DMA compatibility",
      "Better handling of high refresh rates",
      "Reduced CPU overhead on second PC"
    ]
  },
  // September 2025
  {
    version: "3.2.0",
    date: "2025-09-20",
    product: "Custom DMA Firmware",
    type: "security",
    changes: [
      "FaceIt/VGK firmware — improved kernel-level masking",
      "New stealth mode for tournament anti-cheat",
      "Better compatibility with Valorant ranked"
    ]
  },
  {
    version: "3.8.0",
    date: "2025-09-10",
    product: "Blurred DMA Cheat",
    type: "patch",
    changes: [
      "Chapter 5 Season 4 compatibility update",
      "New weapon database for season items",
      "Improved ESP rendering performance"
    ]
  },
  // August 2025
  {
    version: "1.0.0",
    date: "2025-08-12",
    product: "Streck DMA Cheat",
    type: "feature",
    changes: [
      "Streck DMA launch — budget DMA cheat option",
      "Core ESP and aimbot features",
      "Fortnite and Apex Legends support"
    ]
  },
  {
    version: "3.0.0",
    date: "2025-08-01",
    product: "Perm Spoofer",
    type: "feature",
    changes: [
      "Perm Spoofer v3.0 — complete kernel rewrite",
      "NVMe serial spoofing support added",
      "New anti-trace cleanup module"
    ]
  },
  // July 2025
  {
    version: "0.1.0",
    date: "2025-07-05",
    product: "Website",
    type: "feature",
    changes: [
      "Lethal Solutions website launched",
      "Discord server opened for customer support",
      "Initial product catalog: Blurred DMA, Perm Spoofer, Fortnite External"
    ]
  },
  // June 2025
  {
    version: "3.0.0",
    date: "2025-06-01",
    product: "Blurred DMA Cheat",
    type: "feature",
    changes: [
      "Blurred DMA closed beta begins",
      "Core features: ESP, aimbot, triggerbot",
      "First testers onboarded via Discord"
    ]
  },
  // April 2025
  {
    version: "0.0.1",
    date: "2025-04-15",
    product: "Website",
    type: "feature",
    changes: [
      "Lethal Solutions founded",
      "Development begins on DMA cheat and firmware solutions",
      "Initial team assembled"
    ]
  },
]

/**
 * Chip palette — per-type color fills (not just tints). These are the fully
 * saturated badge colors for the UPDATE / FIX / FEATURE / SECURITY tags shown
 * on each entry. Icon and dot use the same hue for visual coherence.
 */
const TYPE_CONFIG = {
  feature: {
    icon: Sparkles,
    label: "Feature",
    dot: "bg-emerald-400",
    iconTint: "text-emerald-300",
    iconBg: "bg-emerald-500/12",
    chip: "bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)]",
  },
  fix: {
    icon: Bug,
    label: "Fix",
    dot: "bg-amber-400",
    iconTint: "text-amber-300",
    iconBg: "bg-amber-500/12",
    chip: "bg-amber-500 text-black shadow-[0_4px_14px_rgba(245,158,11,0.4)]",
  },
  security: {
    icon: Shield,
    label: "Security",
    dot: "bg-sky-400",
    iconTint: "text-sky-300",
    iconBg: "bg-sky-500/12",
    chip: "bg-sky-500 text-white shadow-[0_4px_14px_rgba(14,165,233,0.35)]",
  },
  improvement: {
    icon: Zap,
    label: "Update",
    dot: "bg-violet-400",
    iconTint: "text-violet-300",
    iconBg: "bg-violet-500/12",
    chip: "bg-violet-500 text-white shadow-[0_4px_14px_rgba(139,92,246,0.35)]",
  },
  patch: {
    icon: RefreshCw,
    label: "Patch",
    dot: "bg-[#f97316]",
    iconTint: "text-[#fb923c]",
    iconBg: "bg-[#f97316]/12",
    chip: "bg-[#f97316] text-white shadow-[0_4px_14px_rgba(249,115,22,0.4)]",
  },
} as const

/** Flat product list — no Firmware/Products categorisation, since "Firmware"
 *  realistically only covers Custom DMA Firmware and the split looked
 *  arbitrary. One row, alphabetical-ish. */
const FILTER_PRODUCTS = [
  "Perm Spoofer",
  "Temp Spoofer",
  "Custom DMA Firmware",
  "Fortnite External",
  "Streck DMA Cheat",
  "Blurred DMA Cheat",
  "Website",
] as const

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/** "2 days ago" / "3 weeks ago" / "5 months ago" — stable for SSR (uses today's context). */
function relativeTime(dateStr: string, now: Date = new Date()) {
  const d = new Date(dateStr)
  const diffMs = now.getTime() - d.getTime()
  const day = 1000 * 60 * 60 * 24
  const days = Math.max(0, Math.floor(diffMs / day))
  if (days === 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`
  const months = Math.floor(days / 30)
  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`
  const years = Math.floor(days / 365)
  return years === 1 ? "1 year ago" : `${years} years ago`
}

/** YYYY-MM anchor id for scroll-to navigation. */
function monthAnchor(dateStr: string) {
  const d = new Date(dateStr)
  return `m-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function monthLabelShort(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" })
}

function monthLabelLong(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
}

export default function ChangelogPage() {
  const [selectedProduct, setSelectedProduct] = useState("All")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["Blurred DMA Cheat-4.2.1"]))
  const [activeMonth, setActiveMonth] = useState<string>("")
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const toggleItem = (id: string) => {
    const next = new Set(expandedItems)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedItems(next)
  }

  const filteredChangelog = useMemo(
    () => CHANGELOG_DATA.filter(e => selectedProduct === "All" || e.product === selectedProduct),
    [selectedProduct]
  )

  // Group entries by month (stable order — data is already sorted desc).
  const groupedChangelog = useMemo(() => {
    const map = new Map<string, { anchor: string; short: string; long: string; dateKey: string; entries: ChangelogEntry[] }>()
    for (const entry of filteredChangelog) {
      const anchor = monthAnchor(entry.date)
      if (!map.has(anchor)) {
        map.set(anchor, {
          anchor,
          short: monthLabelShort(entry.date),
          long: monthLabelLong(entry.date),
          dateKey: entry.date.slice(0, 7),
          entries: [],
        })
      }
      map.get(anchor)!.entries.push(entry)
    }
    return Array.from(map.values())
  }, [filteredChangelog])

  // Featured "Latest" entry — most recent feature/improvement/security release
  // (skip tiny hotfix patches where we'd rather see the big one above).
  const featured = useMemo(() => {
    const priority: Record<ChangelogEntry["type"], number> = {
      feature: 3,
      security: 2,
      improvement: 2,
      patch: 1,
      fix: 1,
    }
    const sorted = [...filteredChangelog].sort((a, b) => {
      const byDate = b.date.localeCompare(a.date)
      if (byDate !== 0) return byDate
      return priority[b.type] - priority[a.type]
    })
    // Prefer the top non-patch if there's one in the last 60 days; else fall back to newest overall.
    const now = new Date()
    const sixtyDays = 60 * 24 * 3600 * 1000
    const preferred = sorted.find(
      e => e.type !== "patch" && now.getTime() - new Date(e.date).getTime() < sixtyDays
    )
    return preferred ?? sorted[0]
  }, [filteredChangelog])

  // Scroll-spy: track which month section is currently in view.
  const monthRefs = useRef<Record<string, HTMLDivElement | null>>({})
  useEffect(() => {
    const sections = Object.entries(monthRefs.current).filter(([, el]) => el)
    if (!sections.length) return
    const io = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio - a.intersectionRatio))
        if (visible[0]) setActiveMonth(visible[0].target.id)
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    )
    for (const [, el] of sections) if (el) io.observe(el)
    return () => io.disconnect()
  }, [groupedChangelog.length])

  const scrollToMonth = (anchor: string) => {
    const el = document.getElementById(anchor)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 96
    window.scrollTo({ top: y, behavior: "smooth" })
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // No newsletter API available → open mailto so the visitor sends
    // "subscribe" to staff. We also mark local UI as subscribed.
    const subject = encodeURIComponent("Changelog subscription")
    const body = encodeURIComponent(`Please add ${email} to the Lethal Solutions product changelog list.`)
    window.location.href = `mailto:support@lethalsolutions.me?subject=${subject}&body=${body}`
    setSubscribed(true)
  }

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-10 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <SectionEyebrow number="01" label="Changelog" />
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Product </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>Updates</span>
            </h1>
            <p className="text-[17px] text-white/55 max-w-xl mx-auto leading-relaxed">
              Track all updates, patches, and improvements across our products
            </p>
          </div>
        </div>
      </section>

      {/* Subscribe — wide premium card spanning the timeline width */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-[1180px] mx-auto">
            <div
              className="relative rounded-2xl border border-white/[0.06] bg-white/[0.014] overflow-hidden flex flex-col md:flex-row md:items-center gap-4 px-5 py-4"
              style={{ boxShadow: "0 22px 50px -30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.025)" }}
            >
              <span aria-hidden="true" className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#f97316]/45 to-transparent" />
              <div className="flex items-center gap-3 md:flex-1 min-w-0">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(249,115,22,0.10)",
                    border: "1px solid rgba(249,115,22,0.30)",
                    boxShadow: "0 0 14px rgba(249,115,22,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <BellRing className="h-4 w-4 text-[#f97316]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Stay in the loop</p>
                  <p className="text-[13.5px] font-semibold text-white/85 mt-0.5">Get an email the moment a new build ships — no spam, just patch notes.</p>
                </div>
              </div>
              <form
                onSubmit={handleSubscribe}
                className={cn(
                  "group/sub relative flex items-center w-full md:w-[340px] md:shrink-0 h-11 transition-all duration-300",
                  subscribed && "opacity-95",
                )}
              >
                {/* Hairline underline that breathes under the field */}
                <span
                  aria-hidden="true"
                  className="absolute left-1 right-1 bottom-0 h-px transition-colors duration-300"
                  style={{
                    background: subscribed
                      ? "linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                  }}
                />
                <span
                  aria-hidden="true"
                  className="absolute left-1 right-1 bottom-0 h-px opacity-0 group-focus-within/sub:opacity-100 transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.85), transparent)",
                    boxShadow: "0 0 12px rgba(249,115,22,0.5)",
                  }}
                />
                <Mail className="h-3.5 w-3.5 text-white/35 shrink-0 mr-2.5" />
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribed}
                  aria-label="Email for changelog updates"
                  className="flex-1 min-w-0 h-full bg-transparent text-[13px] text-white placeholder:text-white/30 outline-none disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={subscribed}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300",
                    subscribed
                      ? "text-emerald-400"
                      : "text-[#f97316] hover:text-[#ffb366]",
                  )}
                >
                  {subscribed ? "Subscribed" : "Notify me"}
                  {subscribed
                    ? <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    : <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/sub:translate-x-0.5" strokeWidth={2.4} />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Filter — wide premium pill bar in one row */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-[1180px] mx-auto">
            <div
              className="relative rounded-2xl border border-white/[0.06] bg-white/[0.012] px-4 py-3 flex items-center gap-2 flex-wrap"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)" }}
            >
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 shrink-0 mr-1">
                <Filter className="h-3 w-3 text-[#f97316]" />
                Filter
              </div>
              <FilterChip label="All" active={selectedProduct === "All"} onClick={() => setSelectedProduct("All")} variant="all" />
              <span className="hidden sm:block h-4 w-px bg-white/[0.07] mx-1" />
              {FILTER_PRODUCTS.map((p) => (
                <FilterChip key={p} label={p} active={selectedProduct === p} onClick={() => setSelectedProduct(p)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile horizontal month chips (hidden on md+) */}
      {groupedChangelog.length > 0 && (
        <section className="pb-4 md:hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 pb-1">
              {groupedChangelog.map((g) => (
                <button
                  key={g.anchor}
                  onClick={() => scrollToMonth(g.anchor)}
                  className={cn(
                    "snap-start shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-[12px] font-bold whitespace-nowrap transition-colors",
                    activeMonth === g.anchor
                      ? "bg-[#f97316] border-[#f97316] text-white"
                      : "bg-white/[0.02] border-white/[0.08] text-white/70 hover:text-white"
                  )}
                >
                  {g.short}
                  <span className={cn(
                    "text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded",
                    activeMonth === g.anchor ? "bg-white/20" : "bg-white/[0.06] text-white/55"
                  )}>
                    {g.entries.length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline + sticky rail (desktop 2-col grid) */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-[1180px] mx-auto grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">

            {/* Left sticky rail — desktop only */}
            <aside className="hidden md:block">
              <div className="sticky top-28">
                <div className="flex items-center gap-2 mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/35">
                  <Clock className="h-3 w-3" />
                  Jump to
                </div>
                <nav className="flex flex-col gap-0.5">
                  {groupedChangelog.map((g) => {
                    const active = activeMonth === g.anchor
                    return (
                      <button
                        key={g.anchor}
                        onClick={() => scrollToMonth(g.anchor)}
                        className={cn(
                          "group relative flex items-center justify-between gap-3 text-left pl-4 pr-3 py-2 rounded-lg transition-all",
                          active
                            ? "bg-[#f97316]/12 text-white"
                            : "text-white/55 hover:text-white hover:bg-white/[0.02]"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full transition-all",
                            active ? "bg-[#f97316] shadow-[0_0_10px_rgba(249,115,22,0.7)]" : "bg-transparent group-hover:bg-white/15"
                          )}
                        />
                        <span className="text-[13px] font-bold tracking-tight">{g.short}</span>
                        <span
                          className={cn(
                            "text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-md transition-colors",
                            active
                              ? "bg-[#f97316]/25 text-[#ffb366]"
                              : "bg-white/[0.04] text-white/40 group-hover:text-white/65"
                          )}
                        >
                          {g.entries.length}
                        </span>
                      </button>
                    )
                  })}
                </nav>
                <div className="mt-6 pt-5 border-t border-white/[0.05]">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30 mb-2">Legend</div>
                  <div className="flex flex-col gap-1.5">
                    {(Object.keys(TYPE_CONFIG) as Array<keyof typeof TYPE_CONFIG>).map((k) => {
                      const t = TYPE_CONFIG[k]
                      return (
                        <div key={k} className="flex items-center gap-2 text-[11px]">
                          <span className={cn("w-1.5 h-1.5 rounded-full", t.dot)} />
                          <span className="text-white/55">{t.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* Right timeline — every entry is a regular timeline card.
                The latest one carries a small inline "Latest" tag instead of
                being blown up into its own oversized hero block. */}
            <div className="min-w-0">
              {groupedChangelog.map((g) => (
                <div
                  key={g.anchor}
                  id={g.anchor}
                  ref={(el) => { monthRefs.current[g.anchor] = el }}
                  className="mb-12 scroll-mt-28"
                >
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#f97316] shadow-[0_0_10px_rgba(249,115,22,0.65)]" />
                    {g.long}
                    <span className="text-sm font-normal text-white/45 font-mono tabular-nums">
                      {g.entries.length} {g.entries.length === 1 ? "update" : "updates"}
                    </span>
                  </h2>

                  <div className="space-y-4 pl-6 border-l-2 border-white/[0.06]">
                    {g.entries.map((entry, index) => {
                      const itemId = `${entry.product}-${entry.version}`
                      const isExpanded = expandedItems.has(itemId)
                      const isLatest = !!featured
                        && entry.product === featured.product
                        && entry.version === featured.version
                        && entry.date === featured.date
                      return (
                        <TimelineCard
                          key={`${itemId}-${index}`}
                          entry={entry}
                          isExpanded={isExpanded}
                          isLatest={isLatest}
                          onToggle={() => toggleItem(itemId)}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}

              {filteredChangelog.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/55">No updates found for this product.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

/* ---------------------------------------------------------------- */
/* Timeline card                                                     */
/* ---------------------------------------------------------------- */

function TimelineCard({
  entry,
  isExpanded,
  isLatest = false,
  onToggle,
}: {
  entry: ChangelogEntry
  isExpanded: boolean
  isLatest?: boolean
  onToggle: () => void
}) {
  const typeConfig = TYPE_CONFIG[entry.type]
  const TypeIcon = typeConfig.icon
  return (
    <div className="relative pl-6">
      {/* Timeline dot */}
      <div className={cn(
        "absolute -left-[9px] w-4 h-4 rounded-full border-2 border-white/[0.10]",
        typeConfig.iconBg
      )} />
      <div className={cn(
        "absolute -left-[9px] w-4 h-4 rounded-full opacity-50",
        typeConfig.iconBg
      )} style={{ filter: "blur(6px)" }} />

      <div className={cn(
        "rounded-2xl border overflow-hidden transition-all duration-300",
        isExpanded
          ? "border-[#f97316]/30 bg-white/[0.03] shadow-[0_18px_40px_rgba(0,0,0,0.4),0_0_40px_rgba(249,115,22,0.16)]"
          : "border-white/[0.06] bg-white/[0.015] hover:border-[#f97316]/25 hover:bg-white/[0.03] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
      )}>
        <button
          onClick={onToggle}
          aria-expanded={isExpanded}
          data-cursor="cta"
          data-cursor-label={isExpanded ? "Close" : "Open"}
          className="cursor-cta w-full p-5 text-left"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/[0.06]",
                typeConfig.iconBg
              )}>
                <TypeIcon className={cn("h-5 w-5", typeConfig.iconTint)} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <span className="font-display font-bold text-white tracking-tight truncate">{entry.product}</span>
                  <span className="font-mono text-[12px] text-white/55 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">v{entry.version}</span>
                  {isLatest && (
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-[0.18em]"
                      style={{
                        background: "rgba(249,115,22,0.14)",
                        border: "1px solid rgba(249,115,22,0.4)",
                        color: "#ffb366",
                        boxShadow: "0 0 10px rgba(249,115,22,0.18)",
                      }}
                    >
                      <Sparkle className="h-2.5 w-2.5" />
                      Latest
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.2em]",
                    typeConfig.chip
                  )}>
                    {typeConfig.label}
                  </span>
                  <span className="text-[12px] text-white/65 font-medium">{formatDate(entry.date)}</span>
                  {!isExpanded && (
                    <span className="font-mono text-[11px] text-white/45 tabular-nums">
                      {relativeTime(entry.date)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 transition-all",
              isExpanded ? "bg-[#f97316]/15 border border-[#f97316]/30" : "bg-white/[0.04] border border-white/[0.06]"
            )}>
              <ChevronDown className={cn(
                "h-4 w-4 transition-all",
                isExpanded ? "rotate-180 text-[#f97316]" : "text-white/55"
              )} />
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="px-5 pb-5 pt-2 border-t border-white/[0.06]">
            <ul className="space-y-2 pl-14">
              {entry.changes.map((change, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-white/65 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] mt-2 shrink-0 shadow-[0_0_6px_rgba(249,115,22,0.85)]" />
                  {change}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

/* FeaturedCard removed — the latest release now renders as a regular
 * TimelineCard with a subtle inline "Latest" pill. The earlier hero card
 * was the visual outlier on the page and got removed by request. */

/* ---------------------------------------------------------------- */
/* Premium filter chip — inset orange tint when active               */
/* ---------------------------------------------------------------- */

function FilterChip({
  label,
  active,
  onClick,
  variant = "default",
}: {
  label: string
  active: boolean
  onClick: () => void
  variant?: "default" | "all"
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] transition-colors duration-200",
        active ? "text-white" : "text-white/55 hover:text-white/85",
      )}
      style={
        active
          ? {
              background: "linear-gradient(180deg, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.06) 100%)",
              boxShadow: "inset 0 0 0 1px rgba(249,115,22,0.4), 0 4px 14px -4px rgba(249,115,22,0.45)",
            }
          : variant === "all"
            ? { background: "rgba(255,255,255,0.04)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }
            : { background: "rgba(255,255,255,0.02)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)" }
      }
    >
      {label}
    </button>
  )
}
