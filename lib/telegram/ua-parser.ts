// Lightweight inline User-Agent + Client Hints parser. Avoids the 800kB
// ua-parser-js dependency for the handful of fields we actually want to show
// in the visitor admin notification.

export interface ParsedUA {
  browser: string // "Chrome 121"
  os: string // "Windows 11" / "macOS 14" / "Android 14"
  device: "Desktop" | "Mobile" | "Tablet" | "Bot" | "Unknown"
  vendor?: string // "Apple" / "Samsung" / etc.
  model?: string // "iPhone15,2" / "SM-G991B"
  engine?: string // "Blink" / "WebKit" / "Gecko"
  isBot: boolean
}

const BROWSERS: { name: string; re: RegExp; verRe?: RegExp }[] = [
  // Order matters — more specific first.
  { name: "Edge",    re: /Edg(?:e|A|iOS)?\/([\d.]+)/i, verRe: /Edg(?:e|A|iOS)?\/([\d.]+)/i },
  { name: "Opera",   re: /OPR\/([\d.]+)/i, verRe: /OPR\/([\d.]+)/i },
  { name: "Vivaldi", re: /Vivaldi\/([\d.]+)/i, verRe: /Vivaldi\/([\d.]+)/i },
  { name: "Brave",   re: /Brave\/([\d.]+)/i, verRe: /Brave\/([\d.]+)/i },
  { name: "Yandex",  re: /YaBrowser\/([\d.]+)/i, verRe: /YaBrowser\/([\d.]+)/i },
  { name: "Samsung", re: /SamsungBrowser\/([\d.]+)/i, verRe: /SamsungBrowser\/([\d.]+)/i },
  { name: "Chrome",  re: /Chrome\/([\d.]+)/i, verRe: /Chrome\/([\d.]+)/i },
  { name: "Firefox", re: /Firefox\/([\d.]+)/i, verRe: /Firefox\/([\d.]+)/i },
  { name: "Safari",  re: /Version\/([\d.]+).*Safari/i, verRe: /Version\/([\d.]+)/i },
]

function pickBrowser(ua: string): string {
  for (const b of BROWSERS) {
    if (b.re.test(ua)) {
      const m = b.verRe?.exec(ua)
      const major = m?.[1]?.split(".")[0]
      return major ? `${b.name} ${major}` : b.name
    }
  }
  return "Unknown browser"
}

function pickOS(ua: string): string {
  let m: RegExpExecArray | null

  if ((m = /Windows NT ([\d.]+)/.exec(ua))) {
    const v = m[1]
    const map: Record<string, string> = {
      "10.0": "Windows 10/11",
      "6.3": "Windows 8.1",
      "6.2": "Windows 8",
      "6.1": "Windows 7",
      "6.0": "Windows Vista",
      "5.1": "Windows XP",
    }
    return map[v] || `Windows ${v}`
  }
  if ((m = /Mac OS X ([\d_]+)/.exec(ua))) {
    return `macOS ${m[1].replace(/_/g, ".")}`
  }
  if ((m = /Android ([\d.]+)/.exec(ua))) {
    return `Android ${m[1]}`
  }
  if ((m = /(?:iPhone|iPad|iPod) OS ([\d_]+)/.exec(ua))) {
    return `iOS ${m[1].replace(/_/g, ".")}`
  }
  if (/Linux/.test(ua)) return "Linux"
  if (/CrOS/.test(ua)) return "Chrome OS"
  return "Unknown OS"
}

function pickDevice(ua: string): ParsedUA["device"] {
  if (/iPad|Tablet/i.test(ua)) return "Tablet"
  if (/Mobile|iPhone|Android.*Mobile|webOS|BlackBerry|IEMobile/i.test(ua)) return "Mobile"
  if (/Mozilla|AppleWebKit|Gecko|Trident/i.test(ua)) return "Desktop"
  return "Unknown"
}

