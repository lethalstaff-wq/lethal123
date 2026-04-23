import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getTotalReviewCount } from "@/lib/review-counts"

// Lightweight HEAD-only count query so Home/hero/testimonials can sync with
// the live /api/reviews totalCount without shipping all rows.
export async function GET() {
  const fallback = getTotalReviewCount()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.json({ totalCount: fallback })

  try {
    const db = createClient(url, key)
    // Match /api/reviews filter exactly so both endpoints agree row-for-row:
    // include all sellauth_legacy rows + native rows whose ramp-up date has
    // arrived.
    const nowISO = new Date().toISOString()
    const { count, error } = await db
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .or(`source.eq.sellauth_legacy,created_at.lte.${nowISO}`)
    if (error) return NextResponse.json({ totalCount: fallback })
    return NextResponse.json({ totalCount: count ?? fallback })
  } catch {
    return NextResponse.json({ totalCount: fallback })
  }
}
