# Findings: Animation Libraries & Techniques

Synthesized from transcripts (Olivier Larose, Frontend Tribe, Fireship, ForrestKnight, Footprint Arts, freeCodeCamp) + stack knowledge. Stack context: Next.js 16, React 19, Tailwind 4, **framer-motion 12.38** and **@studio-freight/lenis 1.0.42** already installed. GSAP / Three.js / Spline / Rive NOT installed.

## Framer Motion (already in project)

**When to reach for it** — default for any React-side animation. Declarative `<motion.X>` + variants + layout animations + AnimatePresence.

**Premium patterns**
- **`whileHover` / `whileTap`** on every CTA: { scale: 1.03 } + spring `{ stiffness: 300, damping: 20 }`
- **`layout` prop + `layoutId`** for morphing tabs, accordion, tier switches (free, no FLIP by hand)
- **`AnimatePresence` + `mode="wait"`** for clean route-ish transitions between React states
- **`useScroll` + `useTransform`** for scroll-linked parallax without GSAP. `const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] })` → `useTransform(scrollYProgress, [0,1], [0, -200])`
- **`stagger` via variants container**: `transition: { staggerChildren: 0.08 }` — stagger card grids on viewport enter
- **`whileInView` + `viewport={{ once: true, margin: "-100px" }}`** — cheap scroll reveal
- **`useMotionValue` + `useSpring`** for magnetic buttons — springs stiffness 150–300 damping 20

**Pitfalls**
- `layout` on every card = jank. Use only where a morph is actually visible.
- `AnimatePresence` doesn't work for route transitions in App Router without a template.tsx trick — see "page transitions" below
- Spring physics overshoot — if element lands on a pixel edge, set `damping` ≥ 25 or use a tween

## Lenis (already in project)

**When to reach for it** — you want smooth easing on `scrollTo` + butter-smooth scroll. Required for GSAP ScrollTrigger synchronisation.

**Wiring (Next.js App Router)**
```tsx
// components/lenis-provider.tsx
"use client"
import { useEffect } from "react"
import Lenis from "@studio-freight/lenis"
export function LenisProvider() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    let raf: number
    const tick = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [])
  return null
}
```

**Premium patterns**
- `lerp: 0.1` is the sweet spot; lower = too molasses, higher = barely smoothed
- Anchor-scroll: `lenis.scrollTo("#section", { offset: -80, lerp: 0.08 })`
- Pair with CSS `scroll-behavior: auto !important` — otherwise native SB fights Lenis

**Pitfalls**
- `position: sticky` breaks unless you use `lenis.raf` timeline (rare; mostly works)
- iOS Safari: disable Lenis on mobile (`isTouch` check) — native iOS inertia already good
- Don't Lenis inside modal/drawer — breaks `overscroll-behavior: contain`
- `scroll-behavior: smooth` in CSS conflicts. Remove it when Lenis is on.

## GSAP (NOT installed — install if we go this route)

**When to reach for it** — complex scroll-linked sequences, horizontal scroll, pinned sections, SVG path animation, SplitText. Framer Motion can do ~80% of what GSAP does, but ScrollTrigger + pin + SplitText are where GSAP shines.

**Install**: `npm i gsap --legacy-peer-deps` + `npm i @gsap/react` for the `useGSAP` hook.

**Premium patterns**
- **Text reveal on scroll** with SplitText:
  ```ts
  const split = new SplitText(headline, { type: "chars" })
  gsap.from(split.chars, { opacity: 0, y: 40, stagger: 0.02, scrollTrigger: { trigger: headline, start: "top 80%" } })
  ```
- **Pinned hero** — `ScrollTrigger.create({ trigger: hero, start: "top top", end: "+=100%", pin: true, scrub: 1 })`
- **Horizontal scroll section** — pin + `x: -100vw per panel` with `scrub: 1`
- **Image sequence on scroll** (Apple Vision technique) — canvas + `onUpdate: (self) => drawFrame(Math.round(self.progress * 59))`

**Pitfalls**
- `pin` on mobile destroys perf unless you `media: "(min-width: 768px)"`
- Always `ScrollTrigger.refresh()` after dynamic content loads
- Clean up in `useGSAP` return — otherwise triggers leak on SPA nav
- SplitText is now free (formerly Club GreenSock) — verify license version

