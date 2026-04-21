import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

import { notifyOrderStatus } from "@/lib/telegram/notify"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const orderId = searchParams.get("id")
  const secret = searchParams.get("secret")
  
  // Simple secret check
  const adminSecret = process.env.ADMIN_SECRET || "lethal"
  if (secret !== adminSecret) {
    return new NextResponse(renderHtml("Access Denied", "Invalid authorization.", "error"), {
      headers: { "Content-Type": "text/html" },
      status: 401,
    })
  }
  
  if (!orderId) {
    return new NextResponse(renderHtml("Error", "Order ID is required.", "error"), {
      headers: { "Content-Type": "text/html" },
      status: 400,
    })
  }
  
  try {
    const supabase = await createClient()
    
    // Get order details
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*, order_items(*, product_variants(*, products(*)))")
      .eq("order_display_id", orderId)
      .single()
    
    if (fetchError || !order) {
      return new NextResponse(renderHtml("Error", `Order ${orderId} not found.`, "error"), {
        headers: { "Content-Type": "text/html" },
        status: 404,
      })
    }
    
    // Update order status to confirmed
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "confirmed" })
      .eq("id", order.id)
    
    if (updateError) {
      return new NextResponse(renderHtml("Error", "Failed to update order status.", "error"), {
        headers: { "Content-Type": "text/html" },
        status: 500,
      })
    }
    
    // Send license delivery email
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lethalsolutions.vercel.app"
      
      // Get first item for license key (in real app, generate proper keys)
      const firstItem = order.order_items?.[0]
      const productName = firstItem?.product_variants?.products?.name || "Product"
      
      await fetch(`${siteUrl}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "license_delivery",
          to: order.user_email,
          data: {
            orderId: order.order_display_id,
            productName,
            licenseKey: generateLicenseKey(),
            downloadLink: `${siteUrl}/downloads/${order.order_display_id}`,
            instructions: "1. Download the loader\n2. Run as Administrator\n3. Enter your license key\n4. Enjoy!",
          },
        }),
      })
    } catch (emailError) {
      console.error("[v0] Failed to send license email:", emailError)
    }
    
    // Send Discord notification about approval
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Lethal Orders",
            embeds: [{
              title: "✅ Order Approved",
              description: `Order \`${orderId}\` has been approved and license delivered.`,
              color: 0x22c55e,
              fields: [
                { name: "Email", value: order.user_email || "N/A", inline: true },
                { name: "Total", value: `£${(order.total_pence / 100).toFixed(2)}`, inline: true },
              ],
              timestamp: new Date().toISOString(),
            }],
          }),
        })
      }
    } catch (discordError) {
      console.error("[v0] Failed to send Discord notification:", discordError)
    }

    // Notify Telegram admin chat
    notifyOrderStatus({
      orderId: order.order_display_id || orderId,
      email: order.user_email || undefined,
      newStatus: "confirmed",
      total: typeof order.total_pence === "number" ? order.total_pence / 100 : undefined,
    }).catch((e) => console.error("[telegram/notify] order status failed:", e))

    return new NextResponse(
      renderHtml("Order Approved!", `Order ${orderId} has been approved. License email sent to ${order.user_email}.`, "success"),
      { headers: { "Content-Type": "text/html" } }
    )
    
  } catch (error) {
    console.error("[v0] Order approve error:", error)
    return new NextResponse(renderHtml("Error", "Something went wrong.", "error"), {
      headers: { "Content-Type": "text/html" },
      status: 500,
    })
  }
}

function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const segments = 4
  const segmentLength = 5
  const parts: string[] = []
  
  for (let i = 0; i < segments; i++) {
    let segment = ""
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    parts.push(segment)
  }
  
  return parts.join("-")
}

function renderHtml(title: string, message: string, type: "success" | "error"): string {
  const bgColor = type === "success" ? "#22c55e" : "#ef4444"
  const icon = type === "success" ? "✅" : "❌"
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${title} - Lethal Solutions</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #050505;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #fff;
    }
    .card {
      background: #0a0a0a;
      border: 1px solid #222;
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      max-width: 400px;
      margin: 20px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 12px;
      color: ${bgColor};
    }
    p {
      color: #888;
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      margin-top: 24px;
      padding: 12px 24px;
      background: #f97316;
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
    }
    .btn:hover {
      background: #CC5500;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/admin/orders" class="btn">Go to Admin Panel</a>
  </div>
</body>
</html>
  `
}
