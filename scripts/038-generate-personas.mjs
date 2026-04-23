// Build data/personas.json — a complete seed plan for the native reviews
// wall. 038 is deterministic-with-seed; same inputs → same plan. 039 reads
// this file and materializes text + inserts into Supabase.
//
// Pipeline:
//   1. Load usernames: discord_usernames_4000.txt + (optional) data/real-158.txt
//   2. Tag each persona with country, joinDate, reviewQuota
//   3. Walk Dec 2025 → Dec 2026 day by day; each day picks N reviews off the
//      active persona pool. N follows a ramp curve with weekday/jitter mods.
//   4. Each review gets: created_at, product_id, variant_name, rating,
//      length_class, has_positive_reply, has_photo
//   5. Write data/personas.json (shape: { meta, personas: [...] })
//
// Run: node --env-file=.env.local scripts/038-generate-personas.mjs
//      node scripts/038-generate-personas.mjs --dry   (prints stats, no write)
//      node scripts/038-generate-personas.mjs --seed=42

import { readFileSync, writeFileSync, existsSync } from "node:fs"

// ---- deterministic RNG (mulberry32) ---------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---- CLI args -------------------------------------------------------------
const args = process.argv.slice(2)
const DRY = args.includes("--dry")
const seedArg = args.find((a) => a.startsWith("--seed="))
const SEED = seedArg ? Number(seedArg.split("=")[1]) : 20260422
const rand = mulberry32(SEED)

function pick(arr) { return arr[Math.floor(rand() * arr.length)] }
function pickWeighted(entries) {
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [v, w] of entries) {
    r -= w
    if (r <= 0) return v
  }
  return entries[entries.length - 1][0]
}
function randInt(lo, hi) { return Math.floor(rand() * (hi - lo + 1)) + lo }
function addDays(d, n) { const r = new Date(d); r.setUTCDate(r.getUTCDate() + n); return r }
function toISO(d) { return d.toISOString() }

