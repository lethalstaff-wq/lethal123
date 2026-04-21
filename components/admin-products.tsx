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
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-white/55 mt-1">{products.length} products with variants</p>
        </div>
      </div>

      <div className="space-y-3">
        {products.map((p) => {
          const isExpanded = expandedId === p.id
          const isEditing = editingId === p.id

          return (
            <div key={p.id} className="rounded-xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-4 p-4">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  className="shrink-0 text-white/55 hover:text-white transition-colors"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-white/55" />
                  </div>
                  <div className="min-w-0">
                    {isEditing ? (
                      <Input
                        value={editForm.name ?? ""}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        className="h-7 text-sm font-semibold bg-white/[0.02]"
                      />
                    ) : (
                      <p className="font-semibold text-white text-sm truncate">{p.name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/55">{p.category}</span>
                      <span className="text-xs text-white/55">--</span>
                      <span className="text-xs text-white/55">{p.product_variants.length} variants</span>
                      {p.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f97316]/10 text-[#f97316] font-medium">{p.badge}</span>
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
                <div className="px-4 pb-4 grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-4 ml-8">
                  <div className="col-span-2">
                    <Label className="text-xs text-white/55">Description</Label>
                    <Input
                      value={editForm.description ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      className="mt-1 bg-white/[0.02] text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-white/55">Category</Label>
                    <select
                      value={editForm.category ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                      className="mt-1 w-full h-9 rounded-md border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-white"
                    >
                      <option value="spoofer">Spoofer</option>
                      <option value="cheat">Cheat</option>
                      <option value="firmware">Firmware</option>
                      <option value="bundle">Bundle</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-white/55">Badge</Label>
                    <Input
                      value={editForm.badge ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, badge: e.target.value || null }))}
                      placeholder="e.g. Popular, Best Value"
                      className="mt-1 bg-white/[0.02] text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.popular ?? false}
                      onChange={(e) => setEditForm((f) => ({ ...f, popular: e.target.checked }))}
                      className="rounded"
                    />
                    <Label className="text-xs text-white/55">Popular</Label>
                  </div>
                </div>
              )}

              {/* Variants */}
              {isExpanded && (
                <div className="border-t border-white/[0.08]">
                  <div className="p-4 ml-8 space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-white/55 uppercase tracking-wider">Variants</p>
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
                      <div className="flex items-end gap-2 p-3 rounded-lg bg-white/[0.05] mb-3">
                        <div className="flex-1">
                          <Label className="text-xs text-white/55">Name</Label>
                          <Input
                            value={newVariant.name}
                            onChange={(e) => setNewVariant((v) => ({ ...v, name: e.target.value }))}
                            placeholder="e.g. 7 Days"
                            className="mt-1 h-8 text-sm bg-white/[0.02]"
                          />
                        </div>
                        <div className="w-32">
                          <Label className="text-xs text-white/55">Price (pence)</Label>
                          <Input
                            type="number"
                            value={newVariant.price_in_pence}
                            onChange={(e) => setNewVariant((v) => ({ ...v, price_in_pence: Number(e.target.value) }))}
                            className="mt-1 h-8 text-sm bg-white/[0.02]"
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
                          <div key={v.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                            {isVarEditing ? (
                              <>
                                <Input
                                  value={variantForm.name ?? ""}
                                  onChange={(e) => setVariantForm((f) => ({ ...f, name: e.target.value }))}
                                  className="h-7 text-sm flex-1 bg-white/[0.02]"
                                />
                                <Input
                                  type="number"
                                  value={variantForm.price_in_pence ?? 0}
                                  onChange={(e) => setVariantForm((f) => ({ ...f, price_in_pence: Number(e.target.value) }))}
                                  className="h-7 text-sm w-28 bg-white/[0.02]"
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
                                <span className="text-sm text-white flex-1">{v.name}</span>
                                <span className="text-sm font-mono text-white/55">
                                  {"\u00A3"}{(v.price_in_pence / 100).toFixed(2)}
                                </span>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEditVariant(v)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-400" onClick={() => removeVariant(v.id)}>
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
