export type ChangelogType = "update" | "fix" | "feature" | "security"

export interface ChangelogEntry {
  date: string
  type: ChangelogType
  title: string
  description?: string
}

export interface ProductMeta {
  undetectedSinceDays?: number
  lastPatchResponseHours?: number
  weeklySlots?: number
  changelog?: ChangelogEntry[]
}

export const PRODUCT_META: Record<string, ProductMeta> = {
  "perm-spoofer": {
    undetectedSinceDays: 487,
    lastPatchResponseHours: 2,
    weeklySlots: 40,
    changelog: [
      { date: "2026-04-08", type: "update", title: "Updated for Windows 11 25H2", description: "Full compatibility with the latest 25H2 build including hypervisor-enforced code integrity changes." },
      { date: "2026-03-22", type: "fix", title: "MAC randomization for Realtek adapters", description: "Fixed an edge case with Realtek 2.5GbE NICs where the MAC would revert after sleep." },
      { date: "2026-02-14", type: "feature", title: "Per-component spoof toggles", description: "Choose which components to spoof on launch — motherboard, GPU, disk, network, or all." },
    ],
  },
  "temp-spoofer": {
    undetectedSinceDays: 312,
    lastPatchResponseHours: 2,
    weeklySlots: 60,
    changelog: [
      { date: "2026-04-02", type: "update", title: "Session cleanup on forced reboot", description: "Guarantees clean state after BSOD or power loss." },
      { date: "2026-02-28", type: "feature", title: "Vanguard session isolation", description: "Compatible with Valorant Vanguard post-March patch." },
    ],
  },
  "fortnite-external": {
    undetectedSinceDays: 198,
    lastPatchResponseHours: 2,
    weeklySlots: 80,
    changelog: [
      { date: "2026-04-10", type: "update", title: "Chapter 6 Season 2 support", description: "Updated offsets and bone IDs for the latest chapter drop." },
      { date: "2026-03-18", type: "feature", title: "Smart triggerbot v2", description: "Less detectable pattern — randomized delays, no fixed cadence." },
      { date: "2026-02-05", type: "fix", title: "ESP distance scaling", description: "Fixed box scaling at far distances with high FOV settings." },
    ],
  },
  "custom-dma-firmware": {
    undetectedSinceDays: 623,
    lastPatchResponseHours: 24,
    weeklySlots: 12,
    changelog: [
      { date: "2026-04-01", type: "security", title: "New anti-detection layer", description: "Additional randomization in PCIe device descriptor to reduce signature overlap." },
      { date: "2026-03-05", type: "update", title: "FaceIt AC 2.0 masking", description: "Updated for FaceIt Anti-Cheat major release." },
    ],
  },
  "streck": {
    undetectedSinceDays: 142,
    lastPatchResponseHours: 4,
    weeklySlots: 50,
    changelog: [
      { date: "2026-04-05", type: "update", title: "Apex Legends Season 24 support" },
      { date: "2026-03-01", type: "feature", title: "Configurable crosshair overlay" },
    ],
  },
  "blurred": {
    undetectedSinceDays: 421,
    lastPatchResponseHours: 2,
    weeklySlots: 35,
    changelog: [
      { date: "2026-04-11", type: "update", title: "Fortnite + Apex patch response — 1h 45m", description: "Fastest patch turnaround this quarter." },
      { date: "2026-03-28", type: "feature", title: "Web radar beta", description: "Control your radar from phone/tablet browser. Opt-in via Discord." },
      { date: "2026-03-10", type: "feature", title: "Loot ESP refinements", description: "Rarity-based coloring and distance filters." },
      { date: "2026-02-18", type: "security", title: "Stream-proof overlay v3", description: "Zero capture footprint across OBS, NVIDIA, AMD, and Discord." },
    ],
  },
  "dma-basic": {
    weeklySlots: 8,
    changelog: [
      { date: "2026-04-01", type: "update", title: "Bundle now ships with latest Captain 100T-7th revision" },
    ],
  },
  "dma-advanced": {
    weeklySlots: 5,
    changelog: [
      { date: "2026-04-01", type: "update", title: "Dichen D60 Fuser pre-flashed before shipping" },
      { date: "2026-03-15", type: "feature", title: "Free Macku included" },
    ],
  },
  "dma-elite": {
    weeklySlots: 3,
    changelog: [
      { date: "2026-04-11", type: "update", title: "FaceIt / VGK emulation refreshed for April builds" },
      { date: "2026-03-20", type: "feature", title: "Lifetime hardware replacement now includes next-gen cards" },
    ],
  },
}

export function getProductMeta(productId: string): ProductMeta {
  return PRODUCT_META[productId] ?? {}
}
