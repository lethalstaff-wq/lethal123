// Text-rendering helpers that give the bot a consistent, polished look
// matching the Lethal Solutions site aesthetic (dark + orange accents).
//
// Telegram allows limited HTML (<b>, <i>, <u>, <s>, <code>, <pre>, <a>) and
// emojis, so we lean on those plus Unicode box-drawing for dividers and frames.

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

const DIVIDER = "━━━━━━━━━━━━━━━━━━━"

export function renderWelcome(lang: Lang): string {
  return [
    "🖤  <b>LETHAL SOLUTIONS</b>  🖤",
    DIVIDER,
    "",
    t("welcome_body", lang),
  ].join("\n")
}

export function renderCategory(
  category: Product["category"],
  lang: Lang,
): string {
  const titleKey =
    category === "cheat"
      ? "cat_cheat_title"
      : category === "spoofer"
        ? "cat_spoofer_title"
        : category === "firmware"
          ? "cat_firmware_title"
          : "cat_bundle_title"

  return [
    t(titleKey, lang),
    DIVIDER,
    "",
    t("category_body", lang),
  ].join("\n")
}

export function renderProduct(product: Product, lang: Lang): string {
  const name = escapeHtml(localizedProductName(product, lang))
  const description = escapeHtml(localizedDescription(product, lang))
  const features = localizedFeatures(product, lang)
  const currency = currencyForLang(lang)

  const lines: string[] = []
  lines.push(`◆  <b>${name.toUpperCase()}</b>  ◆`)
  lines.push(DIVIDER)
  if (product.badge) {
    const badgeIcon =
      product.badge === "Popular" || product.popular
        ? "🔥"
        : product.badge === "Best Value"
          ? "💎"
          : product.badge === "Premium"
            ? "👑"
            : "⚡"
    lines.push(`${badgeIcon}  <i>${escapeHtml(product.badge)}</i>`)
  }
  lines.push("")
  lines.push(description)

  if (features.length > 0) {
    lines.push("")
    lines.push(t("includes_title", lang))
    for (const f of features.slice(0, 12)) {
      lines.push(`  ▸  ${escapeHtml(f)}`)
    }
  }

  // Show a price range so the user sees at a glance what to expect before
  // opening the variants keyboard.
  if (product.variants.length > 0) {
    const min = Math.min(...product.variants.map((v) => v.priceInPence))
    const max = Math.max(...product.variants.map((v) => v.priceInPence))
    lines.push("")
    lines.push(DIVIDER)
    const priceLine =
      min === max
        ? formatBotPrice(min, currency)
        : `${formatBotPrice(min, currency)}  —  ${formatBotPrice(max, currency)}`
    lines.push(`💵  <b>${priceLine}</b>`)
    lines.push(t("pick_duration", lang))
  }

  return lines.join("\n")
}

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
  lines.push(DIVIDER)
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

export function renderHelp(lang: Lang): string {
  return [
    "🖤  <b>LETHAL SOLUTIONS</b>  🖤",
    DIVIDER,
    "",
    t("help", lang),
  ].join("\n")
}

export function renderLangPicker(lang: Lang): string {
  return [
    "🌐  <b>Language / Язык</b>",
    DIVIDER,
    "",
    t("lang_picker", lang),
  ].join("\n")
}

// Plain-text description for sendInvoice. Telegram limits this to 255 chars
// and does not render HTML here, so we strip tags and truncate safely.
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
