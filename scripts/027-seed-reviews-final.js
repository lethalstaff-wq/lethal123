const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: ".env.local" })

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── Seeded random ─────────────────────────────────────────────────
function seededRandom(seed) {
  let s = seed
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

// ── Orders per day — organic growth ───────────────────────────────
function getOrdersForDate(date) {
  const month = date.getMonth()
  const day = date.getDate()
  const seed = date.getFullYear() * 10000 + (month + 1) * 100 + day
  const rand = seededRandom(seed)
  const jitter = Math.floor(rand() * 5) - 2
  if (month === 0) return Math.max(4, 7 + jitter)
  if (month === 1) return Math.max(10, 14 + jitter)
  if (month === 2) return Math.max(16, 20 + jitter)
  if (month === 3) return Math.max(26, 30 + jitter)
  return 20
}

// ── Product weights ───────────────────────────────────────────────
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

// ── 200+ usernames ────────────────────────────────────────────────
const USERNAMES = [
  // Gaming tags
  "rxn", "vex", "zk", "drift", "phantom", "cipher", "hex", "apex_g", "stryke",
  "kr4ken", "nyx", "blitz", "recon", "frost", "venom", "wraith", "jinx", "onyx",
  "pulse", "zero_x", "gh0st", "reaper", "cl0ud", "shadow", "nova", "storm",
  "flare", "raze", "titan", "spectre", "omega", "havoc", "mav", "razor", "bolt",
  "fuse", "cryo", "saber", "neo", "pyro", "riot", "surge", "toxin", "bandit",
  "snipe", "ace", "clutch", "legend", "stealth",
  // Normal
  "marcus_t", "jake2001", "connor_b", "dylan_m", "logan_r", "tyler_k", "ethan_w",
  "noah_j", "aiden_s", "mason_p", "caleb_h", "owen_d", "hunter_l", "luke_f",
  "ryan_c", "jack_n", "alex_v", "ben_g", "sam_e", "josh_r", "matt_z", "will_h",
  "cole_m", "drew_a", "ian_b", "jay_t", "zach_w", "adam_k", "chris_d", "nick_l",
  "dan_r", "mike_s", "tom_w", "james_p", "liam_q", "kyle_h", "sean_m", "derek_n",
  "grant_f", "blake_t",
  // EU
  "lars_dk", "sven_se", "felix_de", "pierre_fr", "luca_it", "tomek_pl", "andrei_ro",
  "niklas_fi", "jan_nl", "mika_no", "hans_at", "lukas_cz", "mateo_es", "hugo_be",
  "emil_dk", "oskar_se", "max_de", "theo_fr", "marco_it", "kacper_pl", "dmitri_ee",
  "artur_lv", "radu_ro", "pavel_cz", "mikkel_dk",
  // With numbers
  "gh0st_99", "reaper_7", "cl0ud_9", "dark_kn1ght", "snip3r_x", "t0xic_42",
  "hyp3_88", "bl4ze_1", "n1nja_0", "sp4rk_5", "r4v3n_22", "sh4rk_11",
  "v1per_3", "w0lf_66", "f4lc0n_8", "cr0w_44", "h4wk_17", "l1nk_23",
  "b0ss_69", "k1ng_420", "pr0_55", "z3r0_12", "c0d3_77", "sk8r_31",
  // More variety
  "xeno", "flux", "glitch", "codec", "proxy", "vector", "matrix", "delta",
  "sigma", "alpha", "bravo", "echo", "foxtrot", "kilo", "lima", "mike_ops",
  "oscar_r", "papa_g", "romeo_z", "sierra_x", "tango_v", "uniform", "victor_w",
  "whiskey_j", "xray_m", "yankee_b", "zulu_k", "riptide", "voltage", "turbine",
  "orbit", "quantum", "zenith", "summit", "crest", "ridge", "peak", "vertex",
  "node", "daemon", "kernel", "cache", "packet", "socket", "thread", "buffer",
  "stack", "queue", "hash", "token", "cipher_x", "forge", "anvil", "ember",
  "dusk", "dawn", "void", "null_ptr", "segfault", "malloc", "stdin", "stdout",
]

const EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "proton.me", "icloud.com"]

