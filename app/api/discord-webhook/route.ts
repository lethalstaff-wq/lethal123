import { NextResponse } from "next/server"

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL
const ADMIN_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lethalsolutions.vercel.app"

interface OrderItem {
  name: string
  variant: string
  quantity: number
  price: number
}

interface OrderNotification {
  orderId: string
  email: string
  discord?: string
  discordId?: string
  paymentMethod: string
  total: number
  items: OrderItem[]
  coupon?: string
  discount?: number
  // Enhanced data
  ipAddress?: string
  country?: string
  countryCode?: string
  city?: string
  region?: string
  userAgent?: string
}

// Flag emoji from country code
function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌍"
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Simple risk analysis
function analyzeRisk(data: OrderNotification): { level: string; color: number; reasons: string[] } {
  const reasons: string[] = []
  let riskScore = 0
  
  // Check for VPN/datacenter IPs (simplified check)
  if (data.ipAddress?.startsWith("10.") || data.ipAddress?.startsWith("192.168.")) {
    reasons.push("Private IP detected")
    riskScore += 1
  }
  
  // High-value orders
  if (data.total > 200) {
    reasons.push("High-value order (>£200)")
    riskScore += 1
  }
  
  // No Discord provided
  if (!data.discord && !data.discordId) {
    reasons.push("No Discord contact provided")
    riskScore += 1
  }
  
  // Free email providers for high orders
  const freeEmails = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "mail.ru", "yandex.ru"]
  const emailDomain = data.email.split("@")[1]?.toLowerCase()
  if (data.total > 100 && freeEmails.includes(emailDomain || "")) {
    reasons.push("Free email for high-value order")
    riskScore += 1
  }

  if (riskScore === 0) {
    return { level: "Low Risk", color: 0x22c55e, reasons: ["All checks passed"] }
  } else if (riskScore <= 2) {
    return { level: "Medium Risk", color: 0xeab308, reasons }
  } else {
    return { level: "High Risk", color: 0xef4444, reasons }
  }
}

export async function POST(request: Request) {
  if (!DISCORD_WEBHOOK_URL) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  try {
    const data: OrderNotification = await request.json()
    
    // Risk analysis
    const risk = analyzeRisk(data)
    
    // Format items list
    const itemsList = data.items
      .map(item => `\`${item.quantity}x\` **${item.name}** (${item.variant}) - £${item.price.toFixed(2)}`)
      .join("\n")

    // Location string
    const locationParts = [data.city, data.region, data.country].filter(Boolean)
    const locationStr = locationParts.length > 0 
      ? `${getFlagEmoji(data.countryCode || "")} ${locationParts.join(", ")}`
      : "Unknown"

    // Discord mention if ID provided
    const discordMention = data.discordId ? `<@${data.discordId}>` : (data.discord || "Not provided")

    // Create enhanced Discord embed
    const embed = {
      title: "🛒 New Order Received",
      color: 0xf97316,
      thumbnail: {
        url: "https://i.imgur.com/AfFp7pu.png"
      },
      fields: [
        {
          name: "📋 Order ID",
          value: `\`${data.orderId}\``,
          inline: true,
        },
        {
          name: "💰 Total",
          value: `**£${data.total.toFixed(2)}**${data.discount ? ` ~~£${(data.total + data.discount).toFixed(2)}~~` : ""}`,
          inline: true,
        },
        {
          name: "💳 Payment",
          value: `\`${data.paymentMethod.toUpperCase()}\``,
          inline: true,
        },
        {
          name: "📧 Email",
          value: `\`${data.email}\``,
          inline: true,
        },
        {
          name: "🎮 Discord",
          value: discordMention,
          inline: true,
        },
        ...(data.coupon ? [{
          name: "🎟️ Coupon",
          value: `\`${data.coupon}\``,
          inline: true,
        }] : []),
        {
          name: "📍 Location",
          value: locationStr,
          inline: true,
        },
        ...(data.ipAddress ? [{
          name: "🌐 IP Address",
          value: `\`${data.ipAddress}\``,
          inline: true,
        }] : []),
        {
          name: "⚠️ Risk Analysis",
          value: `**${risk.level}**\n${risk.reasons.map(r => `• ${r}`).join("\n")}`,
          inline: false,
        },
        {
          name: "📦 Items",
          value: itemsList || "No items",
          inline: false,
        },
      ],
      footer: {
        text: `Lethal Solutions • ${data.paymentMethod.toUpperCase()} Payment`,
        icon_url: "https://i.imgur.com/AfFp7pu.png",
      },
      timestamp: new Date().toISOString(),
    }

    // Action buttons - these link to admin panel and order management API
    const components = [
      {
        type: 1, // Action row
        components: [
          {
            type: 2, // Button
            style: 3, // Success (green)
            label: "Approve Order",
            emoji: { name: "✅" },
            custom_id: `approve_${data.orderId}`,
          },
          {
            type: 2,
            style: 4, // Danger (red)
            label: "Decline",
            emoji: { name: "❌" },
            custom_id: `decline_${data.orderId}`,
          },
          {
            type: 2,
            style: 5, // Link
            label: "View in Admin",
            emoji: { name: "🔗" },
            url: `${ADMIN_BASE_URL}/admin/orders?search=${data.orderId}`,
          },
        ],
      },
    ]

    // Send to Discord with webhook
    // Note: Interactive buttons require a Discord Bot, not just a webhook
    // For webhooks, we use link buttons only
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Lethal Orders",
        avatar_url: "https://i.imgur.com/AfFp7pu.png",
        embeds: [embed],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 5, // Link
                label: "✅ Approve Order",
                url: `${ADMIN_BASE_URL}/api/orders/approve?id=${data.orderId}&secret=${process.env.ADMIN_SECRET || "lethal"}`,
              },
              {
                type: 2,
                style: 5, // Link
                label: "❌ Decline Order",
                url: `${ADMIN_BASE_URL}/api/orders/decline?id=${data.orderId}&secret=${process.env.ADMIN_SECRET || "lethal"}`,
              },
              {
                type: 2,
                style: 5, // Link
                label: "🔗 View in Admin",
                url: `${ADMIN_BASE_URL}/admin/orders?search=${data.orderId}`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Discord webhook failed:", errorText)
      return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Discord webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
