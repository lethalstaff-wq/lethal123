"use client"

import { useState, useTransition } from "react"
import { createCoupon, deleteCoupon, toggleCoupon } from "@/app/admin/actions"
import { useRouter } from "next/navigation"
import { 
  Plus, Trash2, ToggleLeft, ToggleRight, Copy, Check,
  Ticket, Zap
} from "lucide-react"

interface Coupon {
  id: string
  code: string
  discount_percent: number
  max_uses: number | null
  uses_count: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export function AdminCouponsClient({ coupons: initial }: { coupons: Coupon[] }) {
  const [coupons] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [code, setCode] = useState("")
  const [percent, setPercent] = useState("10")
  const [maxUses, setMaxUses] = useState("")
  const [expires, setExpires] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let c = "LETHAL"
    for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)]
    setCode(c)
  }

  const handleCreate = () => {
    if (!code || !percent) return
    startTransition(async () => {
      await createCoupon({
        code,
        percent: parseInt(percent),
        max_uses: maxUses ? parseInt(maxUses) : null,
        expires_at: expires || null,
      })
      setCode(""); setPercent("10"); setMaxUses(""); setExpires("")
      setShowForm(false)
      router.refresh()
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this coupon?")) return
    startTransition(async () => {
      await deleteCoupon(id)
      router.refresh()
    })
  }

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleCoupon(id, !current)
      router.refresh()
    })
  }

  const copyCode = (c: string) => {
    navigator.clipboard.writeText(c)
    setCopied(c)
    setTimeout(() => setCopied(null), 2000)
  }

  const activeCoupons = coupons.filter(c => c.is_active)
  const inactiveCoupons = coupons.filter(c => !c.is_active)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-white/55 mt-1">
            {activeCoupons.length} active · {inactiveCoupons.length} inactive
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f97316] text-white text-sm font-semibold hover:brightness-110 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </button>
      </div>

      {/* Fortune Wheel codes notice */}
      <div className="rounded-xl border border-[#f97316]/20 bg-[#f97316]/[0.05] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-[#f97316]" />
          <span className="text-sm font-semibold text-[#f97316]">Fortune Wheel Codes</span>
        </div>
        <p className="text-xs text-white/55">
          These codes are auto-seeded: EASTER5 (5%), BUNNY10 (10%), EGG15 (15%),
          SPRING7 (7%), EASTER20 (20%), HUNT12 (12%), RABBIT8 (8%), GOLDEN25 (25%)
        </p>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-6 space-y-4">
          <h3 className="font-semibold">New Coupon</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/55 mb-1 block">Code</label>
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="LETHAL20"
                  className="flex-1 h-10 px-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm"
                />
                <button
                  onClick={generateCode}
                  className="px-3 h-10 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs hover:bg-white/[0.06]"
                >
                  Random
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/55 mb-1 block">Discount %</label>
              <input
                type="number"
                value={percent}
                onChange={e => setPercent(e.target.value)}
                min="1" max="100"
                className="w-full h-10 px-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/55 mb-1 block">Max Uses (optional)</label>
              <input
                type="number"
                value={maxUses}
                onChange={e => setMaxUses(e.target.value)}
                placeholder="Unlimited"
                className="w-full h-10 px-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/55 mb-1 block">Expires (optional)</label>
              <input
                type="date"
                value={expires}
                onChange={e => setExpires(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={isPending || !code}
              className="px-6 py-2.5 rounded-xl bg-[#f97316] text-white text-sm font-semibold disabled:opacity-50 hover:brightness-110"
            >
              {isPending ? "Creating..." : "Create Coupon"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-xl border border-white/[0.08] text-sm hover:bg-white/[0.04]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Coupons list */}
      <div className="rounded-xl border border-white/[0.08] overflow-hidden">
        <div className="bg-white/[0.05] px-4 py-3 border-b border-white/[0.08] grid grid-cols-6 text-xs font-semibold text-white/55 uppercase">
          <span className="col-span-2">Code</span>
          <span>Discount</span>
          <span>Uses</span>
          <span>Expires</span>
          <span>Actions</span>
        </div>
        {coupons.length === 0 ? (
          <div className="p-12 text-center text-white/55">
            <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No coupons yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {coupons.map(coupon => (
              <div key={coupon.id} className={`grid grid-cols-6 items-center px-4 py-3 hover:bg-white/[0.015] transition-colors ${!coupon.is_active ? "opacity-50" : ""}`}>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="font-mono font-bold text-sm">{coupon.code}</span>
                  <button onClick={() => copyCode(coupon.code)} className="text-white/55 hover:text-white">
                    {copied === coupon.code ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  {!coupon.is_active && <span className="text-xs bg-white/[0.04] px-1.5 py-0.5 rounded">Inactive</span>}
                </div>
                <span className="text-emerald-500 font-bold">{coupon.discount_percent}% OFF</span>
                <span className="text-sm text-white/55">
                  {coupon.uses_count}{coupon.max_uses ? `/${coupon.max_uses}` : ""}
                </span>
                <span className="text-sm text-white/55">
                  {coupon.expires_at
                    ? new Date(coupon.expires_at).toLocaleDateString("en-GB")
                    : "Never"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(coupon.id, coupon.is_active)}
                    className="text-white/55 hover:text-[#f97316] transition-colors"
                    title={coupon.is_active ? "Deactivate" : "Activate"}
                  >
                    {coupon.is_active
                      ? <ToggleRight className="h-5 w-5 text-emerald-500" />
                      : <ToggleLeft className="h-5 w-5" />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="text-white/55 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
