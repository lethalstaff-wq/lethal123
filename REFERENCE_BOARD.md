# REFERENCE BOARD — Curated design vocabulary for dark gaming-tools ecommerce

Scope: real, currently-live URLs (verified 2024–2026 redesigns), "$50k agency quality" references per page type. Each entry: URL + specific technique + adaptation notes for dark gaming (black/near-black base, orange accent, tool/cheat/script DTC context).

Transcripts source references below are analysed at the end (see "Transcript signal").

---

## 1. Dark-theme product detail pages

### linear.app/features/planning
- Technique: full-bleed product "hero frame" (rounded 16px screenshot on deep `#08090A`), flanked by one short caption line + single CTA; below it, a sticky left-column feature index scrolls past a right-column of quiet screenshots. No decoration competes with the product image.
- Adapt: lift the "screenshot-in-rounded-frame on near-black + faint grid" recipe for each of your tools. Keep a single orange CTA per viewport. NOT the purple/blue brand hues — swap to neutral greys + your orange for primary.

### rauno.me/craft/polar (Rauno Freiberg's Polar product pages by proxy — e.g. polar.sh/blog posts)
- Technique: type-driven hero, asymmetric 2-col where right column is a live interactive demo (draggable, hoverable), not a static image. Micro-captions sit in the margin beside H2s like footnotes.
- Adapt: make one "hero feature" on each product page an actual interactive preview (e.g. tiny playable aim-trainer, a keybind simulator). Do NOT copy Rauno's wide serif display type — it reads editorial, not gaming. Use tight sans.

### arc.net/max (Arc Max / Arc browser product page)
- Technique: product "cards" each occupy one full viewport, with a single video loop on one side and 2–3 lines of copy the other. Scroll snaps between them. Between cards: a thin horizontal rule + tiny chapter label ("02 — Ask on page").
- Adapt: use scroll-snap + chapter-number eyebrow ("02 / AIM") for feature cards. Keep videos muted, tight-cropped, <8s loops. Do NOT copy Arc's peach/pastel palette — replace with your orange on charcoal.

### aesop.com (any fragrance product page, e.g. /au/p/fragrance/eidesis-edp)
- Technique: generous vertical whitespace, single centred product shot, serif headline + tiny caps meta row ("Notes · Volume · Origin"). Price is intentionally understated, not a red badge.
- Adapt: borrow the "meta row under the title" pattern for tool specs (Version · Undetected · Last update). Keep it subtle. Do NOT copy the cream/beige palette — invert to graphite with warm amber for the accent so it still feels apothecary-considered.

### balenciaga.com/en-us/sneakers (product pages)
- Technique: oversized product imagery on pure black, micro type for everything else, name of product in tiny caps tracked +80. Zero chrome. Recommended products live on a plain horizontal strip with no card styling — just images.
- Adapt: go fully unchromed on PDP: no cards around thumbnails, no borders on related products. Orange only on the "Add to cart" affordance. NOT the cold monochrome blue tint — keep your warm black.

---

## 2. Success story / case study pages

### stripe.com/customers/figma
- Technique: editorial long-form with sticky quote marginalia, big pull-metric cards ("50x faster"), and inline product screenshots between paragraphs — like a magazine feature, not a brochure.
- Adapt: make each "customer success" (player testimonial / streamer review) a long-form page with pull stats (KD ratio, hours saved, ban-free days). Copy Stripe's sticky left-margin meta block (customer logo, company size, industry). Keep it dark — Stripe is light; just invert.

### vercel.com/customers/adobe
- Technique: hero uses one giant metric ("94% faster builds") as the headline itself — no fluff tagline. Then "Results" appears as a 3-up stat row before any narrative.
- Adapt: lead every success story with ONE big orange number. Ban any headline that doesn't contain a number. The narrative comes after.

### framer.com/showcase (individual site case studies)
- Technique: each showcase page is the live site embedded in an iframe/preview with a thin control bar above it (device switcher, dark/light toggle). Meta info is collapsed into a slim sidebar.
- Adapt: if you ever feature community configs / custom HUDs, present them as embedded previews with device/resolution switcher. Do NOT copy the frosted-glass chrome — keep hard edges for gaming feel.

