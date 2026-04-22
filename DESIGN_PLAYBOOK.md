# DESIGN PLAYBOOK — Premium Gaming-Tools E-Commerce

Source: mined from ~thousands of design/web-dev transcripts (Fireship, Cristian Mihai, Designer Mastery, Flux Academy, DesignCourse, Olivier Larose, Hyperplexed, Beyond Fireship, Kevin Powell, The Code Creative, Tom Is Loading, Codegrid, Malewicz, Viktor Oddy, Footprint Arts, Webflow, and others). Every principle below is concrete and implementation-ready for Next.js 16 + Tailwind + Framer Motion + GSAP.

Stack assumptions: Next.js App Router, Tailwind, `framer-motion`, `gsap + ScrollTrigger + SplitText`, `lenis` (smooth scroll), optionally `@react-three/fiber`, `unicorn.studio` (WebGL without pain). Dark theme, `#ff6a00`-ish orange as the one accent.

---

## 1. Hero patterns (minimalism over chips — trust whitespace)

- **The 4-element rule.** Headline, subheadline (how), one CTA, one hero visual. Nothing else. "99 times out of 100 you want these things to be situated so that the headline is bigger and the sub-headline is smaller" — DesignCourse, *The UI/UX of Hero Sections*. Implement as CSS Grid: `grid-cols-[1.1fr_1fr]` with `gap-16`, headline at `clamp(56px,8vw,144px)` weight 500-600, subheadline at `clamp(18px,1.3vw,24px)` weight 400.
- **Loaders buy you choreography time.** Start `document.body.style.cursor = 'wait'`, mount a preloader, then `setTimeout(() => setLoading(false), 2000)` and fire an `AnimatePresence mode="wait"` exit. While it exits, run a wordByWord entry (delay `0.02 * i`) — source: Olivier Larose, *Rebuild Awwwards Portfolio*. Also: `window.scrollTo(0,0)` on mount so users who scrolled during load snap back.
- **Curved SVG reveal under loader.** Animate an SVG `<path>` from a quadratic bezier curve down to a flat line using Framer Motion `variants`, `transition:{duration:1,ease:[0.76,0,0.24,1]}` — the signature Awwwards "paper lift" feel.
- **Kinetic split-text intro.** `gsap.SplitText(h1,{type:'chars,words'})`, then `tl.from('.char',{y:'110%',opacity:0,ease:'power4.out',duration:0.8,stagger:{amount:0.6,from:'random'}})`. Wrap each char in a `<span style="overflow:hidden;display:inline-block">` so the mask crops cleanly. Source: Footprint Arts + Webflow GSAP Crash Course — the `from:'random'` keyword is the playful touch.
- **Scroll-linked horizontal marquee headline.** Position a 200vw-wide `<h1>` as `relative`, then inside a pinned section use `useScroll({target,offset:['start end','end start']})` → `useTransform(progress,[0.05,0.35],[0,-100])` applied as `x:'${val}%'`. This creates the "hero phrase drifts left as you scroll into section" effect from Codegrid's *3D Product Scroll*.
- **Gradient mesh is fine — one only.** "Aurora or mesh gradients are best to use as the main background or on a card or two to break up the monotony… do not overuse" — Malewicz, *ONE ui design style*. Render with a single fixed `<canvas>` via `unicorn.studio` or a CSS `radial-gradient(circle at 30% 40%, #ff6a0040 0%, transparent 60%)` + `filter:blur(60px)` behind the hero. Never more than one mesh on the page.
- **No chips/pills/grids stuffed above the fold.** Per local `feedback_hero_simplicity.md`: resist the urge. Whitespace > ornaments. Ratio target: the CTA sits alone with at least 2× the whitespace that separates title/subtitle (Flux Academy, *Design The Perfect Hero Section*).
- **Social proof near CTA, not above.** Instead of logo soup, use "4,000+ builders already using this" with 3-5 overlapping avatars (−8px `margin-left` per avatar, ring-2 ring-background). Flux Academy, *Perfect Landing Page in 5 Minutes*.
- **Rotated badge anti-pattern (use sparingly).** DesignCourse showed rotating a pill 6-8° behind the headline can hide overflow and add character. Stay to one per page.

## 2. Scroll-triggered choreography