// ── Review texts per product ──────────────────────────────────────
const REVIEW_TEXTS = {
  "perm-spoofer": {
    5: [
      "fixed my hwid ban in 5 min, was about to buy new mobo lmao",
      "3 weeks after ban zero issues, main fully unbanned",
      "actually permanent unlike the other trash i tried before this",
      "setup took literally 3 minutes with the guide, ban gone forever",
      "got banned on fn and val, this fixed both in one go",
      "third spoofer i bought, first one that actually worked lol",
      "changed everything - mobo serial, gpu uuid, disk sig, mac. all clean",
      "works on both intel and amd, tested on my 5800x no problems",
      "support on discord set me up in 2 min, absolute legends",
      "survived 3 windows updates still clean, this is legit permanent",
      "hwid banned from rust, bought this, unbanned same day. goated",
      "best money spent on gaming tbh. permanent fix no bs",
      "was skeptical ngl but it genuinely works, no more ban screen",
      "my boy recommended this after his worked for 2 months, mine works too now",
      "installed on both my pcs just in case, both running clean af",
      "kernel level spoofing is the way, no other product does this right",
      "even changes network mac which most spoofers just skip over",
      "month in, zero detections. coming back to confirm still working",
      "quick setup permanent result, exactly what i was looking for",
      "worth every penny no cap. no more buying new hardware after getting banned",
      "banned 3 times before finding this, should have bought it first",
      "my mate got banned we both bought this same day, both working",
      "support walked me through entire setup on screenshare. 10/10",
      "uninstalled my old spoofer for this one, night and day difference",
    ],
    4: [
      "works great, took a little while to set up but support helped me out",
      "solid product only 4 stars bc of the price but it does work",
      "good spoofer, guide could be more detailed tho",
      "does what it says, had to restart twice but then it worked fine",
    ],
    3: [
      "works but had to reinstall once. support fixed it tho same day",
      "took me a while to figure out but eventually got it working",
      "decent spoofer, had some driver conflicts but sorted now",
    ],
    2: ["had issues at first, support took a day to respond but fixed it eventually"],
    1: ["struggled to get it working ngl. would be 5 stars if setup was easier"],
  },

  "temp-spoofer": {
    5: [
      "perfect for my alt account, activates on boot clears on restart",
      "cheapest spoofer that actually works, 15 day is all i needed",
      "15 day license is perfect for testing before going permanent",
      "exactly what i needed for temp protection on my alt acc",
      "session based is actually smart, no permanent changes to my pc",
      "2 weeks on my alt, zero issues, exactly as advertised",
      "great for quick protection when you need it, easy af",
      "works with eac battleye and vanguard, all i play covered",
      "instant activation, 3 min setup, literally couldnt be easier",
      "using 30 day license, definitely renewing when it runs out",
      "perfect budget option if u dont need permanent spoofing",
      "clears on restart which is actually a feature for me not a bug",
      "tried 15 day first then got lifetime, worth the upgrade fr",
      "discord support had me running in under 5 minutes no cap",
      "works exactly as described, clean session isolation every boot",
      "bought this for my alt to test before buying perm for main, smart move",
      "honestly surprised how well this works for the price",
      "been renewing every month for 3 months now, never had an issue",
    ],
    4: [
      "does the job for the price, restart thing is slightly annoying but its temp so",
      "good value for money, just gotta remember to activate before gaming",
      "solid temp solution, wish it had an auto-start option tho",
    ],
    3: [
      "works fine but wish it stayed through reboots. guess thats why its called temp lol",
      "decent for the price, had to redo setup after windows update",
    ],
    2: ["works sometimes, had to contact support twice to get it going"],
    1: ["couldnt get it to activate properly, ended up buying the perm instead"],
  },

  "fortnite-external": {
    5: [
      "esp is insane, zero fps drop, been streaming ranked nobody noticed",
      "no dma needed, just runs on my pc, smooth af",
      "stream proof overlay is clutch, streaming arena with zero worries",
      "bought 1 day to test, immediately copped 30 day after first game",
      "aimbot is so smooth it looks natural, nobody suspects anything fr",
      "full player esp with hp bars, i can see literally everyone on map",
      "used it in a cash cup, tournament safe for real",
      "zero fps impact they werent kidding, same fps with and without",
      "runs completely outside the game, no injection no kernel driver nothing",
      "sub 2h patch response after update, was back online same day",
      "tried 4 other fn cheats before this one, this is the best by far",
      "overlay is clean af, minimalist but shows everything u need",
      "config is easy, default settings are already good out the box",
      "month straight of use, zero detections, not even a warning",
      "started with 7 day key, upgraded to lifetime immediately after",
      "works in arena solo duo and ranked, zero issues in any mode",
      "me and my duo both use it, neither of us detected in 3 weeks",
      "esp range is crazy far, can see people before they render basically",
      "best 10 quid i ever spent on gaming honestly",
      "no dual pc needed saves so much money compared to dma setup",
      "the smooth aim is actually undetectable, looks like im just good lmao",
      "been using since season start, still going strong no bans",
      "recommended this to 3 friends now they all bought it too",
    ],
    4: [
      "really good cheat, config takes a bit to dial in but worth the effort",
      "great features, wish there were more color options for esp boxes tho",
      "solid cheat, only 4 stars bc i want loot esp added eventually",
      "very good just takes a min to get settings right for your taste",
    ],
    3: [
      "good cheat but had to wait 3h for patch update once, bit annoying",
      "works well most of the time, had one crash during a game tho",
    ],
    2: ["took a while to get config right, support helped but was slow"],
    1: ["had issues with overlay not showing, ended up fixing it myself after 2 days"],
  },

  "blurred": {
    5: [
      "6 months undetected, best dma cheat on the market hands down",
      "web radar on phone while playing is actually game changing for squads",
      "auto updater is so clutch, never have to worry about game patches",
      "supports 6 games which is insane value honestly",
      "stream proof overlay, streaming ranked without any worries whatsoever",
      "web menu from phone is so convenient, change settings mid game",
      "faceit and vanguard bypass works perfectly, tested both extensively",
      "quarterly license is best value, 3 months undetected gameplay",
      "uav radar overlay gives wallhack level awareness its crazy",
      "triggerbot plus aimbot combo is devastating, movement so smooth",
      "loot esp saves so much time looting in br games",
      "been using since launch day, still undetected, absolute beast of a cheat",
      "features list isnt exaggerated, everything actually works as shown",
      "best purchase ive made for gaming, worth every single penny",
      "the radar feature alone is worth the price, everything else is bonus",
      "running on 75t card, zero issues, clean enumeration perfect",
    ],
    4: [
      "amazing cheat only 4 stars bc lifetime price is steep, but its worth it",
      "great features and support, config is slightly complex but support helps",
      "fantastic cheat, just wish there was a 2 week option for price",
    ],
    3: [
      "good but had a detection scare once, turned out to be false alarm",
      "works well, setup was more complex than expected tho",
    ],
    2: ["took ages to set up with my dma card, support eventually helped tho"],
    1: ["had compatibility issues with my specific dma card model"],
  },

  "streck": {
    5: [
      "perfect budget dma cheat, does everything i need for the price",
      "great if youre new to dma, simple setup solid features",
      "way better than expected for a budget option honestly",
      "7 day license to test was smart, got 90 day right after",
      "esp and aimbot both work great, no recoil is nice bonus",
      "eac and battleye both bypassed, fortnite and apex covered",
      "fast patch updates keep it working, never down for long",
      "best entry level dma cheat out there right now no contest",
      "my first dma cheat and its perfect for learning the ropes",
      "instant delivery, setup took 10 min total, was in game fast",
      "for the price you really cant complain, does what it needs to",
      "been running for 2 months on my setup, clean and stable",
      "lightweight and doesnt interfere with other stuff on my pc",
    ],
    4: [
      "solid budget option, fewer features than blurred but great price point",
      "good starter cheat, will probably upgrade to blurred eventually tho",
      "works well for what it is, just wish it had radar feature",
    ],
    3: [
      "decent for the price, had to redo config after one update",
      "works ok, not as smooth as blurred but much cheaper so fair",
    ],
    2: ["had some stuttering issues, support said its my dma card tho"],
    1: ["couldnt get it stable on my setup, might be my card idk"],
  },

  "custom-dma-firmware": {
    5: [
      "custom firmware is 100% worth it, unique build means no shared detections",
      "delivered in 24h, works flawlessly with my 75t card",
      "built per order means zero shared releases, thats real security",
      "eac and battleye emulation is flawless, running 2 months clean",
      "upgraded from generic firmware, difference is night and day literally",
      "works perfect with my m.2 dma card, clean enumeration no issues",
      "lifetime replacement policy is huge peace of mind",
      "firmware arrived in 20 hours, tested immediately, perfect",
      "the unique signature per build is what sold me, no one else does this",
      "running on zdma card, absolutely perfect compatibility",
    ],
    4: [
      "great firmware, delivery was 36h instead of 24 but works perfectly",
      "solid firmware, just make sure u specify ur exact card model",
      "good product, wish there was a way to test before buying the expensive tiers",
    ],
    3: [
      "works but had to get a rebuild once, they did it free tho",
      "decent firmware, took 48h delivery which was longer than expected",
    ],
    2: ["had compatibility issues initially, needed a rebuild"],
    1: ["firmware didnt work with my card at first, took 3 days to get replacement"],
  },

  "dma-basic": {
    5: [
      "perfect starter bundle, everything i needed to get into dma cheating",
      "great value for a beginner, guide included was super helpful",
      "came with firmware and cheat, setup was surprisingly easy",
      "exactly what description says, good entry level kit",
      "bought this as my first dma setup, no regrets at all",
      "the included guide made setup so much easier than expected",
    ],
    4: [
      "good bundle for beginners, would like more game support tho",
      "solid starter kit, ended up upgrading to advanced after a month",
    ],
    3: ["decent bundle, had to contact support for setup help tho"],
    2: ["basic is right, kinda wish i went straight to advanced"],
  },

  "dma-advanced": {
    5: [
      "most popular for a reason, everything works right out the box",
      "advanced bundle was the sweet spot for me, perfect value",
      "hardware quality is solid, firmware and cheat combo works perfect",
      "this is what i recommend to everyone asking about dma",
      "been running this setup for 2 months, absolutely zero issues",
    ],
    4: [
      "great bundle, just make sure your mobo has right pcie slot first",
      "solid package, delivery took 3 days but everything works great",
    ],
    3: ["good but had to swap pcie slot, wasnt clear which one to use"],
  },

  "dma-elite": {
    5: [
      "no compromises is right, this bundle has absolutely everything",
      "elite is expensive but you genuinely get what you pay for, premium af",
      "best dma setup money can buy, everything included top quality",
      "bought elite bc i didnt want to upgrade later, smart decision",
    ],
    4: [
      "amazing bundle premium quality, only 4 stars bc shipping took 3 days",
      "worth the money if you can afford it, everything is top tier",
    ],
    3: ["great quality but the price is steep, works perfectly tho"],
  },
}

