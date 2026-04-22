# $15–20K POLISH CHECKLIST — Premium Dark-Theme Tier-Up

Scope: the specific numeric tokens and micro-behaviors that separate an $8k dark theme from a $20k agency build. Read `DESIGN_PLAYBOOK.md` for the why; this doc is the exact-number spec.

---

## 1. Radius hierarchy — strict, only 5 values

Radius signals elevation as much as shadow does. Fewer values = more confident.

- [ ] Surfaces / page containers: `rounded-none` — let the grid do the work
- [ ] Cards / panels / modals: `rounded-2xl` (16px)
- [ ] Buttons / inputs / selects: `rounded-xl` (12px)
- [ ] Input inner elements (icon wells, chips-in-input): `rounded-lg` (10px)
- [ ] Pills / tags / eyebrow chips / avatars: `rounded-full` (9999px)
- [ ] **Kill** any `rounded-md` (6px), `rounded-3xl` (24px), `rounded-[20px]` — they are the tell of a template.
- [ ] Image frames inside a card: **radius − 2px** from parent (card `rounded-2xl` → inner image `rounded-[14px]`). Never match the parent, never under by 6+.

## 2. Hairline border strategy — three rgba values, zero wiggle

On `#0a0a0a` / `#09090b` / `#0c0c0e` backgrounds:

- [ ] **0.06** (`border-white/[0.06]`) — ambient card borders. Default for ~80% of components. Invisible until close inspection; exactly the Linear/Arc feel.
- [ ] **0.08** (`border-white/[0.08]`) — hover state of the ambient border, plus section dividers (`border-t border-white/[0.08]`).
- [ ] **0.12** (`border-white/[0.12]`) — active / focused / selected card. Also the border of the "recommended" pricing tier (combined with accent halo).
- [ ] Never use `border-white/20` or higher on ambient chrome — reads 2019.
- [ ] Rule of three: **never stack** a 0.06 border on top of a 0.06 background-elevation step. Either elevate with background shift OR with border, not both.
- [ ] `border-accent/30` only on the 1 primary CTA and the selected tier card. Zero exceptions.

## 3. Shadow tokens — elevation by light, not by spread

