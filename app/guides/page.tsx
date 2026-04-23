"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Search, ChevronRight, Play, ExternalLink, ArrowRight, Download,
  Settings, Wrench, Cpu, FileText, Monitor, CircuitBoard,
  Terminal, ShieldAlert, Keyboard, Gamepad2, Clock,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { SectionEyebrow } from "@/components/section-eyebrow"

type Difficulty = "Beginner" | "Intermediate" | "Advanced"

type Guide = {
  id: string
  title: string
  description: string
  category: string
  readTime: string
  difficulty: Difficulty
  hasVideo: boolean
  hasTool: boolean
  icon: LucideIcon
  iconTint: string // hex for tile accent
}

const SETUP_GUIDES: Guide[] = [
  {
    id: "what-is-dma",
    title: "What are DMA cheats and how do they work",
    description: "Learn about DMA cards, KMBox devices, Fusers, read-only cheats, and how everything works together.",
    category: "Getting Started",
    readTime: "8 min",
    difficulty: "Beginner",
    hasVideo: false,
    hasTool: false,
    icon: CircuitBoard,
    iconTint: "#60a5fa",
  },
  {
    id: "second-pc-setup",
    title: "How to setup your 2nd/Cheat PC for DMA cheating",
    description: "Step-by-step: install drivers, configure USB connections, and get the Lethal Solutions loader running.",
    category: "Setup",
    readTime: "12 min",
    difficulty: "Intermediate",
    hasVideo: true,
    hasTool: false,
    icon: Terminal,
    iconTint: "#f97316",
  },
  {
    id: "memory-map",
    title: "How to generate a Memory Map (MMAP)",
    description: "Generate an MMAP file to fix slow progress, missing ESP, or aimbot issues. Includes browser-based tool.",
    category: "Configuration",
    readTime: "6 min",
    difficulty: "Intermediate",
    hasVideo: true,
    hasTool: true,
    icon: Cpu,
    iconTint: "#a78bfa",
  },
  {
    id: "troubleshooting",
    title: "DMA Troubleshooting — fixes for common issues",
    description: "Fix: Failed to initialize, Unable to locate DTB, Failed to find base address, USB disconnections.",
    category: "Troubleshooting",
    readTime: "15 min",
    difficulty: "Beginner",
    hasVideo: false,
    hasTool: false,
    icon: ShieldAlert,
    iconTint: "#f43f5e",
  },
  {
    id: "kmbox-net",
    title: "How to setup a KMBox Net for DMA cheating",
    description: "Full KMBox Net setup: driver installation, network adapter config, connecting to your gaming PC.",
    category: "Hardware",
    readTime: "10 min",
    difficulty: "Intermediate",
    hasVideo: true,
    hasTool: false,
    icon: Keyboard,
    iconTint: "#34d399",
  },
  {
    id: "kmbox-b-plus",
    title: "How to setup a KMBox B+ Pro for DMA cheating",
    description: "Complete KMBox B+ Pro setup guide. Driver install, connection, and troubleshooting.",
    category: "Hardware",
    readTime: "8 min",
    difficulty: "Intermediate",
    hasVideo: false,
    hasTool: false,
    icon: Gamepad2,
    iconTint: "#22d3ee",
  },
  {
    id: "system-time-sync",
    title: "Syncing your System Time",
    description: "How to correctly sync system time on your 2nd PC — required for license activation.",
    category: "Configuration",
    readTime: "3 min",
    difficulty: "Beginner",
    hasVideo: false,
    hasTool: false,
    icon: Clock,
    iconTint: "#fbbf24",
  },
  {
    id: "fuser-setup",
    title: "How to setup and flash the 4th Gen Dichen Fuser",
    description: "Setup guide for the Dichen Fuser: firmware flashing and EDID spoofing for single-monitor ESP.",
    category: "Hardware",
    readTime: "8 min",
    difficulty: "Advanced",
    hasVideo: false,
    hasTool: false,
    icon: Monitor,
    iconTint: "#fb923c",
  },
]


