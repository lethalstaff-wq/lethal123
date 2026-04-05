// Deterministic review generator — 847 reviews total, realistic distribution.
// All users see identical reviews (seeded by date).

type GeneratedReview = {
  id: number
  text: string
  rating: number
  product: string
  product_id: string
  username: string
  email: string
  time_label: string
  verified: boolean
  is_auto: boolean
  refunded: boolean
  helpful: number
  team_response: string | null
  created_at: string
}

// ─── 5-star / 4-star review texts ───

const SPOOFER_REVIEWS = [
  "hwid ban gone in literally 2 minutes. back on my main playing ranked like nothing happened",
  "been using perm spoofer for 3 months now zero issues. survives reboots, updates, everything",
  "got banned on fortnite and warzone. one install fixed both games. easiest purchase ever",
  "tried 3 other spoofers before this one. all got detected within a week. this one? 4 months",
  "support helped me set it up in 5 min on discord. works on both intel and amd",
  "thought my pc was done after the ban wave. spoofer fixed everything instantly",
  "the kernel level stuff actually works different from other spoofers. properly made",
  "bought for my alt first to test. worked perfectly so got it for main too",
  "instant delivery + instant fix. was back in game within 10 minutes",
  "survived the last big ban wave when everyone else got caught. built different",
  "changed all my hardware ids clean. motherboard, gpu, mac, disk serials",
  "was skeptical but this just works. no bloatware no sketchy stuff",
  "reinstalled windows and the spoofer still held. truly permanent",
  "running it alongside blurred dma and zero conflicts",
  "bought the lifetime. 5 months in still undetected still smooth",
  "eac and battleye both spoofed perfectly. tested on fn rust and pubg",
  "setup guide was clear af. even for someone not technical it was easy",
  "temp spoofer is perfect for a tournament weekend. cheap and effective",
  "30 day temp got me through the whole season. renewed and going again",
  "vanguard bypass works flawlessly. playing val on a banned pc for months",
]

const CHEAT_REVIEWS = [
  "the esp is so clean on stream. overlay is perfect, nobody notices",
  "aimbot smoothing is insane. looks completely natural in kill cams",
  "been running this in ranked for a month. zero suspicion zero detection",
  "fps literally didnt drop at all. whatever optimization they did is top tier",
  "config options are crazy detailed. you can tune everything to your playstyle",
  "external only so no injection risk. smart design. runs clean",
  "started with 7 day to test. bought lifetime same night lmao",
  "support helped me optimize config for comp. attention to detail is next level",
  "update came out 2 hours after the game patched. devs are on it 24/7",
  "switched from another provider. night and day difference. way smoother",
  "been through 3 ban waves with this running. not a single detection",
  "the trigger bot is so subtle even i forget its on sometimes lol",
  "radar hack alone is worth the price. full map awareness without looking sus",
  "dma setup with this cheat is literally unbeatable. hardware level",
  "quarterly sub is the move. saves money and 3 months of updates",
  "movement prediction on the aimbot is crazy accurate",
  "no random crashes no blue screens. just works every time",
  "lifetime was expensive but 6 months later still using it daily",
  "stream proof overlay is flawless. streaming ranked with it, zero drama",
  "blurred dma is the smoothest cheat ive used in 4 years. premium quality",
]

const FIRMWARE_REVIEWS = [
  "custom firmware runs flawless. eac emulation is perfect and stable",
  "dma card with this firmware is literally invisible to anti cheat",
  "setup was smooth with discord support. walked me through flashing",
  "firmware update dropped within hours of the game update. fastest ever",
  "been running eac/be emulation for 3 months. zero issues zero detection",
  "the slotted edition is next level. worth the premium",
  "faceit bypass firmware actually works. thought it was impossible",
  "captain dma + this firmware = unstoppable combo",
  "vanguard emulation works perfectly. val with full hardware bypass",
  "quality is insane. actual engineers built this not amateurs",
  "tried cheap firmware elsewhere. detected in a week. this? 4 months",
  "teensy integration is seamless. plug and play after flashing",
  "firmware updates are free and fast. never left hanging after a patch",
]