## Three.js / React Three Fiber (NOT installed)

**When to reach for it** — actual 3D hero (product viz, kinetic shape, camera flythrough). Overkill for typical SaaS. Install `three @react-three/fiber @react-three/drei` only if you commit to a 3D hero.

**Premium patterns**
- Load GLTF via `useGLTF`, use `<Float>` drei helper for idle wobble
- Scroll-linked camera — `useFrame((state) => { camera.position.z = lerp(camera.position.z, target, 0.1) })` driven by scroll
- Postprocessing `<EffectComposer><Bloom intensity={0.5} /></EffectComposer>` — adds that Apple-grade sheen

**Pitfalls**
- Bundle ≈ 500KB gzipped for a minimal scene. Lazy-load behind `<Suspense>` + dynamic import
- Hydration: wrap in `"use client"` and dynamic import with `ssr: false`
- Models: compress GLB with Draco + meshopt; budget ≤200KB/model

## Spline (NOT installed)

**When to reach for it** — you want 3D but can't / won't code it. Designer tool exports an embed.

**Pattern**: `<Spline scene="https://prod.spline.design/....splinecode" />` in a dynamically-imported client component.

**Pitfalls**
- Adds ~400KB for runtime. Hurts LCP. Either lazy-load on scroll-into-view or replace with static poster image on slow connections
- Can't edit animation code — whatever the designer baked is what you get

## Motion One (NOT installed)

**When to reach for it** — you need one tiny animation and don't want Framer Motion's ~50KB. Rarely the right call in a project that already has FM.

## Rive / Lottie (NOT installed)

**Rive** — interactive state-machine animations (button states, onboarding). Best when a designer hands you a .riv file.
**Lottie** — one-off AE exports. Use `lottie-react`. Fine for icons but heavier than SVG.

**Premium alternative**: pure SVG animation with `framer-motion` path drawing (`pathLength`) — zero asset bundle, infinite control.

## Scroll Animation Pattern Catalogue

### Parallax depth layers (easy — pure Framer Motion)
```tsx
const { scrollYProgress } = useScroll({ target: ref })
const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])
// bg layer uses y2 (moves more), fg uses y1
```

### Pinned hero (GSAP preferred)
See GSAP section above. In FM alternative: `position: sticky; top: 0; height: 100vh` + `useScroll` driving opacity fade.

### Text reveal on scroll
- Mask reveal: wrap text in `overflow:hidden`, animate inner `y: 100%` → `0%` on viewport enter. Character stagger via `text.split("")` + `motion.span` children.
- SplitText (GSAP) for char/word level more polished stagger.

### Scroll progress bar
- Already in project (`scroll-progress.tsx`). Uses `window.scrollY / (docHeight - viewHeight)`.

### Section snap
- CSS `scroll-snap-type: y mandatory` on container + `scroll-snap-align: start` on sections. Avoid on Lenis-enabled pages — conflicts.

### Horizontal scroll (GSAP only — painful in FM)
- Pin container, translate X by `-(N-1)*100vw` via ScrollTrigger + scrub.

### Marquee
- CSS `@keyframes` translateX 0→-50% infinite linear (duplicate content). Pause on hover via `:hover { animation-play-state: paused }`.

## Decision tree for this project

1. **For everything microinteraction + card + button + scroll reveal** → stay in Framer Motion. Already installed, already used.
2. **For smooth scroll** → wire Lenis (already in deps, just not initialized). Big win, low risk.
3. **For marquee / simple keyframes** → plain CSS. Cheaper than FM/GSAP.
4. **For kinetic text reveal at hero** → implement SplitText-like manually with FM `motion.span` per char. Don't install GSAP for just this.
5. **For Three.js / Spline 3D hero** → only if brand narrative demands it. Gaming/spoofer brand could justify a subtle particle field, but not a 3D product. Skip for now.
6. **GSAP install** → only if we need pin + scrub + SplitText simultaneously. Currently no plan pattern requires that.

## Verdict
Keep stack lean: **Framer Motion + Lenis + CSS** cover 95% of premium patterns identified. Add GSAP only if a specific section demands pin+scrub+SplitText together.