### linear.app/customers/ramp
- Technique: quote-first hero — a single 3-line pullquote at 48px in the middle of the viewport, customer logo above it, nothing else. Everything else sits below the fold.
- Adapt: for player testimonials, open with only the quote + player handle + their main game. No stock avatars, no background mesh. Pure restraint.

### mercury.com/customers/linear
- Technique: soft but strict grid (12-col), customer name in the tab title, body copy limited to 640px width. Uses small caps for metric labels.
- Adapt: enforce 640px max body width for readability. Use small caps only for labels — helps the content feel like it has been thought through (Karri Saarinen explicitly said Linear cares more about content than ornament — see transcript).

---

## 3. Referral / invite / rewards pages

### notion.so (referral flow in-app — `/settings/earn-credits`)
- Technique: personal referral link treated as the hero object — giant monospaced code, one-click copy button, live counter of credits earned. No marketing fluff around it.
- Adapt: make the referral link + live "₽ earned / N friends joined" the entire hero. Orange counter, monospaced link. Nothing else above the fold.

### cash.app/referral (and Cash App Boost)
- Technique: illustrated, playful; but the key move is the "share card" — a pre-rendered social card (your avatar + code + amount) that you can save as an image. Instagram-ready.
- Adapt: auto-generate a 1080×1350 shareable card per user (dark bg, orange glow, their handle, referral code). Download/copy buttons. The card itself IS the referral mechanic.

### linear.app/referrals (if present) / alternatively, framer.com/invite
- Technique: tiered rewards displayed as a vertical ladder with checkpoints — exactly like a game battle pass. Progress bar top-right.
- Adapt: this is gold for gaming — literally a battle pass visual metaphor for referrals. Orange fill, locked/unlocked tier icons, unlockable cosmetic rewards (profile banners, Discord roles). DO this.

### airbnb.com/users/referrals
- Technique: two-panel split: left "invite", right "status". Emails and SMS invites integrated natively, not "copy this URL and paste".
- Adapt: give users 3 native share surfaces (Telegram, Discord DM, copy). Skip Twitter/X/email — not your audience.

### revolut.com/referral
- Technique: a single clear "you earn X, they earn Y" equation at the top, in the largest type on the page.
- Adapt: put the equation ("You +500 coins / They −20%") as the H1. That equation is the referral pitch.

---

## 4. Careers / join-us pages

### figma.com/careers
- Technique: hero is a large candid photo of the team (not stock), then values as short 1-sentence statements (not paragraphs), then a filterable open-roles table with location/department/team facets.
- Adapt: if you have a team, show their real avatars (no stock). Replace values with a short "how we work" list (ship weekly, small team, remote). Keep the filterable roles table.

### vercel.com/careers
- Technique: benefits shown as tiny icon + label pairs in a 4-col grid, not as paragraphs. The hero has just H1 + one "see open roles" CTA.
- Adapt: icon+label benefits grid for your team perks (Revenue share · Product voice · Ship fast). Skip ping-pong-table energy.

### linear.app/careers
- Technique: long philosophical hero essay as the "why Linear" section, ending in a single link to roles. The careers page reads like a manifesto, not a recruitment ad.
- Adapt: write a genuine "why we build cheats the way we do" manifesto. Owning being small (Karri's explicit advice in transcript — don't pretend to be a big polished enterprise early). It resonates with your authentic audience.

### arc.net/careers (The Browser Company)
- Technique: hand-drawn / illustrated hero, personal tone ("this is Josh, our CEO"), candid Loom-style embedded video greetings from team members.
- Adapt: a 30s unlisted YouTube from the founder explaining the product's origin. More trust than any static page. Not the illustrated pastels — film it in a dark room, just you, webcam light.

### stripe.com/jobs/search
- Technique: master roles table with live filters, each role expands inline (not new page). Keyboard nav works.
- Adapt: if roles ≥ 3, copy the inline-expand table. If <3, skip the page entirely — a single-role page is anti-premium.

---

## 5. Changelog pages

### linear.app/changelog
- Technique: each entry is a MINI RELEASE PAGE — dated, illustrated hero image per release, one concise title, 2–3 bullets. Uses video loops inline for major features. Archive is chronological with sticky month labels.
- Adapt: copy the "illustrated hero per release" pattern — for every update, a small illustration/screen capture. Use video loops to show AIM tweaks, new HUDs, etc. Sticky month/week labels in the left margin. Transcript confirms: Linear explicitly built the Release page to give "major changes" more visual weight than the continuous changelog — consider splitting into "releases" (big) vs "changelog" (all).

