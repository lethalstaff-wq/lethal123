import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

interface PendingReminder {
  id: string
  user_email: string
  discord_username: string | null
  product_id: string
  variant_id: string
  variant_name: string | null
  duration_days: number | null
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: "No DB" }, { status: 500 })

  const db = createClient(url, key)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "https://www.lethalsolutions.me"

  const { data: due, error } = await db
    .from("renewal_reminders")
    .select("id, user_email, discord_username, product_id, variant_id, variant_name, duration_days")
    .lte("reminder_at", new Date().toISOString())
    .is("sent_at", null)
    .is("cancelled_at", null)
    .limit(200)

  if (error) {
    console.error("Renewals cron query error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const reminders = (due || []) as PendingReminder[]
  let sent = 0

  for (const r of reminders) {
    const renewLink = `${siteUrl}/products/${r.product_id}?variant=${r.variant_id}&utm_source=renewal_reminder`
    try {
      await fetch(`${siteUrl}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "renewal_reminder",
          to: r.user_email,
          data: {
            productId: r.product_id,
            variantName: r.variant_name || "your license",
            durationDays: r.duration_days,
            renewLink,
          },
        }),
      })
      sent++
    } catch (e) {
      console.error("Failed to send renewal reminder", r.id, e)
      continue
    }

    await db.from("renewal_reminders").update({ sent_at: new Date().toISOString() }).eq("id", r.id)
  }

  return NextResponse.json({ found: reminders.length, sent })
}
