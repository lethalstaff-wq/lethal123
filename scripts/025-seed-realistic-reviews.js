const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: ".env.local" })
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// ── Seeded random ──────────────────────────────────────────────────────────────
function seededRandom(seed) {
  let s = seed
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

// ── Organic growth — orders per day ────────────────────────────────────────────
function getOrdersForDate(date) {
  const month = date.getMonth()
  const day = date.getDate()
  const seed = date.getFullYear() * 10000 + (month + 1) * 100 + day
  const rand = seededRandom(seed)
  const jitter = Math.floor(rand() * 5) - 2
  if (month === 0) return Math.max(3, 7 + jitter) // Jan: 5-9
  if (month === 1) return Math.max(8, 14 + jitter) // Feb: 12-16
  if (month === 2) return Math.max(14, 20 + jitter) // Mar: 18-22
  if (month === 3) return Math.max(24, 30 + jitter) // Apr: 28-32
  return 20
}

// ── Product weights ────────────────────────────────────────────────────────────
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

// ── Usernames ──────────────────────────────────────────────────────────────────
const USERNAMES = [
  // Gaming
  "rxn", "vex", "zk", "drift", "phantom", "cipher", "hex", "apex_g", "stryke",
  "kr4ken", "nyx", "blitz", "recon", "frost", "venom", "wraith", "jinx", "onyx",
  "pulse", "zero_x", "gh0st", "reaper", "cl0ud", "shadow", "nova", "storm",
  "flare", "raze", "titan", "spectre", "omega", "havoc", "mav", "razor", "bolt",
  "fuse", "cryo", "saber", "neo", "pyro",
  // Normal
  "marcus_t", "jake2001", "connor_b", "dylan_m", "logan_r", "tyler_k", "ethan_w",
  "noah_j", "aiden_s", "mason_p", "caleb_h", "owen_d", "hunter_l", "luke_f",
  "ryan_c", "jack_n", "alex_v", "ben_g", "sam_e", "josh_r", "matt_z", "will_h",
  "cole_m", "drew_a", "ian_b", "jay_t", "zach_w", "adam_k", "chris_d", "nick_l",
  // EU
  "lars_dk", "sven_se", "felix_de", "pierre_fr", "luca_it", "tomek_pl",
  "andrei_ro", "niklas_fi", "jan_nl", "mika_no", "hans_at", "lukas_cz",
  "mateo_es", "hugo_be", "emil_dk", "oskar_se", "max_de", "theo_fr", "marco_it",
  "kacper_pl",
  // With numbers
  "gh0st_99", "reaper_7", "cl0ud_9", "dark_kn1ght", "snip3r_x", "t0xic_42",
  "hyp3_88", "bl4ze_1", "n1nja_0", "sp4rk_5", "r4v3n_22", "sh4rk_11",
  "v1per_3", "w0lf_66", "f4lc0n_8", "cr0w_44", "h4wk_17", "l1nk_23",
  "b0ss_69", "k1ng_420",
  // More
  "xeno", "flux", "glitch", "codec", "proxy", "vector", "matrix", "delta",
  "sigma", "alpha", "bravo", "echo", "foxtrot", "kilo", "lima", "mike_ops",
  "oscar_r", "papa_g", "romeo_z", "sierra_x", "tango_v", "uniform", "victor_w",
  "whiskey_j", "xray_m", "yankee_b", "zulu_k", "riptide", "voltage", "turbine",
  "orbit", "quantum", "zenith", "summit", "crest", "ridge", "peak", "apex",
  "vertex", "node",
]

const EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "proton.me", "icloud.com"]

