// Debug endpoint: manually exercises the sendMessage path without going
// through Telegram's webhook. Hit this directly in a browser with your
// TELEGRAM_WEBHOOK_SECRET to see the actual error message if the bot is
// failing to reply.

import { NextResponse } from "next/server"

import { mainMenuKeyboard } from "@/lib/telegram/keyboards"
import { renderWelcome } from "@/lib/telegram/design"
import { sendMessage } from "@/lib/telegram/client"
import type { Lang } from "@/lib/telegram/i18n"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const secret = url.searchParams.get("secret")
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }

  const chatParam = url.searchParams.get("chat") || process.env.TELEGRAM_ADMIN_CHAT_ID
  if (!chatParam) {
    return NextResponse.json({ ok: false, error: "no chat id" }, { status: 400 })
  }

  const lang: Lang = url.searchParams.get("lang") === "en" ? "en" : "ru"

  // Try rendering the welcome screen — this is the exact code path the
  // bot takes when a user writes /start, minus the Telegram update parsing.
  let renderedText: string | null = null
  let renderError: string | null = null
  try {
    renderedText = renderWelcome(lang)
  } catch (err) {
    renderError = err instanceof Error ? `${err.message}\n${err.stack || ""}` : String(err)
  }

  let keyboardError: string | null = null
  let keyboard = null
  try {
    keyboard = mainMenuKeyboard(lang)
  } catch (err) {
    keyboardError = err instanceof Error ? `${err.message}\n${err.stack || ""}` : String(err)
  }

  let sendResult: unknown = null
  let sendError: string | null = null
  if (renderedText && keyboard) {
    try {
      sendResult = await sendMessage({
        chat_id: chatParam,
        text: renderedText,
        parse_mode: "HTML",
        reply_markup: keyboard,
      })
    } catch (err) {
      sendError = err instanceof Error ? `${err.message}\n${err.stack || ""}` : String(err)
    }
  }

  return NextResponse.json({
    ok: !renderError && !keyboardError && !sendError,
    chat: chatParam,
    lang,
    steps: {
      render: {
        ok: !renderError,
        error: renderError,
        textPreview: renderedText ? renderedText.slice(0, 200) : null,
      },
      keyboard: {
        ok: !keyboardError,
        error: keyboardError,
      },
      send: {
        ok: !sendError,
        error: sendError,
        result: sendResult,
      },
    },
  })
}
