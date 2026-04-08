// Lightweight i18n for the Telegram bot.
//
// No persistent storage: language is auto-detected from Telegram's
// `language_code` on every update, and carried inside callback_data so the
// user's choice persists across inline keyboard navigation without a database.

import type { BotCurrency } from "@/lib/telegram/pricing"

export type Lang = "en" | "ru"

export function detectLang(user?: { language_code?: string }): Lang {
  const code = user?.language_code?.toLowerCase() || ""
  if (code.startsWith("ru") || code.startsWith("uk") || code.startsWith("be")) {
    return "ru"
  }
  return "en"
}

export function currencyForLang(lang: Lang): BotCurrency {
  return lang === "ru" ? "RUB" : "USD"
}

type Dict = Record<string, { en: string; ru: string }>

const STRINGS: Dict = {
  welcome_title: {
    en: "<b>Welcome to Lethal Solutions</b> 🖤",
    ru: "<b>Добро пожаловать в Lethal Solutions</b> 🖤",
  },
  welcome_body: {
    en: "Premium DMA cheats, HWID spoofers & firmware — now available directly in Telegram.\n\nPick a category below to browse the catalog. Payments are processed in-app via Telegram Stars ⭐.\n\nNeed help? Message us any time and we'll reply.",
    ru: "Премиум DMA-читы, HWID-спуферы и прошивки — теперь прямо в Telegram.\n\nВыбери категорию ниже, чтобы посмотреть каталог. Оплата проходит внутри Telegram через Stars ⭐.\n\nНужна помощь? Просто напиши нам в этот чат.",
  },
  cat_cheat: { en: "🎯 Cheats", ru: "🎯 Читы" },
  cat_spoofer: { en: "🛡️ Spoofers", ru: "🛡️ Спуферы" },
  cat_firmware: { en: "💾 DMA Firmware", ru: "💾 DMA Прошивки" },
  cat_bundle: { en: "📦 Bundles", ru: "📦 Комплекты" },
  cat_cheat_title: { en: "🎯 <b>Cheats</b>", ru: "🎯 <b>Читы</b>" },
  cat_spoofer_title: { en: "🛡️ <b>Spoofers</b>", ru: "🛡️ <b>Спуферы</b>" },
  cat_firmware_title: { en: "💾 <b>DMA Firmware</b>", ru: "💾 <b>DMA Прошивки</b>" },
  cat_bundle_title: { en: "📦 <b>Bundles</b>", ru: "📦 <b>Комплекты</b>" },
  category_body: {
    en: "Select a product to see pricing and purchase options.",
    ru: "Выбери товар, чтобы увидеть цены и оформить покупку.",
  },
  btn_back: { en: "« Back", ru: "« Назад" },
  btn_website: { en: "🛒 Open website", ru: "🛒 Открыть сайт" },
  btn_support: { en: "💬 Support", ru: "💬 Поддержка" },
  btn_language: { en: "🌐 Русский", ru: "🌐 English" },
  includes_title: { en: "<b>What's included:</b>", ru: "<b>В комплекте:</b>" },
  pick_duration: {
    en: "<i>Pick a license duration below to pay with Telegram Stars ⭐</i>",
    ru: "<i>Выбери длительность лицензии ниже — оплата через Telegram Stars ⭐</i>",
  },
  product_not_found: {
    en: "Product not found.",
    ru: "Товар не найден.",
  },
  variant_unavailable: {
    en: "That option is no longer available.",
    ru: "Этот вариант больше недоступен.",
  },
  help: {
    en: "<b>Commands</b>\n/start — main menu\n/catalog — browse products\n/lang — change language\n/help — this message\n\nOr just send us a message and an admin will reply.",
    ru: "<b>Команды</b>\n/start — главное меню\n/catalog — каталог товаров\n/lang — сменить язык\n/help — это сообщение\n\nИли просто напиши нам — админ ответит.",
  },
  lang_picker: {
    en: "Select your language:",
    ru: "Выбери язык:",
  },
  lang_en: { en: "🇬🇧 English", ru: "🇬🇧 English" },
  lang_ru: { en: "🇷🇺 Русский", ru: "🇷🇺 Русский" },
  customer_message_ack: {
    en: "Thanks — your message has been sent to the team. We'll reply shortly.",
    ru: "Спасибо — твоё сообщение отправлено команде. Мы скоро ответим.",
  },
  payment_success: {
    en: "✅ <b>Payment received — thank you!</b>",
    ru: "✅ <b>Оплата получена — спасибо!</b>",
  },
  payment_order_label: { en: "<b>Order:</b>", ru: "<b>Заказ:</b>" },
  payment_product_label: { en: "<b>Product:</b>", ru: "<b>Товар:</b>" },
  payment_paid_label: { en: "<b>Paid:</b>", ru: "<b>Оплачено:</b>" },
  payment_followup: {
    en: "An admin will deliver your license and setup instructions shortly. Please reply to this chat if you don't hear back within an hour.",
    ru: "Админ выдаст лицензию и инструкцию по установке в ближайшее время. Если не ответим в течение часа — напиши в этот чат.",
  },
  invoice_description_suffix: {
    en: "Paid in Telegram Stars.",
    ru: "Оплата в Telegram Stars.",
  },
}

export function t(key: keyof typeof STRINGS, lang: Lang): string {
  const entry = STRINGS[key]
  if (!entry) return key
  return entry[lang] || entry.en
}
