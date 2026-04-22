// Fills the gap left by dedupe — generates N new unique native reviews,
// dates spread Dec 2025 → May 1 2026, de-duplicated against ALL existing
// native texts already in the DB. Append-only (no wipe).
//
// Run: node --env-file=.env.local scripts/fill-gap-297.mjs

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"

const TARGET_COUNT = Number(process.env.TARGET_COUNT || 297)
const START = new Date(process.env.START_DATE || "2025-12-01T00:00:00Z")
const END = new Date(process.env.END_DATE || "2026-05-01T23:59:59Z")
const SEED = Date.now() & 0xffffffff

// --- mulberry32 -----------------------------------------------------------
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
const rand = mulberry32(SEED)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const pickWeighted = (entries) => {
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [v, w] of entries) { r -= w; if (r <= 0) return v }
  return entries[entries.length - 1][0]
}
const randInt = (lo, hi) => Math.floor(rand() * (hi - lo + 1)) + lo

// --- vocab / usernames ----------------------------------------------------
const vocab = JSON.parse(readFileSync("./data/style-vocab.json", "utf8"))
const discord = readFileSync("./discord_usernames_4000.txt", "utf8").split(/\r?\n/).map(s => s.trim()).filter(Boolean)
const real158 = readFileSync("./data/real-158.txt", "utf8").split(/\r?\n/).map(s => s.trim()).filter(Boolean)
const allUsernames = [...real158, ...discord]

// --- product distribution (same spec) -------------------------------------
const PRODUCT_WEIGHTS = [
  ["fortnite-external", 40], ["temp-spoofer", 18], ["streck", 9], ["blurred", 9],
  ["perm-spoofer", 8], ["custom-dma-firmware", 6],
  ["dma-basic", 4], ["dma-advanced", 3], ["dma-elite", 3],
]
const NO_REFUND = new Set(["streck", "blurred", "dma-basic", "dma-advanced", "dma-elite", "custom-dma-firmware"])
const VARIANTS = {
  "fortnite-external": [["1 Day", 18], ["3 Days", 10], ["1 Week", 30], ["1 Month", 22], ["3 Months", 10], ["Lifetime", 10]],
  "temp-spoofer": [["15 Days", 55], ["30 Days", 35], ["180 Days", 10]],
  "perm-spoofer": [["One-Time License", 50], ["Lifetime License", 50]],
  "streck": [["7 Days", 30], ["30 Days", 35], ["90 Days", 15], ["Lifetime", 20]],
  "blurred": [["Weekly", 30], ["Monthly", 35], ["Quarterly", 15], ["Lifetime", 20]],
  "custom-dma-firmware": [["EAC / BE Emulated", 55], ["Slotted Edition", 30], ["FaceIt / VGK", 15]],
  "dma-basic": [["Complete Bundle", 100]],
  "dma-advanced": [["Complete Bundle", 100]],
  "dma-elite": [["Complete Bundle", 100]],
}

// --- composition (mirrored from 039) --------------------------------------
function pickCountry() { return pickWeighted([["us", 50], ["eu", 40], ["ru", 10]]) }
function pickRating() { return Number(pickWeighted([["5", 75], ["4", 13], ["3", 7], ["2", 3], ["1", 2]])) }

function pickPool(rating, lengthClass, country, productId) {
  const category = vocab.productCategory[productId] || "generic"
  const mergeGenCat = (bucket) => {
    if (!bucket) return []
    const gen = bucket.generic?.[country] || []
    const cat = bucket[category]?.[country] || []
    return [...gen, ...cat]
  }
  if (rating === 1) {
    const bucket = vocab.short_1star
    const pool = bucket[category]?.[country] || bucket.fortnite[country] || []
    return pool.length ? pool : bucket.fortnite.us
  }
  const bucketShort = vocab[`short_${rating}star`]
  if (lengthClass === "short") {
    const merged = mergeGenCat(bucketShort)
    return merged.length ? merged : (bucketShort?.generic?.us || vocab.short_5star.generic.us)
  }
  const bucketLen = vocab[`${lengthClass}_5star`]
  const merged = mergeGenCat(bucketLen)
  return merged.length ? merged : vocab.short_5star.generic[country]
}

