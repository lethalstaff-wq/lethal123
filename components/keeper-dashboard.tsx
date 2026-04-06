"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface Account {
  index: number
  username: string
  display_name: string
  connected: boolean
  ready: boolean
  status: string
  uptime: string
  proxy: string
  last_action: string
  guilds: number
  dms: number
  fp: string
  latency: number
  login_type: string
  nitro: boolean
  activity: string
  errors: number
  is_staff: boolean
}

interface Stats {
  online: number
  ready: number
  total: number
  errors: number
  dms: number
  proxies: number
  avg_lat: number
  build: number
  games: Record<string, number>
  uptime: string
  staff: number
}

interface WsData {
  stats: Stats
  accounts: Account[]
  logs: string[]
  dms: { time: string; account: string; from: string; content: string }[]
}

const GAME_NAMES: Record<string, string> = {
  dota2: "Dota 2", cs2: "CS2", fortnite: "Fortnite", osu: "osu!",
  minecraft: "Minecraft", valorant: "VALORANT", gta5: "GTA V",
  roblox: "Roblox", lol: "League of Legends", r6: "R6 Siege",
  apex: "Apex Legends", spotify: "Spotify",
}

const GAMES = Object.keys(GAME_NAMES)

function stripRich(s: string) {
  return s.replace(/\[.*?\]/g, "")
}