- **Pin + scrub is the agency move.** `ScrollTrigger.create({trigger:section, start:'top top', end:'+=1000%', pin:true, pinSpacing:true, scrub:true, onUpdate:(self)=>{ /* drive everything off self.progress */ }})`. Use `end:'+=NNN%'` for generous scroll real estate (1000% = 10vh of scroll). Source: Codegrid, *3D Scroll Animation*.
- **Map progress to animation windows, not to the whole scroll.** Inside `onUpdate`, clamp sub-ranges: `const pHeader = Math.min(1, Math.max(0, (progress-0.05)/(0.35-0.05)))`. This lets you choreograph many events on a single pinned section (header slides out 5→35%, circular mask reveals 20→30%, second header 15→50%, tooltip dividers 45→65%, tooltip text in 65% and 85%, model rotates 5→100%).
- **ScrollTrigger markers during build.** Always develop with `markers:true`. `start` and `end` accept `'top center'`, `'top 35%'`, `'-50%'`, etc. Pattern from DesignCourse *GSAP ScrollTrigger* video: `start:'top 80%', end:'bottom 20%'` is the safest default for enter/exit reveals; use `scrub:true` for motion tied to scroll, `toggle actions: 'play none none reverse'` for one-shot entrance.
- **Framer Motion `useScroll` + `useTransform` is the lightweight alternative.** Declare a `ref`, then `const {scrollYProgress} = useScroll({target:ref, offset:['start end','end start']})`. Offset syntax: `[<element-edge> <viewport-edge>]`. Then `const x1 = useTransform(scrollYProgress,[0,1],[0,150])` and spread `style={{x:x1}}` on a `motion.div`. Source: Tom Is Loading, *Framer Motion Scroll Masterclass*.
- **`whileInView` + `viewport:{once:true, amount:'all', margin:'0px 0px -100px 0px'}`** is the one-liner for "fade-in when element is fully visible, never again." `amount:0.5` means 50% must enter before firing. Source: The Code Creative.
- **Stagger children the cheap way.** Parent Framer Motion variant: `show:{transition:{staggerChildren:0.08, delayChildren:0.1}}`. Child: `{hidden:{y:24,opacity:0,filter:'blur(6px)'},show:{y:0,opacity:1,filter:'blur(0)',transition:{duration:0.6,ease:[0.22,1,0.36,1]}}}`. The `filter:blur` going to `0` is the Beyond Fireship "feels alive" trick (~4 lines of code, huge premium delta).
- **GSAP `total: 0.2s` stagger with `from:'random'`** for hero letters; `each: 0.05s` with `from:'start'` for list items; `each: 0.03s, from: 'center'` for radial feels. Source: Footprint Arts.
- **Parallax without plugins.** `<div data-scroll data-scroll-speed="0.1">` with Locomotive, or `y: useTransform(scrollYProgress,[0,1],[0,-150])` on a `motion.div` for background blobs — always **negative** Y on the element you want to *appear* stationary. Source: Olivier Larose.
- **Pin horizontal scroll section.** GSAP: `gsap.to('.track',{x:()=>-(track.scrollWidth - window.innerWidth), ease:'none', scrollTrigger:{trigger:'.wrapper', pin:true, scrub:1, end:()=>'+='+track.scrollWidth}})`. Use for a "featured products" band where cards travel left as user scrolls down.
- **Card scale/rotate on enter.** `initial:{y:200, scale:0.92, rotate: i%2===0 ? -5 : 5}` → `whileInView:{y:0, scale:1, rotate:0}` with `transition:{duration:0.9, ease:[0.22,1,0.36,1], delay:i*0.08}`. The slight rotate disparity between cards is the Webflow GSAP Crash Course "playful agency" signature.

## 3. Typography as art

