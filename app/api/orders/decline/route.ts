import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const orderId = searchParams.get("id")
  const secret = searchParams.get("secret")
  
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
      .select("*")
      .eq("order_display_id", orderId)
      .single()
    
    if (fetchError || !order) {
      return new NextResponse(renderHtml("Error", `Order ${orderId} not found.`, "error"), {
        headers: { "Content-Type": "text/html" },
        status: 404,
      })
    }
    
    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id)
    
    if (updateError) {
      return new NextResponse(renderHtml("Error", "Failed to update order status.", "error"), {
        headers: { "Content-Type": "text/html" },
        status: 500,
      })
    }
    
    // Send cancellation email
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lethalsolutions.vercel.app"
      
      await fetch(`${siteUrl}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order_status",
          to: order.user_email,
          data: {
            orderId: order.order_display_id,
            status: "cancelled",
            message: "Your order has been cancelled. If you believe this is an error, please contact us on Discord.",
          },
        }),
      })
    } catch (emailError) {
      console.error("[v0] Failed to send cancellation email:", emailError)
    }
    
    // Send Discord notification
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Lethal Orders",
            embeds: [{
              title: "❌ Order Declined",
              description: `Order \`${orderId}\` has been declined and cancelled.`,
              color: 0xef4444,
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
    
    return new NextResponse(
      renderHtml("Order Declined", `Order ${orderId} has been cancelled. Notification sent to ${order.user_email}.`, "error"),
      { headers: { "Content-Type": "text/html" } }
    )
    
  } catch (error) {
    console.error("[v0] Order decline error:", error)
    return new NextResponse(renderHtml("Error", "Something went wrong.", "error"), {
      headers: { "Content-Type": "text/html" },
      status: 500,
    })
  }
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