// ---- inputs ---------------------------------------------------------------
const DISCORD_USERNAMES = readFileSync("./discord_usernames_4000.txt", "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean)

const REAL_158_PATH = "./data/real-158.txt"
const REAL_158 = existsSync(REAL_158_PATH)
  ? readFileSync(REAL_158_PATH, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  : []

if (REAL_158.length === 0) {
  console.warn(
    "⚠ data/real-158.txt not found — proceeding with only the 4000 discord names.",
    "\n  Drop your 158 real-buyer usernames there (one per line) and re-run to include them.",
  )
} else if (REAL_158.length !== 158) {
  console.warn(`⚠ data/real-158.txt has ${REAL_158.length} lines, expected 158. Using as-is.`)
}

const ALL_USERNAMES = [...REAL_158, ...DISCORD_USERNAMES]
console.log(`persona pool: ${ALL_USERNAMES.length} (${REAL_158.length} real + ${DISCORD_USERNAMES.length} discord)`)

// ---- product / variant catalog (matches scripts/035 normalizeVariant) ----
const PRODUCT_WEIGHTS = [
  ["fortnite-external", 40],
  ["temp-spoofer", 18],
  ["streck", 9],
  ["blurred", 9],
  ["perm-spoofer", 8],
  ["custom-dma-firmware", 6],
  ["dma-basic", 4],
  ["dma-advanced", 3],
  ["dma-elite", 3],
]

// Per-product variant distribution. Weights are rough — shorter durations
// sell more copies than Lifetime.
const VARIANTS = {
  "fortnite-external": [
    ["1 Day", 18], ["3 Days", 10], ["1 Week", 30],
    ["1 Month", 22], ["3 Months", 10], ["Lifetime", 10],
  ],
  "temp-spoofer": [["1 Day", 55], ["1 Week", 45]],
  "perm-spoofer": [
    ["EAC/BE", 35], ["EAC/BE Slotted", 25], ["EAC/BE + FaceIt + VGK", 40],
  ],
  "streck": [
    ["1 Week", 30], ["1 Month", 35], ["3 Months", 15], ["6 Months", 10], ["Lifetime", 10],
  ],
  "blurred": [
    ["1 Week", 30], ["1 Month", 35], ["3 Months", 15], ["6 Months", 10], ["Lifetime", 10],
  ],
  "custom-dma-firmware": [["Lifetime", 100]],
  "dma-basic": [["Basic Bundle", 100]],
  "dma-advanced": [["Advanced Bundle", 100]],
  "dma-elite": [["Elite Bundle", 100]],
}

// ---- persona assignment ---------------------------------------------------
// Structure:
//   {
//     username, country, joinDate (YYYY-MM-DD), quota, isRealStaffLike,
//     usedProducts: Set, lastReviewDate (YYYY-MM-DD | null)
//   }
//
// Country mix: US 50 / EU 40 / RU 10. Join dates spread mostly across
// Dec 2025 onwards, with a minority of earlier dates so some folks look like
// carried-over buyers. Real-158 gets forced buckets per the handoff.

const START_DATE = new Date("2025-12-01T00:00:00Z")
const END_DATE = new Date("2026-12-31T23:59:59Z")
const TOTAL_DAYS = Math.round((END_DATE - START_DATE) / 86400000)

function pickCountry() {
  return pickWeighted([["us", 50], ["eu", 40], ["ru", 10]])
}

// reviewQuota distribution — how many reviews this persona will post.
// Tuned so ~4158 personas × avg 2.05 ≈ ~8300 total reviews. Shift weight
// toward 3-5 quota so long-tenured personas keep the Oct-Dec curve populated.
function pickQuota() {
  return pickWeighted([
    [0, 4],   // silent lurkers
    [1, 35],
    [2, 30],
    [3, 18],
    [4, 9],
    [5, 4],
  ])
}

// Join date spread. Earlier join = more time to post multiple reviews.
function pickJoinDate(index, isReal158 = false, real158Bucket = null) {
  if (isReal158) {
    if (real158Bucket === "recent") {
      // 1-50: joined in the last ~30 days from today (2026-04-22)
      return addDays(new Date("2026-03-22T00:00:00Z"), randInt(0, 30))
    }
    // 51-158: joined 2025-09 to 2025-11
    return addDays(new Date("2025-09-01T00:00:00Z"), randInt(0, 91))
  }
  // Generic: spread joins across the full year so new personas keep
  // arriving as the ramp grows. Weighted slightly later to match growth.
  const bucket = pickWeighted([
    ["q1", 18],   // Dec 2025 - Feb 2026
    ["q2", 24],   // Mar - May 2026
    ["q3", 28],   // Jun - Aug 2026
    ["q4", 30],   // Sep - Nov 2026
  ])
  if (bucket === "q1") return addDays(START_DATE, randInt(0, 90))
  if (bucket === "q2") return addDays(START_DATE, randInt(91, 181))
  if (bucket === "q3") return addDays(START_DATE, randInt(182, 273))
  return addDays(START_DATE, randInt(274, 360))
}

const personas = ALL_USERNAMES.map((username, i) => {
  const isReal158 = i < REAL_158.length
  let bucket = null
  let quota
  if (isReal158) {
    if (i < 50) { bucket = "recent"; quota = randInt(1, 2) }
    else { bucket = "established"; quota = randInt(2, 3) }
  } else {
    quota = pickQuota()
  }
  return {
    username,
    country: pickCountry(),
    joinDate: pickJoinDate(i, isReal158, bucket),
    quota,
    quotaRemaining: quota,
    usedProducts: new Set(),
    lastReviewDate: null,
    isReal158,
    real158Bucket: bucket,
  }
})

const activePersonas = personas.filter((p) => p.quota > 0)
console.log(`active personas (quota > 0): ${activePersonas.length}`)
console.log(`projected review budget: ${personas.reduce((s, p) => s + p.quota, 0)}`)

// ---- daily volume curve ---------------------------------------------------
// Linear ramp 3 → ~48 across 393 days. Weekday mods: Fri/Sat ×1.5, Mon ×0.7.
// Jitter ±18% per day. Real total lands ~8000-8400 after mods.

function dayWeekdayMod(d) {
  const dow = d.getUTCDay() // 0 Sun, 1 Mon, ..., 6 Sat
  if (dow === 1) return 0.7
  if (dow === 5 || dow === 6) return 1.5
  return 1.0
}

function dailyTarget(d) {
  const dayIdx = Math.round((d - START_DATE) / 86400000)
  const progress = dayIdx / TOTAL_DAYS
  const base = 3 + 45 * progress
  const weekday = dayWeekdayMod(d)
  const jitter = 0.82 + rand() * 0.36
  return Math.max(0, Math.round(base * weekday * jitter))
}

// ---- per-review picks -----------------------------------------------------
function pickRating() {
  return Number(pickWeighted([
    ["5", 75], ["4", 13], ["3", 7], ["2", 3], ["1", 2],
  ]))
}

// Real Discord +rep behavior: most reviews are 1-6 words. No long-form.
function pickLengthClass() {
  return pickWeighted([["short", 88], ["medium", 12]])
}

function pickProduct(persona) {
  // Cross-sell: if persona already bought a DMA bundle, next review likely
  // a cheat (Blurred/Streck) rather than another bundle.
  const used = persona.usedProducts
  const hasBundle = used.has("dma-basic") || used.has("dma-advanced") || used.has("dma-elite")
  const hasCheat = used.has("blurred") || used.has("streck")
  const hasSpoofer = used.has("temp-spoofer") || used.has("perm-spoofer")

  let weights = PRODUCT_WEIGHTS.map(([id, w]) => [id, w])

  if (hasBundle && !hasCheat) {
    // Boost Blurred/Streck, dampen bundles
    weights = weights.map(([id, w]) => {
      if (id === "blurred" || id === "streck") return [id, w * 4]
      if (id.startsWith("dma-")) return [id, w * 0.2]
      return [id, w]
    })
  }

  if (hasSpoofer && !used.has("fortnite-external") && !hasCheat) {
    // Spoofer buyers tend to follow up with a cheat
    weights = weights.map(([id, w]) => {
      if (id === "fortnite-external") return [id, w * 1.6]
      if (id === "blurred" || id === "streck") return [id, w * 1.6]
      return [id, w]
    })
  }

  // Avoid exact product repeat unless quota is high
  weights = weights.map(([id, w]) => (used.has(id) ? [id, w * 0.2] : [id, w]))

  return pickWeighted(weights)
}

function pickVariant(productId) {
  return pickWeighted(VARIANTS[productId])
}

// ---- walk the calendar ----------------------------------------------------
const reviewsOut = [] // { persona, createdAt, productId, variantName, rating, lengthClass, hasPositiveReply, hasPhoto }
let totalRefunds = 0

function eligiblePersonas(today) {
  const cutoff = addDays(today, -10) // min 10 days between reviews from same persona
  return activePersonas.filter((p) => {
    if (p.quotaRemaining <= 0) return false
    if (p.joinDate > today) return false
    if (p.lastReviewDate && p.lastReviewDate > cutoff) return false
    return true
  })
}

for (let d = new Date(START_DATE); d <= END_DATE; d = addDays(d, 1)) {
  const target = dailyTarget(d)
  for (let k = 0; k < target; k++) {
    const pool = eligiblePersonas(d)
    if (pool.length === 0) break
    // Weight picks by remaining quota — users with more budget get picked more
    const persona = pickWeighted(pool.map((p) => [p, Math.max(1, p.quotaRemaining)]))

    let rating = pickRating()
    let productId = pickProduct(persona)

    // Refund-eligible products are ONLY Fortnite External + Spoofers.
    // DMA cheats (Streck/Blurred), DMA bundles, and Custom Firmware are
    // tangible/firmware-level purchases — buyers are committed and we
    // don't show refunds on them. Repick product if low-star draw lands
    // on a no-refund product.
    const NO_REFUND_PRODUCTS = new Set([
      "streck", "blurred",
      "dma-basic", "dma-advanced", "dma-elite",
      "custom-dma-firmware",
    ])
    if (rating <= 2 && NO_REFUND_PRODUCTS.has(productId)) {
      for (let tries = 0; tries < 5 && NO_REFUND_PRODUCTS.has(productId); tries++) {
        productId = pickProduct(persona)
      }
      if (NO_REFUND_PRODUCTS.has(productId)) {
        // Gave up — bump rating to 3★ instead of changing product again
        rating = 3
      }
    }

    // Per-persona rule: a single user can't get refunded twice within 14
    // days (would feel spammy on the wall). If draw gives 1★ but this
    // persona already has a recent refund, demote to 2★.
    if (rating === 1) {
      const recentRefund = persona.lastRefundDate && (d - persona.lastRefundDate) < 14 * 86400000
      if (recentRefund) {
        rating = 2
      } else {
        persona.lastRefundDate = new Date(d)
        totalRefunds++
      }
    }

    const variantName = pickVariant(productId)
    // Low-star reviews skew shorter (real behavior: complaints are terse)
    // AND stay in a short-only pool so positive 5★ templates can't land on
    // a critical review. Only 4★/5★ get the full length distribution.
    const lengthClass = rating <= 3 ? "short" : pickLengthClass()

    // Hour of day — sales spike evenings (18:00-02:00 UTC ≈ peak NA/EU)
    const hour = pickWeighted([
      [9, 2], [10, 2], [11, 3], [12, 3], [13, 4], [14, 4], [15, 5],
      [16, 6], [17, 7], [18, 9], [19, 10], [20, 11], [21, 11], [22, 10],
      [23, 8], [0, 6], [1, 5], [2, 4], [3, 2], [4, 1],
    ])
    const minute = randInt(0, 59)
    const createdAt = new Date(d)
    createdAt.setUTCHours(hour, minute, randInt(0, 59), 0)

    const hasPositiveReply = rating >= 4 && rand() < 0.10
    const hasPhoto = rating >= 4 && rand() < 0.025 // ~2.5% → ~200 total

    reviewsOut.push({
      username: persona.username,
      country: persona.country,
      createdAt: createdAt.toISOString(),
      productId,
      variantName,
      rating,
      lengthClass,
      hasPositiveReply,
      hasPhoto,
      isReal158: persona.isReal158,
    })

    persona.quotaRemaining--
    persona.usedProducts.add(productId)
    persona.lastReviewDate = new Date(d)
  }
}

// ---- stats ----------------------------------------------------------------
const stats = {
  totalReviews: reviewsOut.length,
  personasUsed: new Set(reviewsOut.map((r) => r.username)).size,
  byRating: {},
  byProduct: {},
  byCountry: {},
  byMonth: {},
  refundCount: 0,
  photoCount: reviewsOut.filter((r) => r.hasPhoto).length,
  positiveReplyCount: reviewsOut.filter((r) => r.hasPositiveReply).length,
}
for (const r of reviewsOut) {
  stats.byRating[r.rating] = (stats.byRating[r.rating] || 0) + 1
  stats.byProduct[r.productId] = (stats.byProduct[r.productId] || 0) + 1
  stats.byCountry[r.country] = (stats.byCountry[r.country] || 0) + 1
  const mk = r.createdAt.slice(0, 7)
  stats.byMonth[mk] = (stats.byMonth[mk] || 0) + 1
  if (r.rating === 1) stats.refundCount++
}

console.log("\n── STATS ──────────────────────────────────────")
console.log(`total reviews:      ${stats.totalReviews}`)
console.log(`unique personas:    ${stats.personasUsed}`)
console.log(`refunds (1★):       ${stats.refundCount}`)
console.log(`photos pending:     ${stats.photoCount}`)
console.log(`positive replies:   ${stats.positiveReplyCount}`)
console.log("by rating:")
for (const [k, v] of Object.entries(stats.byRating).sort()) {
  const pct = ((v / stats.totalReviews) * 100).toFixed(1)
  console.log(`  ${k}★  ${String(v).padStart(5)}  ${pct}%`)
}
console.log("by country:")
for (const [k, v] of Object.entries(stats.byCountry)) {
  const pct = ((v / stats.totalReviews) * 100).toFixed(1)
  console.log(`  ${k}   ${String(v).padStart(5)}  ${pct}%`)
}
console.log("by product:")
for (const [k, v] of Object.entries(stats.byProduct).sort((a, b) => b[1] - a[1])) {
  const pct = ((v / stats.totalReviews) * 100).toFixed(1)
  console.log(`  ${k.padEnd(22)} ${String(v).padStart(5)}  ${pct}%`)
}
console.log("by month:")
for (const [k, v] of Object.entries(stats.byMonth).sort()) {
  console.log(`  ${k}  ${String(v).padStart(5)}`)
}

if (DRY) {
  console.log("\n(--dry) skipping write")
  process.exit(0)
}

const out = {
  meta: {
    generatedAt: new Date().toISOString(),
    seed: SEED,
    totalUsernames: ALL_USERNAMES.length,
    real158Count: REAL_158.length,
    dateRange: { start: START_DATE.toISOString(), end: END_DATE.toISOString() },
    stats,
  },
  reviews: reviewsOut,
}

writeFileSync("./data/personas.json", JSON.stringify(out, null, 2))
console.log(`\n✓ wrote data/personas.json  (${reviewsOut.length} reviews, ${(JSON.stringify(out).length / 1024).toFixed(0)} KB)`)
