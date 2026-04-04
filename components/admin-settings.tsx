"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { updateSetting } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2, Globe, MessageSquare, Percent, Shield, Star } from "lucide-react"

export function AdminSettings({ settings, userEmail }: {
  settings: Record<string, unknown>
  userEmail: string
}) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  // Site settings with defaults
  const [siteName, setSiteName] = useState(String(settings.site_name ?? "Lethal Solutions"))
  const [siteDescription, setSiteDescription] = useState(String(settings.site_description ?? "Premium Gaming Cheats & Spoofers"))
  const [discordLink, setDiscordLink] = useState(String(settings.discord_link ?? "https://discord.gg/lethaldma"))
  const [youtubeLink, setYoutubeLink] = useState(String(settings.youtube_link ?? ""))
  const [telegramLink, setTelegramLink] = useState(String(settings.telegram_link ?? ""))
  const [couponCode, setCouponCode] = useState(String(settings.coupon_code ?? ""))
  const [couponPercent, setCouponPercent] = useState(String(settings.coupon_percent ?? "10"))
  const [announcementText, setAnnouncementText] = useState(String(settings.announcement_text ?? ""))

  // Review display settings - fixed at 847 total
  const [reviewTotal, setReviewTotal] = useState(String(settings.review_total ?? "847"))
  const [reviewStars5, setReviewStars5] = useState(String(settings.review_stars_5 ?? "720"))
  const [reviewStars4, setReviewStars4] = useState(String(settings.review_stars_4 ?? "85"))
  const [reviewStars3, setReviewStars3] = useState(String(settings.review_stars_3 ?? "25"))
  const [reviewStars2, setReviewStars2] = useState(String(settings.review_stars_2 ?? "12"))
  const [reviewStars1, setReviewStars1] = useState(String(settings.review_stars_1 ?? "5"))
  const [reviewDailyGrowth, setReviewDailyGrowth] = useState(String(settings.review_daily_growth ?? "0"))
  const [helpfulMin, setHelpfulMin] = useState(String(settings.helpful_min ?? "50"))
  const [helpfulMax, setHelpfulMax] = useState(String(settings.helpful_max ?? "120"))

  function saveAll() {
    startTransition(async () => {
      try {
        await Promise.all([
          updateSetting("site_name", siteName),
          updateSetting("site_description", siteDescription),
          updateSetting("discord_link", discordLink),
          updateSetting("youtube_link", youtubeLink),
          updateSetting("telegram_link", telegramLink),
          updateSetting("coupon_code", couponCode),
          updateSetting("coupon_percent", couponPercent),
          updateSetting("announcement_text", announcementText),
          updateSetting("review_total", reviewTotal),
          updateSetting("review_stars_5", reviewStars5),
          updateSetting("review_stars_4", reviewStars4),
          updateSetting("review_stars_3", reviewStars3),
          updateSetting("review_stars_2", reviewStars2),
          updateSetting("review_stars_1", reviewStars1),
          updateSetting("review_daily_growth", reviewDailyGrowth),
          updateSetting("helpful_min", helpfulMin),
          updateSetting("helpful_max", helpfulMax),
        ])
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch (err) {
        toast.error("Failed to save: " + (err instanceof Error ? err.message : "Unknown error"))
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your site configuration</p>
        </div>
        <Button onClick={saveAll} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? "Saved!" : "Save All"}
        </Button>
      </div>

      {/* Admin info */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">Admin Account</h2>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* General */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Globe className="h-4 w-4 text-blue-500" />
          </div>
          <h2 className="font-semibold text-foreground text-sm">General</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Site Name</Label>
            <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="mt-1 bg-background text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Input value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} className="mt-1 bg-background text-sm" />
          </div>
          <div className="col-span-2">
            <Label className="text-xs text-muted-foreground">Announcement Banner (leave empty to hide)</Label>
            <Input value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} placeholder="e.g. 20% OFF Summer Sale!" className="mt-1 bg-background text-sm" />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <MessageSquare className="h-4 w-4 text-emerald-500" />
          </div>
          <h2 className="font-semibold text-foreground text-sm">Social Links</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Discord Invite Link</Label>
            <Input value={discordLink} onChange={(e) => setDiscordLink(e.target.value)} className="mt-1 bg-background text-sm" placeholder="https://discord.gg/..." />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">YouTube Channel Link</Label>
            <Input value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} className="mt-1 bg-background text-sm" placeholder="https://youtube.com/..." />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Telegram Link</Label>
            <Input value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)} className="mt-1 bg-background text-sm" placeholder="https://t.me/..." />
          </div>
        </div>
      </div>

      {/* Coupon */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Percent className="h-4 w-4 text-amber-500" />
          </div>
          <h2 className="font-semibold text-foreground text-sm">Welcome Coupon</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Coupon Code</Label>
            <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="mt-1 bg-background text-sm font-mono" placeholder="e.g. SUMMER20" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Discount %</Label>
            <Input type="number" value={couponPercent} onChange={(e) => setCouponPercent(e.target.value)} className="mt-1 bg-background text-sm" />
          </div>
        </div>
      </div>

      {/* Review Display Stats */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Star className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">Review Display Stats</h2>
            <p className="text-xs text-muted-foreground">Controls the numbers shown on the public reviews page</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Total Reviews (base count)</Label>
            <Input type="number" value={reviewTotal} onChange={(e) => setReviewTotal(e.target.value)} className="mt-1 bg-background text-sm font-mono" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Daily Growth (+N per day)</Label>
            <Input type="number" value={reviewDailyGrowth} onChange={(e) => setReviewDailyGrowth(e.target.value)} className="mt-1 bg-background text-sm font-mono" />
          </div>
        </div>
        <div className="border-t border-border pt-4">
          <Label className="text-xs text-muted-foreground mb-3 block">Rating Breakdown</Label>
          <div className="grid grid-cols-5 gap-3">
            <div>
              <Label className="text-xs text-amber-500 font-semibold">5 Stars</Label>
              <Input type="number" value={reviewStars5} onChange={(e) => setReviewStars5(e.target.value)} className="mt-1 bg-background text-sm font-mono" />
            </div>
            <div>
              <Label className="text-xs text-amber-500 font-semibold">4 Stars</Label>
              <Input type="number" value={reviewStars4} onChange={(e) => setReviewStars4(e.target.value)} className="mt-1 bg-background text-sm font-mono" />
            </div>
            <div>
              <Label className="text-xs text-amber-500 font-semibold">3 Stars</Label>
              <Input type="number" value={reviewStars3} onChange={(e) => setReviewStars3(e.target.value)} className="mt-1 bg-background text-sm font-mono" />
            </div>
            <div>
              <Label className="text-xs text-amber-500 font-semibold">2 Stars</Label>
              <Input type="number" value={reviewStars2} onChange={(e) => setReviewStars2(e.target.value)} className="mt-1 bg-background text-sm font-mono" />
            </div>
            <div>
              <Label className="text-xs text-amber-500 font-semibold">1 Star</Label>
              <Input type="number" value={reviewStars1} onChange={(e) => setReviewStars1(e.target.value)} className="mt-1 bg-background text-sm font-mono" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            {"Sum: "}{Number(reviewStars5) + Number(reviewStars4) + Number(reviewStars3) + Number(reviewStars2) + Number(reviewStars1)}
            {" (should equal Total Reviews: "}{reviewTotal}{")"}
          </p>
        </div>
        <div className="border-t border-border pt-4">
          <Label className="text-xs text-muted-foreground mb-3 block">Helpful Count Range (shown on each review)</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-emerald-500 font-semibold">Min Helpful</Label>
              <Input type="number" value={helpfulMin} onChange={(e) => setHelpfulMin(e.target.value)} className="mt-1 bg-background text-sm font-mono" />
            </div>
            <div>
              <Label className="text-xs text-emerald-500 font-semibold">Max Helpful</Label>
              <Input type="number" value={helpfulMax} onChange={(e) => setHelpfulMax(e.target.value)} className="mt-1 bg-background text-sm font-mono" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            {"Each review will show a random helpful count between "}{helpfulMin}{" and "}{helpfulMax}
          </p>
        </div>
      </div>
    </div>
  )
}