function substitute(template) {
  return template
    .replaceAll("{staff}", pick(vocab.staffNames))
    .replaceAll("{weeks}", String(randInt(1, 8)))
    .replaceAll("{n}", String(randInt(2, 12)))
    .replaceAll("{hours}", String(randInt(20, 200)))
}

function composeShort(rating, country, productId) {
  const pool = pickPool(rating, "short", country, productId)
  const main = pick(pool)
  if (rating <= 2) return main
  const openers = vocab.atoms?.openers?.[country] ?? [""]
  const suffixes = vocab.atoms?.suffixes?.[country] ?? [""]
  const opener = pick(openers)
  let suffix = pick(suffixes)
  if (opener && suffix.trim().replace(/[,]/g, "").toLowerCase() === opener.toLowerCase()) suffix = ""
  const suffixCore = suffix.trim().replace(/[,]/g, "").toLowerCase()
  if (suffixCore && main.toLowerCase().includes(suffixCore)) suffix = ""
  return ((opener ? opener + " " : "") + main + suffix).trim()
}
function composeMedium(rating, country, productId) {
  return substitute(pick(pickPool(rating, "medium", country, productId)))
}

function applyLowercase(text, country) {
  const p = vocab.lowercaseProbabilityByCountry[country] ?? 0.3
  return rand() < p ? text.toLowerCase() : text
}
function applyTypos(text, country) {
  if (country !== "us") return text
  const subs = vocab.typoSubs, p = vocab.typoProbability ?? 0.06
  return text.split(/(\s+)/).map(tok => {
    if (/^\s+$/.test(tok)) return tok
    const lower = tok.toLowerCase()
    return subs[lower] && rand() < p ? subs[lower] : tok
  }).join("")
}
function maybeExclaim(text, rating) {
  if (rating < 4) return text
  if (rand() < (vocab.exclamationBoostProbability ?? 0.07)) {
    return text.replace(/\.$/, "") + (rand() < 0.5 ? "!!" : "!!!")
  }
  return text
}
function maybeEmoji(text, rating) {
  if (rating < 4) return text
  if (rand() < (vocab.emojiProbability ?? 0.08)) {
    const pool = rating === 4 ? ["🙏", "❤️", "😏"] : vocab.emojis
    return text + " " + pick(pool)
  }
  return text
}

function composeOnce(rating, lengthClass, country, productId) {
  const raw = lengthClass === "short"
    ? composeShort(rating, country, productId)
    : composeMedium(rating, country, productId)
  let t = applyLowercase(raw, country)
  t = applyTypos(t, country)
  t = maybeExclaim(t, rating)
  t = maybeEmoji(t, rating)
  return t.trim().replace(/\s{2,}/g, " ")
}

// --- refund / positive responses (category-matched; simple, per user's ask)
const UPDATE_POOL = {
  fortnite: {
    ujuk: [
      "windows 25h2 isnt supported rn, refund has been returned",
      "your windows 25h2 build isnt supported, refund is out",
      "win 11 25h2 is unsupported on our loader, refund has been returned",
      "25h2 isnt supported yet, refund went through",
      "windows 25h2 isnt on our compat list, refund has been issued",
    ],
    vsx: [
      "Windows 25H2 is not supported. Refund has been returned.",
      "Cause: Windows 25H2 unsupported. Refund issued.",
      "25H2 build not supported. Refund returned.",
      "Windows 25H2 unsupported on current loader. Refund issued.",
    ],
  },
  spoofer: {
    ujuk: [
      "your motherboard isnt supported, refund has been returned",
      "mobo isnt on our compat list, refund is out",
      "your board combo isnt supported, refund has been returned",
      "motherboard unsupported, refund went through",
      "your mobo isnt supported on our spoofer, refund has been issued",
    ],
    vsx: [
      "Motherboard not supported. Refund has been returned.",
      "Cause: motherboard unsupported. Refund issued.",
      "Mobo unsupported. Refund returned.",
      "Board not on compat list. Refund issued.",
    ],
  },
}

