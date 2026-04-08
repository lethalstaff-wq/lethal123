// Text-rendering helpers for the Telegram bot.
//
// Bot is a fallback storefront for customers who can't pay with crypto on the
// main site, so the design is intentionally minimal — no stats, no social
// proof, just the product info needed to choose and pay.
//
// Telegram allows limited HTML (<b>, <i>, <u>, <s>, <code>, <pre>, <a>) and
// caps captions at 1024 characters.

import { getProductById, type Product } from "@/lib/products"
import { escapeHtml } from "@/lib/telegram/client"
import { t, currencyForLang, type Lang } from "@/lib/telegram/i18n"
import {
  localizedDescription,
  localizedFeatures,
  localizedProductName,
  localizedVariantName,
} from "@/lib/telegram/keyboards"
import { formatBotPrice, formatStars } from "@/lib/telegram/pricing"

// --- Main menu ----------------------------------------------------------------

export function renderWelcome(lang: Lang): string {
  return [
    "<b>LETHAL SOLUTIONS</b>",
    `<i>${t("welcome_tagline", lang)}</i>`,
  ].join("\n")
}

// --- Category screen ----------------------------------------------------------

const CATEGORY_TITLE_KEY: Record<
  Product["category"],
  "cat_cheat_title" | "cat_spoofer_title" | "cat_firmware_title" | "cat_bundle_title"
> = {
  cheat: "cat_cheat_title",
  spoofer: "cat_spoofer_title",
  firmware: "cat_firmware_title",
  bundle: "cat_bundle_title",
}

export function renderCategory(category: Product["category"], lang: Lang): string {
  return t(CATEGORY_TITLE_KEY[category], lang)
}

// --- Product screen -----------------------------------------------------------

export function renderProduct(product: Product, lang: Lang): string {
  const name = escapeHtml(localizedProductName(product, lang))
  const description = escapeHtml(localizedDescription(product, lang))
  const features = localizedFeatures(product, lang)
  const currency = currencyForLang(lang)

  const lines: string[] = []
  lines.push(`<b>${name}</b>`)
  lines.push("")

  // Trim long descriptions to keep the caption tight.
  const trimmedDesc = description.length > 240 ? description.slice(0, 237) + "…" : description
  lines.push(trimmedDesc)

  if (features.length > 0) {
    lines.push("")
    for (const f of features.slice(0, 4)) {
      lines.push(`• ${escapeHtml(f)}`)
    }
  }

  if (product.variants.length > 0) {
    const min = Math.min(...product.variants.map((v) => v.priceInPence))
    const max = Math.max(...product.variants.map((v) => v.priceInPence))
    lines.push("")
    const priceLine =
      min === max
        ? formatBotPrice(min, currency)
        : `${formatBotPrice(min, currency)} — ${formatBotPrice(max, currency)}`
    lines.push(`<b>${priceLine}</b>`)
  }

  let caption = lines.join("\n")
  if (caption.length > 1000) caption = caption.slice(0, 997) + "…"
  return caption
}

// --- Payment method picker ----------------------------------------------------

export function renderPaymentPicker(
  product: Product,
  variantName: string,
  priceLabel: string,
  lang: Lang,
): string {
  return [
    `<b>${escapeHtml(localizedProductName(product, lang))}</b>`,
    `<i>${escapeHtml(variantName)}  ·  ${escapeHtml(priceLabel)}</i>`,
    "",
    t("pay_method_title", lang),
  ].join("\n")
}

// --- Payment success ----------------------------------------------------------

export function renderPaymentSuccess(
  orderId: string,
  productId: string | undefined,
  variantId: string | undefined,
  totalStars: number,
  lang: Lang,
): string {
  const product = productId ? getProductById(productId) : undefined
  const variant = product && variantId ? product.variants.find((v) => v.id === variantId) : undefined
  const lines: string[] = []
  lines.push(t("payment_success", lang))
  lines.push("")
  lines.push(`${t("payment_order_label", lang)} <code>${escapeHtml(orderId)}</code>`)
  if (product && variant) {
    lines.push(
      `${t("payment_product_label", lang)} ${escapeHtml(
        localizedProductName(product, lang),
      )} — ${escapeHtml(localizedVariantName(product, variant, lang))}`,
    )
  }
  lines.push(`${t("payment_paid_label", lang)} ${formatStars(totalStars)}`)
  lines.push("")
  lines.push(t("payment_followup", lang))
  return lines.join("\n")
}

// --- Help / language picker ---------------------------------------------------

export function renderHelp(lang: Lang): string {
  return ["<b>LETHAL SOLUTIONS</b>", "", t("help", lang)].join("\n")
}

export function renderLangPicker(lang: Lang): string {
  return ["<b>Language · Язык</b>", "", t("lang_picker", lang)].join("\n")
}

// --- Invoice description (plain text, 255 char cap) --------------------------

export function renderInvoiceDescription(product: Product, lang: Lang): string {
  const base = lang === "ru"
    ? localizedDescription(product, "ru")
    : product.description
  const suffix = ` — ${t("invoice_description_suffix", lang)}`
  const plain = base.replace(/<[^>]+>/g, "")
  const available = 255 - suffix.length
  const trimmed = plain.length > available ? `${plain.slice(0, available - 1)}…` : plain
  return `${trimmed}${suffix}`
}
