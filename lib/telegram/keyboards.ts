import { PRODUCTS, type Product, type ProductVariant } from "@/lib/products"
import type { InlineKeyboardMarkup } from "@/lib/telegram/client"
import { currencyForLang, t, type Lang } from "@/lib/telegram/i18n"
import { RU_PRODUCTS } from "@/lib/telegram/product-translations"
import {
  formatBotPrice,
  formatStars,
  penceToStars,
} from "@/lib/telegram/pricing"

// Callback data layout (≤64 bytes per Telegram spec):
//   home:<lang>
//   cat:<category>:<lang>
//   prod:<productId>:<lang>
//   buy:<productId>:<variantId>:<lang>
//   lang:<lang>

export const CATEGORIES: {
  id: Product["category"]
  iconKey: "cat_cheat" | "cat_spoofer" | "cat_firmware" | "cat_bundle"
  titleKey: "cat_cheat_title" | "cat_spoofer_title" | "cat_firmware_title" | "cat_bundle_title"
}[] = [
  { id: "cheat", iconKey: "cat_cheat", titleKey: "cat_cheat_title" },
  { id: "spoofer", iconKey: "cat_spoofer", titleKey: "cat_spoofer_title" },
  { id: "firmware", iconKey: "cat_firmware", titleKey: "cat_firmware_title" },
  { id: "bundle", iconKey: "cat_bundle", titleKey: "cat_bundle_title" },
]

export function localizedProductName(product: Product, lang: Lang): string {
  if (lang === "ru") {
    return RU_PRODUCTS[product.id]?.name || product.name
  }
  return product.name
}

export function localizedVariantName(
  product: Product,
  variant: ProductVariant,
  lang: Lang,
): string {
  if (lang === "ru") {
    return RU_PRODUCTS[product.id]?.variantNames?.[variant.id] || variant.name
  }
  return variant.name
}

export function localizedDescription(product: Product, lang: Lang): string {
  if (lang === "ru") {
    return RU_PRODUCTS[product.id]?.longDescription ||
      RU_PRODUCTS[product.id]?.description ||
      product.longDescription ||
      product.description
  }
  return product.longDescription || product.description
}

export function localizedFeatures(product: Product, lang: Lang): string[] {
  if (lang === "ru") {
    const ru = RU_PRODUCTS[product.id]?.features
    if (ru && ru.length > 0) return ru
  }
  return product.features || []
}

function badgeEmoji(p: Product): string {
  if (p.badge === "Popular" || p.popular) return "🔥"
  if (p.badge === "Best Value") return "💎"
  if (p.badge === "Premium") return "👑"
  return "◆"
}

// Strip any surrounding <>, whitespace or trailing slashes from an env-provided
// URL. Vercel env vars are prone to getting <autolink> formatting when copied
// from Markdown on mobile, which Telegram's inline keyboard then rejects with
// "Unsupported URL protocol".
function cleanUrl(raw: string | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim().replace(/^[<\s]+|[>\s]+$/g, "")
  if (!/^https?:\/\//i.test(trimmed)) return null
  return trimmed.replace(/\/+$/, "")
}

function siteUrl(): string {
  return (
    cleanUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://lethalsolutions.me")
  )
}

function supportUrl(): string {
  return cleanUrl(process.env.TELEGRAM_SUPPORT_URL) || "https://t.me/lethalsolutions"
}

export function mainMenuKeyboard(lang: Lang): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      ...CATEGORIES.map((c) => [
        { text: t(c.iconKey, lang), callback_data: `cat:${c.id}:${lang}` },
      ]),
      [
        { text: t("btn_website", lang), url: siteUrl() },
        { text: t("btn_support", lang), url: supportUrl() },
      ],
      [{ text: t("btn_language", lang), callback_data: `lang:${lang === "en" ? "ru" : "en"}` }],
    ],
  }
}

export function categoryKeyboard(
  category: Product["category"],
  lang: Lang,
): InlineKeyboardMarkup {
  const items = PRODUCTS.filter((p) => p.category === category)
  return {
    inline_keyboard: [
      ...items.map((p) => [
        {
          text: `${badgeEmoji(p)}  ${localizedProductName(p, lang)}`,
          callback_data: `prod:${p.id}:${lang}`,
        },
      ]),
      [{ text: t("btn_back", lang), callback_data: `home:${lang}` }],
    ],
  }
}

export function productKeyboard(product: Product, lang: Lang): InlineKeyboardMarkup {
  const currency = currencyForLang(lang)
  return {
    inline_keyboard: [
      ...product.variants.map((v) => {
        const price = formatBotPrice(v.priceInPence, currency)
        const stars = formatStars(penceToStars(v.priceInPence))
        const name = localizedVariantName(product, v, lang)
        return [
          {
            text: `${name}  ·  ${price}  ·  ${stars}`,
            callback_data: `buy:${product.id}:${v.id}:${lang}`,
          },
        ]
      }),
      [{ text: t("btn_back", lang), callback_data: `cat:${product.category}:${lang}` }],
    ],
  }
}

export function languagePickerKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: t("lang_en", "en"), callback_data: "lang:en" },
        { text: t("lang_ru", "ru"), callback_data: "lang:ru" },
      ],
    ],
  }
}