- **Font pairing locked for this build.** Display: `Space Grotesque` or `PP Neue Montreal` (500–700). Body/UI: `Inter` or `Geist Sans` (400/500). Mono/numerics: `JetBrains Mono` or `Geist Mono` 500. Source: Codex Community + Codegrid using `PP Neue Montreal`.
- **Leading rules (Tailwind → CSS).** Display headlines: `leading-[0.95]` to `leading-[1.05]`. Subheadline: `leading-[1.25]`. Body: `leading-[1.6]`. UI/nav: `leading-[1.1]`. Never leave `leading-normal` on 80px headlines — DesignCourse *Epic Typography*.
- **Contrast ratio must be ≥4.5:1 on body.** "The contrast on the body type is only 2.96 to 1 — increase the contrast" — DesignCourse. For dark theme that means `text-zinc-300` minimum on `bg-zinc-950`; never `text-zinc-500` for paragraphs. Use `text-zinc-500` only for metadata/timestamps.
- **Tracking moves inverse to size.** Huge headlines: `tracking-tight` or `tracking-[-0.03em]`. All-caps labels/eyebrows: `uppercase text-xs font-medium tracking-[0.18em]`. This gap is what makes kicker/display pairings read as "editorial."
- **Scrub variable weight on scroll.** With a variable font (e.g., Inter var), wire `font-variation-settings:"wght" ${wght}` where `wght = useTransform(scrollYProgress,[0,1],[400,800])`. As user scrolls through a chapter, the headline gets heavier. Premium touch — no library, just CSS custom prop + Framer MotionValue.
- **Stroke-to-fill on hover for CTAs.** `-webkit-text-stroke: 1px currentColor; color: transparent; transition: color .4s ease-out`. `hover` state sets `color: currentColor`. Pair with a `background-clip: text` gradient sweep for extra flair.
- **Two-line mask reveal.** Each line wrapped in `<span class="block overflow-hidden"><span class="block translate-y-full">`, then Framer Motion flips the inner span `y:0`. Forgiving on wrap, always crisp. Source: Olivier Larose.
- **Drop caps for editorial sections (case study hero).** `.drop-cap::first-letter { float:left; font-size:clamp(72px,7vw,128px); line-height:0.85; padding:0.4rem 0.6rem 0 0; font-weight:600; color:var(--accent); }`. Use once per long-form section — never on short paragraphs.
- **Number-based chapter markers.** Eyebrow pattern: `01 / 04   FEATURES`. `tabular-nums`, mono font, 12px, `tracking-[0.24em]`, dim color, with a hairline rule (`h-px w-10 bg-zinc-700`) between number and label.
- **Hierarchy test (DesignCourse).** "If two pieces of type that are semantically different do not look different enough from each other it results in a user interface that's hard to use." Aim for ≥1.7× scale jump between H1↔H2, ≥1.4× between H2↔H3, at least one of weight/color/tracking changes between sibling labels.

## 4. Motion micro-interactions (premium spring presets)

- **"Premium" spring presets — exact values.**
  - Hover/press button: `type:'spring', stiffness: 400, damping: 28, mass: 0.6` (snappy, no overshoot).
  - Modal/drawer in: `stiffness: 260, damping: 26, mass: 1` (that Apple drop-and-settle).
  - Hero "land" reveal: `stiffness: 180, damping: 22, mass: 0.9` (slow, luxurious).
  - Magnetic cursor follow: `stiffness: 150, damping: 15` (light elastic).
  - Source synthesis: Fireship *Springy Animated Modals* (confirmed damping/stiffness mental model) + Framer Motion defaults.
- **Magnetic button (Olivier Larose pattern).** Wrap children in a `<Magnetic>` component that `React.cloneElement(child, {ref})`. On `mousemove` compute `const rect = el.getBoundingClientRect(); const x = e.clientX - (rect.left+rect.width/2); const y = e.clientY - (rect.top+rect.height/2);` then use `gsap.quickTo(el,'x',{duration:0.8, ease:'elastic.out(1,0.3)'})` — call `xTo(x*0.3)`. On `mouseleave` call `xTo(0)` and `yTo(0)`. Strength `0.3` is subtle; `0.5+` feels gimmicky.
- **Hover "bubble" on CTAs.** Inside button, absolute-positioned `<span class="bg-accent h-[150%] w-full absolute left-0 top-[100%] rounded-[50%]" />`. On hover: GSAP timeline with `from:'enter' → to:'exit'`, labels: enter = `{top:'-25%', width:'150%'}`, exit = `{top:'-150%', width:'125%'}`. `overflow:hidden` on the button so the curve peeks as a wave. Clear any pending timeout on re-enter to avoid stuck states. Source: Olivier Larose.
- **`layoutId` morphs.** On active nav tab, put `<motion.div layoutId="nav-pill" className="absolute inset-0 bg-white/5 rounded-full"/>` inside only the active tab — Framer automatically tweens position between tabs with `transition={{type:'spring',stiffness:320,damping:30}}`. This is the "magic underline" everyone loves.
- **Drag-to-reveal hero gallery (Hyperplexed 20-line trick).** Absolute-position a `.track` with `<img>` children. Track mouse delta from `mousedown` start point, divide by `window.innerWidth/2`, clamp to `[-100,0]` percent — apply via `el.animate([{transform:`translate(${pct}%,-50%)`}],{duration:1200, fill:'forwards'})`. The `.animate()` API + `fill:'forwards'` = buttery native interpolation without Framer. Bonus: also shift each image's `object-position: ${100+pct}% center` for parallax inside the parallax.
- **Reduced-motion guard.** Wrap anything sparkly in `@media (prefers-reduced-motion: no-preference) { … }`. Kevin Powell, *Incredible scroll-based animations*: "If somebody's coming to your website and they're feeling nauseous, they're leaving." Non-negotiable for premium — lack of a11y reads as amateur.
- **Tap-feedback (`whileTap:{scale:0.97}`)** on every clickable card/button. Combined with spring — the brain reads it as "real physical surface."
- **Confetti on purchase/redeem.** Tasteful burst (≤30 particles, 600ms), one-off only. Already have `components/confetti.tsx` — reuse; never loop.