const BUNDLE_REVIEWS = [
  "got the full bundle. everything works together perfectly. best purchase this year",
  "bundle saved me like 200 quid compared to buying separate. smart move",
  "setup took 30 min with discord support. unboxing to in-game in half an hour",
  "the hardware quality is premium. dma card fuser everything feels solid",
  "lifetime discord support is real. they helped me at 2am no questions",
  "discreet shipping was fast. package looked normal from outside",
  "elite bundle is expensive but you get everything for the best setup",
  "advanced bundle hits the sweet spot. great hardware + quarterly cheat",
  "basic bundle got me started. upgraded to advanced 2 months later",
  "everything was plug and play. no compatibility issues no driver problems",
  "bundle came with clear setup docs + priority discord channel",
  "shipping was 3 days to UK. packaged well, arrived perfect condition",
  "already recommended to 3 friends. all running clean now",
]

// ─── 3-star texts ───
const REVIEWS_3STAR = [
  "works but took a while to set up. support was helpful tho",
  "decent but had some fps drops initially. fixed after config changes",
  "good product but the documentation could be better",
  "product is solid but setup was confusing at first",
  "works fine once running but initial config was annoying",
  "its alright. does what it says but expected more for the price",
  "had to reinstall twice before it worked. support helped tho",
  "works on fortnite perfectly but had issues with other games",
  "took about an hour to set up when they said 5 minutes",
]

// ─── 2-star texts ───
const REVIEWS_2STAR = [
  "took 3 days to get support help. product works now but the wait was annoying",
  "had compatibility issues with my amd board. eventually got it working",
  "setup was confusing. got it working after support helped but meh experience",
  "the product works but crashed my pc twice during setup",
  "expected better for the price honestly. its ok but not premium",
]

// ─── 1-star texts ───
const REVIEWS_1STAR = [
  "couldnt get it working on my setup",
  "didnt work with my motherboard",
  "support took forever to respond. gave up",
]

// ─── Usernames ───
const USERNAMES = [
  "wraith", "sk8", "nxva", "zeph", "blitz", "kyro", "dex", "flux",
  "ash", "ryze", "vxid", "cryo", "hex", "mrk", "sly", "bxn",
  "koda", "rift", "syn", "jynx", "ph4nt", "drft", "axl", "t0x",
  "vyn", "echo", "nyx", "z3r0", "raze", "glitch", "spek", "onyx",
  "prx", "faze_kid", "m0nk", "bolt", "hxze", "xen", "puls", "dkz",
  "kr4k", "styx", "xero", "lycan", "r4v3", "djinn", "apex_g", "c0lt",
  "ember", "n1tr0", "shade", "drift", "kx7", "lux", "orion", "vxlt",
  "crypt", "nova", "pulse", "warp", "zenith", "arc", "blaze", "coda",
  "fyr3", "ghost", "hydr4", "ix", "jet", "kairo", "lynx", "mxrk",
  "neon", "opal", "pyro", "quest", "ryx", "solr", "tox", "umbra",
  "vex", "wxrp", "xion", "yuki", "zolt", "agnt", "brx", "clix_fn",
  "d4wn", "evx", "frst", "grim", "havoc", "inx", "jolt", "krypt",
]

const EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "proton.me", "hotmail.com", "icloud.com"]

// ─── Seeded random ───
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}
function pickFromSeed<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)]
}

