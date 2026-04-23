"use client"

import { useEffect, useState } from "react"
import { RefreshCw, X, Calendar, Check, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Reminder {
  id: string
  product_id: string
  variant_id: string
  variant_name: string | null
  duration_days: number | null
  reminder_at: string
  sent_at: string | null
  cancelled_at: string | null
}

export function RenewalRemindersList() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/renewals")
      .then((r) => r.json())
      .then((d) => setReminders(d.reminders || []))
      .catch(() => setReminders([]))
      .finally(() => setLoading(false))
  }, [])

  async function cancel(id: string) {
    setCancellingId(id)
    try {
      const res = await fetch("/api/renewals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) setReminders((prev) => prev.filter((r) => r.id !== id))
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-6 text-white/55 text-sm">
        Loading renewal reminders…
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.012] p-8 text-center">
        <RefreshCw className="h-8 w-8 text-white/20 mx-auto mb-3" />
        <p className="text-sm text-white/50 mb-1">No renewal reminders scheduled</p>
        <p className="text-xs text-white/30">Opt in at checkout to get a heads-up 3 days before a license expires.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reminders.map((r) => {
        const remindAt = new Date(r.reminder_at)
        const daysLeft = Math.max(0, Math.round((remindAt.getTime() - Date.now()) / 86_400_000))
        const isSent = !!r.sent_at
        return (
          <div key={r.id} className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  {isSent ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-bold text-white/60">
                      <Check className="h-2.5 w-2.5" /> Sent
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-[10px] font-bold text-emerald-400">
                      <RefreshCw className="h-2.5 w-2.5" /> Active
                    </span>
                  )}
                  <span className="text-[10.5px] text-white/55">
                    {r.duration_days ? `${r.duration_days}-day plan` : "Subscription"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white/90 truncate">
                  {r.variant_name || r.variant_id}
                </p>
                <p className="text-xs text-white/55 mt-1 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {isSent
                    ? `Reminder sent ${remindAt.toLocaleDateString("en-GB")}`
                    : daysLeft === 0
                    ? "Reminding today"
                    : `Reminding in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Link
                  href={`/products/${r.product_id}?variant=${r.variant_id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-[11px] font-bold text-emerald-400 transition-colors"
                >
                  Renew now <ArrowRight className="h-3 w-3" />
                </Link>
                {!isSent && (
                  <button
                    onClick={() => cancel(r.id)}
                    disabled={cancellingId === r.id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] text-white/55 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors disabled:opacity-50"
                  >
                    <X className="h-3 w-3" /> Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
