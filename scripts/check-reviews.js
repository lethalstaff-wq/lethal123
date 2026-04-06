const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: ".env.local" })
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  const { count } = await db.from("reviews").select("*", { count: "exact", head: true })
  const { count: ac } = await db.from("reviews").select("*", { count: "exact", head: true }).eq("is_auto", true)
  const { data: oldest } = await db.from("reviews").select("created_at,text,username").order("created_at", { ascending: true }).limit(3)
  const { data: newest } = await db.from("reviews").select("created_at,text,username,is_auto").order("created_at", { ascending: false }).limit(3)
  console.log("Total:", count)
  console.log("Auto (is_auto=true):", ac)
  console.log("Oldest 3:", JSON.stringify(oldest, null, 2))
  console.log("Newest 3:", JSON.stringify(newest, null, 2))
}
main().catch(e => console.error(e))