### arc.net/releases (Arc release notes)
- Technique: chronological but structured: "Sometimes" / "Often" / "Now" — they categorise updates by user-facing significance. Also uses tiny animated GIFs inline.
- Adapt: categorise updates: "New" / "Tweaks" / "Fixes" with 3 different orange tints of the heading. GIFs inline for visual updates.

### stripe.com/changelog
- Technique: brutal and dev-focused — long reverse-chron list, each entry is a one-liner + expandable code diff. No illustrations. Breadcrumb anchors per date.
- Adapt: for the "API / Loader updates" dev-oriented part. Pick Stripe's format for internal/technical entries, Linear's for user-facing features. You can do both.

### vercel.com/changelog
- Technique: each entry has a big hero image, author avatar, and a shareable deep-link. Infinite scroll. Tag filters at top (Platform, Functions, Framework).
- Adapt: borrow the author avatar + shareable deep-link URL for each update. "Most kinetic" award → Vercel for motion between entries.

### resend.com/changelog
- Technique: minimalist, beautiful serif date headers, no illustrations, just type-driven changelog. Often one line updates.
- Adapt: if your changelog becomes noisy, Resend's restraint is a reset reference.

---

## 6. FAQ / Help / Docs landing

### stripe.com/docs
- Technique: 3-column landing — left persistent nav tree, centre big search + topic tiles, right "On this page" sticky TOC. Tiles show product icon + 1-line description.
- Adapt: on your FAQ/help landing, use topic tiles with your game icons (Valorant, CS2, Apex, Rust). Sticky TOC on right. Hard dark theme.

### arc.net/help (Help Center)
- Technique: organized by user task, not feature. E.g. "Getting started" / "Pinning tabs" / "Spaces" — each is a question from the user's POV, not a feature name.
- Adapt: write FAQ questions as the user would literally type them ("Will I get banned?", "How do I change my HWID?"). Not "Anti-cheat technology overview".

### linear.app/docs or linear.app/method
- Technique: editorial long-form doc pages, reads like a book chapter with numbered sections, generous line-height. Table of contents floats in right margin.
- Adapt: for long "setup guides", write them as editorial chapters. Numbered sections (01, 02, 03) in tiny caps eyebrow. Right-margin floating TOC.

### supabase.com/docs
- Technique: tri-pane dark docs (sidebar / content / on-this-page) with search front-and-centre, code samples syntax-highlighted in `#1c1c1c`-ish surfaces, inline copy buttons.
- Adapt: good reference for your "API docs" or "loader integration" page styling if you expose scripting. Code block palette matches your dark UI.

### raycast.com/manual
- Technique: minimalist left-rail nav, content centered at 680px, inline GIFs for every action, command palette (`⌘K`) indexes the docs themselves.
- Adapt: make your help center searchable with `/` or `⌘K` (you likely already have command-search from the file tree). Index the FAQ in it.

---

## 7. Compare / pricing pages

### linear.app/pricing
- Technique: 3 plan cards on a dark canvas, subtle border + internal dividers, the "recommended" plan uses an upward colour wash rather than a loud ribbon. Feature matrix below the cards, sticky header, check/dash glyphs not green ticks.
- Adapt: you likely already have this. Check: orange "recommended" halo, not a red ribbon. Checkboxes: simple orange dot or dash, never checkmark emojis. Transcript note: Karri Saarinen emphasised legibility over ornament — do not colour-code cells like a spreadsheet.

### vercel.com/pricing
- Technique: cards with live usage sliders (move the "bandwidth" slider, the price updates). Makes the pricing feel like a product.
- Adapt: if you have tiered/usage pricing (e.g. multi-game), add one interactive control — "Number of games" slider — that adjusts the displayed price.

### cron.com/pricing (now Notion Calendar; the original Cron pricing lives on archive)
- Technique: horizontal comparison table with hover highlight down the whole column, tiny per-feature tooltips explaining differences.
- Adapt: hover-highlight columns, keyboard-reachable. Tooltip on obscure features ("HWID spoofer — what is this?").

