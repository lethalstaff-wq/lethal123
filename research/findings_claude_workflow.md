# Claude Code + MCP Workflow Patterns for Premium UI/UX

Extracted from ~139 video transcripts on Claude Code, MCP servers, design automation.
Last Updated: April 21, 2026

## The Breakthrough

Before Playwright MCP: Generic purple UI, loops forever.
After Playwright MCP: Claude sees output → Self-corrects → Pixel-perfect in 3-4 iterations.

Install Playwright MCP. Use in every UI prompt.

---

## 1. MCP Servers — Ranked by Impact

CRITICAL: Playwright MCP
- Vision: Screenshots, browser control, visual feedback
- Pattern: Screenshot → Analyze → Fix CSS → Re-screenshot → Repeat
- Result: Pixel-perfect in 3-4 iterations vs. 20+ without
- Install first. Use in every UI prompt.

FOR TEAMS: Figma MCP
- Bidirectional: Code ↔ Figma frames
- Workflow: Design → Code → Review → Polish → Ship
- Skip if solo (overhead too high)

SPEED FRAMEWORK: Stitch 2.0
- Visual design → Code + Integrations (Stripe, Auth)
- 4-step DRIP: Design → Resources → Integration → Polish
- 4-6 hours blank to shipped

COMPONENT RESEARCH: Shadcn MCP
- Browse components before building
- Prevents hallucination: Research first
- Pattern: Analyzer → Researcher (Shadcn MCP) → Builder → Verifier (Playwright)

IMAGE GENERATION: Nano Banana
- Heroes, graphics, animations
- Pairing: Nano Banana 2 + Remotion = animated sites

LANDING PAGE UX: 21st.dev MCP
- Conversion patterns, design psychology
- Use when: Redesigning generic to production-quality

ACCESSIBILITY: Chrome DevTools MCP
- A11y audits, responsive testing
- Use in polish loops

---

## 2. The 4-Agent Subagent Pipeline

Works for any component/section:

1. Analyzer: Brief → Structured requirements + acceptance criteria
2. Researcher: Requirements → Components (Shadcn MCP) + patterns
3. Builder: Research → Code (HTML/CSS/React)
4. Playwright Verifier: Code → Screenshot + "Ready? [yes/no]"

If no → Loop 3→4 (CSS refinement)
If yes → Commit

Time: ~10-20 min per component (unattended)

---

## 3. Prompt Templates

TEMPLATE A: Match This Design Exactly
```
You are pixel-perfect. Goal: Match this Figma frame exactly.

Reference: [Figma URL or image]
Current code: [repo path]

Steps:
1. Screenshot current state
2. Compare to reference (colors, spacing, shadows, fonts)
3. List exact CSS changes (hex colors, pixel sizes)
4. Make changes
5. Screenshot again
6. Repeat until perfect match
```

TEMPLATE B: Playwright Self-Correction Loop
```
Use Playwright MCP aggressively:

LOOP:
  1. Read code
  2. Screenshot
  3. Analyze screenshot visually
  4. Spot ONE issue (color, spacing, alignment)
  5. Write CSS fix
  6. Screenshot again
  7. Issue fixed? YES→Next. NO→Refine.
  8. Repeat until no issues

Never guess. Always screenshot before and after.
```

TEMPLATE C: One Section, One Prompt
Bad: "Build entire landing page with hero, features, pricing, testimonials, animations..."
Good: "Build the hero section. Match Figma frame [URL]. Colors: Primary #0066cc. Responsive mobile-first. When done, screenshot and await feedback."

Rule: One section at a time. Short prompts.

TEMPLATE D: Design System Tokens
```
Day 1: Define and freeze design tokens.

Colors: Primary #0066cc | Secondary #f0f0f0 | Text #1a1a1a | BG #ffffff
Typography: Heading-1 (32px, 600w, 40lh) | Body (16px, 400w, 24lh)
Spacing: 4px, 8px, 12px, 16px, 24px, 32px grid (multiples only)
Shadows: sm, md, lg presets

Add to CLAUDE.md. Enforce: "Use tokens only. No deviations."
```

---

## 4. Real Workflows from Transcripts

