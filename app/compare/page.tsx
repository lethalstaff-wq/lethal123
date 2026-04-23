"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  Check,
  X,
  ShoppingCart,
  Crosshair,
  Shield,
  Zap,
  Crown,
  Package,
  Trophy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { useCart } from "@/lib/cart-context"
import { SectionEyebrow } from "@/components/section-eyebrow"
import Link from "next/link"

type CompareCategory = "cheats" | "spoofers" | "bundles"

// ---------------------------------------------------------------------------
// DATA — features now grouped into categories; each category has a "winner"
// that gets a halo on the matching column.
// ---------------------------------------------------------------------------

type FeatureGroup<K extends string> = {
  id: string
  label: string
  // id of the product column that wins this category
  winner: string
  features: { key: K; label: string; description: string }[]
}

// Cheat Features grouped
const CHEAT_GROUPS: FeatureGroup<string>[] = [
  {
    id: "aim",
    label: "Aim",
    winner: "blurred",
    features: [
      { key: "aimbot", label: "Aimbot", description: "Auto-aim assistance" },
      { key: "silent_aim", label: "Silent Aim", description: "Invisible aim adjustment" },
      { key: "triggerbot", label: "Triggerbot", description: "Auto-fire on target" },
      { key: "prediction", label: "Bullet Prediction", description: "Lead target compensation" },
      { key: "no_recoil", label: "No Recoil", description: "Recoil compensation" },
      { key: "fov_circle", label: "FOV Circle", description: "Aim range indicator" },
    ],
  },
  {
    id: "esp",
    label: "ESP",
    winner: "blurred",
    features: [
      { key: "esp_box", label: "Box ESP", description: "Player bounding boxes" },
      { key: "esp_skeleton", label: "Skeleton ESP", description: "Bone structure overlay" },
      { key: "esp_distance", label: "Distance ESP", description: "Player distance display" },
      { key: "esp_health", label: "Health ESP", description: "Health bar display" },
      { key: "esp_weapon", label: "Weapon ESP", description: "Player weapon info" },
      { key: "esp_items", label: "Item ESP", description: "Loot & chest locations" },
      { key: "radar", label: "Radar Hack", description: "Mini-map overlay" },
    ],
  },
  {
    id: "safety",
    label: "Safety",
    winner: "streck",
    features: [
      { key: "stream_proof", label: "Stream Proof", description: "Hidden from OBS/Discord" },
    ],
  },
]

const CHEATS_DATA = {
  blurred: {
    name: "Blurred DMA",
    badge: "Premium",
    bestFor: "Best for Tournaments",
    price: 2200,
    pricePer: "Weekly",
    features: {
      aimbot: true, silent_aim: true, triggerbot: true, prediction: true,
      esp_box: true, esp_skeleton: true, esp_distance: true, esp_health: true,
      esp_weapon: true, esp_items: true, radar: true, stream_proof: true,
      no_recoil: true, fov_circle: true,
    },
  },
  streck: {
    name: "Streck DMA",
    badge: "Value",
    bestFor: "Best on Budget",
    price: 800,
    pricePer: "Weekly",
    features: {
      aimbot: true, silent_aim: false, triggerbot: true, prediction: true,
      esp_box: true, esp_skeleton: true, esp_distance: true, esp_health: true,
      esp_weapon: false, esp_items: true, radar: true, stream_proof: true,
      no_recoil: false, fov_circle: true,
    },
  },
  "fortnite-external": {
    name: "Fortnite External",
    badge: "Software",
    bestFor: "Best for Fortnite",
    price: 1000,
    pricePer: "Daily",
    features: {
      aimbot: true, silent_aim: true, triggerbot: true, prediction: true,
      esp_box: true, esp_skeleton: true, esp_distance: true, esp_health: true,
      esp_weapon: true, esp_items: true, radar: false, stream_proof: true,
      no_recoil: true, fov_circle: true,
    },
  },
} as const

