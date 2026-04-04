import { NextResponse } from "next/server"

// Cache rates for 60 seconds server-side to avoid hammering CoinGecko
let cachedRates: Record<string, number> | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60_000 // 60 seconds

const COINS = ["bitcoin", "ethereum", "tether", "litecoin"]
const COIN_MAP: Record<string, string> = {
  bitcoin: "btc",
  ethereum: "eth",
  tether: "usdt",
  litecoin: "ltc",
}

export async function GET() {
  const now = Date.now()

  // Return cached if fresh
  if (cachedRates && now - cacheTimestamp < CACHE_TTL) {
    return NextResponse.json(cachedRates, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  }

  try {
    const ids = COINS.join(",")
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=gbp`,
      { signal: AbortSignal.timeout(5000) },
    )

    if (!res.ok) throw new Error("CoinGecko API error")

    const data = await res.json()
    const rates: Record<string, number> = {}

    for (const coin of COINS) {
      if (data[coin]?.gbp) {
        rates[COIN_MAP[coin]] = data[coin].gbp
      }
    }

    // Update cache
    cachedRates = rates
    cacheTimestamp = now

    return NextResponse.json(rates, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch {
    // Return stale cache if available
    if (cachedRates) {
      return NextResponse.json(cachedRates)
    }
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 })
  }
}
