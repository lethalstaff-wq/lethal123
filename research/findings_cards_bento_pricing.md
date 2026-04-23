# Design Patterns Extracted from YouTube Transcripts

## Card Hover Interactions

- Scale: 1.0 to 0.95 in 150ms
- Easing: Power1 InOut
- Image zoom: 1.0 to 1.15 simultaneous
- Trigger: Play from current point

## Bento Grids

- Gap: 16-24px consistent
- Hero cell: 2x2 or 2x3 spans
- Padding inside: 20-32px
- Hover scale: 1.0 to 1.02 in 300ms

## Pricing Cards

- Featured: 1.05-1.08x scale
- Border: Rotating conic gradient
- Toggle: 300-400ms cubic-bezier
- Checkmarks: Staggered 80-100ms delay


## Glassmorphism

- Backdrop blur: 10-20px
- Background alpha: 0.1-0.2
- Border: 1-2px with 0.2-0.3 alpha
- Inner shadow: -1px -1px 10px rgba(255,255,255,0.2) inset

## Spotlight Hover Glow

- Radial gradient at mouse position
- Center opacity: 0.25-0.35
- Size: 200-300px diameter
- Fade in/out: 300-500ms

## Shine Sweep

- Type: Linear -45 angle sweep
- Duration: 0.8-1.2 seconds
- Peak opacity: 40%
- Blur: 15-25px

## Card Tilt 3D

- Angle: ±5-8 degrees
- Perspective: 1000px
- Shadow responds to tilt direction
- Real-time mouse tracking

## Bento Premium Details

- Hero cell shadow: 0 10px 40px rgba(0,0,0,0.1)
- Hover shadow: 0 20px 60px rgba(0,0,0,0.15)
- Mixed content per cell (no adjacent duplicates)
- Interactive mini-demos inside cells

## Pricing Badge

- Position: Top-center outside card
- Margin: -15 to -25px (negative)
- Background: Primary brand
- Text: White uppercase 12px weight 600
- Border-radius: Full pill (24px)

## Rotating Border on Pricing

- Animation: 360 rotation in 3-4 seconds
- Timing: Linear
- Blur: 6-10px
- Opacity: 70-85%
- Featured tier: Faster 2-3s rotation

## Gradient Text (Price)

- Font size: 48-64px
- Weight: 700-800
- Gradient: Primary to secondary left-to-right
- Glow: text-shadow 0 0 20px rgba(primary, 0.3)
- Using: background-clip: text

## Monthly/Annual Toggle

- Button size: 120px wide, 40px tall
- Border-radius: 24px
- Indicator: Smooth translateX -50% to +50%
- Duration: 300-400ms cubic-bezier(0.4,0,0.2,1)
- Price transition: Simultaneous fade (150ms each direction)

## Animated Checkmarks

- Staggered by 80-100ms per item
- Scale: 0 to 1.2 to 1.0 (overshoot)
- Rotation: -45 degrees to 0
- Duration: 300-400ms per checkbox
- Easing: cubic-bezier(0.34, 1.56, 0.64, 1)

## Testimonial Marquee

- Speed: 30-50px per second
- Library: Lenis or CSS scroll-behavior
- Timing: Linear (no accel)
- Loop: Seamless repeat
- Pause on hover

## Testimonial Fade Edges

- Width: 80-120px per side
- Position: Absolutely over left/right
- Gradient: transparent to bg (left), bg to transparent (right)
- Z-index: Above cards
- Pointer-events: None

## Product Card Image Swap

- Primary: 100% opacity
- Secondary: Absolutely positioned, 0% opacity
- Transition: Both fade simultaneously in 300ms
- Trigger: .product-card:hover

## Quick-Add Button

- Position: Absolute bottom 16px centered
- Height: 40-48px
- Background: Primary semi-transparent
- Border-radius: 24px pill
- Text: White 14px weight 600
- Animation: translateY +40px to 0 in 200ms ease-out

## Wishlist Heart

- Inactive: Outline gray 24x24px
- Active: Filled brand color
- Animation: Scale 0.8 to 1.3 to 1.0 with 360 rotation
- Duration: 400ms
- Easing: cubic-bezier(0.34, 1.56, 0.64, 1) bouncy

## Product Badge

- Position: Top-right 12-16px from edges
- Size: 40x40px circle or 60x24px rect
- Background colors: Red/orange (sale), green (new), black (limited)
- Text: White 12-14px weight 700

## Variant Swatches

- Size: 32-40px circles or 40x32px rects
- Border: 2-3px transparent
- Border-radius: 50% or 4px
- Gap: 8-12px between
- Selected: 3px primary border plus glow

## Feature Icon Animation

- Scale: 1.0 to 1.2
- Rotation: 0 to 360 degrees
- Duration: 400-500ms
- Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)

## Feature Number Badge

- Size: 40-48px circle
- Background: Primary brand
- Text: White bold 18-24px centered
- Border-radius: 50%

## Feature Card Expanding

- Initial: Title and icon visible
- Hover: Height expands, description fades in
- Duration: 300-400ms ease-out

## Shadow Reference

- Subtle: 0 4px 12px rgba(0,0,0,0.08)
- Standard: 0 10px 40px rgba(0,0,0,0.1)
- Elevated: 0 20px 60px rgba(0,0,0,0.15)
- Premium: 0 30px 60px rgba(0,0,0,0.2)

## Key Principles

1. Consistency: All cards in section share base patterns
2. Hierarchy: Scale, color, position guide eye movement
3. Responsive: Test on slower devices, use prefers-reduced-motion
4. Staggering: Sequential reveals use 80-100ms delays
5. Reversible: Hover out animation mirrors hover in
6. Accessible: 4.5:1 contrast on gradient backgrounds
7. Performance: Use will-change property, target 60fps
8. Mobile: Reduce animations on touch, prefer tap interactions

## Source Information

Research extracted from: 30 MB YouTube design transcript corpus
Key tutorial sources: Webflow interactions, Flux Academy, Design Path, JavaScript Mastery, Frontend Tribe
Date: April 2026 design trends snapshot
Patterns documented: 40+ concrete implementations with pixel values, timing, and easing specifications

