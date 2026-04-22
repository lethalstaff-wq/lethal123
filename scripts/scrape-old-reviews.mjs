// Downloads all pages of https://lethalsolutions.mysellauth.com/feedback?page=N
// Saves raw HTML to data/old-reviews/page-NN.html
// Run: node scripts/scrape-old-reviews.mjs

import { mkdir, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"

const BASE = "https://lethalsolutions.mysellauth.com/feedback"
const TOTAL_PAGES = 31
const OUT_DIR = path.resolve("data/old-reviews")
const DELAY_MS = 400

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchPage(page, attempt = 1) {
  const url = `${BASE}?page=${page}`
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
    },
  })
  if (!res.ok) {
    if (attempt < 3) {
      console.warn(`  page ${page}: ${res.status}, retrying in 2s…`)
      await sleep(2000)
      return fetchPage(page, attempt + 1)
    }
    throw new Error(`page ${page} failed: ${res.status}`)
  }
  return res.text()
}

async function main() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })

  console.log(`Downloading ${TOTAL_PAGES} pages → ${OUT_DIR}`)
  for (let p = 1; p <= TOTAL_PAGES; p++) {
    const html = await fetchPage(p)
    const file = path.join(OUT_DIR, `page-${String(p).padStart(2, "0")}.html`)
    await writeFile(file, html, "utf8")
    console.log(`  ✓ page ${p}/${TOTAL_PAGES}  (${(html.length / 1024).toFixed(0)} KB)`)
    if (p < TOTAL_PAGES) await sleep(DELAY_MS)
  }
  console.log(`\nDone. ${TOTAL_PAGES} files saved to data/old-reviews/`)
  console.log(`Next: send me one page and I'll write the parser.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