// Spoofer Features grouped
const SPOOFER_GROUPS: FeatureGroup<string>[] = [
  {
    id: "hardware",
    label: "Hardware",
    winner: "perm",
    features: [
      { key: "disk_serial", label: "Disk Serial Spoof", description: "HDD/SSD identifiers" },
      { key: "motherboard", label: "Motherboard Spoof", description: "MB serial & UUID" },
      { key: "mac_address", label: "MAC Address Spoof", description: "Network adapter ID" },
      { key: "smbios", label: "SMBIOS Spoof", description: "System firmware data" },
      { key: "gpu_serial", label: "GPU Serial Spoof", description: "Graphics card ID" },
    ],
  },
  {
    id: "firmware",
    label: "Firmware",
    winner: "perm",
    features: [
      { key: "tpm", label: "TPM Bypass", description: "Trusted Platform Module" },
      { key: "efi_vars", label: "EFI Variables", description: "Boot firmware data" },
      { key: "kernel_level", label: "Kernel Level", description: "Ring 0 operation" },
    ],
  },
  {
    id: "persistence",
    label: "Persistence",
    winner: "perm",
    features: [
      { key: "registry_clean", label: "Registry Cleaner", description: "Trace removal" },
      { key: "auto_clean", label: "Auto Cleanup", description: "Automatic trace removal" },
      { key: "persist_reboot", label: "Persist on Reboot", description: "Survives restarts" },
    ],
  },
]

const SPOOFERS_DATA = {
  perm: {
    name: "Perm Spoofer",
    badge: "Permanent",
    bestFor: "Best Overall",
    price: 3500,
    pricePer: "One-Time",
    features: {
      disk_serial: true, motherboard: true, mac_address: true, smbios: true,
      gpu_serial: true, tpm: true, efi_vars: true, registry_clean: true,
      kernel_level: true, auto_clean: true, persist_reboot: true,
    },
  },
  temp: {
    name: "Temp Spoofer",
    badge: "Session",
    bestFor: "Best Short-Term",
    price: 2000,
    pricePer: "15 Days",
    features: {
      disk_serial: true, motherboard: true, mac_address: true, smbios: true,
      gpu_serial: true, tpm: false, efi_vars: false, registry_clean: true,
      kernel_level: true, auto_clean: true, persist_reboot: false,
    },
  },
} as const

// Bundle Features grouped
const BUNDLE_GROUPS: FeatureGroup<string>[] = [
  {
    id: "hardware",
    label: "Hardware",
    winner: "advanced",
    features: [
      { key: "dma_card", label: "DMA Card", description: "Captain DMA 100T-7th" },
      { key: "fuser", label: "Fuser Type", description: "Signal converter" },
      { key: "teensy", label: "Teensy Board", description: "With firmware" },
    ],
  },
  {
    id: "firmware",
    label: "Firmware",
    winner: "elite",
    features: [
      { key: "firmware_eac", label: "EAC/BE Firmware", description: "Anti-cheat bypass" },
      { key: "firmware_faceit", label: "FaceIt/VGK", description: "Additional AC support" },
    ],
  },
  {
    id: "software",
    label: "Software",
    winner: "advanced",
    features: [
      { key: "cheat_included", label: "Cheat Included", description: "DMA cheat software" },
      { key: "cheat_duration", label: "Cheat Duration", description: "License length" },
    ],
  },
  {
    id: "support",
    label: "Delivery & Support",
    winner: "advanced",
    features: [
      { key: "discord_support", label: "Discord Support", description: "Lifetime support" },
      { key: "remote_install", label: "Remote Install", description: "Setup assistance" },
    ],
  },
]