const RESOURCES = [
  {
    id: "rustdesk",
    title: "RustDesk — Remote Access",
    description: "Download RustDesk so our team can remotely flash your DMA firmware after purchase.",
    badge: "Required",
    badgeColor: "red",
    icon: Download,
    externalUrl: "https://rustdesk.com/",
    buttonText: "Download RustDesk",
  },
  {
    id: "cpp-redist",
    title: "Visual C++ Redistributables",
    description: "Required C++ runtime libraries for the Lethal Solutions loader.",
    badge: "Required",
    badgeColor: "red",
    icon: Download,
    externalUrl: "https://aka.ms/vs/17/release/vc_redist.x64.exe",
    buttonText: "Download",
  },
  {
    id: "webview2",
    title: "WebView2 Runtime",
    description: "Required for the loader UI. Pre-installed on Windows 11.",
    badge: "Required",
    badgeColor: "red",
    icon: Download,
    externalUrl: "https://go.microsoft.com/fwlink/p/?LinkId=2124703",
    buttonText: "Download",
  },
  {
    id: "dna-id",
    title: "DMA DNA ID Guide",
    description: "How to obtain your DNA ID needed for custom firmware generation.",
    badge: "Guide",
    badgeColor: "blue",
    icon: Cpu,
    slug: "dna-id",
    buttonText: "Read Guide",
    isInternal: true,
  },
  {
    id: "flash-tools",
    title: "DMA Flash Tools",
    description: "Full collection of drivers and flashers for 35T and 75T DMA cards.",
    badge: "Download",
    badgeColor: "orange",
    icon: Wrench,
    slug: "flash-tools",
    buttonText: "View Tools",
    isInternal: true,
  },
  {
    id: "rammap",
    title: "RamMap Tool",
    description: "Microsoft Sysinternals RamMap for generating MMAP files.",
    badge: "Tool",
    badgeColor: "orange",
    icon: Settings,
    externalUrl: "https://download.sysinternals.com/files/RAMMap.zip",
    buttonText: "Download RAMMap",
  },
  {
    id: "kmbox-driver",
    title: "KMBox Net Driver",
    description: "Official WCHUSBNIC driver for KMBox Net network adapter setup.",
    badge: "Driver",
    badgeColor: "green",
    icon: Download,
    externalUrl: "https://discord.gg/lethaldma",
    buttonText: "Get from Discord",
  },
  {
    id: "dichen-pdf",
    title: "Dichen Fuser Setup PDF",
    description: "Official setup and flashing instructions for 4th Gen Dichen Fuser.",
    badge: "PDF",
    badgeColor: "purple",
    icon: FileText,
    externalUrl: "https://discord.gg/lethaldma",
    buttonText: "Get from Discord",
  },
  {
    id: "all-downloads",
    title: "All Downloads & Files",
    description: "Full archive of drivers, tools, firmware flashers, and setup files.",
    badge: "Archive",
    badgeColor: "blue",
    icon: Download,
    externalUrl: "https://discord.gg/lethaldma",
    buttonText: "Open Discord",
  },
]

const CATEGORIES = ["All", "Getting Started", "Setup", "Configuration", "Hardware", "Troubleshooting"]

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  "Beginner": "text-emerald-400",
  "Intermediate": "text-amber-400",
  "Advanced": "text-red-400",
}

const BADGE_COLORS: Record<string, string> = {
  "red": "bg-red-500/10 text-red-400",
  "blue": "bg-blue-500/10 text-blue-400",
  "orange": "bg-orange-500/10 text-orange-400",
  "green": "bg-emerald-500/10 text-emerald-400",
  "purple": "bg-purple-500/10 text-purple-400",
}

