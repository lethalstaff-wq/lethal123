"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

// Admin client that bypasses RLS using service role key
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase service role credentials")
  return createBrowserClient(url, key)
}

// Verify the caller is actually the admin
async function requireAdmin() {
  const supabase = await createClient()
  // Try getSession first (reads cookie, no API call), then fallback
  let user = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    user = session?.user ?? null
  } catch { /* fallback below */ }
  if (!user) {
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user ?? null
    } catch { /* ignore */ }
  }
  if (!user) throw new Error("Not authenticated")
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email !== adminEmail) throw new Error("Not admin")
  return adminClient()
}

// ── PRODUCTS ──

export async function getProducts() {
  const db = adminClient()
  const { data, error } = await db
    .from("products")
    .select("*, product_variants(*)")
    .order("sort_order", { ascending: true })
  if (error) throw new Error(error.message)
  return data || []
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  const db = await requireAdmin()
  const { error } = await db
    .from("products")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/products")
  revalidatePath("/products")
  revalidatePath("/")
}

export async function deleteProduct(id: string) {
  const db = await requireAdmin()
  await db.from("product_variants").delete().eq("product_id", id)
  const { error } = await db.from("products").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/products")
  revalidatePath("/products")
  revalidatePath("/")
}

export async function createProduct(data: Record<string, unknown>) {
  const db = await requireAdmin()
  const { error } = await db.from("products").insert(data)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/products")
  revalidatePath("/products")
  revalidatePath("/")
}

// ── VARIANTS ──

export async function updateVariant(id: string, data: Record<string, unknown>) {
  const db = await requireAdmin()
  const { error } = await db.from("product_variants").update(data).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/products")
  revalidatePath("/products")
}

export async function deleteVariant(id: string) {
  const db = await requireAdmin()
  const { error } = await db.from("product_variants").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/products")
  revalidatePath("/products")
}

export async function createVariant(data: Record<string, unknown>) {
  const db = await requireAdmin()
  const { error } = await db.from("product_variants").insert(data)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/products")
  revalidatePath("/products")
}

// ── REVIEWS ──

