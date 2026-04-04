"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Service role client to bypass RLS for order creation (guest checkout needs this)
function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createSupabaseClient(url, key)
}

export async function createOrder(data: {
  order_id: string
  email: string
  discord: string
  payment_method: string
  total_in_pence: number
  coupon?: string
  items: Array<{
    product_variant_id: string
    quantity: number
    price_in_pence: number
  }>
  // Enhanced data for Discord
  ipAddress?: string
  country?: string
  countryCode?: string
  city?: string
  region?: string
}) {
  const userSupabase = await createClient()
  const supabase = serviceClient()

  // Get user if logged in (optional -- guest checkout allowed)
  let user = null
  try {
    const { data: d } = await userSupabase.auth.getUser()
    user = d?.user ?? null
  } catch { /* guest checkout */ }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user?.id || null,
      order_display_id: data.order_id,
      user_email: data.email,
      discord_username: data.discord || null,
      payment_method: data.payment_method,
      coupon_code: data.coupon || null,
      total_pence: data.total_in_pence,
      status: "pending",
    })
    .select("id")
    .single()

  if (orderError) throw new Error(orderError.message)

  // Insert order items
  const items = data.items.map((item) => ({
    order_id: order.id,
    product_variant_id: item.product_variant_id,
    quantity: item.quantity,
    price_pence: item.price_in_pence,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(items)
  if (itemsError) throw new Error(itemsError.message)

  // Get product names for notifications
  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, name, price_in_pence, product:products(name)")
    .in("id", data.items.map(i => i.product_variant_id))

  const variantMap = new Map(variants?.map(v => [v.id, v]) || [])

  // Send order confirmation email
  try {
    const emailItems = data.items.map(item => {
      const variant = variantMap.get(item.product_variant_id)
      return {
        name: (variant?.product as { name?: string })?.name || "Product",
        variant: variant?.name || "Standard",
        quantity: item.quantity,
        price: item.price_in_pence / 100,
      }
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || "https://lethalsolutions.vercel.app"

    const emailResponse = await fetch(`${siteUrl}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "order_confirmation",
        to: data.email,
        data: {
          orderId: data.order_id,
          items: emailItems,
          total: data.total_in_pence / 100,
          paymentMethod: data.payment_method,
        },
      }),
    })
    
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error("[v0] Email API error:", errorText)
    }
  } catch (e) {
    console.error("[v0] Email notification failed:", e)
  }

  // Send Discord webhook notification
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (webhookUrl) {
      const discordItems = data.items.map(item => {
        const variant = variantMap.get(item.product_variant_id)
        return {
          name: (variant?.product as { name?: string })?.name || "Product",
          variant: variant?.name || "Standard",
          quantity: item.quantity,
          price: item.price_in_pence / 100,
        }
      })

      const discordSiteUrl = process.env.NEXT_PUBLIC_SITE_URL 
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
        || "https://lethalsolutions.vercel.app"
      
      await fetch(`${discordSiteUrl}/api/discord-webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: data.order_id,
          email: data.email,
          discord: data.discord || undefined,
          paymentMethod: data.payment_method,
          total: data.total_in_pence / 100,
          items: discordItems,
          coupon: data.coupon,
          // Enhanced geo data
          ipAddress: data.ipAddress,
          country: data.country,
          countryCode: data.countryCode,
          city: data.city,
          region: data.region,
        }),
      })
    }
  } catch (e) {
    // Don't fail order if Discord notification fails
    console.error("[v0] Discord notification failed:", e)
  }

  return { orderId: order.id }
}
