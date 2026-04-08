// Text-rendering helpers that give the bot a polished, premium look matching
// the Lethal Solutions site aesthetic (dark + orange accents).
//
// Telegram allows limited HTML (<b>, <i>, <u>, <s>, <code>, <pre>, <a>) and
// emojis, so we lean on those plus Unicode dividers for visual hierarchy.
//
// Caption length cap is 1024 characters; we keep every screen well under that.

import { getProductById, type Product } from "@/lib/products"
import {
  getOrdersToday,
  getProductReviewCount,
  getTotalReviewCount,
} from "@/lib/review-counts"
import { escapeHtml } from "@/lib/telegram/client"
import { t, currencyForLang, type Lang } from "@/lib/telegram/i18n"
import {
  localizedDescription,
  localizedFeatures,
  localizedProductName,
  localizedVariantName,
} from "@/lib/telegram/keyboards"
import { formatBotPrice, formatStars } from "@/lib/telegram/pricing"

// Thin separator that matches the divider pattern used on the site.
const HAIRLINE = "━━━━━━━━━━━━━━━━━━━━"

// Format an integer with thousands separator (5000 → "5,000").
function thousands(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// --- Main menu ----------------------------------------------------------------

export function renderWelcome(lang: Lang): string {
  const totalReviews = getTotalReviewCount()
  const ordersToday = getOrdersToday()

  const lines = [
    t("welcome_title", lang),
    `<i>${t("welcome_tagline", lang)}</i>`,
    "",
    HAIRLINE,
    `🛡  <b>5,000+</b>  ${t("stat_clients", lang)}`,
    `⭐  <b>${thousands(totalReviews)}</b>  ${t("stat_reviews", lang)}`,
    `📦  <b>${ordersToday}</b>  ${t("stat_orders_today", lang)}`,
    HAIRLINE,
    "",
    t("welcome_catalog_label", lang),
  ]
  return lines.join("\n")
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

export function renderCategory(
  category: Product["category"],
  lang: Lang,
  productsInCategory: Product[],
): string {
  const title = t(CATEGORY_TITLE_KEY[category], lang)
  const home = escapeHtml(t("breadcrumb_home", lang))
  const sep = t("breadcrumb_separator", lang)

  // Cheapest variant across the whole category, for the "starting from" line.
  const allVariants = productsInCategory.flatMap((p) => p.variants)
  const minPrice =
    allVariants.length > 0 ? Math.min(...allVariants.map((v) => v.priceInPence)) : 0

  const lines = [
    `<i>${home}${sep}<b>${title.replace(/<[^>]+>/g, "")}</b></i>`,
    "",
    title,
    HAIRLINE,
    `📦  <b>${productsInCategory.length}</b>  ${t("category_products_count", lang)}` +
      (minPrice
        ? `   ·   ${t("category_starting_from", lang)} <b>${formatBotPrice(
            minPrice,
            currencyForLang(lang),
          )}</b>`
        : ""),
    "",
    t("category_body", lang),
  ]
  return lines.join("\n")
}

// --- Product screen -----------------------------------------------------------

export function renderProduct(product: Product, lang: Lang): string {
  const name = escapeHtml(localizedProductName(product, lang))
  const description = escapeHtml(localizedDescription(product, lang))
  const features = localizedFeatures(product, lang)
  const currency = currencyForLang(lang)
  const reviews = getProductReviewCount(product.id)
  const home = escapeHtml(t("breadcrumb_home", lang))
  const sep = t("breadcrumb_separator", lang)
  const categoryTitle = t(CATEGORY_TITLE_KEY[product.category], lang).replace(/<[^>]+>/g, "")

  const lines: string[] = []
  // Breadcrumb
  lines.push(`<i>${home}${sep}${escapeHtml(categoryTitle)}${sep}<b>${name}</b></i>`)
  lines.push("")
  // Title
  lines.push(`<b>${name.toUpperCase()}</b>`)

  // Badge + reviews row
  const trustBits: string[] = []
  if (product.badge) {
    const badgeIcon =
      product.badge === "Popular" || product.popular
        ? "🔥"
        : product.badge === "Best Value"
          ? "💎"
          : product.badge === "Premium"
            ? "👑"
            : "✓"
    trustBits.push(`${badgeIcon} <b>${escapeHtml(product.badge)}</b>`)
  }
  if (reviews > 0) {
    trustBits.push(`⭐ <b>5.0</b> · ${reviews} ${t("product_rating", lang)}`)
  }
  if (trustBits.length > 0) {
    lines.push(trustBits.join("   ·   "))
  }
  lines.push(`<i>${t("product_in_stock", lang)}</i>`)
  lines.push("")

  // Description (trim very long ones to keep room for features + price)
  const trimmedDesc = description.length > 280 ? description.slice(0, 277) + "…" : description
  lines.push(trimmedDesc)

  // Features
  if (features.length > 0) {
    lines.push("")
    for (const f of features.slice(0, 5)) {
      lines.push(`<b>✓</b>  ${escapeHtml(f)}`)
    }
  }

  // Price range
  if (product.variants.length > 0) {
    const min = Math.min(...product.variants.map((v) => v.priceInPence))
    const max = Math.max(...product.variants.map((v) => v.priceInPence))
    lines.push("")
    lines.push(HAIRLINE)
    const priceLine =
      min === max
        ? formatBotPrice(min, currency)
        : `${formatBotPrice(min, currency)}  —  ${formatBotPrice(max, currency)}`
    lines.push(`💵  <b>${priceLine}</b>`)
  }

  // Hard cap at 1000 chars to leave room for Telegram's own caption overhead.
  let caption = lines.join("\n")
  if (caption.length > 1000) caption = caption.slice(0, 997) + "…"
  return caption
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
  lines.push(HAIRLINE)
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
  return ["<b>LETHAL SOLUTIONS</b>", HAIRLINE, "", t("help", lang)].join("\n")
}

export function renderLangPicker(lang: Lang): string {
  return ["<b>Language · Язык</b>", HAIRLINE, "", t("lang_picker", lang)].join("\n")
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
