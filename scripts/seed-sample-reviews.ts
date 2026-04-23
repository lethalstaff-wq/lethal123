import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

config({ path: ".env.local" })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

const SAMPLE = [
  {
    text: "bought blurred lifetime at 2am, download link hit my inbox in under a minute. running clean on valorant for 6 weeks now, 0 flags. aimbot smoothing actually feels human, not robotic.",
    rating: 5,
    product_id: "blurred",
    username: "nyx_gg",
    email: "nyx.gg@proton.me",
    time_label: "2 weeks ago",
    verified: true, is_auto: false, refunded: false, helpful: 87,
    team_response: null,
  },
  {
    text: "captain 100t arrived in 22h to the UK, pre-flashed with their EAC firmware. plugged it in, took me 8 minutes to verify everything worked. discord support walked me through the mmap check step by step at 1am. not even mad that my wife saw the package.",
    rating: 5,
    product_id: "custom-dma-firmware",
    username: "drift_x",
    email: "driftx@outlook.com",
    time_label: "1 month ago",
    verified: true, is_auto: false, refunded: false, helpful: 143,
    team_response: "Appreciate the write-up — EAC firmware batch that week ran clean, glad it landed smooth. — Kai",
  },
  {
    text: "honestly thought this was gonna be another scam. wasnt. perm spoofer fixed my 3yr warzone ban in under 5 min. already queued 40 games, still clean. will update if anything changes.",
    rating: 5,
    product_id: "perm-spoofer",
    username: "rxn",
    email: "rxn.queue@gmail.com",
    time_label: "3 days ago",
    verified: true, is_auto: false, refunded: false, helpful: 62,
    team_response: null,
  },
  {
    text: "fortnite external is solid for the price. esp is crisp, no fps drop on my 4070. only real complaint is the aim assist feels a bit snappy at default smoothing — bumped it to 0.6 and its perfect. setup guide on the site is actually useful.",
    rating: 4,
    product_id: "fortnite-external",
    username: "zk_07",
    email: "zk07@yahoo.com",
    time_label: "1 week ago",
    verified: true, is_auto: false, refunded: false, helpful: 38,
    team_response: null,
  },
  {
    text: "setup failed 4 times on my asrock mobo, kept getting hwid verification errors. support was responsive but couldnt fix it on my config. got a full refund same day, props for that. 2 stars because the software didnt work for me but customer service was actually legit.",
    rating: 2,
    product_id: "temp-spoofer",
    username: "mikez_",
    email: "mikez@icloud.com",
    time_label: "5 days ago",
    verified: true, is_auto: false, refunded: true, helpful: 24,
    team_response: "Asrock X670E boards had a known conflict with our v3.1 bootloader — patched in v3.2 last Friday. Pinged you on Discord with the rebuild if you want to try again. — Kai",
  },
]

async function main() {
  const { count: before } = await db.from("reviews").select("*", { count: "exact", head: true })
  const { data, error } = await db.from("reviews").insert(SAMPLE).select("id, rating, username")
  if (error) {
    console.error("insert failed:", error.message)
    process.exit(1)
  }
  const { count: after } = await db.from("reviews").select("*", { count: "exact", head: true })
  console.log(`Inserted ${data?.length ?? 0} reviews. Total: ${before ?? 0} → ${after ?? 0}.`)
  data?.forEach(r => console.log(`  #${r.id} · ${r.rating}★ · ${r.username}`))
}
main()
