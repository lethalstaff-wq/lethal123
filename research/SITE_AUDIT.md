# Site Audit — what to upgrade, ranked

Methodology: read every key component (hero, navbar, pricing, services, process, testimonials, faq, contact, about, track). Map gaps to DESIGN_PLAYBOOK priorities.

## Score (before this pass)
- Hero: **7/10** — Linear-style pill, orb glow, gradient H1, magnetic CTAs, crypto bar. Missing: per-char reveal, scroll parallax.
- Navbar: **7/10** — glass pill nav, scroll progress. Missing: layoutId morph on active pill.
- About/products grid: **7/10** — decent cards, shine sweep, gradient slash tags. Missing: spotlight-follow, tilt.
- Services: **7/10** — nice hover with big faded number, icon rotate, corner glow. Missing: spotlight-follow, tilt.
- Process: **7/10** — circular badge with pulsing ring + rotating dashes + connector flow. Good.
- Pricing: **8/10** — rotating conic on Elite, slash-cut badge, shine sweep. Missing: per-card tilt, feature stagger.
- Testimonials: **7/10** — 2-row marquee, gradient mask edges, gold-star pulse. Missing: seamless infinity via useAnimationFrame, hover pause.
- FAQ: **7/10** — rotate-45 plus icon, scan line, gradient left. Missing: answer char reveal.
- Contact: **8/10** — Discord card w/ online pulse, 4 trust chips. OK.
- **Track order: 5/10** — ⚠️ user flagged. Functional split-screen but flat. Needs timeline animation, license copy polish, empty state charm.
- Global BG: **8/10** — orbs + dot-grid + grain + vignette. OK.
- Cursor effects: **6/10** — glow + particle trail always on. Could morph on CTAs.
- Scroll-reveal: **6/10** — basic fade-up per section. Could per-element stagger.
- Magnetic button: **9/10** — proper implementation. Use more widely.

**Overall before: ~7/10**

## Target: **9.5/10** (true premium)

## Ranked gap list (top priorities)

### Critical — not yet implemented
1. **Lenis smooth scroll not wired** — package sits in deps unused. Biggest perceived-smoothness win.
2. **Hero H1 has no per-char stagger** — only whole-element fade. Olivier Larose signature missing.
3. **Scroll-linked hero parallax missing** — orbs drift ambient but don't respond to scroll.
4. **Custom cursor doesn't morph on CTAs** — existing global trail doesn't react to interactive elements.
5. **Cards lack spotlight-follow** — services/pricing/about/contact all have static hover states.
6. **No page transitions** — routes snap without fade.
7. **Track order page is flat** — user explicitly requested upgrade.
8. **Navbar active pill doesn't morph** — static bg change, no layoutId transition.
9. **Pricing feature ticks land instantly** — no stagger entrance on scroll in.
10. **Testimonial marquee is pure CSS** — would be buttery via useAnimationFrame + mask.

### Important — partial, needs finishing
11. Input focus ring inconsistent across forms (checkout, apply, login, track).
12. Button press animation global but some CTAs override with their own transitions.
13. FAQ answer doesn't char-reveal on open.
14. About product images don't Ken Burns zoom.
15. Process connector flows but isn't scroll-linked.
16. Contact Discord avatar doesn't pulse its ring.

### Polish — final sweep
17. Copy tightening on every section H2 and CTA label.
18. Kinetic word swap missing from all section titles.
19. Back-to-top button doesn't show scroll progress visually.
20. Grain overlay static — could breathe.

## Per-page snapshot

| Page | Verdict | Key upgrade |
|------|---------|-------------|
| `/` | 7/10 | Per-char hero reveal + spotlight cards + parallax |
| `/products` | TBD | Need to audit product grid |
| `/products/[slug]` | TBD | Need to audit product detail |
| `/cart` | TBD | Audit |
| `/checkout` | TBD | Audit |
| `/track` | **5/10** | Timeline anim + license copy + empty state |
| `/apply` | 7/10 | Already improved in prior night run, light polish |
| `/login` | TBD | Audit |
| `/profile` | TBD | Audit |
| `/reviews` | TBD | Audit |
| `/guides` | TBD | Audit |
| `/faq` | N/A (section only) | — |
| `/status` | TBD | Audit |

## Execution path
Follow DESIGN_PLAYBOOK §"Execution order" — one commit per phase, each a bounded change. Verify with `npx tsc --noEmit` after every phase. Dev server stays up during execution; manual visual check at the end.

## Phase mapping
- Phase 3 foundation → P1.x
- Phase 4 hero → P2.x
- Phase 5 microint → P3.x + P4.x
- Phase 6 sections → P6.x
- Phase 7 transitions/states → P7.x
- Phase 8 validate → final
- Extra Phase 9 → Track order (P5.x)
- Extra Phase 10 → every-button polish (P4.5, copy, final sweep)
