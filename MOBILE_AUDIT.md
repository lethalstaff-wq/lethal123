# Lethal Solutions — Mobile UX Audit

Viewport: iPhone 14 Pro (390×844). Live site: https://www.lethalsolutions.me. All screenshots saved as `mobile-audit-<page>.png` in `C:\Users\кир\Desktop\сайт\`.

Every page inherits the same global layout from `app/layout.tsx`. Before page-level fixes, the **global findings below dominate** every screenshot. Fix those first — they alone will lift almost every score by 1-2 points.

---

## Global findings (apply sitewide)

### G1. `MobileBottomBar` duplicates Navbar actions. HIDE on most pages.
`components/mobile-bottom-bar.tsx` renders a fixed `md:hidden` Status + Discord bar at the bottom. It also injects a `h-16` spacer that steals 64px from every page. On pages the user is actively reading (product detail, checkout, track, login, setup) this is intrusive **and** it redundantly surfaces the Discord/Status links that already live in the hamburger menu.
- **Recommendation:** Either (a) remove entirely and trust the hamburger, or (b) keep but hide on `/products/[slug]`, `/checkout`, `/cart`, `/track`, `/login`, `/download/*`, `/setup`, `/admin/*`, `/downloads`, `/apply`. Easiest: add `usePathname` to `MobileBottomBar` and early-return `null` for those routes.

### G2. `SocialProofToast` is visible on mobile. REMOVE on mobile.
`components/social-proof-toast.tsx` has `fixed top-20 right-6 w-[300px] z-[80]`. No `md:` guard. On a 390px screen a 300px toast glued to `top-20` **covers the scroll-progress bar, the navbar cart icon, and overlaps sticky product info**. I saw it obscure the sticky Buy button block on `/products/perm-spoofer`, the product cards on `/products`, the hero copy on `/compare`, the tier cards on `/referrals`, the changelog rows, and the code terminal on `/apply`.
- **Wrap the top-level div with `hidden md:block`** (or early-return if `window.innerWidth < 768`). This is the single biggest mobile regression.

### G3. Cookie consent covers bottom bar on first visit.
`components/cookie-consent.tsx` uses `bottom-20 md:bottom-6`. That correctly stays above the 64px MobileBottomBar, but `right-6 max-w-sm` = 344px wide, nearly full-screen, and it sits for 2s on mount. On first visit, users see a hero that is mostly uncovered, but everything below CTA buttons is blocked by the cookie card until they dismiss. Acceptable — but drop `max-w-sm` to `max-w-[300px]` on mobile and make the decline/close less prominent so it doesn't fight the Sign Up CTA.

### G4. `BackToTop` button overlaps MobileBottomBar's Status button.
`components/back-to-top.tsx` uses `fixed bottom-6 left-6 z-[70]`. The MobileBottomBar sits at `bottom: 0, height: 64px` ending at ~bottom-16, so BackToTop at `bottom-6` is *below* the bar visually on small screens — screenshots show it peeking **behind** the Status button (you can see its orange ring at the lower-left corner of every scrolled screenshot).
- Fix: on mobile add `bottom-24` (above the bar) or `hidden md:flex` if BackToTop is overkill given the bar already exists.

### G5. `ScrollProgress` bar AND `Navbar` scroll-progress bar both render (double progress bars).
`components/scroll-progress.tsx` (z-101) draws a top-line, AND `Navbar` has its own `fixed top-0 h-[2px] z-[61]` progress. Only one is needed. Remove `ScrollProgress` from `app/layout.tsx` line 134.

### G6. Horizontal scroll on `/status` (body scrollWidth = 428px vs viewport 390px).
The stats row `app/status/page.tsx:243-258` uses `flex items-center justify-center gap-8` with 4 items — on 390px the `3/6` Undetected item spills to `left:-29`, `24/7 Monitoring` spills to `right:411`. The user will feel the page "wobble" left-right when scrolling.
- Fix: change line 243 to `flex flex-wrap md:flex-nowrap items-center justify-center gap-4 md:gap-8` and line 250 to `gap-4 sm:gap-6 md:gap-8`.

### G7. Compare also slightly overflows (body 399 > 390).
Sticky left column + sticky category column under `components/comparison-table.tsx`. Minor, but the product name column is cramped and values wrap to 3 lines ("Bullet / Prediction / Lead target compensation"). Add `px-3 md:px-4` and slightly narrow the feature column to ~110px on mobile.

### G8. "52 orders today" pill + status-pill stack under navbar — OK. Discord counter not present on mobile (good — it only rendered in `contact-section` which should be mobile-hidden anyway).