export async function getReviews() {
  const db = adminClient()
  const { data, error, count } = await db
    .from("reviews")
    .select("*, products(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(4000)
  if (error) throw new Error(error.message)
  return { reviews: data || [], totalCount: count ?? (data?.length || 0) }
}

export async function getReviewCount() {
  const db = adminClient()
  const { count, error } = await db
    .from("reviews")
    .select("*", { count: "exact", head: true })
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function updateReview(id: number, data: Record<string, unknown>) {
  const db = await requireAdmin()
  const { error } = await db.from("reviews").update(data).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/reviews")
  revalidatePath("/reviews")
}

export async function deleteReview(id: number) {
  const db = await requireAdmin()
  const { error } = await db.from("reviews").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/reviews")
  revalidatePath("/reviews")
}

export async function createReview(data: Record<string, unknown>) {
  const db = await requireAdmin()
  const { error } = await db.from("reviews").insert(data)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/reviews")
  revalidatePath("/reviews")
}

export async function bulkCreateReviews(reviews: Array<Record<string, unknown>>) {
  const db = await requireAdmin()

  // Fetch all valid product IDs from the DB to validate foreign keys
  const { data: products } = await db.from("products").select("id, name")
  const validIds = new Set((products || []).map((p: { id: string }) => p.id))
  const nameToId: Record<string, string> = {}
  for (const p of products || []) {
    const prod = p as { id: string; name: string }
    nameToId[prod.name.toLowerCase()] = prod.id
    // Also map slug form
    nameToId[prod.name.toLowerCase().replace(/\s+/g, "-")] = prod.id
  }
  const fallbackId = products?.[0]?.id as string || "perm-spoofer"

  const mapped = reviews.map(r => {
    const row: Record<string, unknown> = {}

    // Convert days_ago to created_at timestamp
    if (r.days_ago !== undefined) {
      const d = new Date()
      d.setDate(d.getDate() - Number(r.days_ago))
      row.created_at = d.toISOString()
    } else if (r.created_at) {
      row.created_at = r.created_at
    }

    // Resolve product_id from various input formats
    let pid: string | null = null
    if (r.product_id && validIds.has(String(r.product_id))) {
      pid = String(r.product_id)
    } else if (r.product) {
      const key = String(r.product).toLowerCase()
      pid = nameToId[key] || nameToId[key.replace(/\s+/g, "-")] || null
    } else if (r.product_id) {
      const key = String(r.product_id).toLowerCase()
      pid = nameToId[key] || (validIds.has(String(r.product_id)) ? String(r.product_id) : null)
    }
    row.product_id = pid || fallbackId

    // Copy over standard fields
    if (r.text !== undefined) row.text = r.text
    if (r.rating !== undefined) row.rating = r.rating
    if (r.username !== undefined) row.username = r.username
    if (r.email !== undefined) row.email = r.email
    if (r.is_auto !== undefined) row.is_auto = r.is_auto
    if (r.time_label !== undefined) row.time_label = r.time_label
    if (r.team_response !== undefined) row.team_response = r.team_response
    if (r.refunded !== undefined) row.refunded = r.refunded
    // Always set verified and helpful defaults so RLS public_read policy works
    row.verified = r.verified !== undefined ? r.verified : true
    row.helpful = r.helpful !== undefined ? r.helpful : 0
    return row
  })

  for (let i = 0; i < mapped.length; i += 500) {
    const batch = mapped.slice(i, i + 500)
    const { error } = await db.from("reviews").insert(batch)
    if (error) throw new Error(error.message)
  }
  revalidatePath("/admin/reviews")
  revalidatePath("/reviews")
}

// ── ORDERS ──

export async function getOrders() {
  const db = adminClient()
  const { data, error } = await db
    .from("orders")
    .select("*, order_items(*, product_variants(*, products(*)))")
    .order("created_at", { ascending: false })
    .limit(100)
  if (error) throw new Error(error.message)
  return data || []
}

export async function updateOrderStatus(id: string, status: string) {
  const db = await requireAdmin()
  
  // Get order details first
  const { data: order } = await db
    .from("orders")
    .select("*, order_items(*, product_variants(*, products(*)))")
    .eq("id", id)
    .single()

  const { error } = await db
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)

  // Send license delivery email when confirming an order
  if (status === "confirmed" && order?.user_email) {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
      const productName = order.order_items?.[0]?.product_variants?.products?.name ?? "Your product"
      await fetch(`${siteUrl}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "license_delivery",
          to: order.user_email,
          data: {
            orderId: order.order_display_id ?? id,
            productName,
            licenseKey: order.license_key ?? "",
            downloadLink: `${siteUrl}/downloads/${order.order_display_id ?? id}`,
          },
        }),
      })
    } catch { /* email failure shouldn't block status update */ }
  }

  revalidatePath("/admin/orders")
  revalidatePath("/admin")
}

export async function deleteOrder(id: string) {
  const db = await requireAdmin()
  await db.from("order_items").delete().eq("order_id", id)
  const { error } = await db.from("orders").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/orders")
  revalidatePath("/admin")
}

// ── USERS ──

export async function getUsers() {
  const db = adminClient()
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

export async function updateUserAdmin(userId: string, isAdmin: boolean) {
  const db = await requireAdmin()
  const { error } = await db.from("profiles").update({ is_admin: isAdmin }).eq("id", userId)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/users")
}

export async function deleteUser(userId: string) {
  const db = await requireAdmin()
  const { error } = await db.from("profiles").delete().eq("id", userId)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/users")
}

// ── COUPONS ──

export async function getCoupons() {
  const db = adminClient()
  const { data, error } = await db
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) return []
  return data || []
}

export async function createCoupon(data: {
  code: string
  percent: number
  max_uses?: number | null
  expires_at?: string | null
}) {
  const db = await requireAdmin()
  const { error } = await db.from("coupons").insert({
    code: data.code.toUpperCase(),
    percent: data.percent,
    max_uses: data.max_uses || null,
    expires_at: data.expires_at || null,
    active: true,
    uses: 0,
  })
  if (error) throw new Error(error.message)
  revalidatePath("/admin/coupons")
}

export async function deleteCoupon(id: string) {
  const db = await requireAdmin()
  const { error } = await db.from("coupons").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/coupons")
}

export async function toggleCoupon(id: string, active: boolean) {
  const db = await requireAdmin()
  const { error } = await db
    .from("coupons")
    .update({ active })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/coupons")
}

// ── SETTINGS ──

export async function getSettings() {
  const db = adminClient()
  const { data, error } = await db.from("site_settings").select("*")
  if (error) throw new Error(error.message)
  const settings: Record<string, unknown> = {}
  for (const row of data || []) {
    try { settings[row.key] = JSON.parse(row.value) } catch { settings[row.key] = row.value }
  }
  return settings
}

export async function updateSetting(key: string, value: unknown) {
  // Use adminClient directly -- the admin page itself is already route-protected
  const db = adminClient()
  const { error } = await db
    .from("site_settings")
    .upsert({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
  revalidatePath("/admin/settings")
  revalidatePath("/reviews")
  revalidatePath("/")
}
