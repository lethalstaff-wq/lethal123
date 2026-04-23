# Design Playbook — Lethal Solutions redesign

Synthesis of 8 research findings ranked by **impact × feasibility**. This is the checklist to hit $100k feel.

## Principle
"Expensive = restraint + craft-level micro-details, not more effects." One good pattern + pixel-perfect execution beats five flashy ones.

## Stack (already available)
Next.js 16, React 19, Tailwind 4, **framer-motion 12.38**, **@studio-freight/lenis 1.0.42** (installed but NOT wired). No GSAP, no Three.js — keep it that way unless a specific pattern demands it.

## 🔥 Priority 1 — Foundation (unlocks everything else)

### P1.1 Wire Lenis globally
Already installed, not initialized. Create `components/lenis-provider.tsx` with `lerp: 0.1, smoothWheel: true`, touch-device guard, `cancelAnimationFrame` cleanup. Mount once in root layout. Remove conflicting `scroll-behavior: smooth` from globals.css (set to auto).

### P1.2 Typography tokens tightening
- Body: 16/24 (already ok)
- Section H2: clamp(2.25rem, 5vw, 3.75rem) with tracking -0.04em
- Hero H1: clamp(3rem, 8vw, 7.5rem) with tracking -0.045em (already ok)
- Never ship plain #000 or pure #fff — use `rgba(255,255,255,0.92)` for display text
- All display text uses **Space Grotesk** (already set)

### P1.3 Color token rationalization
Current globals.css has many ad-hoc `rgba(249, 115, 22, 0.xx)` usages. Introduce CSS vars:
- `--brand`: #f97316
- `--brand-dim`: rgba(249,115,22,0.12)
- `--brand-glow`: rgba(249,115,22,0.45)
- `--surface-1`: rgba(255,255,255,0.02) — resting card
- `--surface-2`: rgba(255,255,255,0.035) — hover card
- `--surface-3`: rgba(255,255,255,0.06) — elevated/popover

## 🔥 Priority 2 — Hero elevation

### P2.1 Per-character headline mask reveal
Wrap H1 in `motion.span` per char. Container variant staggers children 30ms. Child animates `y: 110% → 0%` inside parent with `overflow: hidden`. Apply to the two lines separately so the orange line starts after the white line finishes.

### P2.2 Scroll-linked hero parallax
`useScroll` on hero section. Orb Y transforms [0, 80], subhead opacity [1, 0.3], scroll-indicator opacity → 0 after 300px. `prefers-reduced-motion` kills all of it.

### P2.3 Hero CTA shimmer + magnetic (DONE — keep)

### P2.4 Scroll indicator refinement
Current mouse icon is OK. Add smooth fade-out when scrollY > 300.

## 🔥 Priority 3 — Card craft (across pricing, services, about, process, contact)

### P3.1 Spotlight-follow on cards
Per-card `onMouseMove` → set `--mx`, `--my` CSS vars → `::before` radial gradient uses them:
```css
background: radial-gradient(400px at var(--mx) var(--my), rgba(249,115,22,0.15), transparent 60%);
```
Apply to services-section 6 cards, about-section 3 product cards, pricing-section 3 bundles, contact-section 4 trust chips.

### P3.2 Micro-tilt on pricing + elite bundle
`onMouseMove` → rotateX / rotateY up to ±4deg. Resets on leave. Only desktop + no reduced-motion.

### P3.3 Animated gradient border on Elite (DONE — keep; verify visual)

### P3.4 Pricing checklist stagger
Each feature check has `motion.div whileInView` with `delay = i * 0.08`, `overshoot` spring (stiffness 220, damping 18).

## 🔥 Priority 4 — Microinteraction polish

### P4.1 Custom cursor morph on CTAs
Global cursor follower exists (cursor-effects.tsx). Add logic: when hovering `.cursor-cta`, cursor enlarges to 60px with ring + text "Launch"/"Buy"/"Track". Scale back on leave.

### P4.2 Button press + release
Every `<button>` and `<a role="button">` → scale 0.97 on `:active`, smooth spring release. Already partially in globals.css.

### P4.3 Link underline
`.premium-link` exists. Migrate nav footer and all inline links to use it.

### P4.4 Magnetic on all primary CTAs
Wrap every gradient-orange CTA with `<Magnetic>`. Currently only on hero.

### P4.5 Form input focus ring
Every input: `focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316]/40` + a subtle outer glow `focus:shadow-[0_0_0_4px_rgba(249,115,22,0.08)]`.

