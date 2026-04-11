
/* ═══════════════════════════════════════════════════════════════════════════ */
/*                                                                           */
/*   ██ PART C — MAIN PAGE COMPONENT + GLOBAL STYLES ██                     */
/*                                                                           */
/*   Contains: ApplyPage default export, all sections, form logic,           */
/*   success state, page loader, and comprehensive global CSS                */
/*                                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════ */
/*                                                                    */
/*                     ██ MAIN PAGE ██                                */
/*                                                                    */
/* ═══════════════════════════════════════════════════════════════════ */
export default function ApplyPage() {
  /* ── State ── */
  const [position, setPosition] = useState("")
  const [discord, setDiscord] = useState("")
  const [age, setAge] = useState(18)
  const [timezone, setTimezone] = useState("")
  const [hoursPerWeek, setHoursPerWeek] = useState("")
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [preferredTime, setPreferredTime] = useState("")
  const [experience, setExperience] = useState("")
  const [whyLethal, setWhyLethal] = useState("")
  const [portfolio, setPortfolio] = useState("")
  const [agree16, setAgree16] = useState(false)
  const [agreeActive, setAgreeActive] = useState(false)
  const [agreeUnpaid, setAgreeUnpaid] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formStep, setFormStep] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [heroTextVisible, setHeroTextVisible] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)
  const [loaderDone, setLoaderDone] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const formRef = useRef<HTMLDivElement>(null)

  /* ── Page loader sequence ── */
  useEffect(() => {
    const t1 = setTimeout(() => setPageLoaded(true), 800)
    const t2 = setTimeout(() => setLoaderDone(true), 1400)
    const t3 = setTimeout(() => setHeroTextVisible(true), 1600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  /* ── Scroll parallax tracking ── */
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  /* ── Sticky mobile bar ── */
  useEffect(() => {
    const handler = () => setShowStickyBar(window.scrollY > window.innerHeight * 0.8)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  /* ── Auto-detect timezone ── */
  useEffect(() => {
    try {
      const offsetMin = new Date().getTimezoneOffset()
      const offsetH = -offsetMin / 60
      const sign = offsetH >= 0 ? "+" : ""
      const utcStr = `UTC${sign}${offsetH}`
      const match = TIMEZONES.find(t => t.v === utcStr)
      if (match) setTimezone(`${match.v}|${match.l}`)
    } catch { /* ignore */ }
  }, [])

  /* ── Helpers ── */
  const toggleDay = (d: string) => setSelectedDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])
  const scrollToForm = (id: string) => { setPosition(id); setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100) }
  const selectedPos = POSITIONS.find(p => p.id === position)

  /* ── Validation ── */
  const s0 = !!(position && discord.trim().length >= 2 && age >= 16 && timezone.length > 0)
  const s1 = !!(hoursPerWeek && selectedDays.length > 0 && preferredTime)
  const s2 = !!(experience.length >= 50 && whyLethal.length >= 30 && agree16 && agreeActive && agreeUnpaid)

  /* ── Progress ── */
  let filled = 0
  if (position) filled++; if (discord.trim()) filled++; if (timezone) filled++
  if (hoursPerWeek) filled++; if (selectedDays.length) filled++; if (preferredTime) filled++
  if (experience.length >= 50) filled++; if (whyLethal.length >= 30) filled++
  if (agree16 && agreeActive && agreeUnpaid) filled++
  const pct = Math.round((filled / 9) * 100)

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!s2 || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/apply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position, discord, age, timezone: timezone.split("|")[0], hoursPerWeek, availableDays: selectedDays, preferredTime, experience, whyLethal, portfolio }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch { toast.error("Failed to submit — please try again") }
    setSubmitting(false)
  }


  /* ══════════════════════════════════════════════════════════════ */
  /* SUCCESS STATE                                                 */
  /* ══════════════════════════════════════════════════════════════ */
  if (submitted) return (
    <main className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <Navbar />
      <NoiseOverlay />
      <ParticleField />

      <section className="flex-1 flex items-center justify-center py-32 px-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)" }} />

        {/* Particle burst background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={`burst-${i}`} className="absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                left: `${50 + (Math.random() - 0.5) * 60}%`,
                top: `${50 + (Math.random() - 0.5) * 60}%`,
                backgroundColor: ["#22c55e", "#a855f7", "#3b82f6", "#EF6F29"][i % 4],
                opacity: 0.2 + Math.random() * 0.3,
                animation: `energyPulse ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Confetti — 120 pieces */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {Array.from({ length: 120 }).map((_, i) => (
              <div key={i} className="absolute" style={{
                width: `${Math.random() * 10 + 4}px`,
                height: `${Math.random() * 10 + 4}px`,
                borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0",
                left: `${Math.random() * 100}%`,
                top: "-5%",
                backgroundColor: ["#EF6F29", "#22c55e", "#3b82f6", "#a855f7", "#eab308", "#ec4899", "#06b6d4", "#f97316", "#ff6b6b", "#ffd93d"][i % 10],
                animation: `confettiFall ${2.5 + Math.random() * 3}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                animationDelay: `${Math.random() * 1.5}s`,
                // @ts-expect-error custom CSS props
                "--fall": `${typeof window !== "undefined" ? window.innerHeight + 100 : 1000}px`,
                "--dx": `${(Math.random() - 0.5) * 500}px`,
                "--rot": `${Math.random() * 1440}deg`,
              }} />
            ))}
          </div>
        )}

        <div className="relative text-center max-w-lg" style={{
          opacity: 1,
          animation: "fadeInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}>
          {/* Success icon — 3D animation */}
          <div className="relative mx-auto mb-10 w-32 h-32" style={{ perspective: "800px" }}>
            <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40"
              style={{
                animation: "successBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards, holographic 4s ease-in-out infinite 0.8s",
                transformStyle: "preserve-3d",
              }}>
              <CheckCircle2 className="h-16 w-16 text-white" style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.4))" }} />
            </div>
            {/* Ripple rings */}
            <div className="absolute inset-0 rounded-[36px] border-2 border-emerald-500/30 animate-ripple-1" />
            <div className="absolute -inset-3 rounded-[40px] border border-emerald-500/15 animate-ripple-2" />
            <div className="absolute -inset-6 rounded-[44px] border border-emerald-500/10 animate-ripple-3" />
            <div className="absolute -inset-9 rounded-[48px] border border-emerald-500/05 animate-ripple-3" style={{ animationDelay: "0.9s" }} />
          </div>

          <h2 className="text-5xl sm:text-6xl font-black mb-4 neon-text">
            You&apos;re In!
          </h2>
          {/* Celebration particles burst */}
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(7)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" style={{
                animation: `starPop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.3 + i * 0.08}s both`,
              }} />
            ))}
          </div>
          <p className="text-lg text-white/60 mb-2">
            Application for <span className="text-white font-bold">{selectedPos?.title}</span> submitted successfully.
          </p>
          <p className="text-sm text-white/30 mb-4">We&apos;ll DM you on Discord within 48 hours.</p>

          {/* Animated progress steps */}
          <div className="flex items-center justify-center gap-3 mb-12">
            {["Applied", "In Review", "Interview", "Onboard"].map((step, i) => (
              <div key={i} className="flex items-center gap-2" style={{
                animation: `fadeSlideUp 0.5s ease forwards`,
                animationDelay: `${0.5 + i * 0.15}s`,
                opacity: 0,
              }}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${i === 0 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-white/[0.04] text-white/20 border border-white/[0.08]"}`}>
                  {i === 0 ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`text-[11px] font-semibold ${i === 0 ? "text-emerald-400" : "text-white/20"}`}>{step}</span>
                {i < 3 && <div className="w-6 h-px bg-white/[0.08]" />}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link href="/"
              className="px-8 py-4 rounded-2xl border border-white/10 text-sm font-semibold hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300">
              Home
            </Link>
            <Link href="/products"
              className="px-8 py-4 rounded-2xl text-white text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 neon-btn">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
      <Footer />
      <style jsx global>{`
        @keyframes confettiFall{0%{transform:translateY(0) scale(0) rotate(0);opacity:1}15%{transform:translateX(calc(var(--dx)*0.3)) translateY(15vh) scale(1) rotate(calc(var(--rot)*0.2));opacity:1}100%{transform:translateX(var(--dx)) translateY(var(--fall)) scale(0.3) rotate(var(--rot));opacity:0}}
        @keyframes fadeInScale{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes ripple-1{0%,100%{transform:scale(1);opacity:0.3}50%{transform:scale(1.05);opacity:0.6}}
        @keyframes ripple-2{0%,100%{transform:scale(1);opacity:0.2}50%{transform:scale(1.08);opacity:0.4}}
        @keyframes ripple-3{0%,100%{transform:scale(1);opacity:0.1}50%{transform:scale(1.1);opacity:0.2}}
        .animate-ripple-1{animation:ripple-1 2s ease-in-out infinite}
        .animate-ripple-2{animation:ripple-2 2s ease-in-out infinite 0.3s}
        .animate-ripple-3{animation:ripple-3 2s ease-in-out infinite 0.6s}
        .animate-success-bounce{animation:successBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards}
        @keyframes successBounce{from{transform:scale(0) rotate(-10deg)}to{transform:scale(1) rotate(0)}}
        @keyframes starPop{0%{transform:scale(0) rotate(-180deg);opacity:0}100%{transform:scale(1) rotate(0deg);opacity:1}}
        @keyframes holographic{0%,100%{transform:rotateY(0deg) rotateX(0deg)}25%{transform:rotateY(5deg) rotateX(2deg)}50%{transform:rotateY(-3deg) rotateX(-2deg)}75%{transform:rotateY(4deg) rotateX(1deg)}}
        @keyframes energyPulse{0%,100%{transform:scale(1);opacity:0.2}50%{transform:scale(2);opacity:0.5}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .neon-btn{background:linear-gradient(135deg,#EF6F29,#FF8C42);box-shadow:0 0 15px rgba(239,111,41,0.3),0 0 40px rgba(239,111,41,0.1)}
        .neon-text{color:#EF6F29;text-shadow:0 0 7px rgba(239,111,41,0.4),0 0 10px rgba(239,111,41,0.3),0 0 21px rgba(239,111,41,0.2)}
      `}</style>
    </main>
  )


  /* ══════════════════════════════════════════════════════════════ */
  /* MAIN RENDER                                                   */
  /* ══════════════════════════════════════════════════════════════ */
  return (
    <main className="flex min-h-screen flex-col bg-[#0a0a0a] relative">

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PAGE LOADER OVERLAY — Enhanced with holographic ring       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {!loaderDone && (
        <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center transition-all duration-700"
          style={{ opacity: pageLoaded ? 0 : 1, pointerEvents: pageLoaded ? "none" : "all" }}>
          <div className="relative flex flex-col items-center">
            {/* Holographic loading ring */}
            <div className="relative w-24 h-24 mb-6">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/[0.04]" />
              {/* Spinning gradient ring */}
              <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: "1.2s" }}>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EF6F29" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="46" fill="none" stroke="url(#loaderGrad)" strokeWidth="2.5"
                    strokeDasharray="80 200" strokeLinecap="round" />
                </svg>
              </div>
              {/* Inner holographic glow */}
              <div className="absolute inset-2 rounded-full" style={{
                background: "conic-gradient(from 0deg, rgba(239,111,41,0.1), rgba(168,85,247,0.1), rgba(59,130,246,0.1), rgba(239,111,41,0.1))",
                animation: "holographic 3s linear infinite",
              }} />
              {/* Logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black text-primary neon-text">L</span>
              </div>
            </div>

            {/* Progress bar with percentage */}
            <div className="w-56 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono text-white/20 tracking-widest uppercase">Loading</span>
                <span className="text-[9px] font-mono text-primary/60 tabular-nums animate-loader-pct">100%</span>
              </div>
              <div className="h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full rounded-full animate-loader-progress"
                  style={{ background: "linear-gradient(90deg, #EF6F29, #a855f7, #3b82f6)" }} />
              </div>
            </div>

            {/* System boot text sequence */}
            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-[10px] font-mono text-white/25 tracking-widest uppercase">Initializing systems</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 h-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 h-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
              <div className="text-[8px] font-mono text-white/10 tracking-wider" style={{
                animation: "fadeIn 0.3s ease forwards 0.3s",
                opacity: 0,
              }}>
                LETHAL SOLUTIONS v2.14 // {POSITIONS.reduce((s, p) => s + p.openSlots, 0)} positions available
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* GLOBAL OVERLAYS                                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Navbar />
      <ScrollProgress />
      <NoiseOverlay />
      <CursorGlow />
      <MouseTrail />
      <ParticleField />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION — Epic full-screen                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center px-4 overflow-hidden">
        {/* Multiple parallax background layers */}
        <div className="absolute inset-0 pointer-events-none" style={{ transform: `translateY(${scrollY * 0.08}px)`, willChange: "transform" }}>
          <CyberGrid3D />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ transform: `translateY(${scrollY * 0.15}px)`, willChange: "transform" }}>
          <AuroraMesh />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ transform: `translateY(${scrollY * 0.05}px)`, willChange: "transform" }}>
          <GridBackground />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ transform: `translateY(${scrollY * 0.25}px)`, willChange: "transform" }}>
          <FloatingShapes />
        </div>
        {/* Waveform at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ transform: `translateY(${scrollY * 0.12}px)` }}>
          <WaveformVisualizer />
        </div>

        {/* Radial gradient overlay with parallax */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(239,111,41,0.06) 0%, transparent 60%)",
            transform: `translateY(${scrollY * 0.1}px)`,
          }} />

        <div className="container mx-auto relative z-10 py-32 px-4" style={{ maxWidth: 1280 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16 lg:gap-20">

            {/* ── Left: Text content ── */}
            <div className="text-center lg:text-left">
              {/* Status badge */}
              <div className={`flex justify-center lg:justify-start mb-8 transition-all duration-1000 ${heroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-sm font-semibold text-white/70">
                    {POSITIONS.reduce((s, p) => s + p.openSlots, 0)} Open Positions
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="text-sm text-white/40">Hiring Now</span>
                </div>
              </div>

              {/* Countdown urgency */}
              <div className={`flex justify-center lg:justify-start mb-6 transition-all duration-1000 delay-100 ${heroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                <CountdownBadge />
              </div>

              {/* Heading — Per-character stagger reveal */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black mb-7 tracking-tight leading-[1.05]">
                <span className="block text-white/95 overflow-hidden">
                  {"Join the".split("").map((char, i) => (
                    <span
                      key={i}
                      className="inline-block transition-all"
                      style={{
                        opacity: heroTextVisible ? 1 : 0,
                        transform: heroTextVisible ? "translateY(0) rotateX(0)" : "translateY(100%) rotateX(-80deg)",
                        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${150 + i * 40}ms`,
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
                <span className="block overflow-hidden">
                  {"Lethal Team".split("").map((char, i) => (
                    <span
                      key={i}
                      className="inline-block bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift transition-all"
                      style={{
                        opacity: heroTextVisible ? 1 : 0,
                        transform: heroTextVisible ? "translateY(0) rotateX(0)" : "translateY(100%) rotateX(-80deg)",
                        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${500 + i * 45}ms`,
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
                {/* Animated underline */}
                <span className="block h-1 mt-2 rounded-full overflow-hidden max-w-[200px] lg:max-w-[260px]">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary"
                    style={{
                      width: heroTextVisible ? "100%" : "0%",
                      transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1s",
                      boxShadow: "0 0 20px rgba(239,111,41,0.5)",
                    }}
                  />
                </span>
              </h1>

              {/* Subtitle — word-by-word reveal */}
              <p className="text-base sm:text-lg lg:text-xl mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                {"Work remotely. Set your own hours. Build the best gaming tools on the market.".split(" ").map((word, i) => (
                  <span
                    key={i}
                    className="inline-block text-white/40 mr-[0.3em] transition-all"
                    style={{
                      opacity: heroTextVisible ? 1 : 0,
                      transform: heroTextVisible ? "translateY(0)" : "translateY(12px)",
                      filter: heroTextVisible ? "blur(0)" : "blur(4px)",
                      transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${900 + i * 35}ms`,
                    }}
                  >
                    {word}
                  </span>
                ))}
              </p>

              {/* CTA Buttons */}
              <div className={`flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-14 transition-all duration-1000 delay-450 ${heroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <MagneticButton
                  onClick={() => document.getElementById("positions")?.scrollIntoView({ behavior: "smooth" })}
                  className="group text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-3 neon-btn hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <span>View Open Roles</span>
                  <ArrowRight className="h-[18px] w-[18px] group-hover:translate-x-1 transition-transform duration-300" />
                </MagneticButton>

                <MagneticButton
                  onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="group text-white/60 hover:text-white font-semibold px-8 py-4 rounded-2xl border border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.04] transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    Apply Directly
                    <Send className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </span>
                </MagneticButton>
              </div>

              {/* Mini stats */}
              <div className={`grid grid-cols-3 sm:grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 transition-all duration-1000 delay-600 ${heroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                {[
                  { label: "Team Members", value: "10+", color: "#a855f7" },
                  { label: "Happy Clients", value: "774+", color: "#22c55e" },
                  { label: "Uptime", value: "99.8%", color: "#3b82f6" },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl p-3.5 text-center bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
                    <p className="text-xl font-black text-white">{s.value}</p>
                    <p className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: `${s.color}80` }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: FloatingTechStack + MorphBlob ── */}
            <div className={`hidden lg:block transition-all duration-1000 delay-400 relative ${heroTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
              {/* Morphing blob behind */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
                <MorphBlob color="#EF6F29" size={550} />
              </div>
              {/* 3D Isometric Card Stack */}
              <FloatingTechStack />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => document.getElementById("stats")?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 text-white/25 hover:text-primary/70 transition-colors group cursor-pointer"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">Scroll</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </button>
      </section>


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MARQUEE — Dual direction                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden">
        <Marquee />
        <div className="relative overflow-hidden py-6 opacity-[0.10]">
          <div className="flex animate-marquee-reverse whitespace-nowrap">
            {[...["Remote", "Commission", "Growth", "Flexible", "Developer", "Support", "Sales", "Media", "SEO", "Manager"], ...["Remote", "Commission", "Growth", "Flexible", "Developer", "Support", "Sales", "Media", "SEO", "Manager"], ...["Remote", "Commission", "Growth", "Flexible", "Developer", "Support", "Sales", "Media", "SEO", "Manager"]].map((item, i) => (
              <span key={i} className="mx-8 text-xl font-black uppercase tracking-widest text-white/50">
                {item}
                <span className="mx-8 text-purple-500/50">//</span>
              </span>
            ))}
          </div>
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STATS SECTION                                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="stats" className="relative z-10 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel label="By The Numbers" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              Built Different
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              Real numbers, no fluff. Here&apos;s what we&apos;ve built together.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {STATS.map((stat, i) => (
              <StatCard key={i} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>


      <SectionDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* NEURAL NETWORK — Team Synergy                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24 overflow-hidden">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel label="Team Synergy" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              How We <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">Connect</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              Every team member is a node in our network. Collaboration happens naturally across roles and timezones.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="relative rounded-3xl border border-white/[0.06] bg-[#0a0a0c]/80 overflow-hidden" style={{ height: 420 }}>
              <TeamNetwork />
              {/* Overlay labels */}
              <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-6">
                <div className="flex items-center gap-6">
                  {[
                    { label: "Developers", color: "#a855f7" },
                    { label: "Support", color: "#22c55e" },
                    { label: "Sales", color: "#eab308" },
                    { label: "Media", color: "#ec4899" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}50` }} />
                      <span className="text-[10px] font-bold text-white/30">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      <SectionDivider color="#a855f7" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TECH STACK & WORLD MAP                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24 overflow-hidden">
        <HexGrid />
        <div className="container mx-auto max-w-6xl relative">
          <SectionLabel label="Our Stack & Reach" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              Global Team, <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">Modern Stack</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-16 max-w-lg mx-auto text-sm leading-relaxed">
              We use cutting-edge technology and operate across every major timezone. Work with the best tools, from anywhere.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Tech Orbit */}
            <Reveal direction="left">
              <div className="flex justify-center">
                <TechOrbit />
              </div>
            </Reveal>

            {/* Tools Grid */}
            <div>
              <Reveal delay={200}>
                <h3 className="text-xl font-black mb-2">Tools We Use</h3>
                <p className="text-sm text-white/25 mb-8">Industry-standard stack. All licenses provided.</p>
              </Reveal>
              <ToolsShowcase />
            </div>
          </div>

          {/* World Map + Interactive Globe */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <Reveal>
                <div className="text-center lg:text-left mb-8">
                  <h3 className="text-xl font-black mb-2">
                    Team Across <span className="text-primary">6+ Timezones</span>
                  </h3>
                  <p className="text-sm text-white/25">24/7 coverage. Someone is always online.</p>
                </div>
              </Reveal>
              <Reveal delay={150}>
                <WorldMap />
              </Reveal>
            </div>

            <Reveal direction="right" delay={300}>
              <div className="relative rounded-3xl border border-white/[0.06] bg-[#0a0a0c]/80 overflow-hidden" style={{ height: 320 }}>
                <InteractiveGlobe />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Interactive Globe</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>


      <BeamDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* POSITIONS                                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="positions" className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <SectionLabel label="Open Positions" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-4">
              Find Your Role
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-lg mx-auto text-sm leading-relaxed">
              Every position is fully remote with flexible hours. Pick what fits you best and let&apos;s build something great together.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSITIONS.map((pos, i) => (
              <PositionCard key={pos.id} pos={pos} onApply={scrollToForm} index={i} />
            ))}
          </div>
        </div>
      </section>


      <SectionDivider color="#a855f7" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-4xl">
          <SectionLabel label="How It Works" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              Three Steps to Join
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              Simple, fast, no bureaucracy. Apply today, start tomorrow.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Apply", desc: "Fill out the form below. Takes less than 2 minutes. We read every single one.", icon: Send, color: "#EF6F29" },
              { step: "02", title: "Interview", desc: "Quick Discord call to get to know you. 15-20 minutes, casual vibes.", icon: MessageSquare, color: "#a855f7" },
              { step: "03", title: "Onboard", desc: "Get access, training, and start contributing immediately. Day one impact.", icon: Rocket, color: "#22c55e" },
            ].map((s, i) => (
              <ProcessStep key={i} step={s} index={i} total={3} />
            ))}
          </div>
        </div>
      </section>


      <SectionDivider color="#22c55e" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HIRING TIMELINE                                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24 overflow-hidden">
        <div className="container mx-auto max-w-4xl">
          <SectionLabel label="Your Journey" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              From Apply to <span className="text-primary">Onboarded</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-16 max-w-md mx-auto text-sm leading-relaxed">
              Our hiring process is fast and transparent. No ghosting, no waiting weeks. Here&apos;s exactly what happens.
            </p>
          </Reveal>

          <HiringTimeline />
        </div>
      </section>


      <BeamDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* GROWTH PATH — Career Progression                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24 overflow-hidden">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel label="Career Growth" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              Your <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">Growth Path</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-16 max-w-md mx-auto text-sm leading-relaxed">
              From trial member to partner. Your trajectory is in your hands. Top performers get promoted fast.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <GrowthLadder />
          </Reveal>
        </div>
      </section>


      <SectionDivider color="#eab308" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* COMPARISON TABLE + RADAR SCAN                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel label="The Difference" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              Lethal vs <span className="text-white/20 line-through decoration-red-500/50">Corporate</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              We&apos;re not building the next Fortune 500. We&apos;re building something better.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <ComparisonTable />
            </div>
            <Reveal direction="right" delay={300}>
              <div className="relative rounded-3xl border border-white/[0.06] bg-[#0a0a0c]/80 overflow-hidden p-6" style={{ height: 380 }}>
                <div className="text-center mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">Team Radar</p>
                </div>
                <RadarScan />
              </div>
            </Reveal>
          </div>
        </div>
      </section>


      <SectionDivider color="#ec4899" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TEAM QUOTES                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel label="From The Team" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              What Our Team Says
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/25 mb-14 text-sm max-w-md mx-auto leading-relaxed">
              Real quotes from people who work here every day. No scripts, no edits.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {TEAM_QUOTES.map((q, i) => (
              <TestimonialCard key={i} quote={q} index={i} />
            ))}
          </div>

          {/* Featured large quote */}
          <Reveal delay={300}>
            <GradientBorderCard colors="#a855f7, #3b82f6, #22c55e">
              <div className="p-10 sm:p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, #a855f7 1px, transparent 1px),
                      radial-gradient(circle at 75% 75%, #3b82f6 1px, transparent 1px)`,
                    backgroundSize: "30px 30px",
                  }} />
                <div className="relative z-10">
                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400/80 text-amber-400/80" />
                    ))}
                  </div>
                  <blockquote className="text-xl sm:text-2xl font-bold text-white/60 leading-relaxed mb-8 max-w-2xl mx-auto italic">
                    &ldquo;This isn&apos;t just a team, it&apos;s a family of builders. Everyone here is skilled, driven, and actually fun to work with. Zero corporate BS.&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black"
                      style={{ background: "linear-gradient(135deg, #22c55e20, #22c55e08)", color: "#22c55e", border: "1px solid #22c55e20" }}>
                      NV
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white/80">nova</p>
                      <p className="text-xs text-white/30">Support Lead · 3 months</p>
                    </div>
                  </div>
                </div>
              </div>
            </GradientBorderCard>
          </Reveal>
        </div>
      </section>


      <SectionDivider color="#ec4899" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* LIVE ACTIVITY + HIGHLIGHTS                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel label="Right Now" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              See What&apos;s <span className="text-primary">Happening</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              This is what a day at Lethal looks like. Real work, real results, no corporate theater.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Live Feed */}
            <Reveal direction="left">
              <LiveFeed />
            </Reveal>

            {/* Quick stats / highlights */}
            <Reveal direction="right" delay={200}>
              <GradientBorderCard colors="#22c55e, #3b82f6, #a855f7">
                <div className="p-8">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2.5">
                    <Zap className="h-5 w-5 text-primary" />
                    This Week&apos;s Highlights
                  </h3>
                  <div className="space-y-5">
                    {[
                      { metric: "Tickets Resolved", value: "142", change: "+23%", color: "#22c55e" },
                      { metric: "Revenue Generated", value: "$12.4k", change: "+18%", color: "#eab308" },
                      { metric: "New Customers", value: "87", change: "+31%", color: "#3b82f6" },
                      { metric: "Code Commits", value: "34", change: "+12%", color: "#a855f7" },
                      { metric: "Content Published", value: "8", change: "+60%", color: "#ec4899" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                          <span className="text-sm text-white/50">{item.metric}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white/80">{item.value}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {item.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GradientBorderCard>
            </Reveal>
          </div>
        </div>
      </section>


      <BeamDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ROLE DEEP DIVE — 3D Flip Cards with MatrixRain             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24 overflow-hidden">
        <MatrixRain />
        <div className="container mx-auto max-w-5xl relative">
          <SectionLabel label="Role Deep Dive" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              Flip to <span className="text-primary">Explore</span> Each Role
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              Click any card to see what your day-to-day actually looks like.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSITIONS.map((pos, i) => (
              <Reveal key={pos.id} delay={i * 80} direction="up">
                <FlipCard
                  color={pos.color}
                  front={
                    <div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-white/[0.06]"
                        style={{ background: `linear-gradient(135deg, ${pos.color}15, transparent)` }}>
                        <pos.icon className="h-5 w-5" style={{ color: pos.color }} />
                      </div>
                      <h3 className="text-lg font-black mb-2">{pos.title}</h3>
                      <p className="text-xs text-white/30 leading-relaxed mb-4">{pos.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-400">{pos.openSlots} open</span>
                      </div>
                    </div>
                  }
                  back={
                    <div>
                      <h4 className="text-sm font-black mb-4" style={{ color: pos.color }}>Day-to-Day</h4>
                      <div className="space-y-3">
                        {(ROLE_BENEFITS[pos.id as keyof typeof ROLE_BENEFITS] || []).map((b, j) => (
                          <div key={j} className="flex items-start gap-2.5">
                            <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: pos.color }} />
                            <span className="text-[11px] text-white/40 leading-relaxed">{b}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {pos.perks.map((p, j) => (
                          <span key={j} className="text-[9px] px-2.5 py-1 rounded-full border text-white/25 font-semibold"
                            style={{ borderColor: `${pos.color}20`, background: `${pos.color}08` }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  }
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      <SectionDivider color="#06b6d4" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ISOMETRIC WORKSPACE — Your Future Workspace                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24 overflow-hidden">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel label="Your Setup" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              Your Future <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Workspace</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              Work from anywhere with the tools and setup of your dreams. We provide everything you need.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="relative rounded-3xl border border-white/[0.06] bg-[#0a0a0c]/80 overflow-hidden" style={{ height: 480 }}>
              <IsometricWorkspace />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {["All tools provided", "Zero cost to you", "Your dream setup"].map((text, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-[10px] font-bold text-white/30">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      <SectionDivider color="#3b82f6" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TEAM SKILL MATRIX — Animated skill bars                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel label="Team DNA" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              What We&apos;re <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">Built On</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              Our team&apos;s collective strengths. These are the areas where we excel.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Technical Capabilities */}
            <Reveal direction="left">
              <SpotlightCard className="p-8">
                <h3 className="text-lg font-black mb-8 flex items-center gap-2.5">
                  <Zap className="h-5 w-5 text-primary" />
                  Technical Capabilities
                </h3>
                <div className="space-y-6">
                  <SkillBar label="Reverse Engineering" value={95} color="#a855f7" delay={0} />
                  <SkillBar label="Web Development" value={92} color="#3b82f6" delay={100} />
                  <SkillBar label="Systems Programming" value={88} color="#EF6F29" delay={200} />
                  <SkillBar label="Security Research" value={90} color="#22c55e" delay={300} />
                  <SkillBar label="DevOps & Infrastructure" value={85} color="#eab308" delay={400} />
                  <SkillBar label="AI & Automation" value={78} color="#ec4899" delay={500} />
                </div>
              </SpotlightCard>
            </Reveal>

            {/* Culture metrics */}
            <Reveal direction="right" delay={200}>
              <SpotlightCard className="p-8">
                <h3 className="text-lg font-black mb-8 flex items-center gap-2.5">
                  <Heart className="h-5 w-5 text-primary" />
                  Culture & Operations
                </h3>
                <div className="space-y-6">
                  <SkillBar label="Team Satisfaction" value={97} color="#22c55e" delay={0} />
                  <SkillBar label="Response Time" value={94} color="#3b82f6" delay={100} />
                  <SkillBar label="Creative Freedom" value={99} color="#a855f7" delay={200} />
                  <SkillBar label="Work-Life Balance" value={96} color="#eab308" delay={300} />
                  <SkillBar label="Ship Speed" value={93} color="#EF6F29" delay={400} />
                  <SkillBar label="Knowledge Sharing" value={88} color="#ec4899" delay={500} />
                </div>
              </SpotlightCard>
            </Reveal>
          </div>
        </div>
      </section>


      <BeamDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* WHY JOIN — Perks Grid                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <Reveal>
            <div className="relative rounded-[32px] border border-white/[0.06] bg-[#0c0c0e]/60 backdrop-blur-xl overflow-hidden">
              {/* Background effects */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(239,111,41,0.05) 0%, transparent 70%)" }} />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 70%)" }} />

              <div className="relative p-10 sm:p-14 lg:p-16">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Rocket className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/70">Why Lethal?</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight">
                  Not a corporation.<br />
                  <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">A team that ships.</span>
                </h2>
                <p className="text-white/30 text-sm mb-12 max-w-lg leading-relaxed">
                  Small team, big impact. Your work directly shapes the product. No layers of management, no endless meetings — just build, ship, and get paid.
                </p>

                {/* Perks grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {PERKS_GRID.map((perk, i) => (
                    <PerkCard key={i} perk={perk} index={i} />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      <SectionDivider color="#3b82f6" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ACHIEVEMENT BADGES — Hexagonal badges                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <SectionLabel label="Milestones" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              Badges <span className="text-primary">Unlocked</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-14 max-w-md mx-auto text-sm leading-relaxed">
              Milestones we&apos;ve hit together as a team. Next achievement: your application.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Trophy, label: "500+ Sales", color: "#eab308", unlocked: true },
              { icon: Shield, label: "0 Detects", color: "#22c55e", unlocked: true },
              { icon: Zap, label: "99.8% Up", color: "#3b82f6", unlocked: true },
              { icon: Users, label: "10+ Team", color: "#a855f7", unlocked: true },
              { icon: Globe, label: "6 Zones", color: "#f97316", unlocked: true },
              { icon: Rocket, label: "12 Shipped", color: "#ec4899", unlocked: true },
            ].map((badge, i) => (
              <Reveal key={i} delay={i * 60} direction="scale">
                <div className="group relative flex flex-col items-center text-center p-5 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden achievement-badge">
                  {/* Hexagonal clip decoration */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"
                    style={{ boxShadow: `inset 0 0 40px ${badge.color}10` }} />

                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 border border-white/[0.06] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                    style={{ background: `linear-gradient(135deg, ${badge.color}15, transparent)` }}>
                    <badge.icon className="h-5 w-5" style={{ color: badge.color }} />
                  </div>
                  <span className="text-[10px] font-bold text-white/40">{badge.label}</span>

                  {/* Checkmark */}
                  {badge.unlocked && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-emerald-400" />
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      <BeamDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TESTIMONIAL SPOTLIGHT — Large featured quote                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-4xl">
          <Reveal>
            <GradientBorderCard colors="#a855f7, #3b82f6, #22c55e">
              <div className="p-10 sm:p-14 text-center relative overflow-hidden">
                {/* Background mesh */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, #a855f7 1px, transparent 1px),
                      radial-gradient(circle at 75% 75%, #3b82f6 1px, transparent 1px)`,
                    backgroundSize: "30px 30px",
                  }} />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-white/50">From Our Discord</span>
                  </div>

                  <blockquote className="text-xl sm:text-2xl font-bold text-white/60 leading-relaxed mb-8 max-w-2xl mx-auto italic">
                    &ldquo;I applied on a Monday, had a 15-min Discord call on Tuesday, and by Wednesday I was shipping code. No other team moves this fast.&rdquo;
                  </blockquote>

                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black"
                      style={{ background: "linear-gradient(135deg, #a855f720, #a855f708)", color: "#a855f7", border: "1px solid #a855f720" }}>
                      CI
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white/80">cipher</p>
                      <p className="text-xs text-white/30">Lead Developer · 6 months</p>
                    </div>
                  </div>

                  {/* Star rating */}
                  <div className="flex justify-center gap-1 mt-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400/80 text-amber-400/80" />
                    ))}
                  </div>
                </div>
              </div>
            </GradientBorderCard>
          </Reveal>
        </div>
      </section>


      <SectionDivider color="#eab308" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* APPLICATION FORM                                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="apply-form" ref={formRef} className="relative z-10 py-24 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Reveal>
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
                <Send className="h-3.5 w-3.5" />
                Application Form
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">Apply Now</h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-white/30 text-sm leading-relaxed">Takes 2 minutes. We review every application within 48 hours.</p>
            </Reveal>
          </div>

          {/* Progress bar */}
          <Reveal delay={250}>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-white/20 font-semibold uppercase tracking-wider">Progress</span>
                <span className={`text-[11px] font-black ${pct === 100 ? "text-emerald-400" : "text-primary"}`}>{pct}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${pct === 100 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-primary to-amber-400"}`}
                  style={{ width: `${pct}%` }}
                />
                {/* Glow effect on progress */}
                {pct > 0 && (
                  <div className="absolute top-0 h-full rounded-full blur-sm"
                    style={{
                      width: `${pct}%`,
                      background: pct === 100 ? "rgba(34,197,94,0.3)" : "rgba(239,111,41,0.3)",
                    }} />
                )}
              </div>
            </div>
          </Reveal>

          {/* Step tabs */}
          <Reveal delay={300}>
            <div className="grid grid-cols-3 gap-3 mb-10">
              {["Personal", "Schedule", "Experience"].map((label, i) => {
                const done = (i === 0 && s0) || (i === 1 && s1) || (i === 2 && s2)
                const active = formStep === i
                return (
                  <button key={i} onClick={() => setFormStep(i)}
                    className={`relative py-4 rounded-xl text-xs font-bold transition-all duration-300 overflow-hidden ${
                      active
                        ? "border-2 border-primary/40 text-primary shadow-lg shadow-primary/10"
                        : done
                          ? "border border-emerald-500/25 text-emerald-400 bg-emerald-500/5"
                          : "border border-white/[0.06] text-white/25 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1]"
                    }`}
                    style={active ? { background: "linear-gradient(135deg, rgba(239,111,41,0.08), rgba(239,111,41,0.02))" } : {}}
                  >
                    {/* Active indicator dot */}
                    {active && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                    {done && !active ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="h-3.5 w-3.5" />
                        {label}
                      </span>
                    ) : (
                      `${i + 1}. ${label}`
                    )}
                  </button>
                )
              })}
            </div>
          </Reveal>

          {/* Form card — Glassmorphic with animated conic gradient border */}
          <Reveal delay={350}>
            <div className="relative rounded-[28px] overflow-hidden">
              {/* Animated conic gradient border */}
              <div className="absolute inset-0 rounded-[28px] p-[1px] overflow-hidden">
                <div className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(239,111,41,0.3)_10%,transparent_20%)] animate-[spin_6s_linear_infinite]" />
              </div>

              <div className="relative rounded-[27px] bg-[#0b0b0d]/95 backdrop-blur-xl overflow-hidden">
                {/* Position indicator */}
                {selectedPos && (
                  <>
                    <div className="h-[2px]" style={{
                      background: `linear-gradient(90deg, transparent, ${selectedPos.color}, transparent)`,
                    }} />
                    <div className="px-8 py-5 border-b border-white/[0.04]"
                      style={{ background: `linear-gradient(135deg, ${selectedPos.color}08, transparent)` }}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/[0.06]"
                          style={{ background: `linear-gradient(135deg, ${selectedPos.color}15, ${selectedPos.color}05)` }}>
                          <selectedPos.icon className="h-[22px] w-[22px]" style={{ color: selectedPos.color }} />
                        </div>
                        <div>
                          <p className="font-bold text-white/90">{selectedPos.title}</p>
                          <p className="text-[11px] text-white/25">{selectedPos.openSlots} position{selectedPos.openSlots > 1 ? "s" : ""} available · Remote</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="p-8 sm:p-10">

                  {/* ═══ STEP 0: Personal ═══ */}
                  {formStep === 0 && (
                    <div className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-400">
                      {/* Position */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Position <span className="text-primary">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {POSITIONS.map(p => (
                            <button key={p.id} type="button" onClick={() => setPosition(p.id)}
                              className={`relative flex items-center gap-2.5 p-4 rounded-xl text-xs font-bold transition-all duration-300 overflow-hidden ${
                                position === p.id
                                  ? "border-2 bg-white/[0.03]"
                                  : "border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.01] hover:bg-white/[0.03]"
                              }`}
                              style={position === p.id ? {
                                borderColor: p.color,
                                boxShadow: `0 0 25px ${p.color}15, inset 0 0 20px ${p.color}05`,
                              } : {}}>
                              <p.icon className="h-4 w-4 shrink-0" style={{ color: p.color }} />
                              <span className="truncate">{p.title}</span>
                              {p.popular && position !== p.id && (
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                              )}
                              {position === p.id && (
                                <div className="absolute inset-0 opacity-10"
                                  style={{ background: `radial-gradient(circle at center, ${p.color}, transparent 70%)` }} />
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Role-specific benefits */}
                        {position && <RoleBenefits positionId={position} />}
                      </div>

                      {/* Discord */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Discord <span className="text-primary">*</span>
                        </label>
                        <div className="relative">
                          <input type="text" value={discord} onChange={(e) => setDiscord(e.target.value)}
                            placeholder="your username"
                            className="w-full h-[52px] px-5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm placeholder:text-white/15 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300" />
                          {discord.length >= 2 && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <Check className="h-4 w-4 text-emerald-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Age */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Age <span className="text-primary">*</span>
                        </label>
                        <div className="flex items-center gap-4 w-48">
                          <button type="button" onClick={() => setAge(Math.max(16, age - 1))}
                            className="w-11 h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-90 transition-all duration-200">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="flex-1 text-center text-3xl font-black tabular-nums text-white/90">{age}</span>
                          <button type="button" onClick={() => setAge(Math.min(50, age + 1))}
                            className="w-11 h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-90 transition-all duration-200">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Timezone */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Timezone <span className="text-primary">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {TIMEZONES.map((tz, i) => {
                            const isSelected = timezone === `${tz.v}|${tz.l}`
                            return (
                              <button key={`${tz.l}-${i}`} type="button"
                                onClick={() => setTimezone(`${tz.v}|${tz.l}`)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                                  isSelected
                                    ? "bg-primary/15 text-white border border-primary/30 shadow-lg shadow-primary/10"
                                    : "bg-white/[0.02] border border-white/[0.06] text-white/30 hover:bg-white/[0.05] hover:text-white/50 hover:border-white/[0.1]"
                                }`}>
                                <span className="text-base leading-none">{tz.flag}</span>
                                <span>{tz.l}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Continue */}
                      <button onClick={() => s0 && setFormStep(1)} disabled={!s0}
                        className="w-full py-[18px] rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98]"
                        style={{
                          background: s0 ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${s0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`,
                        }}>
                        Continue <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* ═══ STEP 1: Schedule ═══ */}
                  {formStep === 1 && (
                    <div className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-400">
                      {/* Hours */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Hours / Week <span className="text-primary">*</span>
                        </label>
                        <div className="grid grid-cols-5 gap-2.5">
                          {["5-10h", "10-20h", "20-30h", "30-40h", "40+"].map(h => (
                            <button key={h} type="button" onClick={() => setHoursPerWeek(h)}
                              className={`py-4 rounded-xl text-xs font-bold transition-all duration-300 ${
                                hoursPerWeek === h
                                  ? "neon-btn text-white shadow-lg"
                                  : "bg-white/[0.02] border border-white/[0.06] text-white/30 hover:border-white/[0.12] hover:bg-white/[0.04]"
                              }`}>
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Days */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Available Days <span className="text-primary">*</span>
                        </label>
                        <div className="grid grid-cols-7 gap-2">
                          {DAYS.map(d => (
                            <button key={d} type="button" onClick={() => toggleDay(d)}
                              className={`py-4 rounded-xl text-xs font-bold transition-all duration-300 ${
                                selectedDays.includes(d)
                                  ? "neon-btn text-white shadow-lg"
                                  : "bg-white/[0.02] border border-white/[0.06] text-white/30 hover:border-white/[0.12] hover:bg-white/[0.04]"
                              }`}>
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Preferred Time */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Preferred Time <span className="text-primary">*</span>
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                          {[
                            { v: "Morning", t: "6 — 12", e: "☀️" },
                            { v: "Afternoon", t: "12 — 18", e: "🌤" },
                            { v: "Evening", t: "18 — 00", e: "🌙" },
                            { v: "Night", t: "00 — 06", e: "🌑" },
                            { v: "Flexible", t: "Any", e: "⚡" },
                          ].map(t => (
                            <button key={t.v} type="button" onClick={() => setPreferredTime(t.v)}
                              className={`py-5 rounded-xl text-center transition-all duration-300 ${
                                preferredTime === t.v
                                  ? "bg-primary/10 border-2 border-primary/40 shadow-lg shadow-primary/10"
                                  : "bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
                              }`}>
                              <span className="text-xl block mb-1.5">{t.e}</span>
                              <p className="text-[11px] font-bold text-white/70">{t.v}</p>
                              <p className="text-[9px] text-white/20 mt-0.5">{t.t}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex gap-3">
                        <button onClick={() => setFormStep(0)}
                          className="flex-1 py-[18px] rounded-xl border border-white/[0.06] text-sm font-semibold text-white/30 hover:text-white/60 hover:bg-white/[0.03] hover:border-white/[0.1] transition-all duration-300">
                          Back
                        </button>
                        <button onClick={() => s1 && setFormStep(2)} disabled={!s1}
                          className="flex-[2] py-[18px] rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:-translate-y-0.5"
                          style={{
                            background: s1 ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${s1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`,
                          }}>
                          Continue <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ═══ STEP 2: Experience ═══ */}
                  {formStep === 2 && (
                    <div className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-400">
                      {/* Experience */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Experience <span className="text-primary">*</span>
                        </label>
                        <div className="relative">
                          <textarea value={experience} onChange={(e) => setExperience(e.target.value)}
                            placeholder="Tell us about your relevant experience, skills, past projects..."
                            rows={5}
                            className="w-full px-5 py-4 rounded-xl bg-white/[0.02] text-sm placeholder:text-white/12 focus:outline-none resize-none transition-all duration-300 leading-relaxed"
                            style={{
                              border: `1px solid ${experience.length >= 50 ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.06)"}`,
                              boxShadow: experience.length >= 50 ? "0 0 20px rgba(34,197,94,0.05)" : "none",
                            }} />
                          {/* Character progress ring */}
                          <div className="absolute bottom-3 right-3">
                            <svg width="28" height="28" className="transform -rotate-90">
                              <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
                              <circle cx="14" cy="14" r="11" fill="none"
                                stroke={experience.length >= 50 ? "#22c55e" : "#EF6F29"}
                                strokeWidth="2"
                                strokeDasharray={`${Math.min(experience.length / 50, 1) * 69.1} 69.1`}
                                strokeLinecap="round"
                                className="transition-all duration-300" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
                              style={{ color: experience.length >= 50 ? "#22c55e" : "rgba(255,255,255,0.2)" }}>
                              {experience.length >= 50 ? <Check className="h-2.5 w-2.5" /> : experience.length}
                            </span>
                          </div>
                        </div>
                        <p className={`text-[11px] mt-2 flex items-center gap-1.5 transition-all duration-300 ${experience.length >= 50 ? "text-emerald-400" : "text-white/15"}`}>
                          {experience.length >= 50 ? <><Check className="h-3 w-3" /> Looks good</> : `${experience.length}/50 min characters`}
                        </p>
                      </div>

                      {/* Why Lethal */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Why Lethal? <span className="text-primary">*</span>
                        </label>
                        <div className="relative">
                          <textarea value={whyLethal} onChange={(e) => setWhyLethal(e.target.value)}
                            placeholder="What excites you about this role and our team?"
                            rows={4}
                            className="w-full px-5 py-4 rounded-xl bg-white/[0.02] text-sm placeholder:text-white/12 focus:outline-none resize-none transition-all duration-300 leading-relaxed"
                            style={{
                              border: `1px solid ${whyLethal.length >= 30 ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.06)"}`,
                              boxShadow: whyLethal.length >= 30 ? "0 0 20px rgba(34,197,94,0.05)" : "none",
                            }} />
                          <div className="absolute bottom-3 right-3">
                            <svg width="28" height="28" className="transform -rotate-90">
                              <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
                              <circle cx="14" cy="14" r="11" fill="none"
                                stroke={whyLethal.length >= 30 ? "#22c55e" : "#EF6F29"}
                                strokeWidth="2"
                                strokeDasharray={`${Math.min(whyLethal.length / 30, 1) * 69.1} 69.1`}
                                strokeLinecap="round"
                                className="transition-all duration-300" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
                              style={{ color: whyLethal.length >= 30 ? "#22c55e" : "rgba(255,255,255,0.2)" }}>
                              {whyLethal.length >= 30 ? <Check className="h-2.5 w-2.5" /> : whyLethal.length}
                            </span>
                          </div>
                        </div>
                        <p className={`text-[11px] mt-2 flex items-center gap-1.5 transition-all duration-300 ${whyLethal.length >= 30 ? "text-emerald-400" : "text-white/15"}`}>
                          {whyLethal.length >= 30 ? <><Check className="h-3 w-3" /> Looks good</> : `${whyLethal.length}/30 min characters`}
                        </p>
                      </div>

                      {/* Portfolio */}
                      <div>
                        <label className="text-sm font-bold mb-3.5 block text-white/70">
                          Portfolio <span className="text-white/15 font-normal text-xs ml-1">optional</span>
                        </label>
                        <input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)}
                          placeholder="https://your-portfolio.com"
                          className="w-full h-[52px] px-5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm placeholder:text-white/12 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all duration-300" />
                      </div>

                      {/* Agreements */}
                      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-7 space-y-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/15 mb-2">Agreements</p>
                        {[
                          { c: agree16, s: setAgree16, l: "I confirm I'm at least 16 years old" },
                          { c: agreeActive, s: setAgreeActive, l: "I agree to be active and maintain professionalism" },
                          { c: agreeUnpaid, s: setAgreeUnpaid, l: "I understand this position is initially unpaid / commission-based" },
                        ].map((item, i) => (
                          <label key={i} className="flex items-start gap-4 cursor-pointer group" onClick={() => item.s(!item.c)}>
                            <div className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                              item.c
                                ? "bg-primary border-primary shadow-lg shadow-primary/25"
                                : "border-white/10 group-hover:border-white/25"
                            }`}>
                              {item.c && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span className="text-xs text-white/30 leading-relaxed group-hover:text-white/45 transition-colors">{item.l}</span>
                          </label>
                        ))}
                      </div>

                      {/* Submit */}
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setFormStep(1)}
                          className="flex-1 py-[18px] rounded-xl border border-white/[0.06] text-sm font-semibold text-white/30 hover:text-white/60 hover:bg-white/[0.03] hover:border-white/[0.1] transition-all duration-300">
                          Back
                        </button>
                        <button onClick={handleSubmit} disabled={!s2 || submitting}
                          className="flex-[2] py-[18px] rounded-xl text-white font-bold text-base flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 neon-btn">
                          {submitting ? (
                            <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                          ) : (
                            <>
                              <Send className="h-[18px] w-[18px]" />
                              Submit Application
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      <SectionDivider color="#eab308" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CTA BANNER                                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <Reveal>
            <div className="relative rounded-[24px] overflow-hidden group">
              {/* Background gradient layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-purple-500/10 to-cyan-500/15" />
              <div className="absolute inset-0 bg-[#0a0a0a]/80" />

              {/* Animated scan line */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 h-full w-[30%] opacity-0 group-hover:opacity-100 animate-scan-line"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(239,111,41,0.05), transparent)" }} />
              </div>

              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 px-10 py-8">
                <div>
                  <p className="font-black text-xl mb-1.5">Ready to join the team?</p>
                  <p className="text-sm text-white/35">Applications are reviewed within 48 hours. Zero gatekeeping.</p>
                </div>
                <MagneticButton
                  onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="shrink-0 px-10 py-4 rounded-xl font-bold text-sm flex items-center gap-2.5 neon-btn text-white hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <Send className="h-4 w-4" /> Apply Now
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FAQ                                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-2xl">
          <SectionLabel label="FAQ" />
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-4">Common Questions</h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/25 mb-12 text-sm max-w-md mx-auto leading-relaxed">
              Everything you need to know before applying.
            </p>
          </Reveal>

          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <FaqItem key={i} item={f} index={i} />
            ))}
          </div>
        </div>
      </section>


      <BeamDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* A DAY AT LETHAL — Visual timeline with HexGrid              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24 overflow-hidden">
        <HexGrid />
        <div className="container mx-auto max-w-4xl relative">
          <SectionLabel label="A Day At Lethal" />
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
              What a <GlitchText text="Typical Day" className="text-primary" /> Looks Like
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-center text-white/30 mb-16 max-w-md mx-auto text-sm leading-relaxed">
              No two days are the same, but here&apos;s a peek into the rhythm.
            </p>
          </Reveal>

          <div className="space-y-6">
            {[
              { time: "09:00", title: "Check In", desc: "Quick async standup on Discord. Share what you're working on. No video calls unless needed.", icon: MessageSquare, color: "#3b82f6" },
              { time: "09:30", title: "Deep Work", desc: "Uninterrupted focus time. Code, design, sell — whatever your role demands. Music on, notifications off.", icon: Code2, color: "#a855f7" },
              { time: "12:00", title: "Break", desc: "Go touch grass. Walk your dog. Make food. We don't monitor your screen. Output matters, not hours.", icon: Heart, color: "#ec4899" },
              { time: "13:00", title: "Collaborate", desc: "Work with teammates on shared projects. Review PRs, give feedback, brainstorm ideas in voice channels.", icon: Users, color: "#22c55e" },
              { time: "15:00", title: "Ship It", desc: "Deploy, publish, deliver. We move fast. If it's done, it ships. No approval chains holding you back.", icon: Rocket, color: "#EF6F29" },
              { time: "17:00", title: "Wrap Up", desc: "Log what you shipped, set tomorrow's priorities. Done for the day? Sign off. Need more? Keep going.", icon: Star, color: "#eab308" },
            ].map((block, i) => (
              <Reveal key={i} delay={i * 80} direction="left">
                <div className="group flex gap-6 items-start p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-500 relative overflow-hidden">
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{ background: `radial-gradient(circle at left center, ${block.color}06, transparent 50%)` }} />

                  {/* Time */}
                  <div className="shrink-0 text-center relative z-10">
                    <span className="text-lg font-black font-mono" style={{ color: `${block.color}90` }}>
                      {block.time}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 relative z-10"
                    style={{ background: `linear-gradient(135deg, ${block.color}15, transparent)` }}>
                    <block.icon className="h-5 w-5" style={{ color: block.color }} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h4 className="font-bold text-white/85 mb-1">{block.title}</h4>
                    <p className="text-xs text-white/30 leading-relaxed">{block.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      <SectionDivider color="#06b6d4" />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SOCIAL PROOF NUMBERS — Big impact numbers                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Products Shipped", value: "12", suffix: "+", color: "#EF6F29", desc: "tools & updates launched" },
              { label: "Discord Members", value: "2.5", suffix: "K+", color: "#5865f2", desc: "active community members" },
              { label: "Revenue Shared", value: "$50", suffix: "K+", color: "#22c55e", desc: "paid to team members" },
              { label: "Avg Response Time", value: "4.2", suffix: "min", color: "#3b82f6", desc: "support ticket response" },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 100} direction="scale">
                <div className="group relative rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/60 p-8 text-center hover:border-white/[0.12] transition-all duration-500 overflow-hidden">
                  {/* Background pulse */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: `radial-gradient(circle, ${item.color}08, transparent 70%)` }} />

                  <div className="relative z-10">
                    <p className="text-4xl sm:text-5xl font-black mb-2">
                      <NumberTicker value={item.value + item.suffix} className="text-white" />
                    </p>
                    <p className="text-sm font-bold mb-1" style={{ color: `${item.color}90` }}>{item.label}</p>
                    <p className="text-[11px] text-white/20">{item.desc}</p>
                  </div>

                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-[1.5px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${item.color}40, transparent)` }} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      <BeamDivider />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FINAL CTA — EPIC ENDING                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-4 py-32 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]"
            style={{ background: "radial-gradient(ellipse, rgba(239,111,41,0.08) 0%, transparent 60%)" }} />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px]"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px]"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)" }} />
        </div>

        {/* Floating shapes for drama */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-24 h-24 opacity-[0.03] animate-float-slow">
            <svg viewBox="0 0 100 100"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#EF6F29" strokeWidth="1.5" /></svg>
          </div>
          <div className="absolute top-[20%] right-[8%] w-16 h-16 opacity-[0.03] animate-float-medium rotate-45">
            <svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="none" stroke="#a855f7" strokeWidth="1.5" /></svg>
          </div>
          <div className="absolute bottom-[15%] left-[10%] w-14 h-14 opacity-[0.04] animate-float-fast">
            <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="1.5" /></svg>
          </div>
          <div className="absolute bottom-[25%] right-[5%] w-20 h-20 opacity-[0.03] animate-float-slow">
            <svg viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="none" stroke="#22c55e" strokeWidth="1.5" /></svg>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl text-center relative">
          <Reveal>
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/30" />
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">
                Your Future Starts Here
              </span>
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/30" />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-tight">
              Stop scrolling.<br />
              <span className="bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                <GlitchText text="Start building." />
              </span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-white/35 text-base sm:text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              The best time to join was yesterday.<br className="hidden sm:block" />
              The second best time is <span className="text-primary font-bold">right now</span>.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <MagneticButton
                onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-3 px-14 py-5 rounded-2xl font-bold text-lg neon-btn text-white hover:-translate-y-1 active:scale-[0.97] animate-breathe"
              >
                <Send className="h-5 w-5" />
                Apply Now
                <ArrowRight className="h-5 w-5" />
              </MagneticButton>
            </div>
          </Reveal>

          {/* Trust indicators */}
          <Reveal delay={400}>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {[
                { icon: Shield, text: "48h Response" },
                { icon: Heart, text: "Zero Toxicity" },
                { icon: Zap, text: "Day-One Impact" },
                { icon: Globe, text: "Fully Remote" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/20">
                  <item.icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold">{item.text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PRE-FOOTER MARQUEE — Position icons scrolling               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden py-4 border-t border-b border-white/[0.03]">
        <div className="flex animate-marquee whitespace-nowrap opacity-[0.08]">
          {[...Array(4)].map((_, setIdx) =>
            POSITIONS.map((pos, i) => (
              <span key={`${setIdx}-${i}`} className="mx-6 text-sm font-bold uppercase tracking-wider text-white/50 flex items-center gap-2">
                <pos.icon className="h-3.5 w-3.5" style={{ color: pos.color }} />
                {pos.title}
                <span className="text-primary/50 mx-4">/</span>
              </span>
            ))
          )}
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Footer />


      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PART B ANIMATIONS                                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <PartBAnimations />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* GLOBAL STYLES & ANIMATIONS                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <style jsx global>{`
        /* ─── Page Loader ─── */
        @keyframes loaderProgress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-loader-progress {
          animation: loaderProgress 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-loader-pct {
          animation: fadeIn 0.3s ease forwards 0.5s;
          opacity: 0;
        }

        /* ─── Star Pop ─── */
        @keyframes starPop {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        /* ─── Neon Button ─── */
        .neon-btn {
          background: linear-gradient(135deg, #EF6F29, #FF8C42);
          box-shadow: 0 0 15px rgba(239,111,41,0.3), 0 0 40px rgba(239,111,41,0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .neon-btn:hover {
          box-shadow: 0 0 20px rgba(239,111,41,0.5), 0 0 60px rgba(239,111,41,0.2), 0 0 100px rgba(239,111,41,0.1);
        }
        .neon-btn:disabled {
          box-shadow: none;
          opacity: 0.2;
        }

        /* ─── Aurora Animations ─── */
        @keyframes aurora1 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          25% { transform: translate(5%, 3%) scale(1.1); }
          50% { transform: translate(-3%, 5%) scale(0.95); }
          75% { transform: translate(3%, -3%) scale(1.05); }
        }
        @keyframes aurora2 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          25% { transform: translate(-4%, 2%) scale(1.05); }
          50% { transform: translate(3%, -4%) scale(1.1); }
          75% { transform: translate(-2%, 4%) scale(0.95); }
        }
        @keyframes aurora3 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(5%, -3%) scale(1.08); }
          66% { transform: translate(-4%, 3%) scale(0.95); }
        }
        @keyframes aurora4 {
          0%, 100% { transform: translate(0%, 0%); }
          50% { transform: translate(-6%, -3%); }
        }
        .animate-aurora-1 { animation: aurora1 20s ease-in-out infinite; }
        .animate-aurora-2 { animation: aurora2 25s ease-in-out infinite; }
        .animate-aurora-3 { animation: aurora3 18s ease-in-out infinite; }
        .animate-aurora-4 { animation: aurora4 22s ease-in-out infinite; }

        /* ─── Floating Shapes ─── */
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-15px) rotate(17deg); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow { animation: floatSlow 8s ease-in-out infinite; }
        .animate-float-medium { animation: floatMedium 6s ease-in-out infinite; }
        .animate-float-fast { animation: floatFast 4s ease-in-out infinite; }

        /* ─── Gradient Shift ─── */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift { animation: gradientShift 4s ease-in-out infinite; }

        /* ─── Marquee ─── */
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marqueeReverse {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marquee-reverse { animation: marqueeReverse 35s linear infinite; }

        /* ─── Scan Line ─── */
        @keyframes scanLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-scan-line { animation: scanLine 3s ease-in-out infinite; }

        /* ─── Confetti ─── */
        @keyframes confettiFall {
          0% { transform: translateY(0) scale(0) rotate(0); opacity: 1; }
          15% { transform: translateX(calc(var(--dx) * 0.3)) translateY(15vh) scale(1) rotate(calc(var(--rot) * 0.2)); opacity: 1; }
          100% { transform: translateX(var(--dx)) translateY(var(--fall)) scale(0.3) rotate(var(--rot)); opacity: 0; }
        }

        /* ─── Slide Up ─── */
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* ─── Custom scrollbar ─── */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: rgba(239,111,41,0.3); border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(239,111,41,0.5); }

        /* ─── Selection ─── */
        ::selection { background: rgba(239,111,41,0.3); color: white; }

        /* ─── Smooth scroll ─── */
        html { scroll-behavior: smooth; }

        /* ─── Animate-in utilities ─── */
        .animate-in { animation-fill-mode: both; }
        .fade-in { animation-name: fadeIn; animation-duration: 0.4s; }
        .slide-in-from-right-4 { --tw-enter-translate-x: 16px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(var(--tw-enter-translate-x, 0)); } to { opacity: 1; transform: translateX(0); } }

        /* ─── Orbit animation ─── */
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes counterOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        /* ─── World map scan ─── */
        @keyframes worldScan {
          0% { left: -2%; }
          100% { left: 102%; }
        }
        .animate-world-scan { animation: worldScan 6s linear infinite; }

        /* ─── Beam animation ─── */
        @keyframes beam {
          0% { top: -10%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .animate-beam { animation: beam 2.5s ease-in-out infinite; }

        /* ─── Glitch text ─── */
        .glitch-text {
          position: relative;
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
        }
        .glitch-text:hover::before {
          animation: glitch-1 0.3s linear infinite;
          color: #EF6F29;
          opacity: 0.7;
          clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
        }
        .glitch-text:hover::after {
          animation: glitch-2 0.3s linear infinite;
          color: #3b82f6;
          opacity: 0.7;
          clip-path: polygon(0 66%, 100% 66%, 100% 100%, 0 100%);
        }
        @keyframes glitch-1 {
          0% { transform: translate(0); }
          20% { transform: translate(-3px, 2px); }
          40% { transform: translate(3px, -2px); }
          60% { transform: translate(-2px, 1px); }
          80% { transform: translate(2px, -1px); }
          100% { transform: translate(0); }
        }
        @keyframes glitch-2 {
          0% { transform: translate(0); }
          20% { transform: translate(3px, -2px); }
          40% { transform: translate(-3px, 2px); }
          60% { transform: translate(2px, -1px); }
          80% { transform: translate(-2px, 1px); }
          100% { transform: translate(0); }
        }

        /* ─── Shimmer loading effect ─── */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }

        /* ─── Breathing glow ─── */
        @keyframes breathe {
          0%, 100% { box-shadow: 0 0 20px rgba(239,111,41,0.1); }
          50% { box-shadow: 0 0 40px rgba(239,111,41,0.2), 0 0 80px rgba(239,111,41,0.05); }
        }
        .animate-breathe { animation: breathe 4s ease-in-out infinite; }

        /* ─── Rotate3D ─── */
        @keyframes rotate3d {
          0% { transform: perspective(1000px) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateY(360deg); }
        }

        /* ─── Typewriter cursor ─── */
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink { animation: blink 1s step-end infinite; }

        /* ─── Focus visible ─── */
        *:focus-visible {
          outline: 2px solid rgba(239,111,41,0.5);
          outline-offset: 2px;
          border-radius: 8px;
        }

        /* ─── Spotlight card ─── */
        .spotlight-card:hover .spotlight-gradient {
          opacity: 1;
          background: radial-gradient(
            500px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%),
            rgba(239, 111, 41, 0.06),
            transparent 40%
          );
        }

        /* ─── Skill bar transition ─── */
        .duration-\\[1500ms\\] {
          transition-duration: 1500ms;
        }

        /* ─── Morph blob ─── */
        .animate-morph path {
          transition: d 0.5s ease;
        }

        /* ─── Parallax smooth ─── */
        .parallax-smooth {
          transition: transform 0.1s linear;
        }

        /* ─── Card hover lift ─── */
        .hover-lift {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
        }

        /* ─── Text shadow glow ─── */
        .text-glow {
          text-shadow: 0 0 20px rgba(239,111,41,0.3), 0 0 40px rgba(239,111,41,0.1);
        }

        /* ─── Gradient border animation ─── */
        @keyframes borderRotate {
          0% { --border-angle: 0deg; }
          100% { --border-angle: 360deg; }
        }

        /* ─── Pulsing dot ─── */
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 1; }
        }
        .animate-pulse-dot { animation: pulseDot 2s ease-in-out infinite; }

        /* ─── Typing cursor blink ─── */
        @keyframes cursorBlink {
          0%, 100% { border-color: rgba(239,111,41,0.8); }
          50% { border-color: transparent; }
        }

        /* ─── Slide in from bottom with rotation ─── */
        @keyframes slideInRotate {
          from {
            opacity: 0;
            transform: translateY(40px) rotateX(-10deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotateX(0);
          }
        }
        .animate-slide-in-rotate {
          animation: slideInRotate 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* ─── Hover underline effect ─── */
        .hover-underline {
          position: relative;
        }
        .hover-underline::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #EF6F29, #FF8C42);
          transition: width 0.3s ease;
        }
        .hover-underline:hover::after {
          width: 100%;
        }

        /* ─── Stagger children animation ─── */
        .stagger-children > * {
          opacity: 0;
          animation: fadeSlideUp 0.6s ease forwards;
        }
        .stagger-children > *:nth-child(1) { animation-delay: 0ms; }
        .stagger-children > *:nth-child(2) { animation-delay: 80ms; }
        .stagger-children > *:nth-child(3) { animation-delay: 160ms; }
        .stagger-children > *:nth-child(4) { animation-delay: 240ms; }
        .stagger-children > *:nth-child(5) { animation-delay: 320ms; }
        .stagger-children > *:nth-child(6) { animation-delay: 400ms; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ─── Glass morphism enhanced ─── */
        .glass {
          background: rgba(12, 12, 14, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* ─── Neon text ─── */
        .neon-text {
          color: #EF6F29;
          text-shadow:
            0 0 7px rgba(239,111,41,0.4),
            0 0 10px rgba(239,111,41,0.3),
            0 0 21px rgba(239,111,41,0.2),
            0 0 42px rgba(239,111,41,0.1);
        }

        /* ─── Smooth page transitions ─── */
        section {
          will-change: auto;
        }

        /* ─── NEW: Holographic shimmer ─── */
        @keyframes holographic {
          0%, 100% { transform: rotateY(0deg) rotateX(0deg); }
          25% { transform: rotateY(5deg) rotateX(2deg); }
          50% { transform: rotateY(-3deg) rotateX(-2deg); }
          75% { transform: rotateY(4deg) rotateX(1deg); }
        }
        .animate-holographic {
          animation: holographic 4s ease-in-out infinite;
        }

        /* ─── NEW: Energy pulse ─── */
        @keyframes energyPulse {
          0%, 100% { transform: scale(1); opacity: 0.2; box-shadow: 0 0 0 rgba(239,111,41,0); }
          50% { transform: scale(2); opacity: 0.5; box-shadow: 0 0 20px rgba(239,111,41,0.3); }
        }
        .animate-energy-pulse {
          animation: energyPulse 3s ease-in-out infinite;
        }

        /* ─── NEW: Cyber scan line ─── */
        @keyframes cyberScan {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-cyber-scan {
          animation: cyberScan 4s linear infinite;
        }

        /* ─── NEW: Data flow ─── */
        @keyframes dataFlow {
          0% { transform: translateX(-100%) scaleX(0.5); opacity: 0; }
          20% { opacity: 1; transform: translateX(-50%) scaleX(1); }
          80% { opacity: 1; transform: translateX(50%) scaleX(1); }
          100% { transform: translateX(100%) scaleX(0.5); opacity: 0; }
        }
        .animate-data-flow {
          animation: dataFlow 3s ease-in-out infinite;
        }

        /* ─── NEW: Node pulse ─── */
        @keyframes nodePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,111,41,0.4); }
          50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239,111,41,0); }
        }
        .animate-node-pulse {
          animation: nodePulse 2s ease-in-out infinite;
        }

        /* ─── NEW: Radar sweep ─── */
        @keyframes radarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-radar-sweep {
          animation: radarSweep 4s linear infinite;
        }

        /* ─── NEW: Achievement unlock ─── */
        @keyframes achievementUnlock {
          0% { transform: scale(0) rotateY(180deg); opacity: 0; }
          50% { transform: scale(1.2) rotateY(90deg); opacity: 0.8; }
          100% { transform: scale(1) rotateY(0deg); opacity: 1; }
        }
        .achievement-badge:hover {
          animation: achievementUnlock 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* ─── NEW: Hexagon rotate ─── */
        @keyframes hexRotate {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.05); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .animate-hex-rotate {
          animation: hexRotate 12s linear infinite;
        }

        /* ─── NEW: Perspective grid ─── */
        @keyframes perspectiveShift {
          0%, 100% { transform: perspective(1000px) rotateX(0deg) rotateY(0deg); }
          25% { transform: perspective(1000px) rotateX(2deg) rotateY(3deg); }
          50% { transform: perspective(1000px) rotateX(-1deg) rotateY(-2deg); }
          75% { transform: perspective(1000px) rotateX(1deg) rotateY(2deg); }
        }
        .animate-perspective-shift {
          animation: perspectiveShift 8s ease-in-out infinite;
        }

        /* ─── NEW: Wave propagation ─── */
        @keyframes waveProp {
          0% { transform: translateX(-100%); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .animate-wave-prop {
          animation: waveProp 5s ease-in-out infinite;
        }

        /* ─── Confetti success state ─── */
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes ripple-1 {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.6; }
        }
        @keyframes ripple-2 {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.08); opacity: 0.4; }
        }
        @keyframes ripple-3 {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.2; }
        }
        .animate-ripple-1 { animation: ripple-1 2s ease-in-out infinite; }
        .animate-ripple-2 { animation: ripple-2 2s ease-in-out infinite 0.3s; }
        .animate-ripple-3 { animation: ripple-3 2s ease-in-out infinite 0.6s; }
        @keyframes successBounce {
          from { transform: scale(0) rotate(-10deg); }
          to { transform: scale(1) rotate(0); }
        }

        /* ─── Responsive fixes ─── */
        @media (max-width: 640px) {
          .glitch-text::before,
          .glitch-text::after { display: none; }
        }

        /* ─── Reduced motion ─── */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          .animate-marquee,
          .animate-marquee-reverse,
          .animate-aurora-1,
          .animate-aurora-2,
          .animate-aurora-3,
          .animate-aurora-4,
          .animate-float-slow,
          .animate-float-medium,
          .animate-float-fast,
          .animate-holographic,
          .animate-energy-pulse,
          .animate-cyber-scan,
          .animate-data-flow,
          .animate-node-pulse,
          .animate-radar-sweep,
          .animate-hex-rotate,
          .animate-perspective-shift,
          .animate-wave-prop {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  )
}
