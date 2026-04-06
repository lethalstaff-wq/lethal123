import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: "Server error" }, { status: 500 })

  const db = createClient(url, key)
  const body = await request.json()

  // Validate
  if (!body.discord || !body.age || !body.position || !body.why_hire) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const { error } = await db.from("staff_applications").insert({
    discord: body.discord,
    age: body.age,
    timezone: body.timezone || "",
    experience: body.experience || "",
    languages: body.languages || "",
    hours_per_week: body.hours_per_week || "",
    position: body.position,
    why_hire: body.why_hire,
    how_found: body.how_found || "",
    status: "pending",
  })

  if (error) {
    console.error("Staff apply error:", error)
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
