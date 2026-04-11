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
  "skullz", "d3mon", "hydr4", "cyb3r", "n1tro", "turbo_v", "axel_x",
  "kaz_77", "ren_mk", "jolt", "pyro", "ember", "slate", "cobalt",
]

const DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "proton.me", "icloud.com"]

const REVIEW_TEXTS: Record<string, string[]> = {
  "perm-spoofer": [
    "been 2 weeks since i spoofed, still fully clean no reban. this actually works",
    "finally a perm spoofer that survives windows updates, had issues with others before",
    "kernel level is key, nothing else touched my serials properly. instant unban",
    "support walked me through everything in like 10 min, ban lifted immediately",
    "bought after my friend recommended it, works on both intel and amd no issues",
    "tried 3 other spoofers before this one, only lethal actually fixed my hwid ban",
    "spoofed my entire rig in under 5 minutes, clean on every anticheat now",
    "came back after 6 months still working, genuinely permanent fix",
    "the cleaner tool they include is underrated, removes all traces properly",
    "works with eac and be, tested on multiple games after spoofing, all clean",
    "my mate got banned same day as me, he bought this too and we're both clean now",
    "setup was easier than expected, just run and reboot. done",
    "actually changes disk serials properly unlike cheap alternatives",
    "been recommending to everyone, 4 friends bought after seeing mine work",
    "reinstalled windows after and spoof still holds, truly permanent",
    "changed every hwid including mac address, nothing traces back",
  ],
  "temp-spoofer": [
    "perfect for playing on alts, just boot and go. resets clean every time",
    "15 day key is perfect value, been renewing for 3 months straight",
    "no permanent changes to my system which is exactly what i wanted",
    "works every single boot, never had a failed spoof session",
    "cheapest option that actually works, tried free ones before and got rebanned",
    "session spoof is smart, nothing leftover after restart. clean approach",
    "use it daily for ranked, zero issues in 6 weeks of use",
    "fast af to activate, literally 30 seconds and im in game",
    "bought the 30 day this time, better value for how much i play",
    "my go-to for alt accounts, never failed me once",
    "updated my key yesterday, smooth as always. no downtime",
    "works alongside my vpn setup perfectly, no conflicts",
    "great for testing if you need a spoofer before committing to perm",
    "customer support helped me with activation in under 5 min on discord",
  ],
  "fortnite-external": [
    "zero fps impact is real, tested with msi afterburner, identical frames",
    "stream proof works perfectly, been streaming ranked for a week now",
    "the esp is clean, just outlines and distance. not too cluttered",
    "aimbot smoothing looks natural, spectators cant tell anything",
    "been using for 3 weeks in ranked, 0 issues and climbing fast",
    "external means no injection risk, way safer than internal cheats",
    "overlay is customizable, turned off what i dont need for cleaner look",
    "works on latest season update, they pushed fix same day as patch",
    "best fn cheat period, tried 2 others before and both got detected",
    "item esp is clutch for finding loot fast, huge advantage early game",
    "no weird mouse jitter like other aimbots, this one is smooth",
    "friend and i both use it in duos, dominating lobbies rn",
    "fov slider on aimbot is nice, keep it low for legit looking plays",
    "quick update after every fortnite patch, never more than a few hours",
    "player glow through walls is subtle but effective, love the customization",
    "works in zero build and build mode, no issues with either",
    "bought after seeing a clip from someone using it, had to get it",
    "auto updates so i never have to manually do anything, just launch and play",
  ],
  "blurred": [
    "web radar on phone while gaming is actually insane, next level awareness",
    "multi game support is worth it alone, works on fn warzone and apex",
    "auto updater pushed a fix 2 hours after game update, insane speed",
    "stream proof overlay on my second pc, zero risk of showing on stream",
    "dma + blurred combo is unbeatable, months in and never flagged",
    "the radar view is so clean and accurate, better than any minimap hack",
    "tried streck first then upgraded to blurred, the difference is huge",
    "features keep getting added, they just dropped a new esp style last week",
    "config system lets me save setups per game, very convenient",
    "discord community is active, devs actually respond to feedback",
    "bone esp option is nice for seeing exactly where to aim through walls",
    "runs flawlessly on my squire dma card, zero compatibility issues",
  ],
  "streck": [
    "solid budget dma option, does everything i need for casual play",
    "great starting point for dma, planning to upgrade to blurred later",
    "simple and effective, esp and aimbot work well for the price",
    "perfect if you dont need all the premium features of blurred",
    "been using 2 months on warzone, working great. no complaints",
    "easy setup guide they provide, had it running in 20 min",
    "good value for what you get, not everyone needs premium",
    "works well on my leech dma card, smooth performance",
  ],
  "custom-dma-firmware": [
    "unique firmware means zero shared signatures, worth the premium",
    "delivered within 24 hours, flashed and working immediately",
    "custom build process was smooth, they asked about my specific card model",
    "been 3 months on custom fw, no detection while others using public got flagged",
    "the peace of mind from private firmware is worth every penny",
    "flashed perfectly on my screamer card, works with both blurred and streck",
    "support helped me flash it remotely through discord screenshare",
  ],
  "dma-basic": [
    "perfect starter kit, came with everything i needed to get going",
    "bundle saved me money vs buying separately, good deal",
    "great intro to dma cheating, card + firmware + cheat all in one",
    "instructions were clear, even as a first timer i set it up easy",
  ],
  "dma-advanced": [
    "advanced bundle is the sweet spot, premium firmware included makes the difference",
    "everything works together out of the box, no compatibility headaches",
    "the custom firmware in this bundle alone is worth the upgrade from basic",
  ],
  "dma-elite": [
    "went all in with elite, no regrets. every premium feature included",
    "the private firmware + blurred combo in this bundle is end game setup",
  ],
}