const BUNDLES_DATA = {
  basic: {
    name: "Basic Bundle",
    badge: "Starter",
    bestFor: "Best for Beginners",
    price: 42500,
    features: {
      dma_card: "Captain 100T-7th",
      fuser: "Mini DP Fuser V2",
      teensy: false,
      firmware_eac: "EAC/BE Emulated",
      firmware_faceit: false,
      cheat_included: "Blurred + Macku",
      cheat_duration: "30 Days",
      discord_support: true,
      remote_install: true,
    },
  },
  advanced: {
    name: "Advanced Bundle",
    badge: "Popular",
    bestFor: "Best Value",
    price: 67500,
    features: {
      dma_card: "Captain 100T-7th",
      fuser: "Dichen D60 Fuser",
      teensy: "Included",
      firmware_eac: "Slotted Edition",
      firmware_faceit: false,
      cheat_included: "Blurred DMA",
      cheat_duration: "Quarterly",
      discord_support: true,
      remote_install: true,
    },
  },
  elite: {
    name: "Elite Bundle",
    badge: "Premium",
    bestFor: "Best Performance",
    price: 150000,
    features: {
      dma_card: "Captain 100T-7th",
      fuser: "Dichen DC500 Fuser",
      teensy: "Included",
      firmware_eac: "Full Emulation",
      firmware_faceit: "EAC/BE + FaceIt + VGK",
      cheat_included: "Blurred DMA",
      cheat_duration: "Lifetime",
      discord_support: true,
      remote_install: true,
    },
  },
} as const

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

/**
 * Group-separator row rendered inside <tbody>. First cell shows an orange
 * eyebrow + hairline above the next block of features; the remaining cells
 * carry a Winner pill aligned beneath the product column that wins the
 * category. Gives the long list rhythm so a scrolling user always knows both
 * which axis they're in AND which product leads it.
 */
function GroupSeparator({
  label,
  productEntries,
  winner,
}: {
  label: string
  productEntries: [string, ProductRecord][]
  winner: string
}) {
  return (
    <tr className="bg-transparent">
      <td className="px-4 pt-10 pb-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#f97316]">
            {label}
          </span>
          <span className="flex-1 h-px bg-gradient-to-r from-[#f97316]/40 via-white/[0.08] to-transparent" />
        </div>
      </td>
      {productEntries.map(([id]) => (
        <td key={id} className="px-4 pt-10 pb-2 text-center">
          {id === winner ? <WinnerPill /> : null}
        </td>
      ))}
    </tr>
  )
}

/** Column winner ribbon — sits inside <th> on columns that win their category. */
function WinnerPill() {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[#f97316]/40 bg-[#f97316]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#f97316]">
      <Trophy className="h-3 w-3" />
      Winner
    </div>
  )
}

/** Differentiated check cell. `tier` controls intensity so the grid doesn't feel uniform. */
function CheckCell({ value, tier }: { value: boolean; tier: "win" | "standard" | "none" }) {
  if (!value) {
    return (
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.02] border border-white/[0.04]">
        <X className="h-4 w-4 text-white/30" strokeWidth={1.75} />
      </div>
    )
  }
  if (tier === "win") {
    return (
      <div
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#f97316]/15 ring-1 ring-[#f97316]/40 shadow-[0_0_16px_rgba(249,115,22,0.3)]"
        aria-label="Yes — category winner"
      >
        <Check className="h-5 w-5 text-[#f97316]" strokeWidth={2.25} />
      </div>
    )
  }
  if (tier === "none") {
    return (
      <div
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/[0.08]"
        aria-label="Yes"
      >
        <Check className="h-4 w-4 text-emerald-400/80" strokeWidth={1.75} />
      </div>
    )
  }
  return (
    <div
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20"
      aria-label="Yes"
    >
      <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} />
    </div>
  )
}

