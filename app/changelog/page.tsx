"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Clock, Zap, Bug, Shield, Sparkles, ChevronDown, Filter, Gamepad2, Cpu, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChangelogEntry {
  version: string
  date: string
  product: string
  type: "feature" | "fix" | "security" | "improvement" | "patch"
  changes: string[]
}

// Realistic changelog from April 2025 to present
const CHANGELOG_DATA: ChangelogEntry[] = [
  // April 2026
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

const TYPE_CONFIG = {
  feature: { icon: Sparkles, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "New Feature" },
  fix: { icon: Bug, color: "text-amber-500", bg: "bg-amber-500/10", label: "Bug Fix" },
  security: { icon: Shield, color: "text-blue-500", bg: "bg-blue-500/10", label: "Security" },
  improvement: { icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10", label: "Improvement" },
  patch: { icon: RefreshCw, color: "text-primary", bg: "bg-primary/10", label: "Game Patch" },
}

const PRODUCTS = ["All", "Blurred DMA Cheat", "Streck DMA Cheat", "Fortnite External", "Perm Spoofer", "Temp Spoofer", "Custom DMA Firmware", "Website"]

export default function ChangelogPage() {
  const [selectedProduct, setSelectedProduct] = useState("All")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["Blurred DMA Cheat-4.2.1"]))

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const filteredChangelog = CHANGELOG_DATA.filter(
    entry => selectedProduct === "All" || entry.product === selectedProduct
  )

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  // Group by month
  const groupedChangelog: Record<string, ChangelogEntry[]> = {}
  filteredChangelog.forEach(entry => {
    const monthYear = new Date(entry.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    if (!groupedChangelog[monthYear]) groupedChangelog[monthYear] = []
    groupedChangelog[monthYear].push(entry)
  })

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] opacity-30" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Changelog</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
              Product Updates
            </h1>
            <p className="text-lg text-muted-foreground">
              Track all updates, patches, and improvements across our products
            </p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filter:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRODUCTS.map((product) => (
                  <button
                    key={product}
                    onClick={() => setSelectedProduct(product)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold transition-all",
                      selectedProduct === product
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {product}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {Object.entries(groupedChangelog).map(([month, entries]) => (
              <div key={month} className="mb-12">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  {month}
                  <span className="text-sm font-normal text-muted-foreground">({entries.length} updates)</span>
                </h2>

                <div className="space-y-4 pl-6 border-l-2 border-border/50">
                  {entries.map((entry, index) => {
                    const typeConfig = TYPE_CONFIG[entry.type]
                    const TypeIcon = typeConfig.icon
                    const itemId = `${entry.product}-${entry.version}`
                    const isExpanded = expandedItems.has(itemId)

                    return (
                      <div key={index} className="relative pl-6">
                        {/* Timeline dot */}
                        <div className={cn(
                          "absolute -left-[9px] w-4 h-4 rounded-full border-2 border-background",
                          typeConfig.bg
                        )} />

                        {/* Card */}
                        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden">
                          <button
                            onClick={() => toggleItem(itemId)}
                            className="w-full p-5 text-left"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", typeConfig.bg)}>
                                  <TypeIcon className={cn("h-5 w-5", typeConfig.color)} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-foreground">{entry.product}</span>
                                    <span className="font-mono text-sm text-muted-foreground">v{entry.version}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", typeConfig.bg, typeConfig.color)}>
                                      {typeConfig.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                                  </div>
                                </div>
                              </div>
                              <ChevronDown className={cn(
                                "h-5 w-5 text-muted-foreground shrink-0 transition-transform mt-2",
                                isExpanded && "rotate-180"
                              )} />
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-5 pb-5 pt-2 border-t border-border/30">
                              <ul className="space-y-2 pl-14">
                                {entry.changes.map((change, i) => (
                                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                    {change}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {filteredChangelog.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No updates found for this product.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