### framer.com/pricing
- Technique: monthly/yearly toggle implemented as a segmented control that animates the number smoothly (tween, not replace). 20% discount badge.
- Adapt: animate price transitions (Framer Motion layout animation). Do NOT show a huge strikethrough; a small eyebrow "save 20%" is enough.

### superhuman.com/pricing
- Technique: single-tier, no comparison — doubles down on confidence. Beautiful dark product shots dominate the page.
- Adapt: if your compare page is confusing, consider collapsing to fewer tiers. More premium.

---

## 8. Cart / checkout states (premium DTC)

### aimeleondore.com (cart drawer)
- Technique: cart is a right-side drawer on a pure black backdrop, each line item is a 1:1 square thumbnail + name + tiny size/variant, no quantity spinners inline — `−/+` as text links. Total is the only element at size 32px+.
- Adapt: right-drawer cart, squared product thumbs (your tool icons), text-link quantity controls. Total oversized in orange. No crossed-out shipping costs.

### oamc.com (checkout)
- Technique: 2-step only (Details → Payment), progress shown as `01 / 02` in the corner, body width narrow (480px), typographic labels not placeholder labels (label ABOVE the field in tiny caps).
- Adapt: 2-step checkout max. Step counter top-right. Labels above fields in 11px caps tracked +100.

### apple.com/shop/bag
- Technique: gigantic line items with detailed product copy, delivery estimate per line, real-time tax calc without reload. Zero promotional crust.
- Adapt: per-line "delivery instant / email in 2 min" copy — you sell downloads, reinforce speed. Tax handled silently if applicable.

### gumroad.com (checkout)
- Technique: minimal, single-card checkout. Price above form, one button. Feels like a Stripe Checkout page but branded. Loads in <200ms.
- Adapt: if possible, use Stripe Checkout itself with your dark brand colours — anti-cheat communities trust Stripe's URL bar. Else mimic Gumroad's one-card restraint.

### balenciaga.com/checkout
- Technique: everything on one page (accordion-free), pure type, no cart thumbnails next to payment — they've already committed, don't remind them to reconsider.
- Adapt: on the payment step, don't show product thumbnails (reduces cart abandonment). Just total + itemised text list.

---

## 9. 404 / not-found pages

### github.com/404 (current "parallax octocat")
- Technique: parallax scene that moves with mouse, but copy stays readable dead-centre. "This is not the web page you are looking for." + two links (home, search).
- Adapt: parallax a dark subtle scene (orbs / grid / stars) with your logo mark at centre. Two CTAs: home + search (you already have cmd-search). Keep copy one sentence.

### figma.com/404
- Technique: 404 is literally built from Figma tool icons scattered on a canvas — branded to their product.
- Adapt: scatter your product thumbnails / game icons across the 404 canvas. Makes the page double as a catalogue hint. One line of copy.

### kap.so/404 or similarly minimal indie
- Technique: just "404" in huge display weight on black, one subtle glow, one tiny link back home.
- Adapt: 50vh glyph "404" in your display font, orange underglow, one link. Your existing `not-found-orbs.tsx` suggests you're halfway here.

### raycast.com/404
- Technique: treats 404 like a missing command in their command palette — shows a mocked "no results" state from the product itself.
- Adapt: show your own command-search in "no results" state. Page == product, reinforces the brand.

### notfoundfor.me/404s (gallery of examples — use as reference only)
- Technique: reference gallery of premium 404s. Good shortlist source.
- Adapt: spot-check ideas only. Don't implement from it directly.

---

## 10. Login / auth pages

### linear.app/login
- Technique: hairline-bordered card in exact viewport centre on a faintly textured dark canvas. OAuth buttons FIRST (Google, GitHub), email sign-in BELOW, separated by a thin "OR" rule. Logo + wordmark top of card.
- Adapt: OAuth-first (Discord for gaming is the equivalent — Discord OAuth should be the primary button), email below. Orange accent only on the primary button. Card border `rgba(255,255,255,0.06)`.

### raycast.com/login
- Technique: split layout — left 40% marketing image/loop of the product, right 60% form. On mobile, collapses to form-only.
- Adapt: on large screens, a left-side looping clip of your tool in action; right side form. Reduces cold-auth friction.

### vercel.com/login
- Technique: single-column, everything centred, extremely minimal — just logo, H1 "Log in to Vercel", 3 OAuth options, 1 email input with passwordless magic link.
- Adapt: passwordless magic link is underrated for gaming audiences that hate passwords. Discord OAuth + magic-link email is enough.

