"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"
import { StoryMetrics } from "@/components/story-metrics"

type Story = {
  slug: string
  kicker: string
  title: string
  game: string
  product: string
  avatarColor: [string, string]
  name: string
  quote: string
  metrics: { label: string; value: string; icon: "trophy" | "zap" | "shield" }[]
  body: string[]
  duration: string
  shortTitle: string
}

const STORIES: Story[] = [
  {
    slug: "bronze-to-gold-valorant",
    kicker: "The climb",
    title: "From bronze to gold in two weeks.",
    shortTitle: "Bronze to gold",
    game: "Valorant",
    product: "Private aimbot · VPN-locked account",
    avatarColor: ["#f97316", "#7c2d12"],
    name: "vex_",
    quote: "Hard-stuck silver for 8 months. Hit Gold 2 by the weekend. First clutch of my life.",
    metrics: [
      { label: "Rank gained", value: "+5 tiers", icon: "trophy" },
      { label: "Time to gold", value: "14 days", icon: "zap" },
      { label: "Detections", value: "0", icon: "shield" },
    ],
    body: [
      "vex hit us on Discord after a 32-match losing streak. They'd tried two cheaper aimbots and burned both accounts in a week.",
      "Our support walked them through the private-build setup in twelve minutes. Configured smoothing to 0.4, FOV to 3°, humanized the flick curve. Everything runs through a VPN-locked account so Riot's fingerprint never matches their main.",
      "Two Sundays later they dropped a screenshot of the Gold 2 badge in our channel. No ban. No flags. No drama. Just a clean run.",
    ],
    duration: "3 months ago",
  },
  {
    slug: "dma-3-patch-cycles",
    kicker: "The long game",
    title: "Survived three Vanguard patch cycles.",
    shortTitle: "3 patch cycles",
    game: "Valorant",
    product: "Captain 100T + custom firmware",
    avatarColor: ["#fbbf24", "#7c5800"],
    name: "zk",
    quote: "Tried four other providers before Lethal. Every one caught a wave. Eight months on Captain 100T now — zero bans.",
    metrics: [
      { label: "Days undetected", value: "247", icon: "shield" },
      { label: "Patches survived", value: "3", icon: "zap" },
      { label: "Patch-to-update", value: "< 2h", icon: "trophy" },
    ],
    body: [
      "zk ordered the DMA Elite bundle. Shipped discreetly to an EU address in plain packaging — no logos, no branding, no customs drama.",
      "Three times in the last eight months Vanguard pushed a new detection wave overnight. All three times our firmware was already patched before zk's coffee finished brewing. Auto-update ran in the background. They didn't even open a support ticket.",
      "That's the whole deal. You pay once, the infrastructure keeps you ahead of the curve, and you stop thinking about it.",
    ],
    duration: "Ongoing",
  },
  {
    slug: "hwid-reset-same-day",
    kicker: "The comeback",
    title: "HWID reset same-day, after a three-year ban.",
    shortTitle: "HWID reset",
    game: "Warzone",
    product: "Perm Spoofer + crypto checkout",
    avatarColor: ["#3b82f6", "#1e3a5f"],
    name: "rxn",
    quote: "Hardware banned in 2022 for using a scam provider. Thought my PC was dead for Warzone. Five minutes later I was queueing.",
    metrics: [
      { label: "Ban age", value: "3 years", icon: "shield" },
      { label: "Setup time", value: "4 min", icon: "zap" },
      { label: "Account lifespan", value: "6+ mo", icon: "trophy" },
    ],
    body: [
      "rxn bought Perm Spoofer at 2:17 AM with Bitcoin. Download link hit their inbox in ninety seconds.",
      "Clean reboot. Launcher relogin. Warzone opened without a single flag. No queue penalty, no shadow ban detection. Their old account — alive since 2020 — came back from the dead.",
      "They've been running on the same hardware for six months. No second ban. No stress.",
    ],
    duration: "6 months ago",
  },
]

// Smooth scroll helper — respects sticky navbar by offsetting ~96px.
function scrollToArticle(slug: string) {
  const el = document.getElementById(`story-${slug}`)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo({ top: y, behavior: "smooth" })
}