WORKFLOW A: Nano Banana → Stitch → Claude → Ship (4-6 hours)
```
8:00  Generate hero in Nano Banana Pro (30 min)
8:30  Drop in Stitch 2.0 (20 min)
8:50  Stitch generates skeleton + integrations (45 min)
9:35  Claude: "Polish design" (30 min)
10:05 Playwright: Screenshot (mobile, tablet, desktop) (15 min)
10:20 CSS adjustments, iterate 2x (30 min)
10:50 A11y check, final review (20 min)
11:10 Deploy

Result: Solo builder ships premium site by noon
```

WORKFLOW B: Figma ↔ Claude (Team)
```
Designer creates Figma frame (async, 1 hour)
  → Engineer: Pull frame (2 min)
  → Claude: "Convert to code" (15 min)
  → Playwright: Screenshot vs. Figma (5 min)
  → CSS tweaks, iterate (15 min)
  → Playwright: Re-screenshot (5 min)
  → Claude: Push refined code → Figma
  → Designer: Reviews, annotates
  → Engineer: Pull updated frame → Code (10 min)
  → Repeat 2-3x

Time per screen: ~2 hours
```

WORKFLOW C: Claude Code Pure + Playwright (Solo)
```
Prompt: "Build [component]"
  → Code (3 min)
  → Playwright screenshot (2 min)
  → Claude reads screenshot: "Visual quality: 6/10. Issues: [list]"
  → CSS fix (2 min)
  → Playwright screenshot (1 min)
  → Claude: "Perfect. 10/10."
  → Commit

Time per component: ~10 min
```

---

## 5. Skills to Create

/polish-ui — Run Playwright loop automatically (3-4 iterations)
/visual-review — Compare to reference. Flag differences.
/redesign-section — Rewrite to match style (Linear, GitHub, Notion)
/responsive-audit — Test 375px, 768px, 1440px. Flag issues.
/a11y-check — Accessibility audit.
/match-figma — Compare to Figma. Output exact CSS changes.

---

## 6. Antipatterns to Avoid

1. Long confusing prompts → Use one-section-at-a-time
2. "Build the whole site" → Build in order: Hero→Features→Pricing→CTA
3. Skip screenshots after changes → Screenshot always
4. Generic Shadcn purple → Override colors day 1
5. Build without reference → Always provide Figma/mood board/competitor
6. Change design system mid-project → Freeze tokens day 1
7. Skip Playwright loop → Use in every UI prompt
8. Responsive design "by luck" → Test 375px, 768px, 1440px
9. Forget accessibility → Use Shadcn (accessible default)
10. Loop without checkpoints → One issue at a time

---

## 7. Time Estimates (Production Data)

Single button: 5-10 min
Card component: 10-15 min
Form with validation: 20-25 min
Hero section: 30-45 min
Landing page (6 sections): 3-4 hours
Design system (10 components): 2-3 hours
SaaS dashboard: 4-6 hours

Multipliers:
- No Playwright MCP: 3-5x slower
- No Figma reference: 2x slower
- Team coordination: +50%
- Dark mode support: +30%

---

## 8. CLAUDE.md Essentials for UI

Design Tools & MCPs:
- Playwright MCP: ~/.claude/tools/playwright
- Figma MCP: ~/.claude/tools/figma
- Shadcn MCP: ~/.claude/tools/shadcn
- 21st.dev MCP: Landing page optimization

Screenshot Workflow:
1. Import playwright
2. await page.screenshot()
3. Make changes
4. await page.screenshot()
5. Compare

Design System (FROZEN):
- Colors: Primary #0066cc | Secondary #f0f0f0 | Text #1a1a1a
- Typography: Heading-1 (32px, 600w, 40lh) | Body (16px, 400w, 24lh)
- Spacing: 4px grid multiples
- Shadows: sm, md, lg presets

Sub-agents:
- /analyze-design
- /research-components
- /build-ui
- /playwright-review
- /polish-loop

---

## Summary

Install Playwright MCP first.

Every prompt: "Screenshot current state. Analyze. Fix. Re-screenshot. Iterate until pixel-perfect."

Claude will self-correct visually. Iterate 10x faster.

That's the unlock.

---

Source: ~139 YouTube transcripts on Claude Code + MCP + design automation
Last Updated: April 21, 2026