/** Bundle cell that can render either a check/X or a text value. */
function BundleCell({ value, isWinner }: { value: unknown; isWinner: boolean }) {
  if (value === true) {
    return <CheckCell value={true} tier={isWinner ? "win" : "standard"} />
  }
  if (value === false) {
    return <CheckCell value={false} tier="none" />
  }
  return (
    <span
      className={cn(
        "text-sm font-medium",
        isWinner ? "text-[#f97316]" : "text-white",
      )}
    >
      {String(value)}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ComparePage() {
  const [category, setCategory] = useState<CompareCategory>("cheats")
  const { addItem } = useCart()

  const handleAddToCart = (id: string, name: string, price: number, variantName: string) => {
    addItem(
      {
        id,
        name: variantName,
        price,
        product_id: id,
        is_lifetime: variantName.toLowerCase().includes("lifetime"),
        duration_days: null,
        created_at: "",
        product: {
          id,
          name,
          slug: id,
          description: null,
          category: "cheat",
          image_url: null,
          created_at: "",
          updated_at: "",
        },
      },
      1,
    )
  }

  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />

      {/* Hero — stray orange underline below badge removed; SectionEyebrow already carries its own lines */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <Breadcrumbs items={[{ label: "Compare" }]} />
          <div className="max-w-2xl mx-auto text-center">
            <SectionEyebrow label="Product Comparison" />
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mt-4 mb-6">
              <span style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(180,180,195,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Compare </span>
              <span style={{ background: "linear-gradient(180deg, #ffb366 0%, #f97316 45%, #c2410c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 50px rgba(249, 115, 22, 0.43))" }}>Products</span>
            </h1>
            <p className="text-[17px] text-white/55 max-w-xl mx-auto leading-[1.6]">
              Find the perfect product for your needs with our detailed comparison
            </p>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              {([
                { key: "cheats", label: "Cheats", Icon: Crosshair },
                { key: "spoofers", label: "Spoofers", Icon: Shield },
                { key: "bundles", label: "Bundles", Icon: Package },
              ] as const).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={cn(
                    "flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm transition-[color,background-color,border-color] duration-[180ms] ease-out",
                    category === key ? "bg-[#f97316] text-white" : "text-white/55 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Content */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          {category === "cheats" && (
            <CompareSection
              products={CHEATS_DATA}
              groups={CHEAT_GROUPS}
              onAdd={handleAddToCart}
            />
          )}
          {category === "spoofers" && (
            <CompareSection
              products={SPOOFERS_DATA}
              groups={SPOOFER_GROUPS}
              onAdd={handleAddToCart}
              narrow
            />
          )}
          {category === "bundles" && (
            <>
              <CompareSection
                products={BUNDLES_DATA}
                groups={BUNDLE_GROUPS}
                onAdd={handleAddToCart}
                bundle
              />
              <div className="mt-8 max-w-5xl mx-auto p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
                <p className="text-white/55 leading-[1.6]">
                  All bundles include discreet shipping, lifetime Discord support, and remote firmware installation.
                </p>
                <Link href="/products" className="inline-flex items-center gap-2 mt-4 text-[#f97316] font-bold hover:underline underline-offset-4">
                  View all individual products
                  <Zap className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

// ---------------------------------------------------------------------------
// Shared section renderer — handles desktop sticky table + mobile stacked cards
// ---------------------------------------------------------------------------

type ProductRecord = {
  name: string
  badge: string
  bestFor?: string
  price: number
  pricePer?: string
  features: Record<string, unknown>
}

function CompareSection({
  products,
  groups,
  onAdd,
  narrow,
  bundle,
}: {
  products: Record<string, ProductRecord>
  groups: FeatureGroup<string>[]
  onAdd: (id: string, name: string, price: number, variant: string) => void
  narrow?: boolean
  bundle?: boolean
}) {
  const productEntries = Object.entries(products) as [string, ProductRecord][]
  // Recommended product: prefer "Popular" badge (bundles), else first "Premium", else first col.
  const recommendedId =
    productEntries.find(([, p]) => p.badge === "Popular")?.[0] ??
    productEntries.find(([, p]) => p.badge === "Premium" || p.badge === "Permanent")?.[0] ??
    productEntries[0]?.[0]

  return (
    <div className={cn("mx-auto", narrow ? "max-w-4xl" : "max-w-5xl")}>
      {/* DESKTOP — sticky-head table (md and up) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-16 z-20 bg-black/95 backdrop-blur-md">
            <tr>
              <th className="text-left p-4 w-[200px] align-bottom">
                <div className="flex items-center gap-2 text-white/55">
                  {bundle ? <Package className="h-4 w-4" strokeWidth={1.75} /> : <Crosshair className="h-4 w-4" strokeWidth={1.75} />}
                  <span className="font-medium text-sm">{bundle ? "Includes" : "Features"}</span>
                </div>
              </th>
              {productEntries.map(([id, product]) => {
                const isRecommended = id === recommendedId
                return (
                  <th key={id} className={cn("p-4 text-center", narrow ? "min-w-[200px]" : "min-w-[180px]")}>
                    <ProductHeader
                      product={product}
                      isRecommended={isRecommended}
                    />
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <FeatureGroupRows
                key={group.id}
                group={group}
                productEntries={productEntries}
                bundle={bundle}
              />
            ))}
            <tr>
              <td className="p-4 pt-10" />
              {productEntries.map(([id, product]) => {
                const isRecommended = id === recommendedId
                return (
                  <td key={id} className="p-4 pt-10 text-center align-top">
                    <Button
                      onClick={() =>
                        onAdd(id, product.name, product.price, bundle ? "Complete Bundle" : product.pricePer ?? "")
                      }
                      data-cursor="cta"
                      data-cursor-label="Add"
                      className={cn(
                        "gap-2 rounded-xl w-full font-bold text-[13px] tracking-[-0.01em] transition-[transform,box-shadow] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] border-0 h-11",
                        isRecommended
                          ? "bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-[0_4px_14px_rgba(249,115,22,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_0_28px_rgba(249,115,22,0.55),inset_0_1px_0_rgba(255,255,255,0.1)] hover:-translate-y-0.5"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/[0.08] hover:border-white/[0.12]",
                      )}
                    >
                      <ShoppingCart className="h-4 w-4" strokeWidth={isRecommended ? 2 : 1.75} />
                      {isRecommended ? "Add to Cart" : "Add"}
                    </Button>
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* MOBILE — stacked cards, one per product with per-group feature list */}
      <div className="md:hidden space-y-6">
        {productEntries.map(([id, product]) => {
          const isRecommended = id === recommendedId
          return (
            <div
              key={id}
              className={cn(
                "relative rounded-2xl border p-6 overflow-hidden",
                isRecommended
                  ? "border-[#f97316]/40 bg-gradient-to-b from-[#f97316]/[0.08] to-white/[0.015] shadow-[0_18px_48px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "border-white/[0.06] bg-white/[0.02]",
              )}
            >
              {isRecommended && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent pointer-events-none" />
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    <Crown className="h-3.5 w-3.5 text-[#f97316]" strokeWidth={2} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f97316]">
                      Recommended
                    </span>
                  </div>
                </>
              )}
              <div className="flex flex-col items-center text-center mb-4">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] mb-3 border",
                    product.badge === "Popular" || product.badge === "Premium" || product.badge === "Permanent"
                      ? "bg-[#f97316]/15 text-[#f97316] border-[#f97316]/30"
                      : product.badge === "Value" || product.badge === "Session"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                      : "bg-white/[0.04] text-white/65 border-white/[0.10]",
                  )}
                >
                  {product.badge}
                </span>
                {product.bestFor && (
                  <p className="text-[10px] text-amber-400 font-bold mb-2 uppercase tracking-[0.12em]">
                    {product.bestFor}
                  </p>
                )}
                <h3 className="font-display font-bold text-white text-xl mb-1 tracking-tight">
                  {product.name}
                </h3>
                <p className="font-display text-3xl font-black text-[#f97316] mb-1 tracking-tight numeric">
                  £{(product.price / 100).toFixed(0)}
                </p>
                <p className="text-[11px] text-white/55 uppercase tracking-[0.12em] font-bold">
                  {product.pricePer ?? "one-time"}
                </p>
              </div>

              {/* Feature groups per product */}
              <div className="space-y-5 mt-5">
                {groups.map((group) => {
                  const isGroupWinner = group.winner === id
                  return (
                    <div key={group.id}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f97316]">
                          {group.label}
                        </span>
                        <span className="flex-1 h-px bg-gradient-to-r from-[#f97316]/25 via-white/[0.06] to-transparent" />
                        {isGroupWinner && <WinnerPill />}
                      </div>
                      <ul className="space-y-2">
                        {group.features.map((f) => {
                          const v = product.features[f.key]
                          return (
                            <li
                              key={f.key}
                              className="flex items-center justify-between gap-3 py-1.5"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{f.label}</p>
                                <p className="text-[11px] text-white/45 truncate">{f.description}</p>
                              </div>
                              <div className="shrink-0">
                                {bundle ? (
                                  <BundleCell value={v} isWinner={isGroupWinner && v === true} />
                                ) : (
                                  <CheckCell
                                    value={Boolean(v)}
                                    tier={v ? (isGroupWinner ? "win" : "standard") : "none"}
                                  />
                                )}
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })}
              </div>

              <Button
                onClick={() =>
                  onAdd(id, product.name, product.price, bundle ? "Complete Bundle" : product.pricePer ?? "")
                }
                className={cn(
                  "mt-6 gap-2 rounded-xl w-full font-bold text-sm tracking-[-0.01em] transition-[transform,box-shadow] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] border-0 h-11",
                  isRecommended
                    ? "bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-[0_4px_14px_rgba(249,115,22,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-white/85 border border-white/[0.08]",
                )}
              >
                <ShoppingCart className="h-4 w-4" strokeWidth={isRecommended ? 2 : 1.75} />
                Add to Cart
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Desktop column header — card on top of every column. */
function ProductHeader({
  product,
  isRecommended,
}: {
  product: ProductRecord
  isRecommended: boolean
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border p-6 overflow-hidden transition-[transform,box-shadow] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5",
        isRecommended
          ? "border-[#f97316]/40 bg-gradient-to-b from-[#f97316]/[0.10] to-white/[0.015] shadow-[0_18px_48px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05),0_0_50px_rgba(249,115,22,0.2)]"
          : "border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12]",
      )}
    >
      {isRecommended && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent pointer-events-none" />
      )}
      {isRecommended && (
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Crown className="h-3.5 w-3.5 text-[#f97316]" strokeWidth={2} />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f97316]">
            Recommended
          </span>
        </div>
      )}
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] mb-2 border",
          product.badge === "Popular" || product.badge === "Premium" || product.badge === "Permanent"
            ? "bg-[#f97316]/15 text-[#f97316] border-[#f97316]/30"
            : product.badge === "Value" || product.badge === "Session"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
            : "bg-white/[0.04] text-white/65 border-white/[0.10]",
        )}
      >
        {product.badge}
      </span>
      {product.bestFor && (
        <p className="text-[10px] text-amber-400 font-bold mb-2 uppercase tracking-[0.12em]">
          {product.bestFor}
        </p>
      )}
      <h3 className="font-display font-bold text-white text-lg mb-1 tracking-tight">
        {product.name}
      </h3>
      <p className="font-display text-2xl font-black text-[#f97316] mb-1 tracking-tight numeric">
        £{(product.price / 100).toFixed(0)}
      </p>
      <p className="text-[11px] text-white/55 uppercase tracking-[0.12em] font-bold">
        {product.pricePer ?? "one-time"}
      </p>
    </div>
  )
}

/** Renders a category separator row followed by that category's feature rows. */
function FeatureGroupRows({
  group,
  productEntries,
  bundle,
}: {
  group: FeatureGroup<string>
  productEntries: [string, ProductRecord][]
  bundle?: boolean
}) {
  return (
    <>
      <GroupSeparator
        label={group.label}
        productEntries={productEntries}
        winner={group.winner}
      />
      {group.features.map((feature, idx) => (
        <tr
          key={feature.key}
          className={cn(idx % 2 === 0 && "bg-white/[0.02]")}
        >
          <td className="p-4">
            <div>
              <p className="font-medium text-white text-sm">{feature.label}</p>
              <p className="text-xs text-white/45 leading-[1.4]">{feature.description}</p>
            </div>
          </td>
          {productEntries.map(([id, product]) => {
            const v = product.features[feature.key]
            const isWinnerCol = group.winner === id
            return (
              <td key={id} className="p-4 text-center">
                {bundle ? (
                  <BundleCell value={v} isWinner={isWinnerCol && v === true} />
                ) : (
                  <CheckCell
                    value={Boolean(v)}
                    tier={v ? (isWinnerCol ? "win" : "standard") : "none"}
                  />
                )}
              </td>
            )
          })}
        </tr>
      ))}
    </>
  )
}