const TEAM_RESPONSES = [
  "Thank you for the feedback! Glad everything is working smoothly. 🙏",
  "Appreciate the review! Our team is always here if you need anything.",
  "Thanks for taking the time to review! Enjoy your product. 🎮",
  "Great to hear! Don't hesitate to reach out if you need help.",
  "Glad you're enjoying it! Feel free to join our Discord for tips. 💪",
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickProduct(): string {
  const r = Math.random()
  let cum = 0
  for (const pw of PRODUCT_WEIGHTS) {
    cum += pw.weight
    if (r <= cum) return pw.id
  }
  return PRODUCT_WEIGHTS[0].id
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: "No DB credentials" }, { status: 500 })
  }

  const db = createClient(url, key)

  // Generate ~88 reviews spread over last 4 days (Apr 8-11, 2026)
  const reviews = []
  const now = new Date()
  const reviewsPerDay = [21, 22, 23, 22] // ~88 total

  for (let dayOffset = 3; dayOffset >= 0; dayOffset--) {
    const count = reviewsPerDay[3 - dayOffset]
    for (let i = 0; i < count; i++) {
      const productId = pickProduct()
      const isAuto = Math.random() < 0.35

      const rr = Math.random()
      const rating = isAuto ? 5 : rr < 0.78 ? 5 : rr < 0.91 ? 4 : rr < 0.96 ? 3 : rr < 0.98 ? 2 : 1

      const pool = REVIEW_TEXTS[productId] || REVIEW_TEXTS["perm-spoofer"]
      const text = rating >= 4 ? pick(pool) : pick([
        "works as described, no issues",
        "product works fine",
        "does what it says",
        "ok product, expected more",
        "average, nothing special",
      ])

      const createdAt = new Date(now)
      createdAt.setDate(createdAt.getDate() - dayOffset)
      createdAt.setUTCHours(8 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60))

      const username = pick(USERNAMES)
      const email = `${username}@${pick(DOMAINS)}`

      let teamResponse: string | null = null
      if (rating === 5 && Math.random() < 0.08) {
        teamResponse = pick(TEAM_RESPONSES)
      }

      reviews.push({
        text,
        rating,
        product_id: productId,
        username,
        email,
        time_label: "",
        verified: true,
        is_auto: isAuto,
        refunded: false,
        helpful: Math.floor(Math.random() * 12),
        team_response: teamResponse,
        created_at: createdAt.toISOString(),
      })
    }
  }

  const { error } = await db.from("reviews").insert(reviews)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    message: `Seeded ${reviews.length} reviews over last 4 days`,
    total: reviews.length,
    byDay: reviewsPerDay,
  })
}