// ─── Products ───
const PRODUCT_POOLS: { name: string; id: string; reviews: string[]; weight: number }[] = [
  { name: "Perm Spoofer", id: "perm-spoofer", reviews: SPOOFER_REVIEWS, weight: 25 },
  { name: "Temp Spoofer", id: "temp-spoofer", reviews: SPOOFER_REVIEWS, weight: 12 },
  { name: "Fortnite External", id: "fortnite-external", reviews: CHEAT_REVIEWS, weight: 18 },
  { name: "Blurred DMA Cheat", id: "blurred", reviews: CHEAT_REVIEWS, weight: 20 },
  { name: "Streck DMA Cheat", id: "streck", reviews: CHEAT_REVIEWS, weight: 8 },
  { name: "Custom DMA Firmware", id: "custom-dma-firmware", reviews: FIRMWARE_REVIEWS, weight: 7 },
  { name: "DMA Basic Bundle", id: "dma-basic", reviews: BUNDLE_REVIEWS, weight: 3 },
  { name: "DMA Advanced Bundle", id: "dma-advanced", reviews: BUNDLE_REVIEWS, weight: 4 },
  { name: "DMA Elite Bundle", id: "dma-elite", reviews: BUNDLE_REVIEWS, weight: 3 },
]

function pickProduct(seed: number) {
  const totalWeight = PRODUCT_POOLS.reduce((s, p) => s + p.weight, 0)
  let roll = seededRandom(seed) * totalWeight
  for (const p of PRODUCT_POOLS) { roll -= p.weight; if (roll <= 0) return p }
  return PRODUCT_POOLS[0]
}