export function KeeperDashboard() {
  const [url, setUrl] = useState("")
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [data, setData] = useState<WsData | null>(null)
  const [tab, setTab] = useState<"overview" | "accounts" | "logs" | "dms">("overview")
  const [cmd, setCmd] = useState("")
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const connect = useCallback((wsUrl: string) => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    setConnecting(true)

    const proto = wsUrl.replace(/^https?/, "").startsWith("s") ? "wss" : "ws"
    const host = wsUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
    const fullUrl = `${proto}://${host}/ws`

    try {
      const ws = new WebSocket(fullUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        setConnecting(false)
        localStorage.setItem("keeper_url", wsUrl)
      }

      ws.onmessage = (e) => {
        if (e.data === "ping") return
        try {
          setData(JSON.parse(e.data))
        } catch {}
      }

      ws.onclose = () => {
        setConnected(false)
        setConnecting(false)
        reconnectRef.current = setTimeout(() => {
          if (wsUrl) connect(wsUrl)
        }, 3000)
      }

      ws.onerror = () => {
        ws.close()
      }
    } catch {
      setConnecting(false)
    }
  }, [])

  useEffect(() => {
    async function autoConnect() {
      // Try Supabase first for auto-discovered tunnel URL
      try {
        const res = await fetch(
          "https://ldfrgkvypmwfjyhgdpbs.supabase.co/rest/v1/keeper_config?id=eq.keeper&select=tunnel_url",
          { headers: { apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZnJna3Z5cG13Zmp5aGdkcGJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTA4MDcsImV4cCI6MjA4MzU4NjgwN30.DiJdRrR3cLeuED4qPgNcfOOxRywB0ym-GWZRpboJHDY" } }
        )
        const rows = await res.json()
        if (rows?.[0]?.tunnel_url) {
          setUrl(rows[0].tunnel_url)
          connect(rows[0].tunnel_url)
          return
        }
      } catch {}
      // Fallback to localStorage
      const saved = localStorage.getItem("keeper_url")
      if (saved) {
        setUrl(saved)
        connect(saved)
      }
    }
    autoConnect()
    return () => {
      clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const sendCmd = async (command: string) => {
    if (!url || !command.trim()) return
    const base = url.replace(/\/$/, "")
    try {
      await fetch(`${base}/api/cmd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd: command.trim() }),
      })
    } catch {}
  }

  const s = data?.stats
  const accounts = data?.accounts || []

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-lg font-bold tracking-tight">Keeper Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              <span className="text-xs text-muted-foreground">
                {connected ? `Online — ${s?.ready || 0} accounts` : connecting ? "Connecting..." : "Offline"}
              </span>
            </div>
            {connected && s && (
              <span className="text-xs text-muted-foreground font-mono">UP {s.uptime}</span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-6 flex-1">
        {/* Connection bar */}
        {!connected && (
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-3">
              Enter your Keeper URL (ngrok or direct)
            </p>
            <div className="flex gap-3">
              <input
                className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://abc123.ngrok-free.app"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && connect(url)}
              />
              <button
                onClick={() => connect(url)}
                disabled={connecting || !url}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-lg transition-all disabled:opacity-50"
              >
                {connecting ? "Connecting..." : "Connect"}
              </button>
            </div>
          </div>
        )}

        {/* Connected view */}
        {connected && s && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Accounts" value={`${s.ready}/${s.total}`} color={s.ready === s.total && s.ready > 0 ? "text-green-500" : s.ready > 0 ? "text-yellow-500" : "text-red-500"} />
              <StatCard label="Errors" value={s.errors} color={s.errors > 0 ? "text-red-500" : "text-muted-foreground"} />
              <StatCard label="DMs" value={s.dms} color={s.dms > 0 ? "text-primary" : "text-muted-foreground"} />
              <StatCard label="Latency" value={s.avg_lat >= 0 ? `${s.avg_lat}ms` : "--"} color={s.avg_lat < 0 ? "text-muted-foreground" : s.avg_lat < 100 ? "text-green-500" : s.avg_lat < 300 ? "text-yellow-500" : "text-red-500"} />
            </div>

            {/* Activity summary */}
            {Object.keys(s.games).length > 0 && (
              <div className="rounded-xl border border-border bg-card px-5 py-3 flex items-center gap-3 text-sm">
                <span className="text-primary font-semibold">Activities:</span>
                <span className="text-muted-foreground">
                  {Object.entries(s.games).map(([g, n]) => `${GAME_NAMES[g] || g}: ${n}`).join(", ")}
                </span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit">
              {(["overview", "accounts", "logs", "dms"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    tab === t ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "overview" ? "Overview" : t === "accounts" ? `Accounts (${accounts.length})` : t === "logs" ? "Logs" : `DMs (${s.dms})`}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === "overview" && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Accounts mini table */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Accounts</h3>
                    <span className="text-xs text-muted-foreground">{accounts.length} total</span>
                  </div>
                  <div className="overflow-auto max-h-[400px]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-muted-foreground border-b border-border">
                          <th className="px-4 py-2 text-left">#</th>
                          <th className="px-4 py-2 text-left">Account</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Ping</th>
                          <th className="px-4 py-2 text-left">Act</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.map((a) => (
                          <tr key={a.index} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                            <td className="px-4 py-2 font-mono text-muted-foreground">{a.index + 1}</td>
                            <td className="px-4 py-2 font-medium">
                              {a.username}
                              {a.is_staff && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">STAFF</span>}
                              {a.nitro && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 font-bold">NITRO</span>}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${a.ready ? "text-green-500" : a.connected ? "text-yellow-500" : "text-red-500"}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${a.ready ? "bg-green-500" : a.connected ? "bg-yellow-500" : "bg-red-500"}`} />
                                {a.ready ? a.status : a.connected ? "connecting" : "offline"}
                              </span>
                            </td>
                            <td className={`px-4 py-2 font-mono text-xs ${a.latency < 0 ? "text-muted-foreground" : a.latency < 100 ? "text-green-500" : a.latency < 300 ? "text-yellow-500" : "text-red-500"}`}>
                              {a.latency >= 0 ? `${a.latency}ms` : "--"}
                            </td>
                            <td className="px-4 py-2 text-xs text-primary font-semibold">{GAME_NAMES[a.activity] || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Logs */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="font-semibold text-sm">Logs</h3>
                  </div>
                  <div className="overflow-auto max-h-[400px] p-4 flex flex-col gap-1 font-mono text-xs">
                    {(data?.logs || []).slice(-20).reverse().map((l, i) => (
                      <div key={i} className="text-muted-foreground leading-relaxed">{stripRich(l)}</div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="rounded-xl border border-border bg-card overflow-hidden md:col-span-2">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="font-semibold text-sm">Quick Actions</h3>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                      {GAMES.map((g) => (
                        <button
                          key={g}
                          onClick={() => sendCmd(`${g} all`)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-secondary hover:border-primary/50 hover:text-primary transition-all"
                        >
                          {GAME_NAMES[g]}
                        </button>
                      ))}
                      <button
                        onClick={() => sendCmd("actoff all")}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        OFF
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Enter command..."
                        value={cmd}
                        onChange={(e) => setCmd(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && cmd.trim()) {
                            sendCmd(cmd)
                            setCmd("")
                          }
                        }}
                      />
                      <button
                        onClick={() => { sendCmd(cmd); setCmd("") }}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-lg transition-all"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "accounts" && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-muted-foreground border-b border-border bg-secondary/50">
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Account</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Uptime</th>
                        <th className="px-4 py-3 text-left">Ping</th>
                        <th className="px-4 py-3 text-left">Guilds</th>
                        <th className="px-4 py-3 text-left">Activity</th>
                        <th className="px-4 py-3 text-left">Proxy</th>
                        <th className="px-4 py-3 text-left">Last</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((a) => (
                        <tr key={a.index} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-muted-foreground">{a.index + 1}</td>
                          <td className="px-4 py-2.5 font-medium">
                            {a.username}
                            {a.is_staff && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">STAFF</span>}
                            {a.nitro && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 font-bold">NITRO</span>}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${a.ready ? "text-green-500" : a.connected ? "text-yellow-500" : "text-red-500"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${a.ready ? "bg-green-500" : a.connected ? "bg-yellow-500" : "bg-red-500"}`} />
                              {a.ready ? a.status : a.connected ? "connecting" : "offline"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{a.uptime}</td>
                          <td className={`px-4 py-2.5 font-mono text-xs ${a.latency < 0 ? "text-muted-foreground" : a.latency < 100 ? "text-green-500" : a.latency < 300 ? "text-yellow-500" : "text-red-500"}`}>
                            {a.latency >= 0 ? `${a.latency}ms` : "--"}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">{a.ready ? a.guilds : "--"}</td>
                          <td className="px-4 py-2.5 text-xs text-primary font-semibold">{GAME_NAMES[a.activity] || "—"}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{a.proxy || "Direct"}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[160px] truncate">{a.last_action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "logs" && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-auto max-h-[600px] p-5 flex flex-col gap-1 font-mono text-xs">
                  {(data?.logs || []).slice().reverse().map((l, i) => (
                    <div key={i} className="text-muted-foreground leading-relaxed py-0.5">{stripRich(l)}</div>
                  ))}
                </div>
              </div>
            )}

            {tab === "dms" && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-auto max-h-[600px]">
                  {(data?.dms || []).length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">No DMs yet</div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {(data?.dms || []).slice().reverse().map((dm, i) => (
                        <div key={i} className="px-5 py-3 hover:bg-secondary/30 transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">{dm.time}</span>
                            <span className="text-xs text-primary font-semibold">{dm.account}</span>
                            <span className="text-xs text-muted-foreground">from</span>
                            <span className="text-xs font-semibold">{dm.from}</span>
                          </div>
                          <p className="text-sm text-foreground/80">{dm.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Connection info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
              <span className="font-mono">{url}</span>
              <button
                onClick={() => {
                  wsRef.current?.close()
                  localStorage.removeItem("keeper_url")
                  setConnected(false)
                  setData(null)
                  setUrl("")
                }}
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 transition-all">
      <div className={`text-2xl font-bold font-mono tracking-tight ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{label}</div>
    </div>
  )
}