export default function GuidesPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")

  const filteredGuides = SETUP_GUIDES.filter((guide) => {
    const matchesSearch = guide.title.toLowerCase().includes(search.toLowerCase()) ||
                          guide.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "All" || guide.category === category
    return matchesSearch && matchesCategory
  })

  const filteredResources = RESOURCES.filter((resource) => {
    return resource.title.toLowerCase().includes(search.toLowerCase()) ||
           resource.description.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Breadcrumbs items={[{ label: "Guides" }]} />

          {/* Hero */}
          <div className="text-center mb-14 relative">
            <SectionEyebrow number="01" label="Guides & Resources" />
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Everything You </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>Need</span>
            </h1>
            <p className="text-[15px] text-white/55 max-w-lg mx-auto mb-10 leading-relaxed">
              Setup guides, downloads, and docs for all products.{" "}
              <a href="https://discord.gg/lethaldma" target="_blank" className="text-[#f97316]/70 hover:text-[#f97316] transition-colors">
                Open a Discord ticket
              </a>{" "}
              if you need help.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                  type="text"
                  placeholder="Search guides and resources..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#f97316]/30 transition-colors"
                />
              </div>
              <p className="mt-2.5 text-[11px] text-white/30 text-center">
                Try{" "}
                {["vanguard", "flashing", "mmap"].map((term, i, arr) => (
                  <span key={term}>
                    <button
                      type="button"
                      onClick={() => setSearch(term)}
                      className="text-white/45 hover:text-[#f97316] transition-colors underline-offset-2 hover:underline"
                    >
                      &ldquo;{term}&rdquo;
                    </button>
                    {i < arr.length - 2 ? ", " : i === arr.length - 2 ? " or " : ""}
                  </span>
                ))}
              </p>
            </div>
          </div>

          {/* Section: Setup Guides */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Setup Guides</h2>
              <span className="text-xs text-white/20">{filteredGuides.length} guides</span>
            </div>

            {/* Category tabs — horizontal snap-scroll on mobile, inline-flex on desktop */}
            <div className="-mx-4 sm:mx-0 mb-8">
              <div
                className="flex sm:inline-flex gap-1 p-1 rounded-xl border border-white/[0.04] bg-white/[0.015] overflow-x-auto sm:overflow-visible snap-x snap-mandatory scrollbar-none scroll-px-4 px-4 sm:px-1 [&::-webkit-scrollbar]:hidden"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "shrink-0 snap-start px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                      category === cat
                        ? "bg-white/[0.08] text-white shadow-sm"
                        : "text-white/25 hover:text-white/45"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Guide cards */}
            <div className="grid md:grid-cols-2 gap-3">
              {filteredGuides.map((guide) => {
                const GuideIcon = guide.icon

                return (
                  <Link
                    key={guide.id}
                    href={`/guides/${guide.id}`}
                    data-cursor="cta"
                    data-cursor-label="Read"
                    className="spotlight-card cursor-cta group relative flex gap-4 p-5 rounded-xl border border-white/[0.06] hover:border-[#f97316]/35 bg-white/[0.012] hover:bg-white/[0.028] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(249,115,22,0.14)] transition-all duration-300 overflow-hidden"
                  >
                    {/* Left accent bar */}
                    <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-white/[0.04] group-hover:bg-[#f97316]/50 transition-colors duration-300" />

                    {/* Icon tile 60x60 rounded-2xl */}
                    <div
                      className="relative shrink-0 w-[60px] h-[60px] rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center overflow-hidden ml-1 group-hover:border-white/[0.12] transition-colors"
                      aria-hidden="true"
                    >
                      <div
                        className="absolute inset-0 opacity-60 group-hover:opacity-90 transition-opacity"
                        style={{
                          background: `radial-gradient(circle at 30% 20%, ${guide.iconTint}26, transparent 65%)`,
                        }}
                      />
                      <div
                        className="absolute -bottom-4 -right-4 w-14 h-14 rounded-full blur-xl"
                        style={{ background: `${guide.iconTint}1f` }}
                      />
                      <GuideIcon
                        className="relative h-6 w-6 transition-transform group-hover:scale-110 duration-300"
                        style={{ color: guide.iconTint }}
                        strokeWidth={1.6}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h3 className="font-semibold text-[15px] text-white/85 group-hover:text-white transition-colors line-clamp-1 mb-1">
                        {guide.title}
                      </h3>
                      <p className="text-[13px] text-white/30 line-clamp-2 mb-3">
                        {guide.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] mt-auto">
                        <span className={cn("font-medium", DIFFICULTY_COLORS[guide.difficulty])}>
                          {guide.difficulty}
                        </span>
                        <span className="text-white/15">{guide.readTime}</span>
                        {guide.hasVideo && (
                          <span className="flex items-center gap-1 text-red-400/70">
                            <Play className="h-2.5 w-2.5 fill-current" /> Video
                          </span>
                        )}
                        {guide.hasTool && (
                          <span className="flex items-center gap-1 text-blue-400/70">
                            <Settings className="h-2.5 w-2.5" /> Tool
                          </span>
                        )}
                        <span className="ml-auto hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-white/30 group-hover:text-[#f97316] transition-colors">
                          Read guide
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {filteredGuides.length === 0 && (
              <div className="text-center py-12 text-white/25 text-sm">
                No guides found matching your search.
              </div>
            )}
          </section>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-12">
            <div className="flex-1 h-px bg-white/[0.04]" />
            <span className="text-[11px] font-medium text-white/20 uppercase tracking-wider">
              Downloads & Resources
            </span>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>

          {/* Section: Resources */}
          <section className="mb-20">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredResources.map((resource) => {
                const Icon = resource.icon

                return (
                  <div
                    key={resource.id}
                    className="spotlight-card group p-5 rounded-xl border border-white/[0.06] hover:border-[#f97316]/30 bg-white/[0.012] hover:bg-white/[0.025] hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center">
                        <Icon className="h-4 w-4 text-white/25" />
                      </div>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", BADGE_COLORS[resource.badgeColor])}>
                        {resource.badge}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm text-white/80 mb-1">{resource.title}</h3>
                    <p className="text-xs text-white/25 mb-4 flex-1 line-clamp-2">
                      {resource.description}
                    </p>

                    {resource.isInternal ? (
                      <Link
                        href={`/guides/${resource.slug}`}
                        className="flex items-center justify-center gap-2 w-full h-9 rounded-lg bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-semibold text-xs shadow-[0_6px_20px_-8px_rgba(249,115,22,0.6)] hover:shadow-[0_8px_24px_-6px_rgba(249,115,22,0.75)] hover:opacity-95 transition-all"
                      >
                        {resource.buttonText}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    ) : (
                      <a
                        href={resource.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full h-9 rounded-lg bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-semibold text-xs shadow-[0_6px_20px_-8px_rgba(249,115,22,0.6)] hover:shadow-[0_8px_24px_-6px_rgba(249,115,22,0.75)] hover:opacity-95 transition-all"
                      >
                        {resource.buttonText}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* CTA */}
          <section className="relative rounded-2xl border border-white/[0.06] p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#f97316]/[0.03] via-transparent to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Still need help?</h2>
              <p className="text-white/25 mb-8 max-w-md mx-auto text-sm">
                Our support team is available 24/7 on Discord.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://discord.gg/lethaldma"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="cta"
                  data-cursor-label="Discord"
                  className="cursor-cta press-spring group relative overflow-hidden inline-flex items-center justify-center gap-2 h-11 px-7 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white font-bold text-[14px] shadow-[0_0_28px_rgba(249,115,22,0.35)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 transition-all"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 pointer-events-none" />
                  <span className="relative z-10">Open Discord Ticket</span>
                  <ExternalLink className="relative z-10 h-3.5 w-3.5" />
                </a>
                <Link
                  href="/products"
                  data-cursor="cta"
                  data-cursor-label="Shop"
                  className="cursor-cta press-spring inline-flex items-center justify-center gap-2 h-11 px-7 rounded-xl border border-white/[0.10] bg-white/[0.025] text-white/85 font-bold text-[14px] hover:bg-[#f97316]/[0.08] hover:text-[#f97316] hover:border-[#f97316]/35 transition-all"
                >
                  View Products
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