function buildRefundResponse(productId, createdAt) {
  const persona = rand() * 100 < 70 ? "ujuk" : "vsx"
  const cat = productId === "fortnite-external" ? "fortnite" : "spoofer"
  const first = pick(vocab.firstReplyTemplates[persona])
  const update = pick(UPDATE_POOL[cat][persona])
  const ms = new Date(createdAt).getTime()
  const frMs = ms + randInt(2, 8) * 3600000 + randInt(0, 59) * 60000
  const upMs = frMs + randInt(1, 3) * 86400000 + randInt(0, 12) * 3600000
  return {
    response_persona: persona,
    response_first_reply_text: first,
    response_first_reply_at: new Date(frMs).toISOString(),
    response_update_text: update,
    response_update_at: new Date(upMs).toISOString(),
  }
}
function buildPositiveResponse(createdAt) {
  const persona = rand() * 100 < 50 ? "ujuk" : "vsx"
  const text = pick(vocab.positiveReplyShort[persona])
  const ms = new Date(createdAt).getTime()
  return {
    response_persona: persona,
    response_first_reply_text: text,
    response_first_reply_at: new Date(ms + randInt(1, 24) * 3600000).toISOString(),
    response_update_text: null,
    response_update_at: null,
  }
}

// --- date spread ----------------------------------------------------------
function randomDateInRange() {
  const span = END.getTime() - START.getTime()
  return new Date(START.getTime() + Math.floor(rand() * span))
}

// --- main -----------------------------------------------------------------
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error("missing env"); process.exit(1) }
const db = createClient(url, key)

// Preload ALL existing native texts for dedup
const seen = new Set()
for (let off = 0; off < 3000; off += 1000) {
  const { data } = await db.from("reviews").select("text").eq("source", "native").range(off, off + 999)
  if (!data?.length) break
  data.forEach(r => seen.add(r.text))
  if (data.length < 1000) break
}
console.log(`preloaded ${seen.size} existing native texts for dedup`)

const rows = []
let collisions = 0
for (let i = 0; i < TARGET_COUNT; i++) {
  const rating = pickRating()
  let productId = pickWeighted(PRODUCT_WEIGHTS)
  if (rating <= 2 && NO_REFUND.has(productId)) {
    for (let t = 0; t < 5 && NO_REFUND.has(productId); t++) productId = pickWeighted(PRODUCT_WEIGHTS)
    if (NO_REFUND.has(productId)) productId = "fortnite-external"
  }
  const variantName = pickWeighted(VARIANTS[productId])
  const country = pickCountry()
  const lengthClass = rating <= 3 ? "short" : pickWeighted([["short", 88], ["medium", 12]])

  let text = ""
  for (let a = 0; a < 8; a++) {
    text = composeOnce(rating, lengthClass, country, productId)
    if (!seen.has(text)) break
    collisions++
  }
  if (seen.has(text)) text = text + " " + randInt(10, 99) // last-resort mutate
  seen.add(text)

  const createdAt = randomDateInRange().toISOString()
  let response = { response_persona: null, response_first_reply_text: null, response_first_reply_at: null, response_update_text: null, response_update_at: null }
  if (rating === 1) response = buildRefundResponse(productId, createdAt)
  else if (rating >= 4 && rand() < 0.10) response = buildPositiveResponse(createdAt)

  rows.push({
    text, rating, product_id: productId,
    username: pick(allUsernames),
    email: "", variant_name: variantName, source: "native",
    verified: true, is_auto: false,
    refunded: rating === 1, helpful: 0, needs_photo: rating >= 4 && rand() < 0.025,
    time_label: "", created_at: createdAt, team_response: null,
    ...response,
  })
}

console.log(`built ${rows.length} rows (${collisions} dedup collisions resolved)`)

// Sort by created_at for nicer insert order
rows.sort((a, b) => a.created_at.localeCompare(b.created_at))

// Insert in batches of 100
let inserted = 0
for (let i = 0; i < rows.length; i += 100) {
  const chunk = rows.slice(i, i + 100)
  const { error } = await db.from("reviews").insert(chunk)
  if (error) { console.error("insert fail:", error.message); console.error(JSON.stringify(chunk[0]).slice(0, 300)); process.exit(1) }
  inserted += chunk.length
}
console.log(`✓ inserted ${inserted} new rows`)

const { count: nativeCount } = await db.from("reviews").select("*", { count: "exact", head: true }).eq("source", "native")
console.log(`native total now: ${nativeCount}`)
