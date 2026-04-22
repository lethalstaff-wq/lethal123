import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const PRODUCT_WEIGHTS = [
  { id: "perm-spoofer", weight: 0.18 },
  { id: "temp-spoofer", weight: 0.22 },
  { id: "fortnite-external", weight: 0.25 },
  { id: "blurred", weight: 0.12 },
  { id: "streck", weight: 0.08 },
  { id: "custom-dma-firmware", weight: 0.07 },
  { id: "dma-basic", weight: 0.04 },
  { id: "dma-advanced", weight: 0.025 },
  { id: "dma-elite", weight: 0.015 },
]

const USERNAMES = [
  "rxn", "vex", "zk", "drift", "phantom", "cipher", "hex", "apex_g", "stryke",
  "kr4ken", "nyx", "blitz", "recon", "frost", "venom", "wraith", "jinx", "onyx",
  "pulse", "zero_x", "gh0st", "reaper", "cl0ud", "shadow", "nova", "storm",
  "flare", "raze", "titan", "spectre", "omega", "havoc", "mav", "razor", "bolt",
  "marcus_t", "jake2001", "connor_b", "dylan_m", "logan_r", "tyler_k", "ethan_w",
  "noah_j", "aiden_s", "mason_p", "caleb_h", "owen_d", "hunter_l", "luke_f",
  "lars_dk", "sven_se", "felix_de", "pierre_fr", "luca_it", "tomek_pl",
  "gh0st_99", "reaper_7", "cl0ud_9", "dark_kn1ght", "snip3r_x", "t0xic_42",
  "xeno", "flux", "glitch", "codec", "proxy", "vector", "matrix", "delta",
  "sigma", "alpha", "bravo", "echo", "foxtrot", "kilo", "lima",
]

const DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "proton.me", "icloud.com"]

const MANUAL_TEXTS: Record<string, string[]> = {
  "perm-spoofer": [
    "fixed my hwid ban quick, was about to buy new hardware lmao",
    "permanent fix works perfectly, been weeks no issues",
    "actually permanent unlike other ones, this stays through updates",
    "support helped set it up fast, ban gone for good",
    "changed all hw ids, fully clean now, goated product",
    "kernel level spoofing is the way, works on amd and intel",
  ],
  "temp-spoofer": [
    "perfect for alt accounts, clean session every boot",
    "cheapest working spoofer, 15 day is perfect for me",
    "session based is smart, no permanent system changes",
    "works with all anticheats i play, easy setup",
    "great budget option, does exactly what it needs to",
    "been renewing monthly, never had a single issue",
  ],
  "fortnite-external": [
    "esp is insane zero fps drop, streaming ranked nobody noticed",
    "no dma needed just runs on my pc smooth af",
    "stream proof overlay is clutch for content creation",
    "aimbot looks natural, nobody suspects anything fr",
    "best fn cheat ive tried and ive used a few others",
    "zero fps impact they werent kidding, same performance",
  ],
  "blurred": [
    "best dma cheat on the market, months undetected",
    "web radar on phone is actually game changing for squads",
    "auto updater means never worrying about game patches",
    "supports multiple games, insane value for the price",
    "stream proof overlay, playing ranked with zero worries",
  ],
  "streck": [
    "perfect budget dma cheat, does everything i need",
    "great starter dma cheat, simple and effective",
    "way better than expected for the price honestly",
    "esp and aimbot work great for budget option",
  ],
  "custom-dma-firmware": [
    "custom build means no shared detections, worth it",
    "delivered fast, works flawlessly with my card",
    "unique signature per build is real security",
  ],
  "dma-basic": [
    "perfect starter bundle, everything included",
    "great value for beginners getting into dma",
  ],
  "dma-advanced": [
    "most popular for a reason, works out the box",
    "advanced bundle is the sweet spot, perfect value",
  ],
  "dma-elite": [
    "no compromises, this bundle has everything",
    "expensive but worth every penny, premium quality",
  ],
}

