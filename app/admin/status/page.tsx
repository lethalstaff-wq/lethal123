"use client"

import { useState, useEffect } from "react"
import { Shield, Activity, AlertTriangle, Wrench, CheckCircle2, RefreshCw, Save, ExternalLink } from "lucide-react"
import { PRODUCTS } from "@/lib/products"
import Image from "next/image"
import Link from "next/link"

type ProductStatus = "undetected" | "testing" | "updating" | "maintenance"

const STATUS_OPTIONS: { value: ProductStatus; label: string; color: string; icon: typeof Shield }[] = [
  { value: "undetected", label: "Undetected", color: "emerald", icon: Shield },
  { value: "testing", label: "Testing", color: "yellow", icon: Activity },
  { value: "updating", label: "Updating", color: "red", icon: AlertTriangle },
  { value: "maintenance", label: "Maintenance", color: "blue", icon: Wrench },
]

export default function AdminStatusPage() {
  const [statuses, setStatuses] = useState<Record<string, ProductStatus>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Load statuses from API on mount
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const res = await fetch("/api/admin/statuses")
        const data = await res.json()
        if (data.statuses) {
          const statusMap: Record<string, ProductStatus> = {}
          data.statuses.forEach((s: { product_id: string; status: string }) => {
            statusMap[s.product_id] = s.status as ProductStatus
          })
          // Fill in defaults for any missing products
          PRODUCTS.forEach(p => {
            if (!statusMap[p.id]) {
              statusMap[p.id] = "undetected"
            }
          })
          setStatuses(statusMap)
        } else {
          // Initialize with defaults
          const defaults: Record<string, ProductStatus> = {}
          PRODUCTS.forEach(p => { defaults[p.id] = "undetected" })
          setStatuses(defaults)
        }
      } catch {
        // Initialize with defaults on error
        const defaults: Record<string, ProductStatus> = {}
        PRODUCTS.forEach(p => { defaults[p.id] = "undetected" })
        setStatuses(defaults)
      }
      setLoading(false)
    }
    loadStatuses()
  }, [])

  const updateStatus = (productId: string, status: ProductStatus) => {
    setStatuses(prev => ({ ...prev, [productId]: status }))
  }

  const saveStatuses = async () => {
    setSaving(true)
    
    try {
      const statusArray = Object.entries(statuses).map(([product_id, status]) => ({
        product_id,
        status
      }))
      
      const res = await fetch("/api/admin/statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statuses: statusArray })
      })
      
      if (res.ok) {
        setLastSaved(new Date())
        setToast("Saved successfully")
        setTimeout(() => setToast(null), 3000)
      } else {
        setToast("Failed to save")
        setTimeout(() => setToast(null), 3000)
      }
    } catch {
      setToast("Failed to save")
      setTimeout(() => setToast(null), 3000)
    }
    
    setSaving(false)
  }

  const setAllStatus = (status: ProductStatus) => {
    const newStatuses: Record<string, ProductStatus> = {}
    PRODUCTS.forEach(p => { newStatuses[p.id] = status })
    setStatuses(newStatuses)
  }

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case "undetected": return "emerald"
      case "testing": return "yellow"
      case "updating": return "red"
      case "maintenance": return "blue"
      default: return "gray"
    }
  }

  const operationalCount = Object.values(statuses).filter(s => s === "undetected").length

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-emerald-500 text-white font-medium shadow-lg animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Status Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Control product detection statuses in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/status" 
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/50 text-sm transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View Public Page
          </Link>
          <button
            onClick={saveStatuses}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-emerald-500 font-medium">Undetected</span>
          </div>
          <p className="text-2xl font-bold text-emerald-500">
            {Object.values(statuses).filter(s => s === "undetected").length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-yellow-500 font-medium">Testing</span>
          </div>
          <p className="text-2xl font-bold text-yellow-500">
            {Object.values(statuses).filter(s => s === "testing").length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-500 font-medium">Updating</span>
          </div>
          <p className="text-2xl font-bold text-red-500">
            {Object.values(statuses).filter(s => s === "updating").length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-500 font-medium">Maintenance</span>
          </div>
          <p className="text-2xl font-bold text-blue-500">
            {Object.values(statuses).filter(s => s === "maintenance").length}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-muted-foreground mr-2">Set all to:</span>
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setAllStatus(opt.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={{
              backgroundColor: opt.value === "undetected" ? "rgba(34,197,94,0.1)" :
                             opt.value === "testing" ? "rgba(234,179,8,0.1)" :
                             opt.value === "updating" ? "rgba(239,68,68,0.1)" :
                             "rgba(59,130,246,0.1)",
              borderColor: opt.value === "undetected" ? "rgba(34,197,94,0.2)" :
                          opt.value === "testing" ? "rgba(234,179,8,0.2)" :
                          opt.value === "updating" ? "rgba(239,68,68,0.2)" :
                          "rgba(59,130,246,0.2)",
              color: opt.value === "undetected" ? "#22c55e" :
                    opt.value === "testing" ? "#eab308" :
                    opt.value === "updating" ? "#ef4444" :
                    "#3b82f6",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Products List */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 border-b border-border">
          <p className="text-sm font-medium text-muted-foreground">
            {PRODUCTS.length} Products • {operationalCount} Operational
          </p>
        </div>
        <div className="divide-y divide-border">
          {PRODUCTS.map(product => {
            const currentStatus = statuses[product.id] || "undetected"
            
            return (
              <div 
                key={product.id} 
                className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {STATUS_OPTIONS.map(opt => {
                    const isSelected = currentStatus === opt.value
                    const Icon = opt.icon
                    
                    return (
                      <button
                        key={opt.value}
                        onClick={() => updateStatus(product.id, opt.value)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                          isSelected 
                            ? "ring-2 ring-offset-2 ring-offset-background" 
                            : "opacity-50 hover:opacity-100"
                        }`}
                        style={{
                          backgroundColor: isSelected 
                            ? opt.value === "undetected" ? "rgba(34,197,94,0.2)" :
                              opt.value === "testing" ? "rgba(234,179,8,0.2)" :
                              opt.value === "updating" ? "rgba(239,68,68,0.2)" :
                              "rgba(59,130,246,0.2)"
                            : "transparent",
                          borderColor: opt.value === "undetected" ? "rgba(34,197,94,0.3)" :
                                      opt.value === "testing" ? "rgba(234,179,8,0.3)" :
                                      opt.value === "updating" ? "rgba(239,68,68,0.3)" :
                                      "rgba(59,130,246,0.3)",
                          color: opt.value === "undetected" ? "#22c55e" :
                                opt.value === "testing" ? "#eab308" :
                                opt.value === "updating" ? "#ef4444" :
                                "#3b82f6",
                        }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Last saved indicator */}
      {lastSaved && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