// ── Product-specific review texts ──────────────────────────────────────────────
const REVIEW_TEXTS = {
  "perm-spoofer": {
    5: [
      "fixed my hwid ban in literally 5 minutes. saved me £200+ on a new pc",
      "been using for 3 weeks after ban, zero issues. actually permanent",
      "actually permanent unlike the other ones i tried. this one stays",
      "setup took 3 minutes following the guide. ban is gone forever",
      "got banned on fortnite and val, this fixed both instantly",
      "third spoofer i tried, first one that actually worked permanently",
      "changed all my hw ids. motherboard, gpu, disk, everything",
      "works on both intel and amd. tested on my ryzen 7",
      "support helped me set it up over discord in like 2 minutes",
      "survived 3 windows updates and still working perfectly",
      "used it after getting hwid banned from rust. works flawlessly",
      "best money i ever spent on gaming. permanent fix for real",
      "was skeptical but it genuinely works. no more ban",
      "my friend recommended this after his worked for 2 months. mine works too",
      "installed on my alt pc too just in case. both running clean",
      "kernel level is the way to go. no other spoofer does this properly",
      "even changed my network mac which most spoofers skip",
      "zero detections after a month. checking in to confirm still good",
      "quick setup, permanent result. exactly what i needed",
      "worth every penny. no more buying new hardware after bans",
    ],
    4: [
      "works well, took a bit to set up but support helped me through it",
      "good product, only 4 stars because of the price but it works",
      "solid spoofer, just wish the guide was more detailed",
    ],
    3: [
      "works but had to reinstall once. support fixed it same day",
      "took me a while to get it working but eventually it did",
    ],
    2: ["had some issues initially but support resolved them after a day"],
    1: ["took a while to get working. would have been 5 stars if setup was easier"],
  },
  "temp-spoofer": {
    5: [
      "perfect for my alt account. activates on boot, clears on restart",
      "cheapest spoofer that actually works. 15 day license is perfect",
      "15 day license is perfect for testing before committing",
      "exactly what i needed for temp protection on my alt",
      "session based is actually smart. no permanent changes to my system",
      "been using for 2 weeks on my alt, no issues whatsoever",
      "great for when you just need quick protection",
      "works with eac battleye and vanguard which is all i need",
      "instant activation, 3 minute setup. couldnt be easier",
      "using the 30 day license, definitely renewing when it expires",
      "perfect budget option if you dont need permanent",
      "clears on restart which is actually a feature not a bug for me",
      "got the lifetime after trying 15 day. worth the upgrade",
      "discord support helped me set up in under 5 minutes",
      "works exactly as described. clean session isolation",
    ],
    4: [
      "does the job for the price. clears on restart which is annoying but thats what temp means",
      "good value for money, just remember to activate before gaming",
    ],
    3: ["works fine but i wish it persisted through reboots. guess thats why its called temp"],
  },
  "fortnite-external": {
    5: [
      "bro the esp is actually insane. doesnt drop my fps AT ALL",
      "no dma needed which is huge. single pc setup in 5 min",
      "stream proof overlay is clutch for streaming ranked",
      "1 day key to test and immediately bought 30 day after",
      "aimbot is so smooth nobody suspects anything. natural looking",
      "full player esp with health bars. can see everyone on the map",
      "tournament safe. used it in a cash cup with zero issues",
      "zero fps impact wasnt kidding. literally same fps as without",
      "runs completely outside the game. no injection no driver",
      "sub 2 hour patch response is insane. back online same day",
      "best fortnite cheat ive used and ive tried like 4 others",
      "the overlay is clean af. minimalist but shows everything you need",
      "config is easy to set up. default settings already good tbh",
      "been using for a month straight. zero detections",
      "bought 7 day first to test. upgraded to lifetime immediately",
      "works in arena and ranked with zero issues",
      "my friend and i both use it. neither of us detected",
      "the esp range is crazy. can see people from so far",
      "best £10 ive ever spent on gaming",
      "no dual pc needed saves me so much money vs dma",
    ],
    4: [
      "really good cheat, config takes a bit to dial in but worth it",
      "great features, just wish there were more color options for esp",
      "solid cheat. only reason not 5 stars is i wish it had loot esp",
    ],
    3: ["good cheat but had to wait 3 hours for a patch update once"],
  },
  "blurred": {
    5: [
      "best dma cheat on the market hands down. 6 months undetected",
      "web radar feature is so underrated. game changer for squads",
      "auto updater is clutch. never have to worry about patches",
      "supports 6 games which is insane value for the price",
      "stream proof overlay means i can stream ranked without worrying",
      "the web menu is so convenient. change settings from your phone",
      "faceit and vanguard bypass works perfectly. tested both",
      "quarterly license is best value. 3 months of undetected gameplay",
      "uav radar overlay gives you wallhack level awareness",
      "triggerbot + aimbot combo is devastating. so smooth",
      "loot esp saves so much time in br games",
      "been using since it launched. still undetected. absolute beast",
      "the features list is not exaggerated. everything works perfectly",
    ],
    4: [
      "amazing cheat, only 4 stars because lifetime price is steep but worth it",
      "great features and support. minor config complexity but support helps",
    ],
  },
  "streck": {
    5: [
      "perfect budget dma cheat. does everything i need",
      "great if ur new to dma. simple setup good features",
      "way better than expected for the price honestly",
      "7 day license to test was smart. immediately got 90 day after",
      "esp and aimbot work great. no recoil is a nice bonus",
      "works with eac and battleye. fortnite + apex covered",
      "fast patch updates keep it working consistently",
      "best entry level dma cheat available right now",
      "my first dma cheat and its perfect for learning",
      "instant delivery and setup took 10 minutes total",
    ],
    4: ["solid budget option. fewer features than blurred but great price"],
  },
  "custom-dma-firmware": {
    5: [
      "custom firmware is 100% worth it. unique build per order",
      "delivered in 24 hours, works perfectly with my 75t",
      "the fact that its built per order means zero shared detections",
      "eac and battleye emulation is flawless. been running 2 months",
      "upgraded from generic firmware and the difference is night and day",
      "works with my m.2 dma card perfectly. clean enumeration",
      "lifetime replacement policy is a huge plus. great peace of mind",
    ],
    4: ["great firmware, delivery took 36 hours instead of 24 but works perfectly"],
  },
  "dma-basic": {
    5: [
      "perfect starter bundle. had everything i needed to get going",
      "great value for someone new to dma. guide included helped a lot",
      "came with firmware and cheat. setup was surprisingly easy",
      "exactly what the description says. good starter kit",
    ],
    4: ["good bundle for beginners. would have liked more game support"],
  },
  "dma-advanced": {
    5: [
      "most popular for a reason. everything works out of the box",
      "advanced bundle was the sweet spot for me. great value",
      "hardware quality is solid. firmware + cheat combo is perfect",
    ],
    4: ["great bundle, just make sure your motherboard has the right pcie slot"],
  },
  "dma-elite": {
    5: [
      "no compromises is right. this bundle has absolutely everything",
      "elite bundle is expensive but you get what you pay for. premium",
    ],
    4: ["amazing bundle, premium quality. only 4 stars because shipping took 3 days"],
  },
}