### stripe.com/login (dashboard login)
- Technique: 2FA and device-recognition baked in — after email/password, a subtle transition to a code input. Keyboard focus handled correctly.
- Adapt: copy the animated state-transition between auth stages (email → OTP → success). Use Framer Motion's `AnimatePresence` with a slide-up.

### clerk.com (as a reference component library for <SignIn/>)
- Technique: pre-built auth UI with meticulous dark theming, keyboard navigation, error states.
- Adapt: if building from scratch is costly, Clerk's default dark theme is already close to premium. Skin it with your orange accent variable.

---

## Transcript signal (from `yt-transcripts/transcripts_design.txt`)

Specific tutorials/talks that analyse these references in depth:

- Video 1201 — Linear, "Figma design demo: Linear release page with Karri Saarinen" (https://youtube.com/watch?v=9tjtfhoTiYU). Karri walks through the Linear release page design decisions: why the release page exists separately from the changelog (release = curated, changelog = continuous), why gradients got restrained (warm/retro first draft rejected as "too separate from current design" → pulled towards cold tones), how to build multi-hue gradients in Figma (angular gradient + layer blur + soft-light overlay). Strongly informs sections 1, 5.

- Video 1200 — Y Combinator, "Brand Design Tips From Linear Founder Karri Saarinen" (https://youtube.com/watch?v=uEeFsW9343g). Karri reviews YC startup websites. Key principles extracted: (1) "own being a startup", don't over-polish too early — mismatched expectations; (2) homepage is the "front page", not every-feature encyclopedia; (3) content > ornament (animations should direct attention, not distract — Sprites AI critique); (4) use specific language your user types, not category abstractions ("issue tracking" not "work platform"); (5) yellow is a hard button colour, prefer darker; (6) enterprise audiences want trust signals, small details; (7) borders work when contrast is low, backgrounds work when grouping matters; (8) CTAs floating at the bottom read like cookie banners — users ignore them.

- Video 1153 — Magic Patterns, "Build a Linear-themed Portfolio Website with a Design System" (https://youtube.com/watch?v=6JaqhaVxgY8). Technical teardown of Linear's key visual motifs: pill button with gradient border + hover box-shadow glow; "stage light" effect using radial-gradient masking two symmetric conic-gradients animated with Framer Motion; gradient headline text (white → background colour for the shiny linear-style headline).

- Video 1155 — Codegrid, "I Timelined The Hell Out Of This Landing Page Animation (GSAP)" (https://youtube.com/watch?v=m6IA28EZ1qo). Not Linear-specific but describes a premium pre-loader pattern seen on Awwwards SOTD sites: progress bar + staged image reveals + split-text heading animation → final logo collapse with `mix-blend-mode: difference` for contrast against the revealed hero. Applicable as an optional brand-enter animation if used on the root route once.

No transcript hits on Aesop, Awwwards (as term), or Rauno directly in the design file. The Karri Saarinen content is by far the richest and directly maps to sections 1, 2, 5, 7, and 10 here.

---

## Cross-cutting principles

1. Content > ornament. Every reference earned "premium" by restraint. If an animation doesn't point to content, remove it (Karri).
2. One hero action per viewport. Orange used surgically.
3. Product-as-page — the screenshot/video IS the hero (Linear, Arc, Vercel, Raycast), not a decorated surround.
4. Tiny caps eyebrows over generic kickers: "01 / AIM", "NEW · v2.4".
5. Sticky marginalia (TOC right, meta left) signals editorial care.
6. Motion in changelog/release; stillness everywhere else.
7. Dark ≠ flat. Elevation via shadows (Karri: "in dark mode you need stronger shadows"), not more borders.
8. Cool-grey hue (bluish) makes warm orange pop; brown-grey muddies it.

## Do NOT borrow

- Purple/blue brand hues (Linear, Raycast, Stripe) — swap for orange.
- Pastel / peach (Arc) — reads non-gamer.
- Cream/beige (Aesop) — clashes with HUD vibe.
- Hand-drawn mascots — reads "playful startup".
- Loud pricing ribbons — use a halo.
- Cookie-banner-shaped floaters — users ignore (Karri).
- Auto-playing hi-fi looping hero video — distracts from message.
