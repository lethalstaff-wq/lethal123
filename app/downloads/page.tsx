"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import {
  Download,
  Package,
  Shield,
  Key,
  Copy,
  Check,
  ExternalLink,
  FileDown,
  Clock,
  AlertTriangle,
  Loader2,
  Search,
  CheckCircle2,
  Lock,
  HelpCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { GlossyButton } from "@/components/ui/glossy-button"
import Link from "next/link"

interface DownloadItem {
  id: string
  name: string
  variant: string
  version: string
  size: string
  updated: string
  status: "ready" | "updating" | "maintenance"
  downloadUrl: string
  instructions: string[]
}

interface OrderLicense {
  orderId: string
  displayId: string
  licenseKey: string
  email: string
  products: DownloadItem[]
  expiresAt: string | null
  createdAt: string
}

// Real catalogue shown pre-auth so users see the exact products they'll
// unlock once they verify their key. Metadata is seeded (not live) on purpose
// — this grid is decorative; the real version + updated timestamp arrive from
// /api/downloads after verification.
type Category = "spoofer" | "cheat" | "firmware"
type Lane = { hex: string; glow: string; rgb: string }
const LANES: Record<Category, Lane> = {
  spoofer:  { hex: "#10b981", glow: "rgba(16,185,129,0.35)",  rgb: "16,185,129"  },
  cheat:    { hex: "#f97316", glow: "rgba(249,115,22,0.38)",  rgb: "249,115,22"  },
  firmware: { hex: "#3b82f6", glow: "rgba(59,130,246,0.35)",  rgb: "59,130,246"  },
}

const CATALOGUE_TILES: {
  name: string
  category: Category
  categoryLabel: string
  version: string
  size: string
  undetected: string
  updated: string
}[] = [
  { name: "Perm Spoofer",         category: "spoofer",  categoryLabel: "HWID Spoofer",   version: "v4.4.0", size: "42 MB",  undetected: "236d",  updated: "2 days ago"  },
  { name: "Temp Spoofer",         category: "spoofer",  categoryLabel: "HWID Spoofer",   version: "v3.8.2", size: "28 MB",  undetected: "217d",  updated: "1 week ago"  },
  { name: "Fortnite External",    category: "cheat",    categoryLabel: "DMA Cheat",      version: "v7.1.4", size: "64 MB",  undetected: "189d",  updated: "3 days ago"  },
  { name: "Custom DMA Firmware",  category: "firmware", categoryLabel: "Firmware",       version: "v5.0.0", size: "18 MB",  undetected: "134d",  updated: "8 days ago"  },
  { name: "Streck DMA Cheat",     category: "cheat",    categoryLabel: "DMA Cheat",      version: "v2.3.8", size: "55 MB",  undetected: "120d",  updated: "2 weeks ago" },
  { name: "Blurred DMA Cheat",    category: "cheat",    categoryLabel: "DMA Cheat",      version: "v1.9.1", size: "47 MB",  undetected: "164d",  updated: "4 days ago"  },
]

