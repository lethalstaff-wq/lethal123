"use client"

import { useState, useTransition, useRef } from "react"
import { updateReview, deleteReview, createReview, bulkCreateReviews } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star, Pencil, Save, X, Trash2, Plus, Upload, Loader2, MessageSquare, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type Review = {
  id: number
  text: string
  rating: number
  username: string
  email: string
  product_id: string
  verified: boolean
  is_auto: boolean
  team_response: string | null
  refunded: boolean
  helpful: number
  time_label: string | null
  created_at: string
}

type Product = { id: string; name: string }

export function AdminReviews({ reviews, totalCount, products }: {
  reviews: Review[]
  totalCount: number
  products: Product[]
}) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Review>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newReview, setNewReview] = useState({ text: "", rating: 5, username: "", email: "", product_id: "", team_response: "", refunded: false, is_auto: false })
  const [search, setSearch] = useState("")
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const [importStatus, setImportStatus] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function startEdit(r: Review) {
    setEditingId(r.id)
    setEditForm({ text: r.text, rating: r.rating, team_response: r.team_response, refunded: r.refunded, is_auto: r.is_auto, verified: r.verified })
  }

  function saveEdit(id: number) {
    startTransition(async () => {
      await updateReview(id, editForm)
      setEditingId(null)
      setEditForm({})
      router.refresh()
    })
  }

  function removeReview(id: number) {
    if (!confirm("Delete this review?")) return
    startTransition(async () => {
      await deleteReview(id)
      router.refresh()
    })
  }

  function addReview() {
    if (!newReview.text || !newReview.product_id) return
    startTransition(async () => {
      await createReview({
        text: newReview.text,
        rating: newReview.rating,
        username: newReview.username || "anon",
        email: newReview.email || "user@gmail.com",
        product_id: newReview.product_id,
        verified: true,
        is_auto: newReview.is_auto,
        team_response: newReview.team_response || null,
        refunded: newReview.refunded,
        helpful: 0,
      })
      setShowAdd(false)
      setNewReview({ text: "", rating: 5, username: "", email: "", product_id: "", team_response: "", refunded: false, is_auto: false })
      router.refresh()
    })
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportStatus("Reading file...")

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!Array.isArray(data)) throw new Error("JSON must be an array")
      setImportStatus(`Importing ${data.length} reviews...`)

      startTransition(async () => {
        await bulkCreateReviews(data)
        setImportStatus(`Done! Imported ${data.length} reviews.`)
        setTimeout(() => setImportStatus(""), 3000)
        router.refresh()
      })
    } catch (err) {
      setImportStatus(`Error: ${err instanceof Error ? err.message : "Invalid file"}`)
    }
    if (fileRef.current) fileRef.current.value = ""
  }

  const filtered = reviews.filter((r) => {
    if (filterRating && r.rating !== filterRating) return false
    if (search && !r.text.toLowerCase().includes(search.toLowerCase()) && !r.username.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalCount.toLocaleString()} total reviews (showing latest {reviews.length})</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={isPending}>
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Import JSON
          </Button>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Review
          </Button>
        </div>
      </div>

      {importStatus && (
        <div className="text-sm px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400">{importStatus}</div>
      )}

      {/* Add review form */}
      {showAdd && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">New Review</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Review Text</Label>
              <textarea
                value={newReview.text}
                onChange={(e) => setNewReview((r) => ({ ...r, text: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground min-h-[80px] resize-y"
                placeholder="Review text..."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Username</Label>
              <Input value={newReview.username} onChange={(e) => setNewReview((r) => ({ ...r, username: e.target.value }))} className="mt-1 bg-background text-sm" placeholder="e.g. zk" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input value={newReview.email} onChange={(e) => setNewReview((r) => ({ ...r, email: e.target.value }))} className="mt-1 bg-background text-sm" placeholder="e.g. user@gmail.com" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Product</Label>
              <select
                value={newReview.product_id}
                onChange={(e) => setNewReview((r) => ({ ...r, product_id: e.target.value }))}
                className="mt-1 w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="">Select product</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Rating</Label>
              <select
                value={newReview.rating}
                onChange={(e) => setNewReview((r) => ({ ...r, rating: Number(e.target.value) }))}
                className="mt-1 w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Team Response (optional)</Label>
              <Input value={newReview.team_response} onChange={(e) => setNewReview((r) => ({ ...r, team_response: e.target.value }))} className="mt-1 bg-background text-sm" placeholder="Team response..." />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={newReview.refunded} onChange={(e) => setNewReview((r) => ({ ...r, refunded: e.target.checked }))} className="rounded" />
                Refunded
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={newReview.is_auto} onChange={(e) => setNewReview((r) => ({ ...r, is_auto: e.target.checked }))} className="rounded" />
                Auto feedback
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm" onClick={addReview} disabled={isPending}>
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              Create Review
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews..." className="pl-9 bg-card text-sm" />
        </div>
        <div className="flex items-center gap-1">
          {[null, 5, 4, 3, 2, 1].map((r) => (
            <button
              key={r ?? "all"}
              onClick={() => setFilterRating(r)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                filterRating === r ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {r === null ? "All" : `${r}*`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-2">
        {filtered.map((r) => {
          const isEditing = editingId === r.id
          const productName = products.find((p) => p.id === r.product_id)?.name ?? r.product_id

          return (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4">
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editForm.text ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, text: e.target.value }))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground min-h-[60px] resize-y"
                  />
                  <div className="flex items-center gap-3 flex-wrap">
                    <select
                      value={editForm.rating ?? 5}
                      onChange={(e) => setEditForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                      className="h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground"
                    >
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                    <Input
                      value={editForm.team_response ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, team_response: e.target.value || null }))}
                      placeholder="Team response..."
                      className="h-8 text-sm bg-background flex-1 max-w-xs"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input type="checkbox" checked={editForm.refunded ?? false} onChange={(e) => setEditForm((f) => ({ ...f, refunded: e.target.checked }))} className="rounded" />
                      Refunded
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input type="checkbox" checked={editForm.is_auto ?? false} onChange={(e) => setEditForm((f) => ({ ...f, is_auto: e.target.checked }))} className="rounded" />
                      Auto
                    </label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" onClick={() => saveEdit(r.id)} disabled={isPending}>
                      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      <span className="ml-1.5">Save</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("h-3 w-3", i < r.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30")} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{productName}</span>
                      {r.is_auto && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">Auto</span>}
                      {r.refunded && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">Refunded</span>}
                      {r.verified && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">Verified</span>}
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed">{r.text}</p>
                    {r.team_response && (
                      <div className="mt-2 flex items-start gap-2 pl-3 border-l-2 border-primary/30">
                        <MessageSquare className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground">{r.team_response}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{r.username}</span>
                      <span>{r.email}</span>
                      <span>Helpful: {r.helpful}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(r)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => removeReview(r.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No reviews found. {totalCount === 0 ? "Import reviews using the JSON upload button." : "Try adjusting your filters."}
          </div>
        )}
      </div>
    </div>
  )
}
