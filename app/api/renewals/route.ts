import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user?.email) return NextResponse.json({ reminders: [] })

  const { data, error } = await db
    .from("renewal_reminders")
    .select("id, product_id, variant_id, variant_name, duration_days, reminder_at, sent_at, cancelled_at, created_at")
    .eq("user_email", user.email)
    .is("cancelled_at", null)
    .order("reminder_at", { ascending: true })

  if (error) return NextResponse.json({ reminders: [], error: error.message }, { status: 500 })
  return NextResponse.json({ reminders: data ?? [] })
}

export async function DELETE(request: NextRequest) {
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const { error } = await db
    .from("renewal_reminders")
    .update({ cancelled_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_email", user.email)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