export default function DownloadsPage() {
  const [searchValue, setSearchValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [license, setLicense] = useState<OrderLicense | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchValue.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/downloads?key=${encodeURIComponent(searchValue.trim())}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "License not found")
      }

      setLicense(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify license")
      setLicense(null)
    } finally {
      setLoading(false)
    }
  }

  const copyLicenseKey = () => {
    if (!license) return
    navigator.clipboard.writeText(license.licenseKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const handleDownload = async (item: DownloadItem) => {
    if (!item.downloadUrl) {
      toast.error("Download link is not ready yet. Contact support if this persists.")
      return
    }
    setDownloadingId(item.id)
    try {
      await new Promise(r => setTimeout(r, 1000))
      const opened = window.open(item.downloadUrl, "_blank", "noopener,noreferrer")
      if (!opened) toast.error("Your browser blocked the download. Allow pop-ups and retry.")
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />

      {/* Pre-auth: single editorial block combining hero + input + demo preview */}
      {!license && (
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-xl mx-auto text-center">
              <SectionEyebrow number="01" label="Download Center" />

              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
                <span
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Find your{" "}
                </span>
                <span
                  style={{
                    background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))",
                  }}
                >
                  keys.
                </span>
              </h1>
              <p className="text-[17px] text-white/55 max-w-md mx-auto leading-relaxed mb-10">
                One key unlocks every build, update, and firmware you've paid for.
              </p>

              {/* License input card */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 sm:p-7 text-left">
                <div className="flex items-center gap-2 mb-5">
                  <Key className="h-5 w-5 text-[#f97316]" />
                  <span className="font-bold text-white">License Verification</span>
                </div>

                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="LS-A7K3-9F2X-P4QM"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="focus-ring-premium h-14 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[15px] font-mono tracking-wider text-white placeholder:text-white/25 placeholder:font-mono"
                  />
                  <GlossyButton
                    onClick={handleSearch}
                    disabled={loading}
                    data-cursor="cta"
                    data-cursor-label={loading ? "Wait" : "Verify"}
                    aria-label="Verify license"
                    shape="block"
                    size="lg"
                    className="cursor-cta press-spring h-14 w-14 !px-0 flex-shrink-0"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                  </GlossyButton>
                </div>

                {/* Format hint + help link */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <span className="text-white/35">
                    Format:{" "}
                    <span className="font-mono text-white/55 tracking-wider">LS-A7K3-9F2X-P4QM</span>
                  </span>
                  <Link
                    href="https://discord.gg/lethaldma"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#f97316] hover:text-[#ffb366] transition-colors font-medium"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    Can&apos;t find your key?
                  </Link>
                </div>

                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vault catalogue — real product lineup, locked until key is verified */}
            <div className="max-w-5xl mx-auto mt-20">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.015] text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/50">
                  <Lock className="h-3 w-3 text-[#f97316]" />
                  <span>Inside the vault</span>
                  <span className="text-white/25">·</span>
                  <span className="text-white/35">6 products · key required</span>
                </div>
                <h2 className="font-display text-[26px] sm:text-[30px] font-bold tracking-[-0.03em] leading-[1.1] mt-4">
                  <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.8))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Every build you'll unlock
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {CATALOGUE_TILES.map((tile, i) => {
                  const lane = LANES[tile.category]
                  return (
                    <div
                      key={tile.name}
                      className="group/vault relative rounded-2xl overflow-hidden transition-transform duration-500 hover:-translate-y-[2px]"
                      style={{
                        background: "linear-gradient(180deg, rgba(255,255,255,0.018), rgba(255,255,255,0.006))",
                        border: "1px solid rgba(255,255,255,0.06)",
                        boxShadow: "0 20px 50px -30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.025)",
                      }}
                      aria-hidden="true"
                    >
                      {/* Status-coloured left rail */}
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-0 bottom-0 w-[3px] opacity-70 group-hover/vault:opacity-100 transition-opacity"
                        style={{
                          background: `linear-gradient(180deg, rgba(${lane.rgb},0) 0%, rgba(${lane.rgb},0.8) 50%, rgba(${lane.rgb},0) 100%)`,
                        }}
                      />
                      {/* Ambient corner glow tinted to lane */}
                      <span
                        aria-hidden="true"
                        className="absolute -top-14 -right-14 w-40 h-40 rounded-full pointer-events-none opacity-40 group-hover/vault:opacity-70 transition-opacity duration-500"
                        style={{
                          background: `radial-gradient(circle, ${lane.glow}, transparent 70%)`,
                          filter: "blur(30px)",
                        }}
                      />
                      {/* Scanline shimmer — slow animated sweep */}
                      <span
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background: `linear-gradient(115deg, transparent 0%, rgba(${lane.rgb},0.08) 48%, transparent 56%)`,
                          backgroundSize: "250% 100%",
                          animation: "vaultShimmer 4.5s ease-in-out infinite",
                          animationDelay: `${i * 0.4}s`,
                        }}
                      />

                      <div className="relative p-5">
                        {/* Header row: icon tile + category caption + padlock */}
                        <div className="flex items-start gap-3 mb-4">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              background: `rgba(${lane.rgb},0.10)`,
                              border: `1px solid rgba(${lane.rgb},0.3)`,
                              boxShadow: `0 0 16px ${lane.glow.replace("0.35", "0.2").replace("0.38", "0.22")}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                            }}
                          >
                            {tile.category === "firmware" ? (
                              <Shield className="h-5 w-5" style={{ color: lane.hex }} />
                            ) : tile.category === "spoofer" ? (
                              <Package className="h-5 w-5" style={{ color: lane.hex }} />
                            ) : (
                              <FileDown className="h-5 w-5" style={{ color: lane.hex }} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[9.5px] font-bold uppercase tracking-[0.2em]" style={{ color: lane.hex }}>
                              {tile.categoryLabel}
                            </p>
                            <h3 className="font-display font-bold text-white text-[14.5px] tracking-[-0.01em] mt-0.5 truncate">
                              {tile.name}
                            </h3>
                          </div>
                          <span
                            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <Lock className="h-3 w-3 text-white/35" />
                          </span>
                        </div>

                        {/* Metadata grid: version + size + undetected streak */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="rounded-lg px-2.5 py-2 bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-white/30">Version</p>
                            <p className="text-[11.5px] font-mono font-semibold text-white/75 mt-0.5 tabular-nums">{tile.version}</p>
                          </div>
                          <div className="rounded-lg px-2.5 py-2 bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-white/30">Size</p>
                            <p className="text-[11.5px] font-mono font-semibold text-white/75 mt-0.5 tabular-nums">{tile.size}</p>
                          </div>
                          <div className="rounded-lg px-2.5 py-2 bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-white/30">Clean</p>
                            <p className="text-[11.5px] font-mono font-semibold text-emerald-400 mt-0.5 tabular-nums">{tile.undetected}</p>
                          </div>
                        </div>

                        {/* Footer: status chip + updated */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                            <span className="relative flex w-1 h-1">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" style={{ animation: "statusPulse 2s ease-in-out infinite" }} />
                              <span className="relative inline-flex w-1 h-1 rounded-full bg-emerald-400" />
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-400">Undetected</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-white/40">
                            <Clock className="h-3 w-3" />
                            {tile.updated}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Tiny trust row under the grid */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/35">
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-emerald-400/70" /> Lifetime updates
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Key className="h-3 w-3 text-[#f97316]/70" /> One key · every build
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Download className="h-3 w-3 text-blue-400/70" /> Instant delivery
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* License & Downloads (post-auth) */}
      {license && (
        <>
          <section className="relative pt-32 pb-16 overflow-hidden">
            <div className="container mx-auto px-4 relative">
              <div className="max-w-2xl mx-auto text-center">
                <SectionEyebrow number="01" label="Download Center" />
                <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
                  <span
                    style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Your{" "}
                  </span>
                  <span
                    style={{
                      background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))",
                    }}
                  >
                    Downloads
                  </span>
                </h1>
              </div>
            </div>
          </section>

          <section className="pb-24">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* License Info Card */}
                <div className="spotlight-card rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-white/[0.015] to-white/[0.015] shadow-[0_18px_48px_rgba(0,0,0,0.4)] overflow-hidden">
                  <div className="p-6 border-b border-emerald-500/10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-black text-xl text-white">License Verified</p>
                          <p className="text-sm text-white/40">Order {license.displayId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/40">Registered to</p>
                        <p className="font-bold text-white">{license.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Your License Key</p>
                      <button
                        onClick={copyLicenseKey}
                        data-cursor="cta"
                        data-cursor-label={copiedKey ? "Got it" : "Copy"}
                        className="cursor-cta press-spring flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 hover:shadow-[0_0_18px_rgba(16,185,129,0.4)] transition-all"
                      >
                        {copiedKey ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copiedKey ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="font-mono text-lg text-white bg-white/[0.015] border border-white/[0.05] rounded-xl p-4 break-all select-all">
                      {license.licenseKey}
                    </div>
                  </div>
                </div>

                {/* Downloads */}
                <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] overflow-hidden">
                  <div className="p-6 border-b border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <FileDown className="h-5 w-5 text-[#f97316]" />
                      <span className="font-bold text-white">Available Downloads</span>
                    </div>
                  </div>

                  <div className="divide-y divide-white/[0.03]">
                    {license.products.map((product) => (
                      <div key={product.id} className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                product.status === "ready"
                                  ? "bg-[#f97316]/10"
                                  : product.status === "updating"
                                    ? "bg-amber-500/10"
                                    : "bg-red-500/10"
                              )}
                            >
                              <Package
                                className={cn(
                                  "h-6 w-6",
                                  product.status === "ready"
                                    ? "text-[#f97316]"
                                    : product.status === "updating"
                                      ? "text-amber-500"
                                      : "text-red-500"
                                )}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-white">{product.name}</h3>
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                    product.status === "ready"
                                      ? "bg-emerald-500/10 text-emerald-500"
                                      : product.status === "updating"
                                        ? "bg-amber-500/10 text-amber-500"
                                        : "bg-red-500/10 text-red-500"
                                  )}
                                >
                                  {product.status}
                                </span>
                              </div>
                              <p className="text-sm text-white/40 mb-2">{product.variant}</p>
                              <div className="flex items-center gap-4 text-xs text-white/40">
                                <span>v{product.version}</span>
                                <span>{product.size}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Updated {product.updated}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDownload(product)}
                            disabled={product.status !== "ready" || downloadingId === product.id}
                            className={cn(
                              "flex items-center gap-2 px-5 py-2.5 rounded-xl shrink-0 font-medium text-sm transition-all disabled:opacity-50",
                              product.status === "ready"
                                ? "bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white hover:opacity-90"
                                : "bg-white/[0.04] text-white/40 border border-white/[0.04]"
                            )}
                          >
                            {downloadingId === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : product.status !== "ready" ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            {product.status === "ready"
                              ? "Download"
                              : product.status === "updating"
                                ? "Updating..."
                                : "Unavailable"}
                          </button>
                        </div>

                        {/* Instructions */}
                        {product.instructions.length > 0 && (
                          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2">Quick Start</p>
                            <ol className="space-y-1">
                              {product.instructions.map((instruction, i) => (
                                <li key={i} className="text-sm text-white/40 flex items-start gap-2">
                                  <span className="text-[#f97316] font-bold">{i + 1}.</span>
                                  {instruction}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Help */}
                <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-white/40" />
                    <span className="text-sm text-white/40">Need help with installation?</span>
                  </div>
                  <Link
                    href="https://discord.gg/lethaldma"
                    target="_blank"
                    className="flex items-center gap-2 text-sm text-[#f97316] font-bold hover:underline"
                  >
                    Join Discord
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </main>
  )
}
