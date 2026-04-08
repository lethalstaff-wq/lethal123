import { NextResponse } from "next/server"

import { notifyContact } from "@/lib/telegram/notify"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, discord, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Mirror to the Telegram admin chat.
    await notifyContact({ name, email, discord, message }).catch((err) =>
      console.error("[contact] telegram notify failed:", err),
    )

    // Send to Discord webhook if configured
    const webhookUrl = process.env.DISCORD_CONTACT_WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "New Contact Form Submission",
            color: 0xf97316,
            fields: [
              { name: "Name", value: name, inline: true },
              { name: "Email", value: email, inline: true },
              { name: "Discord", value: discord || "Not provided", inline: true },
              { name: "Message", value: message },
            ],
            timestamp: new Date().toISOString(),
          }]
        })
      })
    }

    return NextResponse.json({ success: true, message: "Message received" }, { status: 200 })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
