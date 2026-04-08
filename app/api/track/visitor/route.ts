// Client-side visitor beacon. The browser fires this once per session
// (gated by the `ls_visitor` cookie set by the supabase middleware) with
// hardware/display details that aren't available from request headers
// alone (screen size, color scheme, GPU, RAM, etc).
//
// Output is a follow-up Telegram notification keyed to the same visitor.

import { NextResponse } from "next/server"

import { notifyVisitorExtras } from "@/lib/telegram/notify"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Cap untrusted strings so a malicious client can't post 1MB of garbage.
function clip(value: unknown, maxLen = 200): string | undefined {
  if (typeof value !== "string") return undefined
  return value.slice(0, maxLen)
}
function num(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined
  return value
}
function bool(value: unknown): boolean | undefined {
  if (typeof value !== "boolean") return undefined
  return value
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined

  const colorSchemeRaw = clip(body.colorScheme, 20)
  const colorScheme: "light" | "dark" | "no-preference" | undefined =
    colorSchemeRaw === "light" || colorSchemeRaw === "dark" || colorSchemeRaw === "no-preference"
      ? colorSchemeRaw
      : undefined

  notifyVisitorExtras({
    visitorId: clip(body.visitorId, 20),
    path: clip(body.path, 200),
    ipAddress,
    screenWidth: num(body.screenWidth),
    screenHeight: num(body.screenHeight),
    windowWidth: num(body.windowWidth),
    windowHeight: num(body.windowHeight),
    pixelRatio: num(body.pixelRatio),
    colorScheme,
    cpuCores: num(body.cpuCores),
    deviceMemory: num(body.deviceMemory),
    touchSupport: bool(body.touchSupport),
    connectionType: clip(body.connectionType, 20),
    effectiveType: clip(body.effectiveType, 20),
    downlink: num(body.downlink),
    language: clip(body.language, 30),
    timezone: clip(body.timezone, 60),
    gpu: clip(body.gpu, 200),
    batteryLevel: num(body.batteryLevel),
    batteryCharging: bool(body.batteryCharging),
  }).catch((e) => console.error("[telegram/notify] visitor extras failed:", e))

  return NextResponse.json({ ok: true })
}
