import { AdminShell } from "@/components/admin-shell"
import { AdminDashboardClient } from "@/components/admin-dashboard"
import { createClient as createServiceClient } from "@supabase/supabase-js"

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase service role credentials")
  return createServiceClient(url, key)
}

export default async function AdminPage() {
  let stats = {
    totalProducts: 0, totalVariants: 0, totalReviews: 0,
    totalUsers: 0, totalOrders: 0, pendingOrders: 0,
    confirmedOrders: 0, cancelledOrders: 0,
  }
  let recentOrders: any[] = []
  let recentUsers: any[] = []

  try {
    const db = adminClient()
    const [productsRes, variantsRes, reviewsRes, usersRes, ordersRes, recentOrdersRes, recentUsersRes] = await Promise.all([
      db.from("products").select("id", { count: "exact", head: true }),
      db.from("product_variants").select("id", { count: "exact", head: true }),
      db.from("reviews").select("id", { count: "exact", head: true }),
      db.from("profiles").select("id", { count: "exact", head: true }),
      db.from("orders").select("*"),
      db.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
      db.from("profiles").select("*").order("created_at", { ascending: false }).limit(8),
    ])

    const allOrders = ordersRes.data || []
    stats = {
      totalProducts: productsRes.count || 0,
      totalVariants: variantsRes.count || 0,
      totalReviews: reviewsRes.count || 0,
      totalUsers: usersRes.count || 0,
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === "pending").length,
      confirmedOrders: allOrders.filter(o => o.status === "confirmed" || o.status === "paid").length,
      cancelledOrders: allOrders.filter(o => o.status === "cancelled").length,
    }
    recentOrders = recentOrdersRes.data || []
    recentUsers = recentUsersRes.data || []
  } catch (e) {
    console.error("Admin dashboard error:", e)
  }

  return (
    <AdminShell>
      <AdminDashboardClient
        stats={stats}
        recentOrders={recentOrders}
        recentUsers={recentUsers}
      />
    </AdminShell>
  )
}
