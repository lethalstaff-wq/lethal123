"use client"

import { useEffect } from "react"

// Tiny one-shot beacon: posts client-side device/display info to
// /api/track/visitor on first page load. Throttled with the same `ls_visitor`
// cookie the supabase middleware sets, so it only fires once per browser
// session even on SPA navigations / refreshes.
//
// All the data this collects is stuff the user's browser already exposes
// in normal client-side JS (window.screen, navigator.*, matchMedia). Nothing
// fingerprinty beyond what site analytics scripts grab anyway.

const SENT_KEY = "ls_visitor_beacon_sent"

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"))
  return m ? decodeURIComponent(m[1]) : null
}

function getColorScheme(): "light" | "dark" | "no-preference" {
  if (typeof window === "undefined" || !window.matchMedia) return "no-preference"
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark"
  if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light"
  return "no-preference"
}

function getGpu(): string | undefined {
  try {
    const canvas = document.createElement("canvas")
    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as
      | WebGLRenderingContext
      | null
    if (!gl) return undefined
    const ext = gl.getExtension("WEBGL_debug_renderer_info")
    if (!ext) return undefined
    const renderer = gl.getParameter((ext as { UNMASKED_RENDERER_WEBGL: number }).UNMASKED_RENDERER_WEBGL)
    return typeof renderer === "string" ? renderer : undefined
  } catch {
    return undefined
  }
}

async function getBattery(): Promise<{ level?: number; charging?: boolean }> {
  try {
    const navAny = navigator as unknown as { getBattery?: () => Promise<{ level: number; charging: boolean }> }
    if (typeof navAny.getBattery !== "function") return {}
    const b = await navAny.getBattery()
    return { level: b.level, charging: b.charging }
  } catch {
    return {}
  }
}

export function VisitorBeacon() {
  useEffect(() => {
    // Only fire once per session — sessionStorage clears on tab close,
    // and the visitor cookie throttles cross-tab.
    if (typeof window === "undefined") return
    if (sessionStorage.getItem(SENT_KEY)) return
    sessionStorage.setItem(SENT_KEY, "1")

    // Defer to avoid competing with page interactivity.
    const timer = setTimeout(async () => {
      try {
        const visitorId = readCookie("ls_visitor") || undefined
        const navAny = navigator as unknown as {
          deviceMemory?: number
          hardwareConcurrency?: number
          maxTouchPoints?: number
          connection?: { type?: string; effectiveType?: string; downlink?: number }
        }
        const conn = navAny.connection
        const battery = await getBattery()

        const payload = {
          visitorId,
          path: window.location.pathname + window.location.search,
          screenWidth: window.screen?.width,
          screenHeight: window.screen?.height,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          pixelRatio: window.devicePixelRatio,
          colorScheme: getColorScheme(),
          cpuCores: navAny.hardwareConcurrency,
          deviceMemory: navAny.deviceMemory,
          touchSupport: (navAny.maxTouchPoints ?? 0) > 0,
          connectionType: conn?.type,
          effectiveType: conn?.effectiveType,
          downlink: conn?.downlink,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          gpu: getGpu(),
          batteryLevel: battery.level,
          batteryCharging: battery.charging,
        }

        // sendBeacon if available so the request survives page navigation,
        // otherwise fall back to fetch with keepalive.
        const body = JSON.stringify(payload)
        if (navigator.sendBeacon) {
          const blob = new Blob([body], { type: "application/json" })
          navigator.sendBeacon("/api/track/visitor", blob)
        } else {
          fetch("/api/track/visitor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true,
          }).catch(() => {})
        }
      } catch {
        // Best-effort only.
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  return null
}
