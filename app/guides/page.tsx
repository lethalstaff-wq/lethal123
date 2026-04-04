"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, Search, ChevronRight, Cpu, Monitor, Settings, Wrench,
  Zap, Shield, Clock, ArrowRight, Play, ExternalLink, Download, FileText
} from "lucide-react"
import { cn } from "@/lib/utils"

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
    icon: Cpu,
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
    icon: Monitor,
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
    icon: Settings,
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
    icon: Wrench,
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
    icon: Zap,
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
    icon: Zap,
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
    icon: Shield,
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
    id: "rammap",
    title: "RamMap Tool",
    description: "Microsoft Sysinternals RamMap for generating MMAP files.",
    badge: "Tool",
    badgeColor: "orange",
    icon: Settings,
    externalUrl: "https://download.sysinternals.com/files/RAMMap.zip",
    buttonText: "Download RAMMap",
  },
]

const CATEGORIES = ["All", "Getting Started", "Setup", "Configuration", "Hardware", "Troubleshooting"]

const DIFFICULTY_COLORS: Record<string, string> = {
  "Beginner": "bg-emerald-500/10 text-emerald-400",
  "Intermediate": "bg-amber-500/10 text-amber-400",
  "Advanced": "bg-red-500/10 text-red-400",
  "All Levels": "bg-blue-500/10 text-blue-400",
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Guides & Resources</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Everything You <span className="text-primary">Need</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Setup guides, downloads, and documentation for all Lethal Solutions products. 
              Need help? <a href="https://discord.gg/lethaldma" target="_blank" className="text-primary hover:underline">Open a ticket on Discord</a>.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search guides and resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-full bg-card border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Section 1: Setup Guides */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">Setup Guides</h2>
              <span className="px-2.5 py-1 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground">
                {filteredGuides.length} guides
              </span>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Guide cards grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredGuides.map((guide) => {
                const Icon = guide.icon
                return (
                  <Link
                    key={guide.id}
                    href={`/guides/${guide.id}`}
                    className="group relative p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all overflow-hidden"
                  >
                    {/* Orange accent bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-muted/50 text-muted-foreground mb-2">
                          {guide.category}
                        </span>

                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                          {guide.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {guide.description}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", DIFFICULTY_COLORS[guide.difficulty])}>
                            {guide.difficulty}
                          </span>
                          <span className="text-xs text-muted-foreground">{guide.readTime}</span>
                          {guide.hasVideo && (
                            <span className="flex items-center gap-1 text-xs text-red-400">
                              <Play className="h-3 w-3 fill-current" /> Video
                            </span>
                          )}
                          {guide.hasTool && (
                            <span className="flex items-center gap-1 text-xs text-blue-400">
                              <Settings className="h-3 w-3" /> Tool
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                    </div>
                  </Link>
                )
              })}
            </div>

            {filteredGuides.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No guides found matching your search.
              </div>
            )}
          </section>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-12">
            <div className="flex-1 h-px bg-border/50" />
            <span className="px-4 py-2 rounded-full bg-muted/30 text-sm font-medium text-muted-foreground">
              Resources & Downloads
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Section 2: Resources */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold">Downloads & Resources</h2>
              <span className="px-2.5 py-1 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground">
                {filteredResources.length} items
              </span>
            </div>
            <p className="text-muted-foreground mb-8">
              Required files, drivers, and tools. External links open in a new tab.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredResources.map((resource) => {
                const Icon = resource.icon
                const isRequired = resource.badge === "Required"
                
                return (
                  <div
                    key={resource.id}
                    className="p-5 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all flex flex-col"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <span className={cn("self-start px-2 py-0.5 rounded text-[10px] font-medium mb-2", BADGE_COLORS[resource.badgeColor])}>
                      {resource.badge}
                    </span>

                    <h3 className="font-semibold text-sm mb-1">{resource.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4 flex-1 line-clamp-2">
                      {resource.description}
                    </p>

                    {resource.isInternal ? (
                      <Link
                        href={`/guides/${resource.slug}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-primary/50 text-primary font-medium text-xs hover:bg-primary/10 transition-colors"
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
                          "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium text-xs transition-colors",
                          isRequired
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border border-primary/50 text-primary hover:bg-primary/10"
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
          <section className="rounded-3xl bg-gradient-to-br from-primary/10 via-card to-primary/5 border border-primary/20 p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Still need help?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Our support team is available 24/7 on Discord.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="https://discord.gg/lethaldma" target="_blank">
                <Button size="lg" className="h-12 px-8 gap-2">
                  Open Discord Ticket
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="h-12 px-8 gap-2">
                  View Products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
