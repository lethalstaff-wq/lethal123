import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Try to fetch from product_statuses table
    const { data, error } = await supabase
      .from("product_statuses")
      .select("*")
    
    // If error (including table not found), return empty array
    if (error) {
      console.log("[v0] Statuses API - table error:", error.message)
      return NextResponse.json({ statuses: [] })
    }
    
    return NextResponse.json({ statuses: data || [] })
  } catch (err) {
    // Any network or other error - return empty statuses
    console.log("[v0] Statuses API - catch error:", err)
    return NextResponse.json({ statuses: [] })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { data: userData } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single()
    
    if (!userData?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const body = await request.json()
    const { statuses } = body
    
    if (!statuses || !Array.isArray(statuses)) {
      return NextResponse.json({ error: "Invalid statuses data" }, { status: 400 })
    }
    
    // Try to upsert all statuses
    for (const status of statuses) {
      const { error } = await supabase
        .from("product_statuses")
        .upsert({
          product_id: status.product_id,
          status: status.status,
          updated_at: new Date().toISOString()
        }, { onConflict: "product_id" })
      
      if (error) {
        // Check if table doesn't exist
        if (error.code === "PGRST205" || error.message.includes("Could not find")) {
          return NextResponse.json({ 
            error: "Database table not found. Please run the migration: scripts/005-admin-tables.sql",
            needsMigration: true 
          }, { status: 400 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.log("[v0] Statuses POST - error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