## 5. Editorial / magazine layouts (great for product-detail, case-study, referrals)

- **Asymmetric 12-col grid.** Build with `grid-cols-12 gap-x-8 md:gap-x-12`. Hero copy `col-span-7`, visual `col-start-9 col-span-4`. Secondary row reverses. Never center-stack everything — centered is the tell of template sites.
- **Marginalia sidebar.** A narrow `<aside>` on the outer column (say `col-start-1 col-span-2`) with a sticky 10px dot + 12px mono metadata (read time, chapter, category). Use `position: sticky; top: 120px`.
- **Pull quote style.** `blockquote` with `border-l-2 border-accent pl-6 text-3xl leading-[1.15] font-medium max-w-[38ch] my-24`. Keep to 38-60ch measure. One per long page, not per section.
- **Chapter markers on scroll.** Fixed-position minimap on the right: list of `01 Hero · 02 Features · 03 Comparison · 04 Pricing · 05 FAQ`, the active one lit orange, updated via `IntersectionObserver`. 14px mono, 8% opacity when idle.
- **Drop cap, number eyebrow, pull quote — rotate, don't stack.** One editorial flourish per section; pick the one that fits the content.
- **Bento grid for "what's included."** Asymmetric tiles (`col-span-2 row-span-2`, `col-span-1 row-span-2`, three `col-span-1` fillers). Flux Academy called this the 2024 trend that's still holding. Tiles must vary in content (one image, one number, one list) to justify the grid.
- **Marquee band between sections.** Horizontal infinite scroll of category keywords (`DRIFT · AIMLOCK · ANTI-RECOIL · TRIGGER · HIP·FIRE ·`), duplicated with `flex-shrink-0` and `animate-[marquee_40s_linear_infinite]`, pause on hover (`hover:[animation-play-state:paused]`). Source: Footprint Arts + ChatGPT-inspired dark-landing tutorial.
- **Hairline rules over boxes.** Use `border-t border-white/5` to separate sections; avoid big cards stacked on cards. Editorial designs show structure through rhythm, not boxes.
- **`tabular-nums` everywhere numbers live.** Pricing, counters, stats, leaderboards. Without it, digits jitter during transitions.

## 6. "Wow" tricks worth the implementation cost

