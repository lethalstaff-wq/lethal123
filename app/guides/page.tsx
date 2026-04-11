"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Search, ChevronRight, Play, ExternalLink, ArrowRight, Download,
  Settings, Wrench, Cpu, FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Breadcrumbs } from "@/components/breadcrumbs"

const SETUP_GUIDES = [
  {
    id: "what-is-dma",
    title: "What are DMA cheats and how do they work",
    description: "Learn about DMA cards, KMBox devices, Fusers, read-only cheats, and how everything works together.",
    category: "Getting Started",
    readTime: "8 min",
    difficulty: "Beginner",
    hasVideo: false,
    hasTool: false,
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
  },
  {
    id: "troubleshooting",
    title: "DMA Troubleshooting — fixes for common issues",
    description: "Fix: Failed to initialize, Unable to locate DTB, Failed to find base address, USB disconnections.",
    category: "Troubleshooting",
    readTime: "15 min",
    difficulty: "All Levels",
    hasVideo: false,
    hasTool: false,
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

const DIFFICULTY_COLORS: Record<string, string> = {
  "Beginner": "text-emerald-400",
  "Intermediate": "text-amber-400",
  "Advanced": "text-red-400",
  "All Levels": "text-blue-400",
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
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Breadcrumbs items={[{ label: "Guides" }]} />

          {/* Hero */}
          <div className="text-center mb-14 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#f97316]/[0.02] rounded-full blur-[100px] pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Guides & Resources</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
              Everything You{" "}
              <span className="bg-gradient-to-r from-[#f97316] to-[#fb923c] bg-clip-text text-transparent">
                Need
              </span>
            </h1>
            <p className="text-[15px] text-white/30 max-w-lg mx-auto mb-10 leading-relaxed">
              Setup guides, downloads, and docs for all products.{" "}
              <a href="https://discord.gg/lethaldma" target="_blank" className="text-[#f97316]/60 hover:text-[#f97316] transition-colors">
                Open a Discord ticket
              </a>{" "}
              if you need help.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
              <input
                type="text"
                placeholder="Search guides and resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#f97316]/30 transition-colors"
              />
            </div>
          </div>

          {/* Section: Setup Guides */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Setup Guides</h2>
              <span className="text-xs text-white/20">{filteredGuides.length} guides</span>
            </div>

            {/* Category tabs */}
            <div className="inline-flex flex-wrap gap-1 p-1 rounded-xl border border-white/[0.04] bg-white/[0.015] mb-8">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-medium transition-all",
                    category === cat
                      ? "bg-white/[0.08] text-white shadow-sm"
                      : "text-white/25 hover:text-white/45"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Guide cards */}
            <div className="grid md:grid-cols-2 gap-3">
              {filteredGuides.map((guide) => {
                const globalIndex = SETUP_GUIDES.indexOf(guide)
                const num = String(globalIndex + 1).padStart(2, "0")

                return (
                  <Link
                    key={guide.id}
                    href={`/guides/${guide.id}`}
                    className="group relative flex gap-4 p-5 rounded-xl border border-white/[0.04] hover:border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.015] transition-all duration-300 overflow-hidden"
                  >
                    {/* Left accent bar */}
                    <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-white/[0.04] group-hover:bg-[#f97316]/50 transition-colors duration-300" />

                    {/* Number */}
                    <span className="text-[28px] font-bold text-white/[0.04] group-hover:text-[#f97316]/15 transition-colors tabular-nums leading-none mt-0.5 shrink-0 w-9 ml-1">
                      {num}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[15px] text-white/80 group-hover:text-white transition-colors line-clamp-1 mb-1">
                        {guide.title}
                      </h3>
                      <p className="text-[13px] text-white/25 line-clamp-2 mb-3">
                        {guide.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px]">
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
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-white/0 group-hover:text-white/20 transition-all self-center shrink-0" />
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
                const isRequired = resource.badge === "Required"

                return (
                  <div
                    key={resource.id}
                    className="group p-5 rounded-xl border border-white/[0.04] hover:border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.015] transition-all duration-300 flex flex-col"
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
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-white/[0.06] text-white/40 font-medium text-xs hover:bg-white/[0.03] hover:text-white/60 transition-colors"
                      >
                        {resource.buttonText}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    ) : (
                      <a
                        href={resource.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center justify-center gap-2 w-full py-2 rounded-lg font-medium text-xs transition-colors",
                          isRequired
                            ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white hover:opacity-90"
                            : "border border-white/[0.06] text-white/40 hover:bg-white/[0.03] hover:text-white/60"
                        )}
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
                  className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-semibold text-sm shadow-[0_4px_16px_rgba(249,115,22,0.2)] hover:shadow-[0_8px_24px_rgba(249,115,22,0.3)] hover:-translate-y-px transition-all"
                >
                  Open Discord Ticket
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-xl border border-white/[0.06] text-white/40 font-medium text-sm hover:bg-white/[0.03] hover:text-white/60 transition-colors"
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
