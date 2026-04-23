"use client"

import { useState, useEffect } from "react"
import { 
  Download, 
  Key, 
  Copy, 
  Check, 
  Shield, 
  FileText, 
  ExternalLink,
  Loader2,
  AlertTriangle,
  Package,
  Clock,
  Zap,
  HelpCircle,
  ArrowRight,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface OrderData {
  id: string
  display_id: string
  status: string
  created_at: string
  items: Array<{
    name: string
    variant: string
    product_id: string
  }>
  license_keys: Array<{
    product: string
    variant: string
    key: string
    expires?: string
  }>
  downloads: Array<{
    product: string
    variant: string
    filename: string
    size: string
    url: string
  }>
}

export function DownloadContent({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/download/${orderId}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Order not found")
      }

      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleDownload = async (url: string, filename: string) => {
    setDownloadingFile(filename)
    // Simulate download delay
    await new Promise(r => setTimeout(r, 1500))
    // In real implementation, this would trigger actual download
    window.open(url, "_blank")
    setDownloadingFile(null)
  }

  if (loading) {
    return (
      <section className="flex-1 flex items-center justify-center py-32">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#f97316] animate-spin mx-auto mb-4" />
          <p className="text-white/55">Loading your order...</p>
        </div>
      </section>
    )
  }

  if (error || !order) {
    return (
      <section className="flex-1 flex items-center justify-center py-32">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
          <p className="text-white/55 mb-6">
            {error || "We couldn't find this order. Please check your order ID and try again."}
          </p>
          <Link href="/track">
            <Button className="gap-2">
              Track Your Order
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    )
  }

  if (order.status !== "completed") {
    return (
      <section className="flex-1 flex items-center justify-center py-32">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Pending</h2>
          <p className="text-white/55 mb-6">
            Your order is still being processed. Downloads will be available once payment is verified.
          </p>
          <Link href={`/track?order_id=${orderId}`}>
            <Button className="gap-2">
              Check Order Status
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="flex-1 pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-500">Order Complete</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Download Center
            </h1>
            <p className="text-lg text-white/55">
              Order <span className="font-mono font-bold text-white">{order.display_id}</span>
            </p>
          </div>

          {/* License Keys Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#f97316]/10 flex items-center justify-center">
                <Key className="h-5 w-5 text-[#f97316]" />
              </div>
              <h2 className="text-xl font-bold text-white">License Keys</h2>
            </div>

            <div className="space-y-4">
              {order.license_keys.map((license, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.015] overflow-hidden"
                >
                  <div className="p-5 border-b border-white/[0.06] bg-white/[0.015]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{license.product}</p>
                        <p className="text-sm text-white/55">{license.variant}</p>
                      </div>
                      {license.expires && (
                        <div className="text-right">
                          <p className="text-xs text-white/55">Expires</p>
                          <p className="text-sm font-bold text-white">{license.expires}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <p className="text-xs text-white/55 uppercase tracking-wider mb-2">License Key</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-4 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-sm break-all select-all">
                        {license.key}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(license.key, `license-${index}`)}
                        className="shrink-0 h-12 w-12"
                      >
                        {copiedKey === `license-${index}` ? (
                          <Check className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Downloads Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Downloads</h2>
            </div>

            <div className="space-y-4">
              {order.downloads.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-5 rounded-2xl border border-white/[0.08] bg-white/[0.015]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{file.product}</p>
                      <p className="text-sm text-white/55">{file.filename} • {file.size}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleDownload(file.url, file.filename)}
                    disabled={downloadingFile === file.filename}
                    className="gap-2"
                  >
                    {downloadingFile === file.filename ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Start Guide */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] overflow-hidden mb-8">
            <div className="p-5 border-b border-white/[0.06] bg-white/[0.015]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-white">Quick Start</h2>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#f97316]/10 flex items-center justify-center shrink-0 text-sm font-bold text-[#f97316]">1</div>
                <div>
                  <p className="font-bold text-white">Download the loader</p>
                  <p className="text-sm text-white/55">Click the download button above to get the latest version</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#f97316]/10 flex items-center justify-center shrink-0 text-sm font-bold text-[#f97316]">2</div>
                <div>
                  <p className="font-bold text-white">Disable antivirus temporarily</p>
                  <p className="text-sm text-white/55">Add an exclusion for the loader folder to prevent false positives</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#f97316]/10 flex items-center justify-center shrink-0 text-sm font-bold text-[#f97316]">3</div>
                <div>
                  <p className="font-bold text-white">Run as Administrator</p>
                  <p className="text-sm text-white/55">Right-click the loader and select "Run as administrator"</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#f97316]/10 flex items-center justify-center shrink-0 text-sm font-bold text-[#f97316]">4</div>
                <div>
                  <p className="font-bold text-white">Enter your license key</p>
                  <p className="text-sm text-white/55">Copy your key from above and paste it into the loader</p>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-white/[0.015] border border-white/[0.06]">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <HelpCircle className="h-5 w-5 text-white/55 hidden sm:block" />
              <p className="text-white/55">
                Need help? Check our guides or contact support
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/guides">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Guides
                </Button>
              </Link>
              <Link href="https://discord.gg/lethaldma" target="_blank">
                <Button className="gap-2">
                  Discord
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 mt-8 text-xs text-white/40">
            <Shield className="h-4 w-4" />
            <span>All downloads are verified and digitally signed</span>
          </div>
        </div>
      </div>
    </section>
  )
}
