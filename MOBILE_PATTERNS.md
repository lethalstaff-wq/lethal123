# Mobile Patterns for Dark Gaming Tools Site (2024–2026)

Research snapshot for adapting premium SaaS/commerce mobile patterns to a dark-themed gaming tools site. Width reference: 375px (iPhone SE/mini), 390px (iPhone 15/16), 430px (iPhone 17 Pro Max).

---

## 1. Mobile Hero Patterns That Convert

### What premium sites actually ship

**Linear.app** (https://linear.app) — mobile hero is a vertical stack: sticky 56–64px header with logo + hamburger, headline ("The product development system…"), one-line sub, and a single text link/CTA above the product image. Hero fills ~85–100vh on first load. No autoplay video on mobile; product UI is a still image that animates only after idle scroll.

**Stripe.com** — approximately 80–90vh hero, 5–6 elements above the fold: nav, headline, subhead, two stacked **full-width** CTAs, and the edge of the wave graphic peeking in. Typography hierarchy ~28–36px headline, 16–18px body. Wave is CSS/SVG (no heavy images).

**Rauno Freiberg** (https://rauno.me) — the minimum viable hero: name, role, a manifesto list ("Make it fast. Make it beautiful. Make it consistent…"). Single column, typography-first, zero ornament. Proves the "trust whitespace" rule.

**Arc.net** — headline ("A familiar design…"), two platform-specific download CTAs repeated later in the page, minimal chrome.

### Concrete rules to ship

- **Use `100svh` for hero height, not `100vh`.** `svh` = small viewport height, measured against the smallest possible visible area (address bar expanded), so the CTA is never clipped by Safari's collapsing chrome. `dvh` causes layout shift when the bar collapses; `lvh` hides the CTA on load. (See sources on viewport units below.)
- **4 elements above the fold, max:** headline (2 lines), 1-line sub, primary CTA, one secondary link. Anything more = clutter at 375px.
- **Stack CTAs vertically, full-width (minus 20–24px side padding).** Do not put two buttons side-by-side at 375px — each ends up ~160px wide, which feels cramped and reads like a toolbar.
- **Kill autoplay video and parallax on mobile.** Linear and Stripe both defer heavy motion. Under LCP budgets (<2s), animations that block render are the #1 bounce driver.
- **Hero height target: 85svh.** Not 100. Leaving 15% reveals the next section's top edge — visual promise that there's more, which is the single most effective scroll trigger on mobile.

### For the gaming tools site
Single headline (product promise), one 16px sub, one 56px-tall full-width primary CTA in your accent color, one ghost secondary ("See products"). No chips. No grid. No live Discord counter above the fold on mobile — it reads as noise.

---

## 2. Product Grid on Mobile (375px)

### The tiered "bento" pattern

Bento grids are the 2024–2026 consensus for product lists with hierarchy. On desktop: 2×2 hero + 1×1 satellites. **On mobile at 375px, the correct answer is almost always single-column, not 2-column.**

**Why single-column wins at 375px:**
- A 2-col grid leaves each card ~170px wide after gaps and padding — too narrow for a product image + title + price + tag without cropping.
- Thumb reach: single-column means every card center is within the 60–80% "green zone" for thumbs. 2-col pushes outer cards into the "yellow" edge zone.
- Nike, LVMH, and other e-commerce brands using bento PLPs saw a 14% AOV lift by **spanning the hero tile 2-wide at tablet/desktop and collapsing to single-column on mobile**, not by forcing 2-col.

### When 2-col is OK
Only when tiles are thumbnail-heavy with minimal metadata (image + one-line label). Example: icon grids for categories. Minimum tile width 164px, minimum tap zone 48px.

### Concrete spec for the gaming site
- Mobile: 1 column, card height ~280–320px, full-width image at 16:10, 12px gap between cards.
- Featured/bestseller: same column but with a 2px accent-color border or a subtle inset glow (fits dark theme).
- Metadata row: name (18px/600), price (16px/500), one tag chip. That's it.

---

## 3. Mobile Nav Patterns

### What premium sites ship (reality check)

| Site | Pattern |
|---|---|
| Linear | Top sticky header (56–64px) + hamburger drawer |
| Stripe | Top sticky header + hamburger drawer |
| Vercel | Top sticky header + drawer |
| Arc.net | Top sticky, no drawer (few links) |
| Rauno.me | Inline text links, no nav bar |

**Not a single premium SaaS marketing site ships a bottom bar.** Bottom bars are an *app* pattern (Instagram, X, Spotify) used for persistent destinations in a logged-in context. On marketing sites they confuse users who expect browser chrome at the bottom.

**Floating pill nav** (shadcn block style) is trending on designer portfolios and agency sites but is a **desktop-first pattern**. On mobile at 375px, the pill either overflows or collapses back into a hamburger — you end up with a hamburger wearing a disguise.

### Rules
- **Sticky top bar, 56px tall, with safe-area-inset-top padding.** Use `env(safe-area-inset-top)` so it doesn't overlap the notch/island.
- **Hamburger opens a full-screen drawer** (not a partial slide-in). At 375px, a 300px drawer leaves a 75px gutter that reads as broken.
- **Drawer items: 56px tall rows.** Bigger than Apple's 44pt; matches what Vercel and Linear ship (48–56px comfortable hit zone).
- **Close button 48×48px top-right**, with the drawer's content fading/scaling in — the "Rauno rule" that sequential motion reads more organic than simultaneous.

### For the gaming site
Dark-themed sticky bar (black/95 blur backdrop at 12–16px), logo left, cart icon + hamburger right. Drawer: logo at top, 6–8 primary nav rows (56px each), auth CTAs at bottom with safe-area-inset-bottom padding. No bottom tab bar.

---

## 4. Empty-State Patterns That Feel Intentional

### The 4-element formula (Mobbin's analysis of 2,600+ components)

Every good empty state has:
1. **Icon or illustration** — native to the feature (empty cart ≠ empty search). 48–64px size.
2. **Headline** — one line, ~18–20px, states the fact ("No orders yet").
3. **Body** — one sentence, ~14–16px, explains what happens next or why.
4. **CTA** — primary action button, full-width or centered. "Browse products," not "Click here."

### Specific apps doing it well
- **Linear's empty backlog**: illustration of a sorted stack, "No issues yet. Create your first one or import from GitHub." Two buttons stacked.
- **Stripe's empty dashboard**: skeleton of the future state (faded chart + table) with an overlay CTA. The "ghost UI" pattern — hints at what filled looks like.
- **Wise**: uses color-matched flat icons, never stock photos. Keeps trust.

### Anti-patterns
- Generic magnifying glass for every empty feature (reads as broken).
- 404 humor on empty states (makes users think something failed).
- No CTA — breaks the "what do I do now?" rule.

### For the gaming site
Empty cart: shopping bag icon in your accent color at 30% opacity, "Your cart is empty", "Find the perfect tool for your setup", CTA "Browse products" full-width. Empty wishlist: heart icon, similar pattern, CTA "Browse". Empty reviews: message icon, "Be the first to review this", CTA opens review form.

---

## 5. Touch Targets Beyond Apple's 44×44

### What the research actually says

- **Apple HIG**: 44×44pt minimum (baseline compliance).
- **Material Design (Android)**: 48×48dp, with 8dp spacing between targets.
- **Steven Hoober touch research** (cited by Smashing Mag, 2023): top/bottom of screen needs 42–46px because users are *least* precise at screen edges; center needs only ~27px.
- **WCAG 2.2 AAA**: 44×44px minimum.
- **Author recommendation from research**: push to **30×30 in content, 48×48 on navigation**, and note that "a 56px or 64px button is noticeably easier and more satisfying to tap than a 48px button."

### What premium/Awwwards-winning sites ship

From observed patterns:
- **Primary CTAs**: 52–56px tall (not 44).
- **Secondary/ghost buttons**: 48px tall.
- **Nav items in drawers**: 56px tall rows.
- **Close/dismiss icons**: 48×48 hit zone with 24px icon centered (generous padding).
- **Bottom sticky CTAs (cart, checkout)**: 56–64px tall.
- **Card tap zones**: full card clickable, never just the title or thumbnail.

### Spacing
8px minimum between tappable elements. 12–16px feels premium. Never adjacent targets without gap — causes 10–15% mistap rate at 44px.

### For the gaming site
- Primary CTA: **56px tall**, 18px font, 20px horizontal padding, full-width on mobile.
- Icon buttons (cart, close, menu): **48×48 hit zone**.
- Product card: entire 280–320px tile tappable.
- Input fields: **52px tall, 16px font** (anything smaller than 16px triggers iOS auto-zoom, which is jarring).

---

## 6. Changelog / Activity Feed on Mobile

### What shipping products do

**Linear's changelog** (https://linear.app/changelog): reverse-chronological with **date headers** ("April 16, 2026") and **page-based pagination** ("Older updates → /page/2"). Not infinite scroll.

**GitHub's activity feed**: also chronological, grouped by day/month, with lazy-loaded pagination on mobile.

### The three valid patterns (pick one, stick with it)

| Pattern | When to use |
|---|---|
| **Grouped by month, chronological scroll, paginated at ~20 entries** | Product updates, changelog. User wants "what's new since I last checked." |
| **Infinite scroll with sticky date chips** | Social/activity feeds. User grazes. |
| **Search + filter + list** | >100 entries, enterprise audit log use case. |

For a gaming tools changelog, **grouped by month with pagination** is correct. Users scan "April 2026," see 4–6 entries with title + 1-line description, and paginate for older.

### Specific mobile spec
- Month header: sticky while scrolling that month's entries. 16px font, uppercase, 60% opacity (fits dark theme).
- Entry: 14–16px headline, 13–14px body (2 lines max, expand on tap), 12px timestamp. Tap target on entire row — min 72px tall to accommodate multi-line body.
- Tag chips (Feature / Fix / Improvement): 10–11px text, accent color on feature, green on fix, yellow on improvement.
- "Load more" button at bottom, not infinite scroll. Infinite scroll on a changelog breaks back-button / share-link behavior.

---

## 7. FAQ / Help Patterns on Mobile

### The data (Mobbin + LogRocket + accessibility research)

- **≤10 questions**: plain scroll, no accordion. Cleaner, faster, no interaction overhead.
- **10–50 questions**: accordion is correct. Saves vertical space, familiar pattern, reduces cognitive load.
- **>50 questions OR technical content**: linked pages or dedicated help hub. Each question gets its own URL (shareable, SEO-indexable, schema-markupable).

### Accordion rules for mobile
- **Hit zone**: entire row, min 56px tall.
- **Chevron indicator**: 16–20px, top-right. Rotates 180° on expand (180ms ease-out).
- **Only one open at a time** is the modern default (Linear, Stripe, Apple all do this). Multi-open causes users to lose their scroll position.
- **Expanded content**: 14–16px body, max 3–4 short paragraphs. If longer, link to a full page.
- **Animate max-height**, not display: smooth transition, no content jump.

### Anti-pattern
Accordions with deeply nested accordions inside. Breaks focus, breaks a11y, breaks trust.

### For the gaming site
Accordion at 10–30 FAQs is right. Add schema.org FAQPage markup for SEO. If support ever grows past 30, split into categories with collapsed sections per category, each accordion-style.

---

## Summary: Gaming Site Mobile Build Checklist

- Hero: `min-height: 85svh`, 4 elements above fold, single full-width 56px CTA.
- Product grid: 1-column at 375px, 280–320px card height, 12px gap.
- Nav: sticky top 56px bar with safe-area-inset, hamburger → full-screen drawer with 56px rows.
- Empty states: icon + headline + body + CTA. Feature-native iconography.
- Touch targets: 48px icons, 56px CTAs, 16px min font in inputs, 8–12px spacing.
- Changelog: month-grouped chronological, paginated at ~20.
- FAQ: single-open accordion at ≤30 questions, linked pages beyond.
- Every elevated/interactive element uses your dark-theme accent for tap feedback (not default browser blue).

---

## Sources

- https://linear.app
- https://linear.app/changelog
- https://stripe.com
- https://rauno.me
- https://arc.net
- https://vercel.com/design/guidelines
- https://mobbin.com/glossary/empty-state
- https://mobbin.com/glossary/accordion
- https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/
- https://web.dev/articles/accessible-tap-targets
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- https://www.nngroup.com/articles/empty-state-interface-design/
- https://github.blog/changelog/2025-02-14-reverting-feed-activity-sorting-back-to-chronological-ordering/
- https://inkbotdesign.com/bento-grid-design/
- https://tailwindcss.com/plus/ui-blocks/marketing/sections/bento-grids
- https://medium.com/@tharunbalaji110/understanding-mobile-viewport-units-a-complete-guide-to-svh-lvh-and-dvh-0c905d96e21a
- https://www.designstudiouiux.com/blog/mobile-navigation-ux/
- https://blog.appmysite.com/bottom-navigation-bar-in-mobile-apps-heres-all-you-need-to-know/
- https://screensizechecker.com/devices/iphone-viewport-sizes
- https://www.shopify.com/blog/16480796-how-to-create-beautiful-and-persuasive-hero-images-for-your-online-store
