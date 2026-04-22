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

  // Native seed rows can carry future-dated created_at (ramp-up schedule out to
  // Dec 2026). Hide them until their day arrives. Legacy SellAuth rows bypass
  // the filter so archive scope is always complete.
  const nowISO = new Date().toISOString()

  // Supabase caps rows per request (default 1000). Paginate with range() so the
  // UI can show every archived review.
  const PAGE = 1000
  const MAX_TOTAL = 15000
  let data: any[] = []
  let count = 0
  for (let offset = 0; offset < MAX_TOTAL; offset += PAGE) {
    let q = db
      .from("reviews")
      .select("*, products(name)", { count: "exact" })
      .or(`source.eq.sellauth_legacy,created_at.lte.${nowISO}`)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE - 1)
    if (productId) q = q.eq("product_id", productId)
    const { data: chunk, count: c, error } = await q
    if (error) {
      console.error("Reviews API error:", error.message)
      return NextResponse.json({ reviews: [], totalCount: 0 }, { status: 200 })
    }
    if (offset === 0) count = c ?? 0
    if (!chunk || chunk.length === 0) break
    data = data.concat(chunk)
    if (chunk.length < PAGE) break
  }

  const reviews = data.map((r: any) => ({
    id: r.id,
    text: r.text || "",
    rating: r.rating ?? 5,
    product: r.products?.name || "Unknown",
    product_id: r.product_id || "",
    username: r.username || "User",
    email: r.email || "",
    time_label: r.time_label || formatTimeAgo(r.created_at),
    verified: r.verified ?? true,
    is_auto: r.is_auto ?? false,
    refunded: r.refunded ?? false,
    helpful: r.helpful ?? 0,
    team_response: r.team_response || null, // legacy fallback
    created_at: r.created_at,
    source: r.source || "native",
    variant_name: r.variant_name || "",
    // Two-stage support response (new shape). Falls back to legacy team_response
    // for rows imported before migration 037.
    response_persona: r.response_persona as "ujuk" | "vsx" | null,
    response_first_reply_text: r.response_first_reply_text || r.team_response || null,
    response_first_reply_at: r.response_first_reply_at || null,
    response_update_text: r.response_update_text || null,
    response_update_at: r.response_update_at || null,
  }))

  return NextResponse.json({ reviews, totalCount: count ?? reviews.length })
}
