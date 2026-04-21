# Findings: Typography + Color + Spacing Rules

Extracted from YouTube design-system/type tutorials (Flux Academy, Figma variables workshops, DesignCourse).

## 1. Typography

### Type scale (Major Thirds, 16px base)
- Body: **16px** (ref)
- H6 / small heading: 20px
- H5: 24–28px
- H4: 32px
- H3: 40px
- H2: 48px
- H1: 64px
- Small body: 12px

### Line-height pairs
| Size | Line-height | Ratio |
|------|-------------|-------|
| 12px | 20px | 1.67 |
| 16px body | 24px | **1.5 min** |
| 20px H6 | 24px | 1.2 |
| 24–28px H5 | 32px | 1.2–1.33 |
| 32px H4 | 40px | 1.25 |
| 40px H3 | 48px | 1.2 |
| 48px H2 | 52–56px | 1.08–1.17 (NOT 64 — too open) |
| 64px H1 | 64px | **1.0 — tight is OK for giants** |

### Weight pairing
- Body regular 400, heading semi/bold 600–700
- Same family acceptable if weight + size differ dramatically
- **Light fonts + dark-gray text (not #000) = higher perceived luxury**
- Never all-caps for body; reserve for titles/labels

### Letter spacing
- Tight tracking on display (luxury); default on body
- Don't over-kern

### Paragraph spacing (bottom margin)
- 16px body → 12px gap
- 20px body → 16px gap
- 40px H3 → 16px
- 48px H2 → 24px
- 64px H1 → **32px** (large space = grandeur)

## 2. Color

### Token system (10-shade)
- 100 = lightest tint → 500 = base saturated → 900 = darkest shade
- Extended: 100, 200, 300, 350, 400, 500, 600, 700, 800, 900
- Each color (primary, neutral, accent, success/error/warning) gets the full ramp

### Building shades/tints
- Start base 100% opacity
- Overlay black rect at 20%/40%/60%/80% opacity → extract hex for shades
- Overlay white rect same steps → tints
- **Never ship opacity — extract solid hex**

### Neutral palette
- Gray body text (~600–700) reads more premium than pure black
- Dark themes: near-black bg (#0a0a0f, #111114) — **never pure #000**
- Light text on dark: off-white (not #fff pure) — ~#fafafa, #e8e8ec

### Semantic aliases (ship via CSS custom props)
- `--text-heading`, `--text-body`, `--text-disabled`
- `--surface-bg`, `--surface-card`, `--surface-elevated`, `--border-subtle`
- `--btn-primary`, `--btn-primary-hover`, `--btn-ghost`, `--btn-ghost-hover`
- `--icon-default`, `--icon-hover`, `--icon-disabled`

### Contrast as premium signal
- Headings: neutral-900 on light / 50 on dark
- Body: neutral-700/800 (deliberately lower contrast than headings)
- Disabled: 200–300 clearly visible but dimmed
- Hover: distinct token, not ad-hoc `opacity: 0.8`

## 3. Spacing

### Scale (8px base, Tailwind-aligned)
- 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 120, 160 px
- Name as tokens: `space-xs/sm/md/lg/xl/2xl/3xl`

### Button padding
- Medium (16px text): **px-6 py-3** (24/12px)
- Large (20px+): **px-8 py-4** (32/16px)
- Radius: **8px** = sweet spot (neither sharp nor pill)
- Hero pill CTAs ok at 999px radius

### Section paddings
- Vertical: **80–120px** desktop, 48–64px mobile
- Max content width: **1200–1280px** — hero can go wider with edge art

### Readable text
- Body max-width **60–75 characters** per line — convert to rem using font size

### Grid gaps
- Card grid gap: **16–24px**
- Bento gap: **12–16px** (tighter = more premium)
- Menu items gap: ~30px

### Whitespace as luxury
- More whitespace = more expensive-looking
- Asymmetric intentional spacing > forced symmetric
- ALL spacing snapped to token scale — no one-off values

## 4. Design system rigor
- Base collection → aliases → component usage (3 layers)
- Same system for Figma variables + CSS custom properties
- Typography variables: family / size / line-height / weight / paragraph-spacing per role
- Spacing variables: name by role, not by px

## Premium signals observed
- Simple bold palette (fewer colors, high contrast)
- Generous whitespace
- Grid-aligned spacing everywhere
- Dark gray body text (not #000)
- Explicit hover states as tokens
- 10+ shade color ramps (shows system maturity)
- WCAG-compliant contrast (accessibility = premium)
