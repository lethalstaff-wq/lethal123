import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key")

  if (!key) {
    return NextResponse.json({ error: "License key or order ID required" }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    // Try to find by license key first
    let { data: license, error: licenseError } = await supabase
      .from("licenses")
      .select("*, order:orders(*)")
      .eq("license_key", key)
      .single()

    // Handle licenses table not existing - fall back to orders only
    if (licenseError?.code === "PGRST205") {
      // Licenses table doesn't exist, try to find order directly
      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .or(`order_display_id.eq.${key.toUpperCase()},license_key.eq.${key}`)
        .eq("status", "completed")
        .single()

      if (order) {
        // Get order items without licenses
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("*, variant:product_variants(*, product:products(*))")
          .eq("order_id", order.id)

        const products = orderItems?.map(item => ({
          id: `${item.variant?.product?.id || ""}-${item.variant?.id}`,
          name: item.variant?.product?.name || "Product",
          variant: item.variant?.name || "Standard",
          version: "1.0.0",
          size: "25 MB",
          updated: "Today",
          status: "ready",
          downloadUrl: `/api/download/${order.id}/${item.variant?.product?.id}`,
          instructions: [
            "Extract the ZIP file to a folder",
            "Run the loader as Administrator",
            "Enter your license key when prompted",
            "Launch your game and enjoy!"
          ]
        })) || []

        return NextResponse.json({
          orderId: order.id,
          displayId: order.order_display_id,
          licenseKey: order.license_key || key,
          email: order.user_email,
          products,
          expiresAt: null,
          createdAt: order.created_at
        })
      }
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // If not found by license key, try by order display ID
    if (!license) {
      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .eq("order_display_id", key.toUpperCase())
        .eq("status", "completed")
        .single()

      if (order) {
        const { data: orderLicense } = await supabase
          .from("licenses")
          .select("*")
          .eq("order_id", order.id)
          .single()

        if (orderLicense) {
          license = { ...orderLicense, order }
        }
      }
    }

    if (!license || !license.order) {
      return NextResponse.json({ error: "License not found or order not completed" }, { status: 404 })
    }

    // Get order items with product details
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("*, variant:product_variants(*, product:products(*))")
      .eq("order_id", license.order.id)

    // Get product statuses from site_settings
    const { data: statusSettings } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "product_statuses")
      .single()

    const productStatuses = statusSettings?.value || {}

    // Format products for download
    const products = orderItems?.map(item => {
      const product = item.variant?.product
      const variant = item.variant
      const productId = product?.id || ""
      const status = productStatuses[productId] || "undetected"
      
      return {
        id: `${productId}-${variant?.id}`,
        name: product?.name || "Product",
        variant: variant?.name || "Standard",
        version: "1.0.0", // Would come from actual product data
        size: "25 MB", // Would come from actual file
        updated: "Today",
        status: status === "undetected" ? "ready" : status === "updating" ? "updating" : "maintenance",
        downloadUrl: `/api/download/${license.id}/${productId}`, // Protected download URL
        instructions: [
          "Extract the ZIP file to a folder",
          "Run the loader as Administrator",
          "Enter your license key when prompted",
          "Launch your game and enjoy!"
        ]
      }
    }) || []

    return NextResponse.json({
      orderId: license.order.id,
      displayId: license.order.order_display_id,
      licenseKey: license.license_key,
      email: license.order.user_email,
      products,
      expiresAt: license.expires_at,
      createdAt: license.created_at
    })
  } catch (error) {
    console.error("[v0] Downloads API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
