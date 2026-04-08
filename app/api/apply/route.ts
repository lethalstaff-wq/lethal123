import { NextResponse } from "next/server"

import { notifyStaffApply } from "@/lib/telegram/notify"

export async function POST(request: Request) {
  const data = await request.json()

  if (!data.position || !data.discord || !data.age || !data.experience || !data.whyLethal) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Mirror to the Telegram admin chat.
  await notifyStaffApply({
    position: data.position,
    discord: data.discord,
    age: data.age,
    timezone: data.timezone,
    hoursPerWeek: data.hoursPerWeek,
    experience: data.experience,
    whyLethal: data.whyLethal,
    portfolio: data.portfolio,
  }).catch((err) => console.error("[apply] telegram notify failed:", err))

  // Send to Discord webhook
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || process.env.APPLY_WEBHOOK_URL
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: `📋 New Staff Application: ${data.position}`,
            color: 0xf97316,
            fields: [
              { name: "Discord", value: data.discord, inline: true },
              { name: "Age", value: String(data.age), inline: true },
              { name: "Timezone", value: data.timezone || "Not specified", inline: true },
              { name: "Hours/Week", value: data.hoursPerWeek || "Not specified", inline: true },
              { name: "Available Days", value: data.availableDays?.join(", ") || "Not specified", inline: true },
              { name: "Preferred Time", value: data.preferredTime || "Not specified", inline: true },
              { name: "Experience", value: (data.experience || "").slice(0, 1024) },
              { name: "Why Lethal?", value: (data.whyLethal || "").slice(0, 1024) },
              { name: "Portfolio", value: data.portfolio || "Not provided" },
            ],
            timestamp: new Date().toISOString(),
          }],
        }),
      })
    } catch (e) {
      console.error("Discord webhook error:", e)
    }
  }

  // Also save to Supabase if available
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) {
    try {
      const { createClient } = await import("@supabase/supabase-js")
      const db = createClient(url, key)
      await db.from("staff_applications").insert({
        discord: data.discord,
        age: data.age,
        timezone: data.timezone || "",
        experience: data.experience || "",
        languages: "",
        hours_per_week: data.hoursPerWeek || "",
        position: data.position,
        why_hire: data.whyLethal || "",
        how_found: "",
        status: "pending",
      })
    } catch (e) {
      console.error("Supabase insert error:", e)
    }
  }

  return NextResponse.json({ ok: true })
}
