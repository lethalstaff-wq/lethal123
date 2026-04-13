import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Lazy init so the module can be imported at build time ("collect page data"
// phase) even when Supabase env vars aren't available in the build environment.
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
    }
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get("order_id")
    const email = searchParams.get("email")

    if (!orderId && !email) {
      return NextResponse.json({ error: "Order ID or email required" }, { status: 400 })
    }

    let query = supabase
      .from("orders")
      .select(`
        id,
        order_display_id,
        status,
        created_at,
        updated_at,
        user_email,
        discord_username,
        payment_method,
        total_pence,
        coupon_code,
        order_items (
          id,
          quantity,
          price_pence,
          product_variant_id
        )
      `)
      .order("created_at", { ascending: false })

    if (orderId) {
      // Search by order display ID
      query = query.ilike("order_display_id", `%${orderId}%`)
    } else if (email) {
      // Search by email
      query = query.eq("user_email", email.toLowerCase())
    }

    const { data: orders, error } = await query.limit(10)

    if (error) {
      console.error("[v0] Track order error:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "No orders found" }, { status: 404 })
    }

    // Get variant details for items
    const allVariantIds = orders.flatMap(o => 
      (o.order_items || []).map((i: { product_variant_id: string }) => i.product_variant_id)
    )
    
    const { data: variants } = await supabase
      .from("product_variants")
      .select("id, name, product:products(name)")
      .in("id", allVariantIds)

    const variantMap = new Map(variants?.map(v => [v.id, v]) || [])

    // Fetch real license keys (track is public — we only return a masked form)
    const { data: licenses } = await supabase
      .from("licenses")
      .select("order_id, license_key")
      .in("order_id", orders.map(o => o.id))

    const licenseMap = new Map(
      (licenses || []).map((l: { order_id: string; license_key: string }) => [l.order_id, l.license_key])
    )

    // Format orders for response
    const formattedOrders = orders.map(order => {
      const realKey = licenseMap.get(order.id)
      return {
        id: order.id,
        display_id: order.order_display_id,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        email: order.user_email,
        discord: order.discord_username,
        payment_method: order.payment_method,
        total: order.total_pence,
        items: (order.order_items || []).map((item: { product_variant_id: string; quantity: number; price_pence: number }) => {
          const variant = variantMap.get(item.product_variant_id)
          return {
            name: (variant?.product as { name?: string })?.name || "Product",
            variant: variant?.name || "Standard",
            quantity: item.quantity,
            price: item.price_pence,
          }
        }),
        // Public endpoint — show only a stable masked license. Full key lives in /profile and /download/[orderId].
        license_key: order.status === "completed" && realKey ? maskLicense(realKey) : undefined,
      }
    })

    return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error("[v0] Track order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Stably mask a license key — preserves prefix and last group only.
// "LS-ABCD-EFGH-IJKL-MNOP" → "LS-****-****-****-MNOP"
function maskLicense(key: string): string {
  if (!key) return ""
  const parts = key.split("-")
  if (parts.length >= 3) {
    const head = parts[0]
    const tail = parts[parts.length - 1]
    const middle = parts.slice(1, -1).map(() => "****").join("-")
    return `${head}-${middle}-${tail}`
  }
  if (key.length <= 6) return "****"
  return key.slice(0, 3) + "****" + key.slice(-4)
}
