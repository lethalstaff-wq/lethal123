import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Coupon code required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single()

    // Handle table not existing or coupon not found
    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("Could not find")) {
        return NextResponse.json({ error: "Coupon system not configured" }, { status: 404 })
      }
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
    }
    
    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
    }

    // Check if expired
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 })
    }

    // Check max uses
    if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
      return NextResponse.json({ error: "Coupon has reached maximum uses" }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      percent: coupon.discount_percent
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
