"use client"

import { useState, useTransition } from "react"
import { updateProduct, updateVariant, createVariant, deleteVariant } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Save, X, Plus, Trash2, ChevronDown, ChevronRight, Loader2, Package } from "lucide-react"
import { useRouter } from "next/navigation"

type Variant = {
  id: string
  name: string
  price_in_pence: number
  sort_order: number
  sell_auth_variant: string | null
  product_id: string
}

type Product = {
  id: string
  name: string
  description: string
  image: string
  category: string
  badge: string | null
  popular: boolean
  sort_order: number
  sell_auth_product_id: string | null
  product_variants: Variant[]
}

export function AdminProducts({ products }: { products: Product[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Product>>({})
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null)
  const [variantForm, setVariantForm] = useState<Partial<Variant>>({})
  const [addingVariantTo, setAddingVariantTo] = useState<string | null>(null)
  const [newVariant, setNewVariant] = useState({ name: "", price_in_pence: 0 })
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function startEdit(p: Product) {
    setEditingId(p.id)
    setEditForm({ name: p.name, description: p.description, image: p.image, category: p.category, badge: p.badge, popular: p.popular })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({})
  }

  function saveProduct(id: string) {
    startTransition(async () => {
      await updateProduct(id, editForm)
      setEditingId(null)
      setEditForm({})
      router.refresh()
    })
  }

  function startEditVariant(v: Variant) {
    setEditingVariantId(v.id)
    setVariantForm({ name: v.name, price_in_pence: v.price_in_pence })
  }

  function saveVariant(id: string) {
    startTransition(async () => {
      await updateVariant(id, variantForm)
      setEditingVariantId(null)
      setVariantForm({})
      router.refresh()
    })
  }

  function removeVariant(id: string) {
    if (!confirm("Delete this variant?")) return
    startTransition(async () => {
      await deleteVariant(id)
      router.refresh()
    })
  }

  function addVariant(productId: string) {
    if (!newVariant.name) return
    const id = `${productId}-${newVariant.name.toLowerCase().replace(/\s+/g, "-")}`
    startTransition(async () => {
      await createVariant({
        id,
        product_id: productId,
        name: newVariant.name,
        price_in_pence: newVariant.price_in_pence,
        sort_order: 99,
      })
      setAddingVariantTo(null)
      setNewVariant({ name: "", price_in_pence: 0 })
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} products with variants</p>
        </div>
      </div>

      <div className="space-y-3">
        {products.map((p) => {
          const isExpanded = expandedId === p.id
          const isEditing = editingId === p.id

          return (
            <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-4 p-4">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    {isEditing ? (
                      <Input
                        value={editForm.name ?? ""}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        className="h-7 text-sm font-semibold bg-background"
                      />
                    ) : (
                      <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{p.category}</span>
                      <span className="text-xs text-muted-foreground">--</span>
                      <span className="text-xs text-muted-foreground">{p.product_variants.length} variants</span>
                      {p.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{p.badge}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={isPending}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" onClick={() => saveProduct(p.id)} disabled={isPending}>
                        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        <span className="ml-1.5">Save</span>
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => startEdit(p)}>
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="ml-1.5">Edit</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Edit form */}
              {isEditing && (
                <div className="px-4 pb-4 grid grid-cols-2 gap-3 border-t border-border pt-4 ml-8">
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <Input
                      value={editForm.description ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      className="mt-1 bg-background text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <select
                      value={editForm.category ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                      className="mt-1 w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                    >
                      <option value="spoofer">Spoofer</option>
                      <option value="cheat">Cheat</option>
                      <option value="firmware">Firmware</option>
                      <option value="bundle">Bundle</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Badge</Label>
                    <Input
                      value={editForm.badge ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, badge: e.target.value || null }))}
                      placeholder="e.g. Popular, Best Value"
                      className="mt-1 bg-background text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.popular ?? false}
                      onChange={(e) => setEditForm((f) => ({ ...f, popular: e.target.checked }))}
                      className="rounded"
                    />
                    <Label className="text-xs text-muted-foreground">Popular</Label>
                  </div>
                </div>
              )}

              {/* Variants */}
              {isExpanded && (
                <div className="border-t border-border">
                  <div className="p-4 ml-8 space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Variants</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddingVariantTo(addingVariantTo === p.id ? null : p.id)}
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Variant
                      </Button>
                    </div>

                    {/* Add variant form */}
                    {addingVariantTo === p.id && (
                      <div className="flex items-end gap-2 p-3 rounded-lg bg-muted/30 mb-3">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Name</Label>
                          <Input
                            value={newVariant.name}
                            onChange={(e) => setNewVariant((v) => ({ ...v, name: e.target.value }))}
                            placeholder="e.g. 7 Days"
                            className="mt-1 h-8 text-sm bg-background"
                          />
                        </div>
                        <div className="w-32">
                          <Label className="text-xs text-muted-foreground">Price (pence)</Label>
                          <Input
                            type="number"
                            value={newVariant.price_in_pence}
                            onChange={(e) => setNewVariant((v) => ({ ...v, price_in_pence: Number(e.target.value) }))}
                            className="mt-1 h-8 text-sm bg-background"
                          />
                        </div>
                        <Button size="sm" className="h-8" onClick={() => addVariant(p.id)} disabled={isPending}>
                          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
                        </Button>
                      </div>
                    )}

                    {p.product_variants
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((v) => {
                        const isVarEditing = editingVariantId === v.id
                        return (
                          <div key={v.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                            {isVarEditing ? (
                              <>
                                <Input
                                  value={variantForm.name ?? ""}
                                  onChange={(e) => setVariantForm((f) => ({ ...f, name: e.target.value }))}
                                  className="h-7 text-sm flex-1 bg-background"
                                />
                                <Input
                                  type="number"
                                  value={variantForm.price_in_pence ?? 0}
                                  onChange={(e) => setVariantForm((f) => ({ ...f, price_in_pence: Number(e.target.value) }))}
                                  className="h-7 text-sm w-28 bg-background"
                                />
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingVariantId(null)}>
                                  <X className="h-3 w-3" />
                                </Button>
                                <Button size="sm" className="h-7" onClick={() => saveVariant(v.id)} disabled={isPending}>
                                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className="text-sm text-foreground flex-1">{v.name}</span>
                                <span className="text-sm font-mono text-muted-foreground">
                                  {"\u00A3"}{(v.price_in_pence / 100).toFixed(2)}
                                </span>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEditVariant(v)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => removeVariant(v.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        )
                      })}
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
