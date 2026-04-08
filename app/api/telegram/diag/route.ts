// Tiny diagnostic endpoint. Returns which Telegram-related env vars are
// defined on the running server, without leaking any values. Use this to
// confirm a deploy has picked up its env configuration.

import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function mask(value: string | undefined, keepLast = 4): string | null {
  if (!value) return null
  if (value.length <= keepLast) return "•".repeat(value.length)
  return "•".repeat(Math.max(4, value.length - keepLast)) + value.slice(-keepLast)
}

export async function GET() {
  const vars = {
    TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_WEBHOOK_SECRET: !!process.env.TELEGRAM_WEBHOOK_SECRET,
    TELEGRAM_ADMIN_CHAT_ID: !!process.env.TELEGRAM_ADMIN_CHAT_ID,
    ADMIN_SECRET: !!process.env.ADMIN_SECRET,
    NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    VERCEL_URL: !!process.env.VERCEL_URL,
  }

  // Find any env var name that looks even remotely Telegram-related so we can
  // catch typos (trailing spaces, wrong prefixes, underscores-vs-dashes, etc).
  const allKeys = Object.keys(process.env)
  const telegramLike = allKeys
    .filter((k) => /telegram|teleg|t\.?me|chat_id|bot_token|webhook/i.test(k))
    .sort()

  return NextResponse.json({
    ok: true,
    hint: "true = variable is set, false = missing",
    present: vars,
    // Masked previews help spot typos or copy/paste whitespace.
    previews: {
      TELEGRAM_BOT_TOKEN: mask(process.env.TELEGRAM_BOT_TOKEN),
      TELEGRAM_WEBHOOK_SECRET: mask(process.env.TELEGRAM_WEBHOOK_SECRET, 6),
      TELEGRAM_ADMIN_CHAT_ID: process.env.TELEGRAM_ADMIN_CHAT_ID || null,
      VERCEL_ENV: process.env.VERCEL_ENV || null,
      VERCEL_URL: process.env.VERCEL_URL || null,
    },
    // Any env var name matching a Telegram-related regex. If you added the
    // secrets with a typo or stray whitespace in the name, it should show up
    // here even though the strict lookups above return false.
    telegramLike,
    totalEnvKeys: allKeys.length,
  })
}
