export interface ProductVariant {
  id: string
  name: string
  priceInPence: number // Price in pence (GBP)
  sellAuthVariant?: string // SellAuth variant ID (set in SellAuth dashboard)
}

export interface Product {
  id: string
  name: string
  description: string
  longDescription?: string
  features?: string[]
  image: string
  category: "spoofer" | "cheat" | "firmware" | "bundle"
  variants: ProductVariant[]
  popular?: boolean
  badge?: string
  sellAuthProductId?: string // SellAuth product ID from your SellAuth dashboard checkout URL
}

// Source of truth for all products - prices in pence (GBP)
export const PRODUCTS: Product[] = [
  {
    id: "perm-spoofer",
    name: "Perm Spoofer",
    description: "Permanent HWID spoofing solution",
    longDescription: "Changes your hardware identity at kernel level — motherboard serial, GPU UUID, disk signature, network MAC. Once installed your old HWID no longer exists. Hardware bans become permanently irrelevant. Setup takes under 5 minutes.",
    features: ["Kernel-level HWID spoofing", "Motherboard serial replacement", "GPU UUID reset", "Disk signature change", "Network adapter MAC reset", "Survives all reboots permanently", "EAC, BattlEye, Vanguard, Ricochet", "Intel + AMD supported", "Setup under 5 minutes", "Unique hardware profile per user", "Lifetime Discord support"],
    image: "/images/products/perm-spoofer.png",
    category: "spoofer",
    badge: "In Stock",
    variants: [
      { id: "perm-onetime", name: "One-Time License", priceInPence: 3500 },
      { id: "perm-lifetime", name: "Lifetime License", priceInPence: 12000 },
    ],
  },
  {
    id: "temp-spoofer",
    name: "Temp Spoofer",
    description: "Temporary HWID spoofing solution",
    longDescription: "Session-based HWID spoofing with zero permanent changes. Activates on boot, clears on restart — nothing written, nothing left behind. Ideal for alt accounts and short-term protection.",
    features: ["Session-based HWID spoofing", "Zero permanent system changes", "Activates on boot, clears on restart", "Works after HWID ban", "EAC, BattlEye, Vanguard compatible", "Instant activation — no reboot needed", "Clean session isolation", "3 minute average setup time", "Discord support included"],
    image: "/images/products/temp-spoofer.png",
    category: "spoofer",
    badge: "Popular",
    popular: true,
    variants: [
      { id: "temp-15day", name: "15-Day License", priceInPence: 2000 },
      { id: "temp-30day", name: "30-Day License", priceInPence: 4000 },
      { id: "temp-180day", name: "180-Day License", priceInPence: 15000 },
      { id: "temp-lifetime", name: "Lifetime License", priceInPence: 50000 },
    ],
  },
  {
    id: "fortnite-external",
    name: "Fortnite External",
    description: "Clean UI. Fast setup. Tournament-ready.",
    longDescription: "Runs completely outside the game process — no injection, no kernel driver, no second PC needed. Clean overlay with zero FPS impact. Built for competitive players and streamers.",
    features: ["No DMA hardware required", "No injection, no kernel driver", "No dual-PC setup needed", "Clean overlay — zero FPS impact", "Smooth aimbot with humanization", "Full player ESP", "Stream-safe rendering", "100% Tournament safe", "Sub-2h patch response", "Lifetime updates included"],
    image: "/images/products/fortnite-external.png",
    category: "cheat",
    badge: "In Stock",
    variants: [
      { id: "fn-ext-1day", name: "1 Day", priceInPence: 1000 },
      { id: "fn-ext-3day", name: "3 Days", priceInPence: 2000 },
      { id: "fn-ext-7day", name: "7 Days", priceInPence: 3500 },
      { id: "fn-ext-30day", name: "30 Days", priceInPence: 8000 },
      { id: "fn-ext-lifetime", name: "Lifetime", priceInPence: 30000 },
    ],
  },
  {
    id: "custom-dma-firmware",
    name: "Custom DMA Firmware",
    description: "Built for precision. Designed to endure.",
    longDescription: "Private firmware built per order — unique device signature, no shared releases. Clean PCIe enumeration, zero driver footprint. Built and delivered in 24-48 hours.",
    features: ["Built per order — unique signature", "No shared releases or public builds", "Clean PCIe enumeration", "Zero driver footprint on host", "EAC / BattlEye emulation", "FaceIt / Vanguard masking (top tier)", "75T, 100T, M.2, ZDMA supported", "Javelin, ACE, RICO compatible", "24-48h build and delivery", "Lifetime replacement included"],
    image: "/images/products/fortnite-external-2.png",
    category: "firmware",
    badge: "In Stock",
    variants: [
      { id: "dma-fw-eac-be", name: "EAC / BE Emulated", priceInPence: 2000 },
      { id: "dma-fw-slotted", name: "Slotted Edition", priceInPence: 45000 },
      { id: "dma-fw-faceit-vgk", name: "FaceIt / VGK", priceInPence: 97500 },
    ],
  },
  {
    id: "streck",
    name: "Streck DMA Cheat",
    description: "Premium DMA cheat solution",
    longDescription: "Lightweight DMA cheat for players who want clean performance at an accessible price. Core ESP and aimbot, fast patch updates, instant delivery.",
    features: ["Full player ESP", "Smooth aimbot", "No recoil", "EAC / BattlEye bypass", "Unique build per customer", "Fortnite + Apex Legends", "Fast patch updates", "Instant delivery", "Discord support included"],
    image: "/images/products/blurred-dma.png",
    category: "cheat",
    badge: "In Stock",
    variants: [
      { id: "streck-7day", name: "7 Days", priceInPence: 800 },
      { id: "streck-30day", name: "30 Days", priceInPence: 1500 },
      { id: "streck-90day", name: "90 Days", priceInPence: 4000 },
      { id: "streck-lifetime", name: "Lifetime", priceInPence: 15000 },
    ],
  },
  {
    id: "blurred",
    name: "Blurred DMA Cheat",
    description: "Premium DMA cheat solution",
    longDescription: "The most comprehensive DMA cheat suite. Full radar, stream-proof overlay, FaceIt and Vanguard bypass. Reads game memory through your DMA card — completely external. Auto-updates within 2 hours of any patch.",
    features: ["Full player ESP (visible + invisible)", "Smooth aimbot + triggerbot", "Full map radar", "No recoil", "Stream-proof overlay", "EAC, BE, FaceIt, Vanguard, Ricochet", "UAV radar overlay", "Web radar — shareable link", "Web menu — any device", "Loot ESP", "Spectator list", "Cloud configs browser", "Auto updater — sub-2h patches", "6 games supported"],
    image: "/images/products/blurred-dma.png",
    category: "cheat",
    badge: "Popular",
    popular: true,
    sellAuthProductId: "210d655a4a941-0000010058682",
    variants: [
      { id: "blurred-weekly", name: "Weekly", priceInPence: 2200 },
      { id: "blurred-monthly", name: "Monthly", priceInPence: 3500 },
      { id: "blurred-quarterly", name: "Quarterly", priceInPence: 8500 },
      { id: "blurred-lifetime", name: "Lifetime", priceInPence: 38500 },
    ],
  },
  {
    id: "dma-basic",
    name: "DMA Basic Bundle",
    description:
      "Reliable foundation for everyday use. Includes: Captain DMA 100T-7th, EAC/BE Emulated, Mini DP Fuser V2, Blurred (30 Days), Macku (Free)",
    longDescription: "Pre-configured and ready to use. No separate purchases, no compatibility guesswork. Ships within 24 hours with lifetime Discord support.",
    image: "/images/products/dma-firmware.png",
    category: "bundle",
    badge: "In Stock",
    variants: [{ id: "dma-basic-full", name: "Complete Bundle", priceInPence: 42500 }],
  },
  {
    id: "dma-advanced",
    name: "DMA Advanced Bundle",
    description:
      "Balanced configuration for creators and semi-pro users. Includes: Captain DMA 100T-7th, Dichen D60 Fuser, Teensy (Firmware Included), EAC/BE Emulated Slotted, Blurred DMA (Quarterly)",
    longDescription: "Slotted firmware reduces detection overlap. Quarterly Blurred keeps you covered long-term. Ships within 24 hours with full technical assistance.",
    image: "/images/products/dma-firmware.png",
    category: "bundle",
    badge: "Best Value",
    popular: true,
    variants: [{ id: "dma-advanced-full", name: "Complete Bundle", priceInPence: 67500 }],
  },
  {
    id: "dma-elite",
    name: "DMA Elite Bundle",
    description:
      "Maximum performance — full emulation & lifetime access. Includes: Captain DMA 100T-7th, Dichen DC500 Fuser, Teensy (Firmware Included), Blurred Lifetime DMA Cheat, EAC/BE, FaceIt, VGK Emulated",
    longDescription: "Maximum performance, lifetime access, no compromises. Highest-spec hardware with FaceIt and Vanguard emulation. Lifetime hardware replacement and priority Discord access.",
    image: "/images/products/dma-firmware.png",
    category: "bundle",
    badge: "Premium",
    variants: [{ id: "dma-elite-full", name: "Complete Bundle", priceInPence: 150000 }],
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export function getVariantById(productId: string, variantId: string): ProductVariant | undefined {
  const product = getProductById(productId)
  return product?.variants.find((v) => v.id === variantId)
}

export function formatPrice(priceInPence: number): string {
  return `£${(priceInPence / 100).toFixed(priceInPence % 100 === 0 ? 0 : 2)}`
}