### G9. `CommandSearch` opens with Cmd/Ctrl-K — unreachable on mobile. Harmless but the search icon in navbar triggers it — on mobile the modal is OK (`/ui/command.tsx` handles mobile). Leave as-is.

### G10. Typography: hero H1 on home uses `text-7xl` at `sm:6xl md:7xl`. On 390px the mobile base size is correct but `Dominate With` wraps awkwardly because of the typewriter caret. Acceptable.

### G11. Cursor/trail effects: `components/cursor-effects.tsx` already gates on `matchMedia("(hover: hover)")` — confirmed no custom cursor on mobile. Good.

### G12. `ShortcutsOverlay`, `ConfettiCanvas`, `CheckoutProgress`, `AbandonedCartToast` — none of these are triggered on mobile paint unless user types/cart. Fine as-is.

---

## What `/` (home) should show on mobile

Per user spec: **Hero → Featured Products → Bundles → nothing else**. Current mobile layout (`app/page.tsx`):
1. `HeroSection` — keep.
2. `StatsStrip` — **HIDE on mobile.** Wrap in `<div className="hidden md:block">` or change `<section>` class in `components/stats-strip.tsx:51` to include `hidden md:block`. Redundant with the "52 orders today" pill in hero.
3. `AboutSection` (= "01 Top Sellers / Featured Products") — keep. This is the Featured Products section.
4. `ServicesSection` ("02 Why Choose Us") — **HIDE on mobile.**
5. `ProcessSection` ("03 How it works") — **HIDE on mobile.**
6. `PricingSection` ("04 DMA Bundles") — keep. This is the Bundles section.
7. `TestimonialsSection` ("05 Customer Reviews") — **HIDE on mobile.**
8. `FaqSection` ("06 Common Questions") — **HIDE on mobile.** (Dedicated /faq exists.)
9. `ContactSection` ("07 Community") — **HIDE on mobile.** (Carries the Discord online counter which user wants hidden on mobile.)
10. `Footer` — keep (but collapse by default, see page notes).

Cleanest diff in `app/page.tsx`: wrap items 2, 4, 5, 7, 8, 9 in `<div className="hidden md:block">...</div>`. Current mobile scrollHeight on `/` is **14,410px** — that's ~38 screens. Target after cuts: ~4,800px (~13 screens).

---

## Per-page report

### `/` Home
- **Score: 5/10**
- Issues: (1) 14,410px scroll — 7 sections below the fold that user didn't ask for. (2) SocialProofToast appears after 8s and covers hero CTAs. (3) Double scroll progress bars at the top.
- Hide on mobile: `StatsStrip`, `ServicesSection`, `ProcessSection`, `TestimonialsSection`, `FaqSection`, `ContactSection`.

