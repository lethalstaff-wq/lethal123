# Findings: Microinteraction Recipes

Extracted from ~1500 web-design YouTube transcripts (Fireship, Olivier Larose, DesignCourse, Frontend Tribe, Jake Pomper).

35 recipes, each: trigger / animation / timing / tech.

## Page-level

1. **Logo enter (header)** — page load → translateX with `overflow:hidden` mask → 0.6s ease-out → Framer Motion initial/animate
2. **Page transition fade** — route change → current page opacity 1→0, new 0→1, 0.3s stagger → next.js layout animations + Framer Motion
3. **Page transition slide** — route change → slide left/right direction-aware → 0.5s cubic-bezier(0.4,0,0.2,1) → Framer Motion custom transitions
4. **Scroll-to-top button appear** — scroll >300px → fade in from bottom + scale → 0.3s ease-out → Framer Motion + scroll listener

## Buttons

5. **Button hover scale** — mouseenter → scale 1→1.05 → 0.2s ease-out → CSS transition or Framer Motion whileHover
6. **Button active press** — whileTap → scale 0.95 + brightness bump → immediate → Framer Motion whileTap
7. **Inner shimmer sweep** — hover or on-load loop → linear-gradient sweep L→R inside button → 1.2s cubic-bezier(0.4,0,0.2,1) → CSS linear-gradient + animation or GSAP
8. **Magnetic button follow** — mouse within 60px → button eased-follows cursor → 0.2s follow + spring return → Framer Motion useMotionValue + useTransform
9. **Ripple on click** — click → radial gradient expands from click point + fades → 0.6s ease-out → canvas or CSS radial-gradient
10. **Icon rotation on hover** — hover → rotate 360° → 0.5s ease-in-out → CSS or Framer Motion

## Cards

11. **Card hover lift** — hover → translateY(-8px) + boxShadow increase → 0.3s cubic-bezier(0.4,0,0.2,1) → CSS or Framer Motion
12. **Card spotlight follow** — mousemove within card → radial gradient follows cursor → real-time → CSS custom props + onMouseMove
13. **Card tilt 3D** — mousemove → perspective(1000) rotateX/Y based on cursor offset → eased → Framer Motion useMotionValue

## Links / Text

14. **Link underline expand** — hover → width 0→100% or scaleX(0→1) → 0.3s ease-out → CSS pseudo-element + transform-origin:left
15. **Text reveal on scroll** — ScrollTrigger → clip-path or translateY reveal → synced to scroll progress → GSAP or Framer Motion whileInView

## Forms

16. **Input focus ring expand** — focus → ring scale up, border color shift → 0.2s ease-out → CSS :focus-visible + outline
17. **Label float** — input focus or value present → translateY(-1.5rem) + scale(0.85) → 0.3s cubic-bezier(0.4,0,0.2,1) → CSS transition or Framer Motion
18. **Validation success check** — valid submit → SVG stroke-dasharray draws + BG pulse → 0.6s draw + 1.2s pulse loop → SVG + Framer Motion
19. **Validation error shake** — invalid → translateX(-4px,+4px) × 4 → 0.08s/step → Framer Motion keyframes

## Nav / Tabs / Toggles

20. **Burger menu scale-in** — scroll past threshold → scale 0→1 with stagger → gap-based timing → Framer Motion useLayoutEffect
21. **Nav indicator slide** — route change → smooth position shift → 0.3s cubic-bezier(0.4,0,0.2,1) → CSS or layoutId in Framer Motion
22. **Tab switch** — tab click → underline slides to new tab + content exit old / enter new → 0.4s ease-in-out → Framer Motion AnimatePresence + layoutId
23. **Toggle switch slide** — click → BG color + knob translateX → 0.25s ease-in-out → CSS or Framer Motion
24. **Dropdown spring** — open → scale 0.8→1 + fade → spring stiffness 300 damping 30 → Framer Motion

## Modal / Dialog

25. **Modal backdrop fade** — open → opacity 0→1 → 0.2s linear → Framer Motion initial/animate/exit
26. **Modal scale-bounce** — mount → scale 0.8→1 spring physics → stiffness 300 damping 30 → Framer Motion spring
27. **Modal drag handler** — mousedown on grab bar → draggable with constraints + physics return → Framer Motion drag + dragConstraints
28. **Close button hover** — pointer enter → scale 1.1 + rotate 90° → 0.2s → Framer Motion whileHover
29. **Backdrop click dismiss** — click outside → exit variant (scale out + fade) → 0.3s ease-in → Framer Motion exit variants

## Feedback

30. **Copy-to-clipboard** — click copy → "Copied!" slide in + icon swap check → 0.3s slide + 2s hold + 0.3s fade → Framer Motion AnimatePresence + useState
31. **Toast slide in** — event → slide from right + fade → 0.4s spring → sonner / Framer Motion

## Loading

32. **Skeleton shimmer** — loading → linear-gradient -100%→100% across skeleton → 1.5s infinite → CSS animation
33. **Spinner pulse** — async → opacity 0.3→1→0.3 + rotation → 1.2s infinite ease-in-out → CSS or Framer Motion
34. **Progress bar fill** — upload start → width 0→100% → variable + ease-out → CSS transition

## Cursor

35. **Custom CTA cursor + trail** — hover CTA → default cursor replaced, trail dots follow with 50-100ms lag each → real-time → React hooks + rAF

## Universal timing cheatsheet
- Micro-interactions: **0.2–0.6s**
- Transitions: **0.8–1.5s**
- Material-style standard easing: **cubic-bezier(0.4, 0, 0.2, 1)**
- Spring physics: **stiffness 150–300, damping 20–30**
- Stagger delay: **0.1–0.2s** between sequential items
