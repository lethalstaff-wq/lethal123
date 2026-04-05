import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "recently"
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return "today"
  if (days === 1) return "1 day ago"
  if (days < 30) return `${days} days ago`
  if (days < 60) return "1 month ago"
  return `${Math.floor(days / 30)} months ago`
}

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.json({ reviews: [], totalCount: 0 }, { status: 200 })
  }

  const { searchParams } = new URL(request.url)
  const productId = searchParams.get("product")

  const db = createClient(url, key)

  let query = db
    .from("reviews")
    .select("*, products(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(4000)

  if (productId) {
    query = query.eq("product_id", productId)
  }

  const { data, count, error } = await query

  if (error) {
    console.error("Reviews API error:", error.message)
    return NextResponse.json({ reviews: [], totalCount: 0 }, { status: 200 })
  }

  const reviews = (data || []).map((r: any) => ({
    id: r.id,
    text: r.text || "",
    rating: r.rating ?? 5,
    product: r.products?.name || "Unknown",
    product_id: r.product_id || "",
    username: r.username || "User",
    email: r.email || "user@email.com",
    time_label: r.time_label || formatTimeAgo(r.created_at),
    verified: r.verified ?? true,
    is_auto: r.is_auto ?? false,
    refunded: r.refunded ?? false,
    helpful: r.helpful ?? 0,
    team_response: r.team_response || null,
    created_at: r.created_at,
  }))

  return NextResponse.json({ reviews, totalCount: count ?? reviews.length })
}