const AUTO_TEXTS = [
  "works as described, no issues",
  "product works perfectly 👍",
  "satisfied with purchase",
  "fast delivery, works immediately",
  "everything working fine so far",
  "good product, does what it says",
  "no complaints, works well",
  "delivered fast and works great",
  "happy with the purchase",
  "exactly what i expected",
  "working perfectly after 1 week",
  "solid product, recommend",
  "quick delivery and easy setup",
  "does exactly what it promises",
  "great value for the money",
]

const TEAM_RESPONSES = [
  "Thank you for the feedback! Glad everything is working smoothly. 🙏",
  "Appreciate the review! Our team is always here if you need anything.",
  "Thanks for taking the time to review! Enjoy your product. 🎮",
  "Great to hear! Don't hesitate to reach out if you need help.",
]

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: "No DB" }, { status: 500 })

  const db = createClient(url, key)

  // Check how many reviews already added today
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const { count: todayCount } = await db
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayStart.toISOString())

  if ((todayCount || 0) >= 20) {
    return NextResponse.json({ message: "Already added today", count: todayCount })
  }

  // ~15 orders/day, slight growth over time, capped at 25/day
  const weeksSinceLaunch = Math.floor((Date.now() - new Date("2026-01-01").getTime()) / (7 * 864e5))
  const ordersToday = Math.min(15 + Math.floor(weeksSinceLaunch / 4), 25)
  const reviewsToAdd = Math.floor(ordersToday * 0.5) // 50% write review

  const reviews = []
  const now = new Date()

  for (let i = 0; i < reviewsToAdd; i++) {
    // Pick product
    const r = Math.random()
    let cum = 0
    let productId = PRODUCT_WEIGHTS[0].id
    for (const pw of PRODUCT_WEIGHTS) {
      cum += pw.weight
      if (r <= cum) { productId = pw.id; break }
    }

    // 60% manual, 40% auto
    const isAuto = Math.random() < 0.40

    let text: string
    let rating: number
    const createdAt = new Date(now)

    if (isAuto) {
      rating = 5
      text = AUTO_TEXTS[Math.floor(Math.random() * AUTO_TEXTS.length)]
      // Auto reviews appear 7 days later
      createdAt.setDate(createdAt.getDate() + 7)
    } else {
      const rr = Math.random()
      rating = rr < 0.80 ? 5 : rr < 0.90 ? 4 : rr < 0.96 ? 3 : rr < 0.98 ? 2 : 1
      const manualPool = MANUAL_TEXTS[productId] || MANUAL_TEXTS["perm-spoofer"]
      text = rating >= 4 ? manualPool[Math.floor(Math.random() * manualPool.length)]
        : AUTO_TEXTS[Math.floor(Math.random() * AUTO_TEXTS.length)]
      // Manual reviews appear 0-3 days later
      createdAt.setDate(createdAt.getDate() + Math.floor(Math.random() * 4))
    }

    // Random time during the day
    createdAt.setUTCHours(8 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60))

    const username = USERNAMES[Math.floor(Math.random() * USERNAMES.length)]
    const email = `${username}@${DOMAINS[Math.floor(Math.random() * DOMAINS.length)]}`

    let teamResponse: string | null = null
    if (!isAuto && rating === 5 && Math.random() < 0.10) {
      teamResponse = TEAM_RESPONSES[Math.floor(Math.random() * TEAM_RESPONSES.length)]
    }

    reviews.push({
      text, rating, product_id: productId,
      username, email, time_label: "",
      verified: true, is_auto: isAuto,
      refunded: false, helpful: Math.floor(Math.random() * 10),
      team_response: teamResponse,
      created_at: createdAt.toISOString(),
    })
  }

  const { error } = await db.from("reviews").insert(reviews)
  if (error) {
    console.error("Cron review insert error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    message: `Added ${reviews.length} reviews`,
    manual: reviews.filter(r => !r.is_auto).length,
    auto: reviews.filter(r => r.is_auto).length,
  })
}
