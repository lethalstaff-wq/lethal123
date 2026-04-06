"use client"

import { useState } from "react"
import { updateStaffApplication } from "@/app/admin/actions"
import { toast } from "sonner"
import { ChevronDown, ChevronUp, Check, X, Clock, User, Briefcase, Globe, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Application {
  id: number
  discord: string
  age: number
  timezone: string
  experience: string
  languages: string
  hours_per_week: string
  position: string
  why_hire: string
  how_found: string
  status: string
  admin_notes: string | null
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  accepted: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
}

const POSITION_LABELS: Record<string, string> = {
  support: "Support Agent",
  moderator: "Moderator",
  developer: "Developer",
  reseller: "Reseller",
}

export function AdminStaffApplications({ applications }: { applications: Application[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [loadingId, setLoadingId] = useState<number | null>(null)

  async function handleUpdateStatus(id: number, status: string) {
    setLoadingId(id)
    try {
      await updateStaffApplication(id, status, notes[id])
      toast.success(`Application ${status}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {applications.length} application{applications.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            {applications.filter((a) => a.status === "pending").length} pending
          </span>
          <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            {applications.filter((a) => a.status === "accepted").length} accepted
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            {applications.filter((a) => a.status === "rejected").length} rejected
          </span>
        </div>
      </div>

      {applications.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          No applications yet.
        </div>
      )}

      <div className="space-y-3">
        {applications.map((app) => {
          const isExpanded = expanded === app.id
          return (
            <div
              key={app.id}
              className="border border-border rounded-xl bg-card overflow-hidden transition-all"
            >
              {/* Row header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : app.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 grid grid-cols-5 gap-4 items-center text-sm">
                  <div className="font-medium text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {app.discord}
                  </div>
                  <div className="text-muted-foreground">{app.age} yrs</div>
                  <div className="text-muted-foreground">
                    {POSITION_LABELS[app.position] || app.position}
                  </div>
                  <div>
                    <span
                      className={cn(
                        "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        STATUS_STYLES[app.status] || STATUS_STYLES.pending
                      )}
                    >
                      {app.status}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-border px-5 py-5 space-y-5 bg-muted/10">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                        <Globe className="w-3.5 h-3.5" /> Timezone
                      </span>
                      <p className="text-foreground">{app.timezone || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                        <Clock className="w-3.5 h-3.5" /> Hours/Week
                      </span>
                      <p className="text-foreground">{app.hours_per_week || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                        <MessageCircle className="w-3.5 h-3.5" /> Found via
                      </span>
                      <p className="text-foreground">{app.how_found || "Not specified"}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm mb-1 block">Languages</span>
                    <p className="text-foreground text-sm">{app.languages || "Not specified"}</p>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm flex items-center gap-1.5 mb-1">
                      <Briefcase className="w-3.5 h-3.5" /> Experience
                    </span>
                    <p className="text-foreground text-sm whitespace-pre-wrap bg-background/50 rounded-lg p-3 border border-border">
                      {app.experience || "No experience provided"}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm mb-1 block">Why should we hire them?</span>
                    <p className="text-foreground text-sm whitespace-pre-wrap bg-background/50 rounded-lg p-3 border border-border">
                      {app.why_hire}
                    </p>
                  </div>

                  {/* Admin notes & actions */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1.5">Admin Notes</label>
                      <textarea
                        value={notes[app.id] ?? app.admin_notes ?? ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [app.id]: e.target.value }))}
                        placeholder="Add internal notes..."
                        rows={2}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(app.id, "accepted")}
                        disabled={loadingId === app.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, "rejected")}
                        disabled={loadingId === app.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                      {app.status !== "pending" && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, "pending")}
                          disabled={loadingId === app.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <Clock className="w-4 h-4" />
                          Reset to Pending
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