### `/products`
- **Score: 6/10**
- Issues: (1) SocialProofToast covers the second product card mid-scroll. (2) Hero eats 60% of first viewport before showing a single product (waste). (3) Category tab bar "All / Bundles / Cheats / Spoo..." overflows and clips "Spoofers" — it's horizontally scrollable but there's no visual affordance.
- Hide on mobile: none structurally (the page is a catalog, it's doing its job). Just shrink the `PageHeader` padding on mobile — currently `py-24`, cut to `py-12 md:py-24` so products appear sooner.
- Add a visible scroll-indicator on the tab pills (fade mask on right edge) or convert to a `grid grid-cols-3` on mobile.

### `/products/perm-spoofer`
- **Score: 4/10**
- Issues: (1) SocialProofToast crashes into the variant selector (`One-Time License`/`Lifetime License`). In the scroll screenshot it covers the currency toggle AND the price text. (2) The price history chart below is fine, but `components/price-history-chart.tsx` renders a 6-month SVG that is genuinely useful — keep. (3) The sticky bottom `MobileBottomBar` from layout plus the giant "Buy Now £35" button already present create redundant purchase entry points; arguably fine, but the spacer eats real estate.
- Hide on mobile: (per-page) hide `ProductShare`, `RecentlyViewed`, `LoyaltyCard` if present below the fold — not urgent.

### `/compare`
- **Score: 6/10**
- Issues: (1) SocialProofToast lands on top of the breadcrumb + page title (see screenshot — Perm Spoofer toast covers "Compare" breadcrumb). (2) Body width is 399px on 390 viewport — 9px overflow from the sticky table column. (3) Feature label column is cramped: "Bullet / Prediction / Lead target / compensation" wrapped on 4 lines.
- Hide on mobile: nothing to hide. Fix: widen the feature column on mobile to `w-[140px]` and make tick cells `w-[60px]`; allow horizontal scroll of the product columns.

### `/stories`
- **Score: 7/10**
- Issues: (1) Hero is clean and respects whitespace (per your memory rule). Good. (2) The "ISSUE 01 — CASE STUDIES" eyebrow + "Players who came back" hero is well-proportioned. (3) The story header below renders a weird absolutely-positioned "Valorant STACK" text clipped on the left of the viewport — visible in scroll screenshot. Likely `StoryMetrics` or a watermark label that uses `left: -X`.
- Hide on mobile: check `components/story-metrics.tsx` for a watermark that should be `hidden md:block`.

### `/referrals`
- **Score: 6/10**
- Issues: (1) SocialProofToast again — this time on top of the "3. Earn 10%" step. (2) The "Bronze / Silver / Gold" tier cards are stacked correctly but each card is 500+px tall; 4 tiers = 2000px of single-column scrolling with no break. (3) `ReferralsLeaderboard` (if present further down) — verify it doesn't render as a table on mobile.
- Hide on mobile: if `ReferralsLeaderboard` is a `<table>`, either collapse to a card list or hide it on mobile (`hidden md:block`).

### `/apply`
- **Score: 7/10**
- Issues: (1) Nice hero, chips wrap well. (2) SocialProofToast lands on the terminal JSON block (covers `"status": "accepted"`). (3) The stats grid "23+ TEAM MEMBERS / 8,734+ HAPPY CLIENTS / 97% SATISFACTION / 24/7 SUPPORT" is 2x2 — good. But the terminal block's monospaced JSON is readable at 390px only because it's short; any longer it would `overflow-x-auto`.
- Hide on mobile: nothing.

### `/reviews`
- **Score: 7/10**
- Issues: (1) Hero is good — "4.2 / 5 verdicts" works. (2) Scrolled the rating histogram renders correctly. (3) Search + filter selects stack vertically — good. (4) No issues unique to mobile.
- Hide on mobile: nothing.

### `/guides`
- **Score: 7/10**
- Issues: (1) Guide card titles truncate at mid-word with `…` ("How to setup your 2nd/Che…"). Change `truncate` → `line-clamp-2` on the card title. (2) Category pill bar ("All / Getting Started / Setup / Configuration / Hardware / Troubleshooting") wraps nicely.
- Hide on mobile: nothing.

### `/changelog`
- **Score: 7/10**
- Issues: (1) Filter pills wrap cleanly. (2) SocialProofToast covers the first filter badge row. (3) Expanded changelog entry shows version + bullet list — works well on mobile. (4) Version pills `v4.2.5` align next to title — crowded on narrower titles.
- Hide on mobile: nothing.

### `/faq`
- **Score: 8/10**
- Issues: (1) Clean hero + search + category pills. (2) FAQ cards are clear and well-spaced. (3) No horizontal scroll.
- Hide on mobile: nothing. Best-behaved page on mobile.

### `/downloads`
- **Score: 7/10**
- Issues: (1) License input + orange search button are correctly sized. (2) Help text visible below. (3) Below the fold it drops straight to the sitewide Footer — no middle content. Fine.
- Hide on mobile: nothing.

### `/status`
- **Score: 4/10**
- Issues: (1) **Horizontal scroll** — stats row `3/6 99.8% <2h 24/7` overflows on both sides (see G6). First digit of `3/6` hidden (`3` is clipped to `/6`), last digit of `24/7` clipped to `24/`. (2) Status filter pills (All / Cheats / Spoofers / Firmware) and legend (Undetected / Testing / Updating / Updated now) are on the same row — cramped. (3) Each product status card is fine.
- Fix: per G6 wrap the stats row `flex-wrap` on mobile. Stack the filter + legend on two rows below 768px.
- Hide on mobile: the stats strip at the top of `/status` is redundant — only value it adds is the "0/6 undetected" count. Consider hiding the stats block entirely on mobile and keeping just the page title + filter.

### `/cart` (empty)
- **Score: 8/10**
- Issues: (1) Empty state is clean — icon + "Your cart is empty" + Browse Products CTA. (2) Below that the Footer renders immediately — no awkward gap. (3) One nit: the MobileBottomBar's Discord CTA visually competes with the Browse Products primary CTA directly above it — there's no product-relevant action on an empty cart, so the bar's utility is low here.
- Hide on mobile: consider hiding `MobileBottomBar` on `/cart` when empty.

### `/track`
- **Score: 8/10**
- Issues: (1) Full-screen login-style layout, no navbar — clean. (2) Back arrow + green status dot in top corners. Input + "Track Order" CTA. (3) Works. No horizontal scroll.
- Hide on mobile: `MobileBottomBar` already hidden here because this layout doesn't include it (verify — may actually still render from root layout; if so, hide on `/track`).

### `/media`
- **Score: 7/10**
- Issues: (1) Clean hero. (2) Video cards stack vertically at full width — good. (3) "First cuts dropping soon" CTA card is clean. (4) Below that, the Footer. No issues.
- Hide on mobile: nothing.

### `/login`
- **Score: 9/10**
- Issues: (1) Excellent. No navbar, centered form, correct 16px input font-size (no iOS zoom). Login/Sign Up tabs clear. Google + Discord social buttons nicely sized. (2) One nit: "Forgot?" link in top-right of password field is tiny — bump to 13px.
- Hide on mobile: nothing.

### `/setup`
- **Score: 8/10**
- Issues: (1) Great hero "Up and running in 5 minutes". (2) Step cards with terminal mock, license mock — clean. (3) One issue: on step 02 the license string `LS-A7K3-9F2X-P4QM` is inside a card with `flex justify-between` — the label "LICENSE" and the value are cramped on 390px. Narrow the label or stack below. (4) Step numbers `01 / 02 / 03` in the right column compete with the step body — consider hiding the number label on mobile (`hidden md:inline-block`).
- Hide on mobile: nothing major.

---

## Global summary table

| Page                 | Score | Worst issue                                                            |
| -------------------- | ----- | ---------------------------------------------------------------------- |
| `/`                  | 5     | 7 extra sections below the fold                                        |
| `/products`          | 6     | SocialProofToast over cards; tab bar clipped                           |
| `/products/perm-spoofer` | 4 | SocialProofToast over variant selector                                 |
| `/compare`           | 6     | Toast over breadcrumb; 9px overflow                                    |
| `/stories`           | 7     | Stray "Valorant STACK" watermark                                       |
| `/referrals`         | 6     | Toast over tier list                                                   |
| `/apply`             | 7     | Toast over terminal                                                    |
| `/reviews`           | 7     | —                                                                      |
| `/guides`            | 7     | Title truncation                                                       |
| `/changelog`         | 7     | Toast over filter row                                                  |
| `/faq`               | 8     | —                                                                      |
| `/downloads`         | 7     | —                                                                      |
| `/status`            | 4     | Horizontal scroll; stats row clipped                                   |
| `/cart` (empty)      | 8     | MobileBottomBar redundant                                              |
| `/track`             | 8     | —                                                                      |
| `/media`             | 7     | —                                                                      |
| `/login`             | 9     | —                                                                      |
| `/setup`             | 8     | License label cramped                                                  |

**Average: 6.6/10.** After fixing G2 (SocialProofToast), G6 (status overflow), and the home-page section cuts, the average jumps to roughly **8.0/10**.

---

## Prioritized fix list

1. **Wrap `<SocialProofToast />` with `hidden md:block`** in `app/layout.tsx` line 132. (Biggest single win — affects every page.)
2. **Hide 6 home sections on mobile** — `StatsStrip`, `ServicesSection`, `ProcessSection`, `TestimonialsSection`, `FaqSection`, `ContactSection` in `app/page.tsx`.
3. **Fix `/status` stats row overflow** — `app/status/page.tsx:243` add `flex-wrap gap-4 md:gap-8`.
4. **Remove `ScrollProgress` from layout** — duplicate of Navbar's progress bar (line 134 of `app/layout.tsx`).
5. **Route-gate `MobileBottomBar`** — hide on `/products/[slug]`, `/cart`, `/checkout`, `/track`, `/login`, `/downloads`, `/download/*`, `/setup`, `/admin/*`.
6. **Nudge `BackToTop` above the bottom bar** — `bottom-24 md:bottom-6`.
7. **Fix guide card title truncation** — swap `truncate` for `line-clamp-2`.
8. **Patch `/compare` column widths** — feature column `w-[140px]`, cells `w-[60px]` on mobile.
9. **Audit `/stories` watermark** in `components/story-metrics.tsx` or similar for a `left: -X` that leaks left of viewport.
10. **Cookie consent** — narrow to `max-w-[300px]` on mobile.

Expected mobile score after all fixes: **8.5/10 average**, with home, status, and product detail all jumping 3+ points each.
