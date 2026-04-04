import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Try getSession first (reads cookie, no API call), then fallback to getUser
  let user = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    user = session?.user ?? null
  } catch {
    // Fallback: cookie may be stale
  }

  if (!user) {
    // One more try with API call
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user ?? null
    } catch { /* ignore */ }
  }

  if (!user) {
    redirect("/login")
  }

  // Fetch orders with items and product variant names
  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(product_variant_id, price_pence, quantity, variant:product_variants(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const userOrders = orders || []
  
  // Calculate total spent correctly (handle both total_pence and total)
  const totalSpent = userOrders.reduce((sum, order) => {
    const amount = order.total_pence ? order.total_pence / 100 : (order.total ?? 0)
    return sum + amount
  }, 0)

  // Active licenses - check multiple status types
  const activeStatuses = ["completed", "confirmed", "paid", "approved"]
  const activeLicenses = userOrders.filter(o => activeStatuses.includes(o.status))

  // Member tier based on order count
  const orderCount = userOrders.length
  let memberTier = { name: "New", color: "text-muted-foreground", bg: "bg-muted" }
  if (orderCount >= 6) {
    memberTier = { name: "VIP", color: "text-amber-500", bg: "bg-amber-500/10" }
  } else if (orderCount >= 3) {
    memberTier = { name: "Loyal", color: "text-purple-500", bg: "bg-purple-500/10" }
  } else if (orderCount >= 1) {
    memberTier = { name: "Member", color: "text-blue-500", bg: "bg-blue-500/10" }
  }

  // Extract username from email
  const username = user.email?.split("@")[0] || "User"
  const memberSince = new Date(user.created_at).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  })

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <DashboardClient 
        user={{
          id: user.id,
          email: user.email || "",
          created_at: user.created_at
        }}
        orders={userOrders}
        totalSpent={totalSpent}
        activeLicenses={activeLicenses}
        memberTier={memberTier}
        username={username}
        memberSince={memberSince}
      />
      <Footer />
    </main>
  )
}
