import { NextResponse } from "next/server"

// Proxy Discord's public Server Widget so we can cache and avoid Discord's
// per-IP rate limiting. The widget must be enabled in the server settings
// (Server Settings → Widget → Enable Server Widget).
const SERVER_ID = "1428073546604740690"
const WIDGET = `https://ptb.discord.com/api/guilds/${SERVER_ID}/widget.json`
const INVITE = `https://discord.com/api/v10/invites/gyfaBmB6?with_counts=true&with_expiration=true`

export const revalidate = 300

export async function GET() {
  try {
    // Widget gives live presence (online). Invite endpoint additionally gives
    // approximate total member count. Fetch both in parallel.
    const [widgetRes, inviteRes] = await Promise.all([
      fetch(WIDGET, { next: { revalidate: 300 } }),
      fetch(INVITE, { next: { revalidate: 300 } }),
    ])

    const widget = widgetRes.ok
      ? ((await widgetRes.json()) as { presence_count?: number; instant_invite?: string; name?: string })
      : null
    const invite = inviteRes.ok
      ? ((await inviteRes.json()) as { approximate_member_count?: number; approximate_presence_count?: number; guild?: { name?: string } })
      : null

    const online =
      typeof widget?.presence_count === "number"
        ? widget.presence_count
        : typeof invite?.approximate_presence_count === "number"
          ? invite.approximate_presence_count
          : null

    const members = typeof invite?.approximate_member_count === "number" ? invite.approximate_member_count : null

    return NextResponse.json(
      {
        online,
        members,
        invite: widget?.instant_invite ?? null,
        name: widget?.name ?? invite?.guild?.name ?? null,
      },
      { status: 200, headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    )
  } catch {
    return NextResponse.json({ online: null, members: null }, { status: 200 })
  }
}