- **Unicorn Studio WebGL shader backgrounds.** Drop-in embed, no three.js code, runs at 60fps on mobile, exports a single `<canvas>`. Use for hero background depth. Viktor Oddy + Flux Academy both endorse.
- **Image distortion on hover (WebGL).** Use `curtains.js` or a custom shader via `@react-three/fiber` with a `ShaderMaterial` that displaces UVs by `mouse distance * 0.05`. Keep the displacement tiny — above 0.05 it looks like a broken plugin.
- **3D card tilt.** Framer Motion `useMotionValue` for `x/y` inside an `onMouseMove`, then `rotateX = useTransform(y,[−half,half],[10,−10])`, `rotateY = useTransform(x,[−half,half],[−10,10])`. Apply to a parent with `perspective: 1000px`. Add a `mix-blend-overlay` radial gradient that follows the cursor for fake specular highlight. Premium level when the spec highlight lives on a pseudo-element (`::before`) with `background:radial-gradient(circle at var(--mx) var(--my), #ffffff30, transparent 40%)`.
- **Scroll-linked 3D rotation (Three.js).** On a pinned section, `model.rotateOnAxis(new Vector3(0,1,0), delta)` where `delta = (targetRotation - currentRotation)`. Cap `pixelRatio` at 2, enable `antialias:true`, use `ACESFilmicToneMapping` — Codegrid's exact recipe. Spin is `progress * Math.PI * 2 * 12` (= 12 full turns across scroll) for product showcase drama.
- **Lenis everywhere.** `const lenis = new Lenis({ lerp: 0.08, duration: 1.2, smoothWheel:true })`. Wire `requestAnimationFrame(raf); function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }`. Then `gsap.ticker.add((t)=>lenis.raf(t*1000))` and `gsap.ticker.lagSmoothing(0)`. Non-negotiable for the "glides like silk" feel that every Awwwards site has.
- **Lottie vector accents.** `.json` from LottieFiles — use for a 32px icon inside the "Order confirmed" toast, the referral badge pulse, or the level-up celebration. Keep to <20KB per Lottie.
- **Scroll-linked `clip-path` reveal.** `clip-path: circle(${size}% at 50% 50%)` where `size = Math.min(Math.max((progress-0.2)/0.1,0),1)*150`. Gives the "dramatic circle wipe to next scene" trick from Codegrid — premium transition without 3D.
- **CSS `@scroll-timeline` (progressive enhancement).** Kevin Powell walked through `animation-timeline: view()` and `animation-range: entry 500px exit 100px`. Limited support today, but adding it as a pure-CSS fallback future-proofs the site.
- **Cursor state morph.** Default = 8px dot, on `:hover` of link = 40px outlined ring, on `:hover` of button = 64px filled orange with micro label ("buy"). Already scoped out since the user removed custom cursor — if reviving, use `mix-blend-difference` on white for the orange-reads-well-on-any-bg trick.
- **Variable-weight scrubbed chapter titles.** See §3. Pair with reduced opacity out of range (0.2) and blur 4px → 0 for layered depth.

## 7. Anti-patterns — what kills the premium feel

- **Too many gradients / too much orange glow.** "Do not overuse solid colors and flat surfaces … no thanks. Mesh and aurora gradients are best to use as the main background or on a card or two" — Malewicz. Rule: **one** orange glow on the hero, **one** accent gradient on a single card, and zero elsewhere. The rest is flat `#0a0a0a` on `#111` on `#1a1a1a` surface stacking.
- **Slide-fest syndrome.** Malewicz, *How We 3X This Website's Conversion*: "We try to avoid the animation paradox in which many companies go with every section sliding in either from the sides or from the bottom or from the top so as you scroll you have a complete slide fest… that is cognitively taxing." Rule: **half your sections should not animate in.** Let the user rest.
- **Generic iconography.** Lucide/tabler is fine if customized (stroke-width 1.25 instead of 2; consistent 24px box; custom accent glyph for 3-5 hero features). Raw Material icons = instant template feel.
- **Inconsistent alignment.** Mixing left-align + center in the same block is the #1 tell of amateur work — DesignCourse *Epic Typography*. Pick one axis per section and stick to it.
- **Weak spacing.** Internal vertical rhythm must multiply from a single unit (4 or 8). Never use `mb-[13px]`. Tailwind's own scale is fine; stay on it.
- **Three + font families.** Two max (display + body). A third mono *only* for numerics. Four-font pages look like class projects. "There are too many fonts — choose one that looks better" — DesignCourse, *Epic Typography*.
- **Button text same color as headline.** "Your call-to-action really needs to stand out on its own. When they're both the same color that can kind of take a little bit of emphasis away from it" — DesignCourse.
- **Pop-up cookie/newsletter modals.** Fireship: "What you don't want to do is pop one of these things up after a few seconds asking someone to subscribe… or even worse asking them to accept cookies." Modal-spam = amateur.
- **Too-aggressive toast/social-proof spam.** "Bob just bought…" every 6 seconds reads desperate. Use at most one per 60s with a subtle slide+fade, and stop after 3 total per session.
- **Glassmorphism everywhere.** "One or two layers can have a glassomorphic effect — just don't make it all glass please, that sucks" — Malewicz.
- **Hero text overlapping the hero image with no contrast fix.** Always add a `bg-gradient-to-r from-background/90 to-transparent` behind text columns.
- **Scroll-hijack without scrub.** Disabling native scroll rate = instant bounce. Lenis smoothing (≤1.2s) is fine; a JS-driven `snap` on every section is not.
- **Loading "spinner of shame."** If you need loading, use a skeleton or a branded curved SVG reveal (§1). Default browser spinners scream "unfinished."

