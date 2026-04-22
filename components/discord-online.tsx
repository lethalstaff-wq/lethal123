"use client"

import { useEffect, useState } from "react"

type DiscordStats = { count: number | null; members: number | null; invite: string | null }

/**
 * Live Discord stats from our cached widget proxy.
 * Re-polls every 60s client-side on top of the 300s server cache.
 */
export function useDiscordOnline(): DiscordStats {
  const [count, setCount] = useState<number | null>(null)
  const [members, setMembers] = useState<number | null>(null)
  const [invite, setInvite] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch("/api/discord-online", { cache: "no-store" })
        const data = (await res.json()) as { online: number | null; members: number | null; invite: string | null }
        if (cancelled) return
        if (typeof data.online === "number") setCount(data.online)
        if (typeof data.members === "number") setMembers(data.members)
        if (data.invite) setInvite(data.invite)
      } catch { /* noop */ }
    }
    load()
    const intv = setInterval(load, 60_000)
    return () => { cancelled = true; clearInterval(intv) }
  }, [])

  return { count, members, invite }
}