// Each article manages its own parallax watermark. Using its own sectionRef keeps
// scroll progress local, so the 01/02/03 watermarks drift at their own cadence.
function StoryArticle({ story, index, next }: { story: Story; index: number; next?: Story }) {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  // 0.4x drift: watermark moves 40% of section scroll distance in opposite direction
  // (negative Y as user scrolls down) so the giant number feels anchored in space.
  const watermarkY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [140, -140])
  const watermarkOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0])

  return (
    <article
      ref={sectionRef}
      id={`story-${story.slug}`}
      className="relative py-24 sm:py-32 border-t border-white/[0.05] first:border-t-transparent scroll-mt-28"
    >
      {/* Giant 01/02/03 parallax watermark — sits behind grid, absolute to article */}
      <motion.span
        aria-hidden
        style={{
          y: watermarkY,
          opacity: watermarkOpacity,
          background: "linear-gradient(180deg, rgba(249,115,22,0.14) 0%, rgba(249,115,22,0.04) 70%, transparent 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
        className="pointer-events-none select-none absolute right-0 lg:right-[-20px] top-8 font-display font-black tracking-[-0.05em] leading-none tabular-nums"
      >
        <span
          style={{ fontSize: "clamp(220px, 34vw, 520px)" }}
          className="block"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </motion.span>

      <div className="relative grid grid-cols-12 gap-x-8 gap-y-10">
        {/* LEFT MARGINALIA — sticky on desktop, inline + smaller avatar on mobile */}
        <aside className="col-span-12 lg:col-span-3 lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.26em] font-bold text-[#f97316]/80 mb-6">
            <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
            <span className="h-px w-6 bg-[#f97316]/40" />
            <span>{story.kicker}</span>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center text-[15px] lg:text-[17px] font-black text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_0_30px_rgba(249,115,22,0.22)]"
              style={{ background: `linear-gradient(135deg, ${story.avatarColor[0]}, ${story.avatarColor[1]})` }}
            >
              {story.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-display font-bold text-[15px] text-white tracking-tight">{story.name}</p>
              <p className="text-[11px] text-white/35 mt-0.5 tabular-nums">{story.duration}</p>
            </div>
          </div>

          <dl className="mt-8 space-y-4 text-[12.5px]">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/35 mb-1">Game</dt>
              <dd className="text-white/75">{story.game}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/35 mb-1">Stack</dt>
              <dd className="text-white/75 leading-[1.5]">{story.product}</dd>
            </div>
          </dl>
        </aside>

        {/* RIGHT BODY */}
        <div className="col-span-12 lg:col-span-8 lg:col-start-5 max-w-[68ch]">
          <h2
            className="font-display font-bold tracking-[-0.035em] leading-[1.02] mb-10 text-white"
            style={{ fontSize: "clamp(36px, 4.8vw, 64px)" }}
          >
            {story.title}
          </h2>

          {/* HERO PULL QUOTE — `.story-pull-quote` adds the animated ::before glyph */}
          <p
            className="story-pull-quote relative font-display text-white tracking-[-0.015em] leading-[1.25] mb-14 pl-7 border-l-[3px] border-[#f97316]"
            style={{ fontSize: "clamp(22px, 2.4vw, 30px)" }}
          >
            &ldquo;{story.quote}&rdquo;
          </p>

          {/* BODY — paragraph stack, first ¶ drop-cap */}
          <div className="space-y-6 mb-16">
            {story.body.map((para, pi) => (
              <p
                key={pi}
                className={`text-white/65 leading-[1.85] ${pi === 0 ? "drop-cap" : ""}`}
                style={{ fontSize: "17px", maxWidth: "60ch" }}
              >
                {para}
              </p>
            ))}
          </div>

          {/* METRICS */}
          <StoryMetrics metrics={story.metrics} />

          {/* PREV / NEXT story chip — sticky-bottom-right feel, sits at article end */}
          {next ? (
            <div className="mt-14 flex justify-end">
              <button
                type="button"
                onClick={() => scrollToArticle(next.slug)}
                data-cursor="cta"
                className="cursor-cta press-spring group inline-flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm text-[12.5px] font-semibold text-white/80 hover:text-white hover:border-[#f97316]/50 hover:bg-[#f97316]/[0.08] transition-all"
              >
                <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/40 group-hover:text-[#f97316]/80 transition-colors">
                  Next story
                </span>
                <span className="h-3 w-px bg-white/15" />
                <span>{next.shortTitle}</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#f97316] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default function StoriesPage() {
  return (
    <main className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-16 px-6 sm:px-10 z-10">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] font-bold text-white/40 mb-8">
            <span className="tabular-nums">Issue 01</span>
            <span className="h-px w-12 bg-white/20" />
            <span>Case studies</span>
          </div>

          <h1
            className="font-display font-bold leading-[0.86] tracking-[-0.048em] max-w-[14ch]"
            style={{ fontSize: "clamp(52px, 9.5vw, 128px)" }}
          >
            <span
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(170,170,185,0.75))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Players who came
            </span>{" "}
            <span
              style={{
                background: "linear-gradient(180deg, #ffb366 0%, #f97316 50%, #c2410c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 70px rgba(249,115,22,0.32))",
              }}
            >
              back.
            </span>
          </h1>

          <div className="mt-10 grid grid-cols-12 gap-x-8">
            <p className="col-span-12 md:col-span-6 lg:col-span-5 text-[17px] text-white/55 leading-[1.55] max-w-[50ch]">
              Three stories pulled from our Discord. Names changed, screenshots real, edits for length only.
            </p>
            <div className="col-span-12 md:col-span-6 lg:col-span-4 lg:col-start-9 mt-6 md:mt-0 flex md:justify-end md:items-end">
              <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] font-semibold text-white/35">
                <span>{STORIES.length} stories</span>
                <span className="h-px w-8 bg-white/15" />
                <span>Monthly drops</span>
              </div>
            </div>
          </div>

          {/* ─── JUMP-TO CHAPTER STRIP ──────────────────────────────────── */}
          <nav
            aria-label="Jump to story"
            className="mt-12 flex flex-wrap items-center gap-2.5"
          >
            <span className="text-[10px] uppercase tracking-[0.26em] font-bold text-white/35 mr-2">Jump to</span>
            {STORIES.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => scrollToArticle(s.slug)}
                data-cursor="cta"
                className="cursor-cta press-spring group inline-flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-full border border-white/10 bg-white/[0.025] text-[12px] font-semibold text-white/70 hover:text-white hover:border-[#f97316]/45 hover:bg-[#f97316]/[0.07] transition-all"
              >
                <span className="tabular-nums text-[10px] text-[#f97316]/80 font-bold">{String(i + 1).padStart(2, "0")}</span>
                <span>{s.shortTitle}</span>
                <span className="text-white/30 group-hover:text-white/50 transition-colors">·</span>
                <span className="text-white/45 group-hover:text-white/70 transition-colors">{s.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* ─── STORIES ───────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 relative z-10 overflow-x-clip">
        <div className="max-w-[1180px] mx-auto">
          {STORIES.map((s, i) => (
            <StoryArticle
              key={s.slug}
              story={s}
              index={i}
              next={STORIES[i + 1]}
            />
          ))}

          {/* ─── FOOTER CTA ───────────────────────────────────────────── */}
          <div className="border-t border-white/[0.05] py-24 text-center">
            <p className="text-[10px] uppercase tracking-[0.26em] font-bold text-white/35 mb-6">Your move</p>
            <h3
              className="font-display font-bold tracking-[-0.035em] leading-[1] mb-8"
              style={{ fontSize: "clamp(32px, 4.5vw, 56px)" }}
            >
              <span
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(170,170,185,0.8))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Your story
              </span>{" "}
              <span
                style={{
                  background: "linear-gradient(180deg, #ffb366 0%, #f97316 50%, #c2410c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                next?
              </span>
            </h3>
            <Link
              href="/products"
              data-cursor="cta"
              className="cursor-cta press-spring group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white font-bold text-[16px] shadow-[0_0_28px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.7)] hover:-translate-y-0.5 transition-all"
            >
              Start your comeback
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