const AUTO_REVIEW_TEXTS = [
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
  "smooth experience from purchase to setup",
  "working perfectly after 1 week",
  "solid product, recommend",
  "quick delivery and easy setup",
  "does exactly what it promises",
  "very satisfied with this product",
  "great value for the money",
  "no issues encountered yet",
  "product quality is excellent",
  "would buy again 👍",
  "easy setup and works perfectly",
  "five stars, works as advertised",
  "instant delivery, instant results",
  "everything works out of the box",
  "reliable product, no problems",
]

const TEAM_RESPONSES = [
  "Thank you for the feedback! Glad everything is working smoothly. 🙏",
  "Appreciate the review! Our team is always here if you need anything.",
  "Thanks for taking the time to review! Enjoy your product. 🎮",
  "Great to hear it's working well! Don't hesitate to reach out if you need help.",
  "We appreciate the support! Let us know if you ever need assistance.",
  "Thank you! We're always working to improve our products. 🔥",
  "Glad you're enjoying it! Our Discord support is 24/7 if you need anything.",
  "Thanks for the kind words! We put a lot of work into making this reliable.",
]

// ── Helpers ────────────────────────────────────────────────────────────────────
function pickWeightedProduct(rand) {
  const r = rand()
  let cumulative = 0
  for (const pw of PRODUCT_WEIGHTS) {
    cumulative += pw.weight
    if (r <= cumulative) return pw.id
  }
  return PRODUCT_WEIGHTS[PRODUCT_WEIGHTS.length - 1].id
}