function getTimeLabel(daysAgo: number): string {
  if (daysAgo === 0) return "today"
  if (daysAgo === 1) return "yesterday"
  if (daysAgo < 7) return `${daysAgo} days ago`
  if (daysAgo < 14) return "1 week ago"
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`
  if (daysAgo < 60) return "1 month ago"
  if (daysAgo < 365) return `${Math.floor(daysAgo / 30)} months ago`
  return "1 year ago"
}

function formatDate(d: Date): string { return d.toISOString().split("T")[0] }

// ─── Team responses ───
const TEAM_RESPONSES_POSITIVE = [
  "appreciate the love! glad everything is running smooth. hit us up on discord if you need anything 🤝",
  "thanks for the review! dont hesitate to reach out if you want help optimizing configs",
  "glad to hear it! we put a lot of work into keeping everything undetected 💪",
  "love hearing this! thanks for the kind words",
  "thanks king! we push updates fast because downtime = lost games 🔥",
  "welcome to the lethal family! quality and reliability are our top priorities",
  "respect! reviews like this keep us motivated 🎯",
  "thanks for taking the time to write this! real feedback drives us forward",
]

const TEAM_RESPONSES_NEGATIVE = [
  "sorry to hear that, please open a discord ticket and we'll sort it out asap",
  "this shouldn't happen — DM us on discord and we'll get you fixed up today",
  "we've updated the setup guide based on feedback like this. thanks for letting us know",
  "really sorry about the experience. please reach out again and we'll prioritize you",
  "appreciate the honest feedback. we've pushed an update that should fix this",
  "not the experience we want for anyone. DM us your order ID and we'll make it right",
]

// ─── Generator — exactly 847 reviews ───

const TARGET_TOTAL = 847
const GEN_START = new Date("2025-06-01")

export function generateAllReviews(): GeneratedReview[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const totalDays = Math.max(1, Math.floor((today.getTime() - GEN_START.getTime()) / 86400000))

  // Calculate per-day count to hit exactly TARGET_TOTAL
  // We'll distribute reviews across days, more recent = more reviews
  const reviews: GeneratedReview[] = []
  let globalId = 10000

  // First pass: calculate raw weights per day
  const dayWeights: number[] = []
  let totalWeight = 0
  for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
    // Gradual growth: early days ~0.6 weight, recent ~1.4
    const w = 0.6 + 0.8 * (dayIdx / totalDays)
    dayWeights.push(w)
    totalWeight += w
  }

  // Second pass: scale to TARGET_TOTAL
  const dayCounts: number[] = []
  let runningTotal = 0
  for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
    const raw = (dayWeights[dayIdx] / totalWeight) * TARGET_TOTAL
    const count = Math.round(raw)
    dayCounts.push(count)
    runningTotal += count
  }
  // Adjust last day to hit exact target
  if (dayCounts.length > 0) {
    dayCounts[dayCounts.length - 1] += TARGET_TOTAL - runningTotal
  }

  // For today: only show up to current hour proportion
  const todayIdx = totalDays - 1
  if (dayCounts[todayIdx]) {
    const hour = now.getUTCHours()
    const proportion = Math.min((hour + 1) / 24, 1)
    dayCounts[todayIdx] = Math.max(1, Math.floor(dayCounts[todayIdx] * proportion))
  }

  const d = new Date(GEN_START)
  for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
    const year = d.getFullYear()
    const month = d.getMonth()
    const day = d.getDate()
    const daySeed = year * 10000 + (month + 1) * 100 + day
    const daysAgo = Math.floor((today.getTime() - d.getTime()) / 86400000)
    const count = dayCounts[dayIdx] || 0

    for (let i = 0; i < count; i++) {
      const seed = daySeed * 1000 + i
      const product = pickProduct(seed + 1)
      const username = pickFromSeed(USERNAMES, seed + 3)
      const domain = pickFromSeed(EMAIL_DOMAINS, seed + 4)
      const emailLocal = username.replace(/[^a-z0-9]/g, "") + Math.floor(seededRandom(seed + 5) * 99)
      const masked = emailLocal.substring(0, 3) + "***"

      // Rating: 70% 5★, 18% 4★, 8% 3★, 3% 2★, 1% 1★
      const ratingRoll = seededRandom(seed + 6)
      let rating: number
      if (ratingRoll < 0.70) rating = 5
      else if (ratingRoll < 0.88) rating = 4
      else if (ratingRoll < 0.96) rating = 3
      else if (ratingRoll < 0.99) rating = 2
      else rating = 1

      // Pick text by rating
      let reviewText: string
      if (rating >= 4) reviewText = pickFromSeed(product.reviews, seed + 2)
      else if (rating === 3) reviewText = pickFromSeed(REVIEWS_3STAR, seed + 2)
      else if (rating === 2) reviewText = pickFromSeed(REVIEWS_2STAR, seed + 2)
      else reviewText = pickFromSeed(REVIEWS_1STAR, seed + 2)

      // Helpful by age
      let helpful: number
      if (daysAgo > 180) helpful = 80 + Math.floor(seededRandom(seed + 7) * 120)
      else if (daysAgo > 30) helpful = 15 + Math.floor(seededRandom(seed + 7) * 65)
      else if (daysAgo > 0) helpful = Math.floor(seededRandom(seed + 7) * 15)
      else helpful = Math.floor(seededRandom(seed + 7) * 3)

      // Team responses: 15% on 5★, 10% on 4★, 40% on ≤3★
      let teamResponse: string | null = null
      const responseRoll = seededRandom(seed + 8)
      if (rating === 5 && responseRoll < 0.15) teamResponse = pickFromSeed(TEAM_RESPONSES_POSITIVE, seed + 9)
      else if (rating === 4 && responseRoll < 0.10) teamResponse = pickFromSeed(TEAM_RESPONSES_POSITIVE, seed + 9)
      else if (rating <= 3 && responseRoll < 0.40) teamResponse = pickFromSeed(TEAM_RESPONSES_NEGATIVE, seed + 9)

      reviews.push({
        id: globalId++,
        text: reviewText,
        rating,
        product: product.name,
        product_id: product.id,
        username,
        email: `${masked}@${domain}`,
        time_label: getTimeLabel(daysAgo),
        verified: true,
        is_auto: false,
        refunded: false,
        helpful,
        team_response: teamResponse,
        created_at: formatDate(d),
      })
    }

    d.setDate(d.getDate() + 1)
  }

  return reviews.reverse()
}
