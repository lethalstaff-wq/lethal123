// One-shot helper to register the bot's webhook with Telegram.
//
// Hit this endpoint once after deploying (or any time you rotate the secret):
//   curl "https://your-site.com/api/telegram/set-webhook?secret=<ADMIN_SECRET>"
//
// It calls Telegram's setWebhook pointing at /api/telegram/webhook and
// attaches TELEGRAM_WEBHOOK_SECRET as the secret_token header that Telegram
// will send on each update.

import { NextResponse } from "next/server"

import { deleteWebhook, getMe, setWebhook } from "@/lib/telegram/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function siteUrl(): string | null {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  )
}

async function ensureAuthorized(request: Request): Promise<NextResponse | null> {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_SECRET not configured on the server" },
      { status: 500 },
    )
  }
  const url = new URL(request.url)
  const provided = url.searchParams.get("secret") || request.headers.get("x-admin-secret")
  if (provided !== adminSecret) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
  }
  return null
}

export async function GET(request: Request) {
  const unauthorized = await ensureAuthorized(request)
  if (unauthorized) return unauthorized

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN missing" }, { status: 500 })
  }

  const base = siteUrl()
  if (!base) {
    return NextResponse.json(
      {
        ok: false,
        error: "Cannot determine public site URL. Set NEXT_PUBLIC_SITE_URL or deploy on Vercel.",
      },
      { status: 500 },
    )
  }

  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "TELEGRAM_WEBHOOK_SECRET missing" },
      { status: 500 },
    )
  }

  try {
    const me = await getMe()
    const webhookUrl = `${base.replace(/\/$/, "")}/api/telegram/webhook`
    const result = await setWebhook(webhookUrl, webhookSecret)
    return NextResponse.json({ ok: true, bot: me, webhook: webhookUrl, result })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await ensureAuthorized(request)
  if (unauthorized) return unauthorized
  try {
    const result = await deleteWebhook()
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
