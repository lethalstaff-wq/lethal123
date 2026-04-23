import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

config({ path: ".env.local" })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

async function main() {
  const { count: before } = await db.from("reviews").select("*", { count: "exact", head: true })
  const { error } = await db.from("reviews").delete().gte("id", 0)
  if (error) {
    console.error("delete failed:", error.message)
    process.exit(1)
  }
  const { count: after } = await db.from("reviews").select("*", { count: "exact", head: true })
  console.log(`Deleted ${before ?? 0} reviews. Remaining: ${after ?? 0}.`)
}
main()
