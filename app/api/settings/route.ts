import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.from("site_settings").select("key, value")
    
    // Handle table not existing
    if (error) {
      return NextResponse.json({})
    }
    
    const settings: Record<string, unknown> = {}
    for (const row of data || []) {
      try {
        settings[row.key] = typeof row.value === "string" ? JSON.parse(row.value) : row.value
      } catch {
        settings[row.key] = row.value
      }
    }

    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({})
  }
}