function pickVendor(ua: string): string | undefined {
  if (/iPhone|iPad|iPod|Macintosh/.test(ua)) return "Apple"
  if (/Samsung|SM-/.test(ua)) return "Samsung"
  if (/Pixel/.test(ua)) return "Google"
  if (/Huawei/.test(ua)) return "Huawei"
  if (/Xiaomi|Redmi|MI [\d]/.test(ua)) return "Xiaomi"
  if (/OnePlus/.test(ua)) return "OnePlus"
  if (/Oppo/.test(ua)) return "Oppo"
  if (/Vivo/.test(ua)) return "Vivo"
  return undefined
}

function pickEngine(ua: string): string | undefined {
  if (/Gecko\/\d/.test(ua) && !/like Gecko/.test(ua)) return "Gecko"
  if (/AppleWebKit/.test(ua) && /Chrome/.test(ua)) return "Blink"
  if (/AppleWebKit/.test(ua)) return "WebKit"
  if (/Trident/.test(ua)) return "Trident"
  return undefined
}

const BOT_RE =
  /bot\b|crawler|spider|headless|preview|monitor|prober|uptime|pingdom|gtmetrix|lighthouse|pagespeed|datadog|newrelic|statuscake|betteruptime|uptimerobot|fetch\b|curl|wget|python|java\/|libwww|httpclient|okhttp|axios|got\/|node-fetch|go-http|scrapy|phantom|selenium|puppeteer|playwright|ahref|semrush|mj12|baiduspider|yandexbot|petalbot|bytespider|telegram|slack|discord|whatsapp|facebook|twitterbot|linkedin|skype|pinterest/i

export function parseUA(ua: string | null | undefined): ParsedUA {
  if (!ua) {
    return { browser: "—", os: "—", device: "Unknown", isBot: true }
  }
  const isBot = BOT_RE.test(ua)
  return {
    browser: pickBrowser(ua),
    os: pickOS(ua),
    device: isBot ? "Bot" : pickDevice(ua),
    vendor: pickVendor(ua),
    engine: pickEngine(ua),
    isBot,
  }
}

// AS numbers belonging to public clouds, hosting providers, scrapers and
// VPN providers. When the visitor's request comes from one of these, it's
// almost certainly automated traffic, not a real customer.
const CLOUD_AS_NUMBERS = new Set<number>([
  // AWS
  16509, 14618, 8987, 39111, 7224, 38895,
  // Microsoft / Azure
  8075, 8068, 8070, 8071, 8072, 8073, 12076,
  // Google Cloud / Workspace
  15169, 396982, 36492, 19527, 16550, 36040,
  // Oracle Cloud
  31898, 7160,
  // DigitalOcean
  14061,
  // Linode / Akamai Linode
  63949, 48337,
  // Vultr
  20473, 64425,
  // Hetzner
  24940, 213230,
  // OVH
  16276, 35540,
  // Contabo
  51167,
  // M247
  9009,
  // Choopa
  20473,
  // Latitude.sh
  396356,
  // Leaseweb
  60781, 30633, 19318, 16265,
  // Scaleway
  12876,
  // Alibaba Cloud
  45102, 37963,
  // Tencent Cloud
  132203,
  // Cloudflare (Workers / Tunnel can show up here)
  13335,
  // Akamai
  20940, 32787, 16702, 21342,
  // Fastly
  54113,
  // Vercel (their internal probes shouldn't notify)
  13335,
  // QuadraNet
  8100,
  // ColoCrossing
  36352,
  // Datacamp / CDN77
  60068, 212238,
  // Hivelocity
  29802,
  // PSINet / Cogent
  174,
  // Limestone Networks
  46475,
  // Server Central / Deft
  23352,
  // GoDaddy / WildWest
  26496, 21501,
  // PacketHub / Datacamp
  212238,
  // BL Networks
  399629,
  // Stark Industries / common scraper hosting
  44477,
])

export function isDatacenterAsn(asNumber: string | undefined | null): boolean {
  if (!asNumber) return false
  const n = Number(asNumber)
  if (!Number.isFinite(n)) return false
  return CLOUD_AS_NUMBERS.has(n)
}