function pickRating(rand) {
  const r = rand()
  if (r < 0.80) return 5
  if (r < 0.90) return 4
  if (r < 0.96) return 3
  if (r < 0.98) return 2
  return 1
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Deleting all existing reviews...")
  const { error: delErr } = await db.from("reviews").delete().gte("id", 0)
  if (delErr) {
    console.error("Failed to delete reviews:", delErr)
    process.exit(1)
  }
  console.log("All reviews deleted.\n")

  const reviews = []
  const TODAY = new Date(2026, 3, 6) // Apr 6, 2026

  // Track text usage per product to rotate and avoid duplicates
  const textCounters = {}
  const autoTextCounter = { i: 0 }

  const startDate = new Date(2026, 0, 1) // Jan 1, 2026
  let globalSeed = 42

  for (let d = new Date(startDate); d <= TODAY; d.setDate(d.getDate() + 1)) {
    const currentDate = new Date(d)
    const orders = getOrdersForDate(currentDate)

    for (let orderIdx = 0; orderIdx < orders; orderIdx++) {
      const daySeed =
        currentDate.getFullYear() * 1000000 +
        (currentDate.getMonth() + 1) * 10000 +
        currentDate.getDate() * 100 +
        orderIdx
      const rand = seededRandom(daySeed + globalSeed)

      // Pick product
      const productId = pickWeightedProduct(rand)

      // 60% chance the buyer writes a review
      if (rand() > 0.6) continue

      // Of those who write: 60% manual, 40% auto
      const isAuto = rand() < 0.4

      let rating, text, delayDays

      if (isAuto) {
        // Auto: always 5★, 7-9 day delay
        rating = 5
        const autoIdx = autoTextCounter.i % AUTO_REVIEW_TEXTS.length
        text = AUTO_REVIEW_TEXTS[autoIdx]
        autoTextCounter.i++
        delayDays = 7 + Math.floor(rand() * 3)
      } else {
        // Manual: rating distribution, 0-3 day delay
        rating = pickRating(rand)
        delayDays = Math.floor(rand() * 4)

        // Pick text from product-specific texts for that rating
        const productTexts = REVIEW_TEXTS[productId]
        const textsForRating = productTexts ? productTexts[rating] : null

        if (textsForRating && textsForRating.length > 0) {
          const key = `${productId}_${rating}`
          if (!textCounters[key]) textCounters[key] = 0
          const idx = textCounters[key] % textsForRating.length
          text = textsForRating[idx]
          textCounters[key]++
        } else {
          // Fallback to auto-style text for ratings without specific texts
          const autoIdx = autoTextCounter.i % AUTO_REVIEW_TEXTS.length
          text = AUTO_REVIEW_TEXTS[autoIdx]
          autoTextCounter.i++
        }
      }

      // Calculate review date (order date + delay)
      const reviewDate = new Date(currentDate)
      reviewDate.setDate(reviewDate.getDate() + delayDays)

      // Don't exceed today
      if (reviewDate > TODAY) continue

      // Add random time (8-22 hours, random minutes)
      const hour = 8 + Math.floor(rand() * 14)
      const minute = Math.floor(rand() * 60)
      reviewDate.setHours(hour, minute, Math.floor(rand() * 60), 0)

      // Pick username
      const usernameIdx = Math.floor(rand() * USERNAMES.length)
      const username = USERNAMES[usernameIdx]

      // Generate email
      const domainIdx = Math.floor(rand() * EMAIL_DOMAINS.length)
      const email = `${username}@${EMAIL_DOMAINS[domainIdx]}`

      // Helpful count based on review age
      const daysSinceReview = Math.floor((TODAY - reviewDate) / (1000 * 60 * 60 * 24))
      const helpful = Math.min(100, Math.max(0, Math.floor((daysSinceReview / 96) * 80 + rand() * 20)))

      // Team response: 10% chance on 5★ manual reviews
      let teamResponse = null
      if (!isAuto && rating === 5 && rand() < 0.1) {
        teamResponse = TEAM_RESPONSES[Math.floor(rand() * TEAM_RESPONSES.length)]
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
        helpful,
        team_response: teamResponse,
        created_at: reviewDate.toISOString(),
      })
    }
  }

  // Sort by created_at
  reviews.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  console.log(`Generated ${reviews.length} reviews. Inserting in batches of 200...\n`)

  // Insert in batches of 200
  for (let i = 0; i < reviews.length; i += 200) {
    const batch = reviews.slice(i, i + 200)
    const { error } = await db.from("reviews").insert(batch)
    if (error) {
      console.error(`Failed to insert batch at offset ${i}:`, error)
      process.exit(1)
    }
    console.log(`  Inserted batch ${Math.floor(i / 200) + 1} (${batch.length} reviews)`)
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════")
  console.log(`  Total reviews: ${reviews.length}`)
  console.log("═══════════════════════════════════════════\n")

  // Per-star breakdown
  console.log("Rating breakdown:")
  for (let star = 5; star >= 1; star--) {
    const count = reviews.filter((r) => r.rating === star).length
    const pct = ((count / reviews.length) * 100).toFixed(1)
    console.log(`  ${star}★: ${count} (${pct}%)`)
  }

  // Auto vs Manual
  const autoCount = reviews.filter((r) => r.is_auto).length
  const manualCount = reviews.length - autoCount
  console.log(`\nAuto: ${autoCount} | Manual: ${manualCount}`)

  // Per-product counts
  console.log("\nPer-product:")
  for (const pw of PRODUCT_WEIGHTS) {
    const productReviews = reviews.filter((r) => r.product_id === pw.id)
    const avg =
      productReviews.length > 0
        ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(2)
        : "N/A"
    console.log(`  ${pw.id}: ${productReviews.length} reviews, avg ${avg}★`)
  }

  console.log("\nDone!")
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