## 8. Success-story / case-study 10× patterns

- **Editorial hero.** `01 / CASE` eyebrow, 7-column left headline ("We 3×'d their conversion in 60 days"), 4-column right sidebar with metadata: Client, Role, Industry, Year, Stack. Hairline rule under. Source: Malewicz *How We 3X'd* + general editorial convention.
- **Before/after split with 70/30 weighting.** Don't do 50/50 — it reads as "two equal things." Give the "after" 70% width, with the "before" inset as a small floating thumbnail. Label them `BEFORE 2023` / `AFTER 2024` in mono eyebrows.
- **Metric explosion reveal.** When scrolling into the KPIs, use `useInView` + `useMotionValue` → animate from 0 → target over 1.6s with `ease:[0.22,1,0.36,1]`. For `+347%` format, count the integer; for `$1.2M` count the cents. `tabular-nums` required. Optional: add a `+` that slides in at 80% of the count duration.
- **Three-act structure.** Context (the problem, orange-tinted hero stat), Process (5-7 annotated screenshots + designer commentary callouts), Outcome (big-number grid). Malewicz structures his entire *3X Conversion* video this way; readers follow hero-flows subconsciously.
- **Annotated screenshots.** Place numbered pins (01, 02, 03) on the image; below, a three-line caption for each. Pin = `10px` dot with `ring-2 ring-accent` and label `tabular-nums text-xs`.
- **Designer commentary pull-outs.** A floating italic quote block every 2-3 scrolls ("The decision-maker is a hospital director, not a consumer. That changes everything about density and copy length.") in `text-2xl leading-tight max-w-[44ch]`.
- **Background: dark but chapter-tinted.** Slightly shift hue per chapter (problem = zinc-950, process = #0a0d14 cool, outcome = #0d0a08 warm). Subtle, but makes a 3000px page feel structured.
- **Testimonial at end, not start.** After the outcome metrics. Quote first (no name above), then the attribution in the lower-right. Pull the avatar in at 24px, muted.
- **Next case study teaser.** `03 / 12 NEXT CASE →` as a giant hover target. On hover, the next project's image crossfades in behind the text (Framer Motion `<AnimatePresence>`). Very hard to stop clicking.

## 9. Referral / loyalty / community page patterns

- **Leaderboard = data density, not decoration.** Columns: `rank · avatar · handle · referrals · earnings · trend sparkline`. Use `grid-cols-[48px_40px_1fr_80px_100px_120px]`, row height 56px, `border-b border-white/5`, tabular-nums on numeric columns. Top 3 get a small medal glyph + `bg-accent/10` tint; everything else stays monochrome.
- **Rank diff animation.** When new data arrives, animate rank changes with Framer Motion `<Reorder.Group>` — rows `layout` their way into new positions. `transition={{type:'spring',stiffness:380,damping:30}}`. Subtle green/red `↑2` / `↓1` badge next to rank.
- **Tier visualization (loyalty card).** Stacked horizontal bar, `rounded-full`, filled proportionally with `bg-gradient-to-r from-accent/30 to-accent`, with tier ticks (`Bronze · Silver · Gold · Platinum`) dropped below using `absolute left-[${tierPos}%]`. Active tier label gets weight 600; others dim to 30%.
- **"Progress to next tier" card.** `You're 280 XP from Gold` with a circular SVG progress (stroke-dasharray trick). Pair with a pulsing dot (Lottie or pure CSS `@keyframes pulse`) near the current tier.
- **Real-time social proof that's not spam.** A ticker bar at the top: `23 redemptions this hour · $4,812 in rewards paid today`. Numbers increment softly every ~10s with a tiny fade. No modal popups, no toasts.
- **Milestone "burst" reveal.** When a user crosses a tier threshold on their own page, one-shot confetti + a 2s celebration overlay that shows the new badge morphing in via `layoutId`. Never auto-loop.
- **Community wall (Discord-style).** Grid of recent messages/reviews, 4 columns on desktop, with staggered `motion.div` enter (`whileInView`, `staggerChildren:0.06`). Each card: avatar, handle, 2-line quote, timestamp in `tabular-nums text-xs text-zinc-500`. Subtle orange dot for active users (from `/api/discord-online`).
- **"Your referrals" dashboard tiles.** Four tiles: total referrals, total earnings, pending, this-month trend. Each with a mini sparkline (SVG `<path>`, 80px×24px, `stroke-accent/60`). Numbers count up on mount (§8). Use `border border-white/5 rounded-xl p-6` — no heavy glass.
- **Refer-a-friend CTA.** Short code (`NIGHT-A7F3`) displayed in a large mono block with a one-tap copy button. On click: button text swaps via `AnimatePresence` from "Copy" → "Copied ✓" (green), reverts after 1800ms. Tiny thing, huge trust signal.
- **Leaderboard filter pills.** `All time · This month · This week` with `layoutId` underline morph (§4). Active pill = white text + animated underline; inactive = zinc-500. Don't box them; just text.

---

## Inspiration quotes (verbatim from transcripts)

> "Your role as the designer is to save the world. Well actually it's to help your clients make more money." — Flux Academy, *Design The Perfect Hero Section*

> "99 times out of 100 you want these things to be situated so that the headline is bigger and the sub-headline is smaller." — DesignCourse, *The UI/UX of Hero Sections*

> "If two pieces of type that are semantically different do not look different enough from each other it results in a user interface that's hard to use." — DesignCourse, *Epic Typography*

> "What many designers do is that they take their previous website and they apply the newest design trend on it — make some glass transparent panels on it or some dark mode gradients and call it a day. There is no thought put into it. This is not how we do it." — Malewicz, *How We 3X This Website's Conversion*

> "While designing this we try to avoid the animation paradox in which many companies go with every section sliding in either from the sides or from the bottom or from the top so as you scroll you have a complete slide fest of animation all over that is cognitively taxing." — Malewicz

> "Do not overuse solid colors and flat surfaces. You can show depth by the lightness of layers instead of shadows." — Malewicz, *ONE UI design style*

> "One or two layers can have a glassomorphic effect to spice up the otherwise minimal aesthetic. Just don't make it all glass please. That sucks." — Malewicz

> "If somebody's coming to their your website and they're feeling nauseous, they're leaving. They're not going to try and force their way through it." — Kevin Powell, *Incredible scroll-based animations*

> "Animation is one of the most satisfying things for a developer because it can turn a boring cookie cutter feature into something really special." — Fireship, *Springy Animated Modals*

> "If you want to sell something on a website in 2022 you have to animate things on scroll." — Beyond Fireship, *Subtle, yet Beautiful Scroll Animations*

> "It's just more developer friendly to work with." — Fireship, on Framer Motion vs raw CSS

> "You don't want to have if you have different heights of images and stuff, you don't want to have to figure that out." — Kevin Powell, on `animation-range: contain`

> "Over 90% of people leave the website because what they see in the first 15 seconds — the hero section — sucks." — Flux Academy, *Design The Perfect Hero Section*

> "Never just go with one idea." — Flux Academy (on creative concepts for hero)

> "Your call-to-action really needs to stand out on its own. When they're both the same color that can kind of take a little bit of emphasis away from it." — DesignCourse, *The UI/UX of Hero Sections*

---

## Quick-reference cheat sheet (tattoo this above the monitor)

- Hero: 4 elements only. `clamp(56px,8vw,144px)` display. One CTA. Whitespace is the feature.
- Scroll: Lenis `lerp:0.08` + ScrollTrigger `scrub:true` + pinned hero section with sub-range mapping.
- Stagger: `staggerChildren:0.08`, ease `[0.22,1,0.36,1]`, `filter:blur(6px)→0` for the premium tell.
- Springs: button `{stiffness:400,damping:28}`; modal `{260,26}`; hero land `{180,22}`; magnetic `{150,15}`.
- Type: display 500–600 `leading-[0.95] tracking-[-0.03em]`; body `leading-[1.6]`; eyebrow `uppercase text-xs tracking-[0.18em]`.
- Motion hygiene: `prefers-reduced-motion` guard, `viewport:{once:true}` for entrance-only, `mode:'wait'` on AnimatePresence.
- Anti-patterns: no slide-fest, no 3+ fonts, no glassmorphism everywhere, no cookie modals, no mismatched alignment, no text-on-image without gradient scrim.
- Editorial: 12-col grid, asymmetric, one flourish per section (drop-cap OR number eyebrow OR pull quote).
- Case study: 70/30 before/after, metric count-up on scroll-in, designer commentary pull-outs every 2-3 scrolls.
- Referrals/loyalty: data density > decoration, `tabular-nums` everywhere, non-spam social proof ticker.