## 🔥 Priority 5 — Track Order page (user-requested)

### P5.1 Hero copy animation — headline word stagger (match home pattern)

### P5.2 Status timeline — animated
Current progress bar is static width transition. Replace:
- Bar fills with shimmer sweep during `processing`
- Each step circle: when it completes, pulse ring expands outward + tick-icon draws in (SVG stroke-dasharray)
- Use spring physics on circle fill transitions

### P5.3 License key block — premium treatment
- Copy-to-clipboard button (per microinteractions recipe #30)
- "Copied!" slide-in animation
- Segmented display (split key by 4 chars into groups)

### P5.4 Empty state + error state
Both exist but are plain. Add:
- 3D box-falling SVG animation on "No orders found"
- Shake-on-error animation on input when validation fails

### P5.5 Split-screen left brand — add scroll
Left half is static. Add rotating product badge + metric tickers so it feels alive.

## 🔥 Priority 6 — Sections polish (existing decent, push to great)

### P6.1 Services — "spotlight-follow" + tilt (see P3)

### P6.2 About products grid — per-card Ken Burns zoom on image hover (1.0 → 1.08 over 700ms)

### P6.3 Process — pulsing connector flow animated in direction of scroll

### P6.4 Testimonials — infinite marquee via `useAnimationFrame` for butter (not CSS keyframe); add `whileHover` pause per row

### P6.5 FAQ — answer reveal with char stagger (30ms per char), gradient left-border while open

### P6.6 Contact Discord card — pulsing ring around avatar, inner gradient breath

## 🔥 Priority 7 — Page transitions & states

### P7.1 Page transition
App Router `template.tsx` at root wraps children in `motion.div` with `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}` transition 0.4s. Works per-route.

### P7.2 Loading states
- Page-level skeletons already exist; add shimmer (already in globals).
- Route-change loading progress bar — tiny top-of-viewport during nav (orange).

### P7.3 Success states
- Toast already present (sonner).
- Add confetti dust on "added to cart" — particles ejected once, pure CSS.

### P7.4 Error states
- Input shake on validation fail (CSS keyframe translate ±4px × 4).
- Inline error with `Alert` component (already present) — add fade-in.

## 🔥 Priority 8 — Navigation improvements

### P8.1 Navbar active pill — `layoutId` morph
Framer Motion `layoutId="nav-active"` on the active pill background → smooth glide between items as route changes.

### P8.2 Mobile menu — staggered link reveal on open

### P8.3 Command search — already exists; add keyboard arrow navigation + inline keyboard shortcuts hint.

## 🔥 Priority 9 — Brand-level craftsmanship

### P9.1 Kinetic word swap in one title
Rotate through 3–4 words in a headline on loop (e.g., "Undetected. Fast. Backed.").

### P9.2 Scroll-progress enhancement
Existing progress bar in navbar. Add glow that intensifies as user progresses.

### P9.3 Grain overlay heartbeat
Existing grain at 2.2% opacity. Add subtle `animation: pulse 6s` between 1.8% and 2.6% for organic feel.

### P9.4 Back-to-top button — morphing
Current is simple. Make it a circular progress ring showing scroll-back distance, fills as you scroll down.

## Anti-patterns to avoid
- Three.js hero (out of scope, adds 500KB, low payoff for this brand)
- Over-animation (never more than 3 concurrent motion sources in same viewport)
- Bright pure colors (use muted — hex `#f97316` is already sub-100% saturated, keep it)
- Text-shadow on body copy (trash signal)
- Generic ease-in-out everywhere — prefer `cubic-bezier(0.4, 0, 0.2, 1)` or spring

## Execution order (commit per phase)
1. `feat(foundation): wire Lenis smooth scroll + token rationalization`
2. `feat(hero): per-char mask reveal + scroll parallax`
3. `feat(cards): spotlight-follow + micro-tilt across pricing/services/about/contact`
4. `feat(microint): cursor morph + magnetic on all CTAs + input focus polish`
5. `feat(track): full premium redesign — timeline + license copy + animations`
6. `feat(sections): testimonials buttery marquee + FAQ char reveal + process flow`
7. `feat(transitions): app-router page transitions + route loader`
8. `feat(nav): layoutId active pill + mobile menu stagger`
9. `feat(polish): kinetic word swap + grain heartbeat + scroll progress glow`
10. `feat(copy): every button label + subhead tightened`
