import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

import { notifyCoupon } from "@/lib/telegram/notify"

export async function POST(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined
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
      notifyCoupon({ code, valid: false, reason: "not found", ipAddress }).catch(() => {})
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
    }

    if (!coupon) {
      notifyCoupon({ code, valid: false, reason: "not found", ipAddress }).catch(() => {})
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
    }

    // Check if expired
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      notifyCoupon({ code, valid: false, reason: "expired", ipAddress }).catch(() => {})
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 })
    }

    // Check max uses
    if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
      notifyCoupon({ code, valid: false, reason: "max uses reached", ipAddress }).catch(() => {})
      return NextResponse.json({ error: "Coupon has reached maximum uses" }, { status: 400 })
    }

    notifyCoupon({ code: coupon.code, valid: true, ipAddress }).catch(() => {})
    return NextResponse.json({
      valid: true,
      code: coupon.code,
      percent: coupon.discount_percent
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
