// Run: node scripts/generate-favicon.mjs
// Generates favicon.ico and apple-touch-icon.png from public/images/logo.png
// Requires: npm install sharp png-to-ico

import sharp from "sharp"
import pngToIco from "png-to-ico"
import { writeFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const logoPath = resolve(root, "public/images/logo.png")

async function main() {
  console.log("Generating favicons from", logoPath)

  // Generate 32x32 PNG for ICO
  const png32 = await sharp(logoPath)
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  // Generate 16x16 PNG for ICO
  const png16 = await sharp(logoPath)
    .resize(16, 16, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  // Save temp PNGs and create ICO
  const tmpPath32 = resolve(root, "public/favicon-32.png")
  const tmpPath16 = resolve(root, "public/favicon-16.png")
  writeFileSync(tmpPath32, png32)
  writeFileSync(tmpPath16, png16)

  const ico = await pngToIco([tmpPath32, tmpPath16])
  writeFileSync(resolve(root, "public/favicon.ico"), ico)
  console.log("Created public/favicon.ico")

  // Clean up temp files
  const { unlinkSync } = await import("fs")
  try { unlinkSync(tmpPath32) } catch {}
  try { unlinkSync(tmpPath16) } catch {}

  // Generate apple-touch-icon 180x180
  await sharp(logoPath)
    .resize(180, 180, { fit: "contain", background: { r: 10, g: 10, b: 10, alpha: 1 } })
    .png()
    .toFile(resolve(root, "public/apple-touch-icon.png"))
  console.log("Created public/apple-touch-icon.png")

  console.log("Done!")
}

main().catch(console.error)