Dark UIs need deeper, colored shadows. Use these three only:

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.45);
--shadow-md: 0 8px 24px -8px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4);
--shadow-lg: 0 32px 64px -16px rgba(0,0,0,0.7), 0 8px 24px -8px rgba(0,0,0,0.5);
--shadow-accent: 0 0 0 1px rgba(255,106,0,0.18), 0 12px 36px -8px rgba(255,106,0,0.28);
```

- [ ] `sm` — inputs at rest, resting pills.
- [ ] `md` — cards on hover, dropdowns, tooltips, toasts.
- [ ] `lg` — modals, command palette, elevated drawers.
- [ ] `accent` — primary CTA hover + the 1 pricing-tier halo. **Do not** glow every orange thing.
- [ ] Internal highlight (the premium move): pair every shadow with `inset 0 1px 0 rgba(255,255,255,0.04)` — the faint top-edge rim light. This single inset separates "dark card" from "dark card that looks expensive."

## 4. Focus-ring on dark — never browser-default blue

The default `focus:ring-blue-500` is the single loudest amateur tell on a dark orange site.

- [ ] Remove global default: `*:focus-visible { outline: none }` then wire per component.
- [ ] Text inputs / selects: `focus-visible:ring-2 focus-visible:ring-white/[0.14] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:border-white/[0.18]`
- [ ] Primary buttons (accent bg): `focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950`
- [ ] Ghost/secondary buttons: `focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-0` (tighter — they're not the primary)
- [ ] Cards / interactive surfaces: `focus-visible:ring-1 focus-visible:ring-accent/50 focus-visible:ring-inset` — inset ring feels native.
- [ ] Never use `:focus` — always `:focus-visible` so mouse clicks don't leave a ring.
- [ ] `:focus-visible` is a11y-required. Skip it and the build is not $20k.

## 5. Hover transition timing — 3 durations only

Stop shipping `transition-all duration-300`. Premium uses one of three durations tied to the change:

- [ ] **180ms** — color, border-color, opacity, inline translate ≤ 2px. Button at rest ↔ hover, link underline, chip active state. `transition-[color,border-color,background-color] duration-[180ms] ease-out`.
- [ ] **240ms** — transforms 2–8px, shadow elevation, scale ≤ 1.02. Card hover lift, thumbnail zoom. `transition-[transform,box-shadow] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]`.
- [ ] **360ms** — layout shift, drawer/modal reveal, layoutId morph. Never longer; past 400ms the UI feels laggy.
- [ ] **Easing:** use `cubic-bezier(0.22,1,0.36,1)` (out-expo-ish) for enters, `cubic-bezier(0.76,0,0.24,1)` (in-out-quart) for scroll-linked. Never `ease-in-out` default — it's flat.
- [ ] **Never** `transition-all`. Always enumerate properties. Prevents paint-thrash and makes intent readable.

## 6. Skeleton shimmer — dark-tuned, not grey pulse

The generic `animate-pulse` on `bg-zinc-800` screams Tailwind starter.

```css
@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
.skel {
  background: linear-gradient(90deg,
    rgba(255,255,255,0.02) 0%,
    rgba(255,255,255,0.06) 50%,
    rgba(255,255,255,0.02) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.6s linear infinite;
}
```

- [ ] Base color `rgba(255,255,255,0.02)`, peak `0.06`. Higher and the shimmer looks like a bug.
- [ ] Duration `1.6s` linear — slower than default `1.2s`; calmer.
- [ ] **One skeleton instance at a time on screen** — or the page flickers. For lists, skeleton the first 3 items only, leave space reserved.
- [ ] Skeleton radius = final component radius. Never rounded pills where images will be.

## 7. Button hover choreography — ONE animation, not three

The $8k tell: color swap + scale + shadow + arrow slide + glow, all at once.

- [ ] Pick **one** choreography per button type:
  - Primary (accent bg): background darkens by 4% + shadow deepens to `--shadow-accent`. That's it.
  - Secondary (ghost): border `0.06 → 0.12` + text `zinc-300 → white`. That's it.
  - Icon-only: `scale(1.04)` + 180ms. That's it.
- [ ] Arrow/chevron micro-translate (`group-hover:translate-x-0.5`) allowed on link-buttons only, never on primary CTAs.
- [ ] Magnetic pull (§DESIGN_PLAYBOOK.4) reserved for **one** button per page — the hero CTA. Not every button. Becomes noise.
- [ ] `whileTap={{ scale: 0.97 }}` universal. Press feedback is free premium.

## 8. Icon weight — pick one lucide stroke, lock it globally

- [ ] Lucide `strokeWidth={1.75}` as the project-wide default. Not `2` (too thick for 14–16px contexts), not `1.5` (too wispy on hover states).
- [ ] Exception: inside a filled accent button, use `strokeWidth={2}` — the weight reads correctly against the orange fill.
- [ ] Size rhythm: **14 / 16 / 20 / 24** only. Never `18`, never `22`.
- [ ] Always sized via `size={n}` prop, not via `className="w-n h-n"` — avoids stroke-scaling bugs.
- [ ] Per nav item: icon 16, label follows at text-sm. Per card header: icon 20, title at text-base. Per section eyebrow: icon 14, label at text-xs.

## 9. Typography micro-adjustments

- [ ] **Buttons:** `tracking-[-0.01em]` at text-sm/base (sans). NOT default tracking — default is loose at small sizes.
- [ ] **All-caps eyebrows:** `uppercase text-[11px] font-medium tracking-[0.18em]` at root, `tracking-[0.22em]` for the number-eyebrow pattern (`01 / AIM`). Below 10px caps tracking goes to `0.24em`.
- [ ] **`font-variant-numeric: tabular-nums`** globally on: price, counter, leaderboard rank, timestamps, stat rows, license keys, order IDs, countdowns. Add to Tailwind layer: `.numeric { font-variant-numeric: tabular-nums; font-feature-settings: 'cv11'; }`.
- [ ] **Headlines:** `tracking-[-0.025em]` at clamp(56px,8vw,144px). At 80px+, kerning matters — enable `font-feature-settings: 'kern' 1`.
- [ ] **Body:** `leading-[1.6]` on paragraphs, `leading-[1.4]` on UI labels, `leading-[0.95]` on display headlines. No default `leading-normal` anywhere — it's the blandest value CSS ships.
- [ ] **Small-caps metric labels:** `font-variant: small-caps; letter-spacing: 0.08em;` (Mercury/Linear pattern) — one per section max.
- [ ] **Measure:** body `max-w-[68ch]`, pull-quotes `max-w-[38ch]`. Enforce, don't suggest.
- [ ] **Link underline:** `underline underline-offset-4 decoration-white/20 hover:decoration-white/60 transition-[text-decoration-color] duration-[180ms]` — never default `text-decoration: underline` (it crowds descenders).

## 10. Empty-state discipline — geometric, not literal

- [ ] No cartoon mascots. No literal illustrations of "empty box." No magnifying glass with face.
- [ ] Allowed: one geometric SVG primitive at 80–96px, `stroke-white/[0.08]`, stroke-width 1. Ring, dashed circle, simple orbital line.
- [ ] Or: oversized display glyph (`"∅"`, `"404"`, `"·"`) at clamp(96px,14vw,200px), `text-white/[0.04]` behind, headline in foreground at 24px.
- [ ] One-line body. One CTA. Nothing else. See COPY_AUDIT "Cart's dry. / Pick a tool..."
- [ ] Empty state vertical space: `py-24` minimum. Crowded empty = broken empty.

## 11. Component height rhythm — four values

Heights on a 4px grid, locked to these:

- [ ] Navbar: `h-16` (64px) desktop, `h-14` (56px) mobile. Sticky with `backdrop-blur-md` + `bg-zinc-950/80` (never opaque — reveals scroll position).
- [ ] Buttons: **sm 36 / md 40 / lg 44 / xl 48**. Primary CTA in hero = 48. Inline actions = 36. Everything else = 40.
- [ ] Inputs: 44 always (touch target). Select = input. Search = input.
- [ ] Dropdown/menu row: 40.
- [ ] Table row: 56 (leaderboards) or 48 (dense data).
- [ ] Card padding: `p-6` (24px) for content cards, `p-8` (32px) for hero/feature cards. Never `p-4` — feels cheap; never `p-10` — feels wasteful.
- [ ] Vertical section rhythm: `py-24` mobile, `py-32` tablet, `py-40` desktop (space-y-40 between major sections). Hero gets `py-48+`.

## 12. Gap scale — the 8-point grid, strict

Every spacing value must be one of: **4, 8, 12, 16, 24, 32, 48, 64, 96, 128**. No `gap-[22px]`, no `mt-[30px]`.

- [ ] **4 (gap-1)** — icon ↔ label inside a button, number ↔ unit in stat.
- [ ] **8 (gap-2)** — adjacent inline elements, pill groups.
- [ ] **12 (gap-3)** — form-field row, tab-strip items.
- [ ] **16 (gap-4)** — card internal vertical rhythm, button groups.
- [ ] **24 (gap-6)** — between card and its description, between H3 and its body.
- [ ] **32 (gap-8)** — between cards in a grid, between form sections.
- [ ] **48 (gap-12)** — between H2 and section body.
- [ ] **64 (gap-16)** — between sub-sections within a long page.
- [ ] **96 (gap-24)** — between major sections.
- [ ] **128 (gap-32)** — between page chapters (case study, long-form).
- [ ] Grids: `gap-x-8 gap-y-12` asymmetric — never equal gaps on editorial layouts (feels gridded, not designed).

## 13. Color / glow discipline

- [ ] **Orange glow count, per page: 2 max.** One on hero CTA, one on the single recommended pricing tier OR hero background mesh — not both.
- [ ] **White text on orange glow:** if H1 is white and sits within 200px of an orange glow blob, drop the glow to `bg-accent/20 blur-3xl` max, and add `opacity: 0.6`. Over-saturated orange on white reads neon-sign, not luxury.
- [ ] Accent fill for primary button: `#FF6A00` at rest, `#FF7A18` on hover (4% lighter, not darker — on dark bg, darker reads broken). Text always `#0a0a0a` on orange, never white — contrast ratio jumps from 3.4:1 (fail) to 12:1 (AAA).
- [ ] **Gradient drift fix:** the common bug where `bg-gradient-to-br from-accent/20 to-transparent` shows banding. Fix by adding `[background:linear-gradient(135deg,#ff6a0033_0%,#ff6a0000_60%)]` with explicit 60% stop + `filter: blur(0.5px)` to smooth banding. Do not add noise SVG overlay to fix banding — it dirties the color.
- [ ] Per-chapter hue nudge (playbook §8): problem section `bg-zinc-950`, process `bg-[#0a0d14]` cooler, outcome `bg-[#0d0a08]` warmer. Shift is ≤2% — imperceptible individually, structural across 3000px.
- [ ] **Never** gradient on body text. Gradient on H1 only, once per page.

## 14. Floating overlay budget

Your current page at peak has: navbar, chat widget, back-to-top, cart drawer trigger, cookie banner, toast, onboarding tour, keyboard-shortcuts hint. That's 8 floating layers competing.

- [ ] **Max 3 floating elements simultaneously.** Navbar (always) + toast (if active) + one contextual widget (chat OR back-to-top, not both).
- [ ] Back-to-top appears only after `scrollY > 800px` AND user has paused scrolling `>400ms`. Not always-on.
- [ ] Chat widget collapses to 40px dot after 3s idle on every page except `/apply` and `/faq`.
- [ ] Onboarding tour: one-shot, `localStorage` flag, **never replays**.
- [ ] Shortcuts hint: show on `Cmd+/` keypress, never floating ambient.
- [ ] No cookie banner if the jurisdiction doesn't require it (playbook §7 — Fireship rule). If required, make it the width of the content column, not full-width chrome.
- [ ] z-index scale: `navbar: 40, dropdown: 50, toast: 60, modal: 70, command-palette: 80, tooltip: 90`. Lock these. Zero inline z-index values.

## 15. Scrollbar (often forgotten — huge premium delta)

- [ ] Global `*::-webkit-scrollbar { width: 10px }` — thinner than default.
- [ ] Thumb: `background: rgba(255,255,255,0.08); border-radius: 999px;` — never visible track.
- [ ] Thumb hover: `rgba(255,255,255,0.14)`.
- [ ] `scrollbar-color: rgba(255,255,255,0.08) transparent;` for Firefox.
- [ ] Horizontal scrollers (marquee, featured products): hide scrollbar entirely with `scrollbar-width: none; &::-webkit-scrollbar { display: none }`.

## 16. Selection / caret color

- [ ] `::selection { background: rgba(255,106,0,0.25); color: #fff }` — brand in the select highlight. Tiny, noticed subconsciously.
- [ ] `caret-color: var(--accent)` on inputs. The blinking cursor in brand orange is a 5-second build, 10-point polish.

## 17. Image treatment

- [ ] Every product image inside a card gets a `bg-white/[0.02]` fallback + `after` element with `inset 0 1px 0 rgba(255,255,255,0.04)` inset rim light.
- [ ] Aspect ratio locked (`aspect-[4/3]`, `aspect-square`, `aspect-video`) — never let image height float.
- [ ] On hover: `scale(1.03)` + 240ms inside a container with `overflow-hidden`. Scale goes on `<img>`, not container.
- [ ] Screenshot frames: subtle `ring-1 ring-white/[0.06]` + `shadow-lg` — matches Linear reference (playbook §1).
- [ ] Always `next/image` with `sizes` attribute set. Missing `sizes` is a page-speed + layout-shift tax.

## 18. Motion hygiene

- [ ] `prefers-reduced-motion: reduce` kills: scroll-linked transforms, magnetic cursor, confetti, skeleton shimmer, `whileInView` stagger. Leaves: focus transitions, hover color swaps, press feedback (these are a11y-required feedback, not decoration).
- [ ] One hero animation per page. One count-up per page. One layoutId morph per nav.
- [ ] Every `AnimatePresence` must have `mode="wait"` — otherwise exit + enter overlap and the page stutters.

## 19. Data-rich UI polish

- [ ] Leaderboards, status pages, pricing: all numeric columns `tabular-nums text-right`.
- [ ] Currency: symbol `text-zinc-500`, value `text-white`. Not one lump.
- [ ] Deltas: `+12.4%` green `#4ade80`, `-3.1%` red `#f87171`. Never 3+ sentiment colors.
- [ ] Status dots: 8px, `ring-2 ring-current/20` outer ring for subtle glow without filter hacks.
- [ ] Sparklines in stat tiles: 80×24, `stroke-accent/60`, `stroke-width: 1.25`, no fill. Anything more reads dashboard-template.

## 20. Final sweep before ship

- [ ] Open the site at 110%, 125%, and 150% browser zoom. Any overflow, layout break, or clipping = not shipped.
- [ ] View every page at `375px`, `768px`, `1280px`, `1920px`. Touch targets 44+ on mobile, always.
- [ ] Tab through every page with keyboard only. Focus visible on every interactive element. No focus trap outside modals.
- [ ] Screenshot every page in dark mode and squint — if more than 2 orange glows, cull.
- [ ] Grep for `duration-300`, `transition-all`, `rounded-md`, `shadow-md` (Tailwind default). Replace each with the token above.
- [ ] Grep for `border-zinc-800` — replace with `border-white/[0.06]`. Alpha borders compose better across surfaces.
- [ ] Grep for `text-gray-` — replace with `text-zinc-` (your body grays must be one family, one hue).
- [ ] Check contrast: body text on bg ≥ 4.5:1. `text-zinc-500` only for metadata, never paragraphs.
- [ ] Run Lighthouse: Performance 90+, Accessibility 100, Best Practices 100. Anything less is not $20k.

---

Source tokens for Tailwind config (single source of truth):

```ts
// tailwind.config.ts extend
borderRadius: { xl: '12px', '2xl': '16px' },
boxShadow: {
  sm: '0 1px 2px rgba(0,0,0,0.45)',
  md: '0 8px 24px -8px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4)',
  lg: '0 32px 64px -16px rgba(0,0,0,0.7), 0 8px 24px -8px rgba(0,0,0,0.5)',
  accent: '0 0 0 1px rgba(255,106,0,0.18), 0 12px 36px -8px rgba(255,106,0,0.28)',
},
transitionTimingFunction: {
  premium: 'cubic-bezier(0.22,1,0.36,1)',
  scrub: 'cubic-bezier(0.76,0,0.24,1)',
},
transitionDuration: { fast: '180ms', base: '240ms', slow: '360ms' },
```

Every checkbox above is binary — ship or not shipped. This is the list.
