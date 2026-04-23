import { NextResponse } from "next/server"

// Proxy Discord's public Server Widget so we can cache and avoid Discord's
// per-IP rate limiting. The widget must be enabled in the server settings
// (Server Settings → Widget → Enable Server Widget).
const SERVER_ID = "1428073546604740690"
const WIDGET = `https://ptb.discord.com/api/guilds/${SERVER_ID}/widget.json`

export const revalidate = 300

// Extract invite code from a URL like https://discord.com/invite/ABCDE123 or
// https://ptb.discord.com/invite/ABCDE123. Returns null if the URL doesn't
// match the expected shape.
function extractInviteCode(url: string | undefined | null): string | null {
  if (!url) return null
  const m = url.match(/\/invite\/([A-Za-z0-9-]+)/)
  return m ? m[1] : null
}

export async function GET() {
  try {
    // Step 1: widget gives live presence + a fresh instant_invite. The invite
    // code in widget auto-rotates when Discord admins refresh it, so we pull
    // it dynamically instead of hardcoding — hardcoded invites die silently
    // and kill the members count.
    const widgetRes = await fetch(WIDGET, { next: { revalidate: 300 } })
    const widget = widgetRes.ok
      ? ((await widgetRes.json()) as { presence_count?: number; instant_invite?: string; name?: string })
      : null

    // Step 2: use widget's invite (or env override) to query member count.
    const inviteCode = extractInviteCode(widget?.instant_invite) || process.env.DISCORD_INVITE_CODE || null

    let invite: { approximate_member_count?: number; approximate_presence_count?: number; guild?: { name?: string } } | null = null
    if (inviteCode) {
      const res = await fetch(
        `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true&with_expiration=true`,
        { next: { revalidate: 300 } },
      )
      if (res.ok) invite = await res.json()
    }

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
