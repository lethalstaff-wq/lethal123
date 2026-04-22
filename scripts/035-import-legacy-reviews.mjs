// Imports the 1828 five-star reviews fetched from SellAuth (data/old-reviews-raw.json)
// into the reviews table with source='sellauth_legacy'.
//
// Prereq: run scripts/034-reviews-add-source-variant.sql in Supabase first.
// Run: node --env-file=.env.local scripts/035-import-legacy-reviews.mjs

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}
const db = createClient(SUPABASE_URL, SUPABASE_KEY)

// SellAuth product.name → our products.id
const PRODUCT_MAP = {
  Blurred: "blurred",
  "Custom Dma Firmware": "custom-dma-firmware",
  "DMA Advanced": "dma-advanced",
  "DMA Basic": "dma-basic",
  "DMA Elite": "dma-elite",
  "Fortnite External": "fortnite-external",
  "Perm Spoofer": "perm-spoofer",
  Streck: "streck",
  "Temp Spoofer": "temp-spoofer",
}

// Normalize variant names so duration pills stay consistent.
function normalizeVariant(name) {
  if (!name) return ""
  const s = name.trim()
  const map = {
    "1 Day License": "1 Day",
    "3 Days License": "3 Days",
    "1 Week License": "1 Week",
    "7 Days": "1 Week",
    Weekly: "1 Week",
    "15 Days": "15 Days",
    "1 Month License": "1 Month",
    "30 Days": "1 Month",
    Monthly: "1 Month",
    "90 Days": "3 Months",
    Quarterly: "3 Months",
    "180 Days": "6 Months",
    "One Time License": "Lifetime",
    "Lifetime License": "Lifetime",
    Lifetime: "Lifetime",
    "EAC/BE Emulated": "EAC/BE",
    "EAC/BE Emulated Slotted": "EAC/BE Slotted",
    "EAC/BE, FaceIt, VGK Emulated": "EAC/BE + FaceIt + VGK",
    "💻 DMA Bundle – Basic": "Basic Bundle",
    "💻 DMA Bundle – Advanced": "Advanced Bundle",
    "💻 DMA Bundle – Elite": "Elite Bundle",
  }
  return map[s] ?? s
}

// Build a username from email without leaking it: "v19163431@gmail.com" → "v19163"
function anonUsername(email) {
  if (!email) return "verified buyer"
  const local = email.split("@")[0] || ""
  // keep first 5-6 chars, strip trailing digits block if long
  const base = local.slice(0, 6).replace(/[_\.\-]/g, "")
  return base || "verified buyer"
}

const raw = JSON.parse(readFileSync("./data/old-reviews-raw.json", "utf8"))
console.log(`Loaded ${raw.length} raw reviews`)

// Filter: only rating >= 2 (user said skip 1★), non-empty message, published
const filtered = raw.filter(
  (r) =>
    r.status === "published" &&
    r.rating >= 2 &&
    typeof r.message === "string" &&
    r.message.trim().length >= 3,
)
console.log(`After filter (≥2★, published, non-empty): ${filtered.length}`)

const rows = []
let skippedUnknownProduct = 0
for (const r of filtered) {
  const item = r.invoice?.items?.[0]
  const productName = item?.product?.name
  const productId = PRODUCT_MAP[productName]
  if (!productId) {
    skippedUnknownProduct++
    continue
  }
  rows.push({
    external_id: r.id,
    source: "sellauth_legacy",
    text: r.message.trim(),
    rating: r.rating,
    product_id: productId,
    username: anonUsername(r.invoice?.email),
    email: "", // never store legacy emails
    variant_name: normalizeVariant(item?.variant?.name),
    verified: true,
    is_auto: !!r.is_automatic,
    refunded: false,
    helpful: 0,
    team_response: r.reply || null,
    time_label: "", // API recomputes this from created_at
    created_at: r.created_at,
  })
}

if (skippedUnknownProduct) console.log(`Skipped ${skippedUnknownProduct} (unknown product)`)
console.log(`Ready to upsert: ${rows.length}`)

// Wipe any previous legacy rows first so re-runs are idempotent.
// (partial unique index on external_id can't be used with PostgREST's ON CONFLICT)
const { error: delErr, count: delCount } = await db
  .from("reviews")
  .delete({ count: "exact" })
  .eq("source", "sellauth_legacy")
if (delErr) {
  console.error("Failed to clear previous legacy rows:", delErr.message)
  process.exit(1)
}
console.log(`Cleared ${delCount ?? 0} previous legacy rows`)

// Insert in batches.
const BATCH = 200
let inserted = 0
for (let i = 0; i < rows.length; i += BATCH) {
  const chunk = rows.slice(i, i + BATCH)
  const { error } = await db.from("reviews").insert(chunk)
  if (error) {
    console.error(`Batch ${i / BATCH + 1} failed:`, error.message)
    process.exit(1)
  }
  inserted += chunk.length
  process.stdout.write(`  batch ${Math.ceil((i + BATCH) / BATCH)}: +${chunk.length}  (total: ${inserted})\n`)
}

console.log(`\n✓ imported ${inserted} legacy reviews`)