// ── Auto review texts (25) ────────────────────────────────────────
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

// ── Team responses ────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────
function pickProduct(rand) {
  const r = rand()
  let cum = 0
  for (const pw of PRODUCT_WEIGHTS) {
    cum += pw.weight
    if (r <= cum) return pw.id
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

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log("Deleting ALL existing reviews...")
  const { error: delErr } = await db.from("reviews").delete().gte("id", 0)
  if (delErr) { console.error("Delete failed:", delErr); process.exit(1) }
  console.log("Deleted.\n")

  const reviews = []
  const END = new Date(2026, 3, 6) // Apr 6
  const START = new Date(2026, 0, 1) // Jan 1

  const textIdx = {} // track rotation per product+rating
  let autoIdx = 0
  let globalSeed = 7

  for (let d = new Date(START); d <= END; d.setDate(d.getDate() + 1)) {
    const cur = new Date(d)
    const orders = getOrdersForDate(cur)

    for (let oi = 0; oi < orders; oi++) {
      const seed = cur.getFullYear() * 1e6 + (cur.getMonth() + 1) * 1e4 + cur.getDate() * 100 + oi + globalSeed
      const rand = seededRandom(seed)

      const productId = pickProduct(rand)

      // 60% write a review
      if (rand() > 0.60) continue

      // 60% manual, 40% auto
      const isAuto = rand() < 0.40

      let rating, text, delayDays

      if (isAuto) {
        rating = 5
        text = AUTO_TEXTS[autoIdx % AUTO_TEXTS.length]
        autoIdx++
        delayDays = 7 + Math.floor(rand() * 3)
      } else {
        rating = pickRating(rand)
        delayDays = Math.floor(rand() * 4)

        const prodTexts = REVIEW_TEXTS[productId]
        const ratingTexts = prodTexts ? prodTexts[rating] : null

        if (ratingTexts && ratingTexts.length > 0) {
          const key = `${productId}_${rating}`
          if (!textIdx[key]) textIdx[key] = 0
          text = ratingTexts[textIdx[key] % ratingTexts.length]
          textIdx[key]++
        } else {
          text = AUTO_TEXTS[autoIdx % AUTO_TEXTS.length]
          autoIdx++
        }
      }

      // Review date
      const reviewDate = new Date(cur)
      reviewDate.setDate(reviewDate.getDate() + delayDays)
      if (reviewDate > END) continue

      const hour = 8 + Math.floor(rand() * 14)
      const min = Math.floor(rand() * 60)
      reviewDate.setHours(hour, min, Math.floor(rand() * 60), 0)

      // Username + email
      const uIdx = Math.floor(rand() * USERNAMES.length)
      const username = USERNAMES[uIdx]
      const dIdx = Math.floor(rand() * EMAIL_DOMAINS.length)
      const email = `${username}@${EMAIL_DOMAINS[dIdx]}`

      // Helpful based on age
      const daysOld = Math.floor((END - reviewDate) / 864e5)
      const helpful = Math.min(100, Math.max(0, Math.floor((daysOld / 96) * 80 + rand() * 20)))

      // Team response
      let teamResponse = null
      if (!isAuto && rating === 5 && rand() < 0.10) {
        teamResponse = TEAM_RESPONSES[Math.floor(rand() * TEAM_RESPONSES.length)]
      }

      reviews.push({
        text, rating, product_id: productId,
        username, email, time_label: "",
        verified: true, is_auto: isAuto,
        refunded: false, helpful,
        team_response: teamResponse,
        created_at: reviewDate.toISOString(),
      })
    }
  }

  reviews.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  console.log(`Generated ${reviews.length} reviews. Inserting...\n`)

  // Test insert first
  const { error: testErr } = await db.from("reviews").insert(reviews[0])
  if (testErr) {
    console.error("TEST INSERT FAILED:", testErr.message)
    console.error("Review:", JSON.stringify(reviews[0], null, 2))
    process.exit(1)
  }
  console.log("Test insert OK. Inserting rest in batches...\n")

  // Insert rest in batches of 200 (skip first, already inserted)
  const rest = reviews.slice(1)
  for (let i = 0; i < rest.length; i += 200) {
    const batch = rest.slice(i, i + 200)
    const { error } = await db.from("reviews").insert(batch)
    if (error) { console.error(`Batch ${i} failed:`, error.message); process.exit(1) }
    console.log(`  Batch ${Math.floor(i / 200) + 1} (${batch.length} reviews)`)
  }

  // ── Stats ─────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════")
  console.log(`  TOTAL: ${reviews.length} reviews`)
  console.log("══════════════════════════════════════\n")

  console.log("Rating breakdown:")
  for (let s = 5; s >= 1; s--) {
    const c = reviews.filter(r => r.rating === s).length
    console.log(`  ${s}★: ${c} (${((c / reviews.length) * 100).toFixed(1)}%)`)
  }

  const autoC = reviews.filter(r => r.is_auto).length
  console.log(`\nManual: ${reviews.length - autoC} | Auto: ${autoC} (${((autoC / reviews.length) * 100).toFixed(1)}%)`)

  console.log("\nPer product:")
  for (const pw of PRODUCT_WEIGHTS) {
    const pr = reviews.filter(r => r.product_id === pw.id)
    const avg = pr.length > 0 ? (pr.reduce((s, r) => s + r.rating, 0) / pr.length).toFixed(2) : "N/A"
    const ac = pr.filter(r => r.is_auto).length
    console.log(`  ${pw.id}: ${pr.length} (${ac} auto) avg ${avg}★`)
  }

  console.log("\nDone!")
}

main().catch(e => { console.error("FATAL:", e); process.exit(1) })
