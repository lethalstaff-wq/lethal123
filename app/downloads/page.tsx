"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
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
  Lock
} from "lucide-react"
import { cn } from "@/lib/utils"
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

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] opacity-30" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f97316]/10 border border-[#f97316]/20 mb-6">
              <Download className="h-4 w-4 text-[#f97316]" />
              <span className="text-sm font-bold text-[#f97316]">Download Center</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Download Your <span className="text-[#f97316]">Products</span>
            </h1>
            <p className="text-lg text-white/40">
              Enter your license key or order ID to access your downloads
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] backdrop-blur-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <Key className="h-5 w-5 text-[#f97316]" />
                <span className="font-bold text-white">License Verification</span>
              </div>

              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Enter license key or order ID"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-14 rounded-xl bg-white/[0.015] border border-white/[0.05] text-white placeholder:text-white/20"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="h-14 w-14 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* License & Downloads */}
      {license && (
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* License Info Card */}
              <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-black to-black overflow-hidden">
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
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
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                            product.status === "ready" ? "bg-[#f97316]/10" :
                            product.status === "updating" ? "bg-amber-500/10" : "bg-red-500/10"
                          )}>
                            <Package className={cn(
                              "h-6 w-6",
                              product.status === "ready" ? "text-[#f97316]" :
                              product.status === "updating" ? "text-amber-500" : "text-red-500"
                            )} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-white">{product.name}</h3>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                product.status === "ready" ? "bg-emerald-500/10 text-emerald-500" :
                                product.status === "updating" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                              )}>
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
                          {product.status === "ready" ? "Download" : product.status === "updating" ? "Updating..." : "Unavailable"}
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
      )}

      {/* Empty State */}
      {!license && !loading && !error && (
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center py-12">
              <div className="w-20 h-20 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-6">
                <Key className="h-10 w-10 text-white/20" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Enter Your License</h3>
              <p className="text-white/40">
                Your license key was sent to your email after purchase. Enter it above to access your downloads.
              </p>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
