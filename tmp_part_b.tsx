/* ═══════════════════════════════════════════════════════════════════════════ */
/*                                                                           */
/*   ██████╗  █████╗ ██████╗ ████████╗    ██████╗                           */
/*   ██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝    ██╔══██╗                          */
/*   ██████╔╝███████║██████╔╝   ██║       ██████╔╝                          */
/*   ██╔═══╝ ██╔══██║██╔══██╗   ██║       ██╔══██╗                          */
/*   ██║     ██║  ██║██║  ██║   ██║       ██████╔╝                          */
/*   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝       ╚═════╝                          */
/*                                                                           */
/*   CARD COMPONENTS & COMPLEX WIDGETS                                       */
/*   Part B — Concatenated after Part A                                      */
/*                                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════ */
/* 1. GRADIENT BORDER CARD — Animated rotating conic gradient border  */
/* ═══════════════════════════════════════════════════════════════════ */
function GradientBorderCard({
  children,
  className = "",
  colors = "#EF6F29, #a855f7, #3b82f6",
  borderWidth = 1,
  speed = 8,
}: {
  children: React.ReactNode
  className?: string
  colors?: string
  borderWidth?: number
  speed?: number
}) {
  const colorArr = colors.split(",").map(c => c.trim())
  const conicStops = colorArr.map((c, i) => {
    const pct = (i / colorArr.length) * 100
    return `${c} ${pct}%`
  }).join(", ")

  return (
    <div className={`relative rounded-[24px] overflow-hidden group ${className}`}>
      {/* Spinning conic gradient border */}
      <div className="absolute inset-0 rounded-[24px] overflow-hidden">
        <div
          className="absolute inset-[-200%]"
          style={{
            background: `conic-gradient(from 0deg, ${conicStops}, ${colorArr[0]} 100%)`,
            animation: `spin ${speed}s linear infinite`,
          }}
        />
      </div>
      {/* Inner glassmorphic container */}
      <div
        className="relative rounded-[23px] bg-[#0b0b0d]/95 backdrop-blur-xl overflow-hidden"
        style={{ margin: `${borderWidth}px` }}
      >
        {/* Glassmorphism internal reflections */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.01] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
        {/* Hover glow intensification */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${colorArr[0]}08, transparent 70%)`,
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 2. SPOTLIGHT CARD — Card with mouse-following spotlight gradient    */
/* ═══════════════════════════════════════════════════════════════════ */
function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(239,111,41,0.08)",
  spotlightSize = 400,
}: {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
  spotlightSize?: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/80 overflow-hidden hover:border-white/[0.12] transition-all duration-300 ${className}`}
    >
      {/* Spotlight gradient follows mouse */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${spotlightSize}px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 60%)`,
        }}
      />
      {/* Border glow at mouse position */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${spotlightSize * 0.6}px circle at ${mousePos.x}px ${mousePos.y}px, rgba(239,111,41,0.15), transparent 50%)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 3. HOLOGRAPHIC CARD — Rainbow shimmer with prismatic reflections   */
/* ═══════════════════════════════════════════════════════════════════ */
function HolographicCard({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePos({ x, y })
  }, [])

  const angle = Math.atan2(mousePos.y - 0.5, mousePos.x - 0.5) * (180 / Math.PI) + 180
  const intensity = Math.sqrt(
    Math.pow(mousePos.x - 0.5, 2) + Math.pow(mousePos.y - 0.5, 2)
  ) * 2

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-2xl overflow-hidden group cursor-default ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transform: isHovered
          ? `perspective(800px) rotateY(${(mousePos.x - 0.5) * 8}deg) rotateX(${-(mousePos.y - 0.5) * 8}deg)`
          : "perspective(800px) rotateY(0deg) rotateX(0deg)",
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
      }}
    >
      {/* Holographic shimmer layer */}
      <div
        className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300 rounded-2xl"
        style={{
          opacity: isHovered ? 0.6 : 0,
          background: `
            linear-gradient(
              ${angle}deg,
              rgba(255,0,0,0.12) 0%,
              rgba(255,127,0,0.12) 14%,
              rgba(255,255,0,0.12) 28%,
              rgba(0,255,0,0.12) 42%,
              rgba(0,127,255,0.12) 57%,
              rgba(75,0,130,0.12) 71%,
              rgba(143,0,255,0.12) 85%,
              rgba(255,0,0,0.12) 100%
            )
          `,
          backgroundSize: "200% 200%",
          backgroundPosition: `${mousePos.x * 100}% ${mousePos.y * 100}%`,
          mixBlendMode: "overlay",
        }}
      />
      {/* Metallic sheen */}
      <div
        className="absolute inset-0 pointer-events-none z-20 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.4 : 0,
          background: `radial-gradient(
            ellipse at ${mousePos.x * 100}% ${mousePos.y * 100}%,
            rgba(255,255,255,0.25) 0%,
            rgba(255,255,255,0.05) 30%,
            transparent 60%
          )`,
        }}
      />
      {/* Prismatic light streak */}
      <div
        className="absolute inset-0 pointer-events-none z-20 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? intensity * 0.5 : 0,
          background: `linear-gradient(
            ${angle + 90}deg,
            transparent 30%,
            rgba(255,255,255,0.1) 48%,
            rgba(255,255,255,0.2) 50%,
            rgba(255,255,255,0.1) 52%,
            transparent 70%
          )`,
        }}
      />
      {/* Base card */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0c0c0e]/90 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 4. STAT CARD — Enhanced with 3D tilt, sparkles, pulsing glow      */
/* ═══════════════════════════════════════════════════════════════════ */
function StatCard({ stat, index }: { stat: typeof STATS[number]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const tilt = useTilt(cardRef)
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([])
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!isHovered) return
    const interval = setInterval(() => {
      setSparkles(prev => {
        const next = [...prev, {
          id: Date.now() + Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          delay: 0,
        }]
        return next.slice(-8)
      })
    }, 300)
    return () => clearInterval(interval)
  }, [isHovered])

  return (
    <Reveal delay={index * 80} direction="up">
      <div
        ref={cardRef}
        {...tilt}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); tilt.onMouseLeave() }}
        className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04]"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        <div data-shine className="absolute inset-0 pointer-events-none z-10 opacity-0 transition-opacity duration-500 rounded-2xl" />
        <div data-glow className="absolute inset-0 pointer-events-none z-5 opacity-0 transition-opacity duration-500 rounded-2xl" />

        {/* Pulsing glow border on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: `0 0 20px ${stat.color}15, inset 0 0 20px ${stat.color}08`,
            animation: isHovered ? "pulse 2s ease-in-out infinite" : "none",
          }}
        />

        {/* Top accent line */}
        <div className="h-[1.5px] w-full" style={{
          background: `linear-gradient(90deg, transparent, ${stat.color}60, transparent)`,
        }} />

        <div className="p-5 text-center relative">
          {/* Sparkle effects */}
          {sparkles.map(s => (
            <div
              key={s.id}
              className="absolute pointer-events-none z-20"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                animation: "sparkle-fade 0.8s ease-out forwards",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-full h-full" style={{ color: stat.color }}>
                <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10Z" fill="currentColor" />
              </svg>
            </div>
          ))}

          {/* Animated icon */}
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center border border-white/[0.06] transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
              transform: isHovered ? "scale(1.15) rotate(5deg)" : "scale(1) rotate(0deg)",
              boxShadow: isHovered ? `0 0 30px ${stat.color}20` : "none",
            }}
          >
            <stat.icon
              className="h-5 w-5 transition-all duration-500"
              style={{
                color: stat.color,
                filter: isHovered ? `drop-shadow(0 0 6px ${stat.color})` : "none",
              }}
            />
          </div>

          {/* Value with counting animation */}
          <p className="text-2xl font-black text-white mb-1">
            <AnimatedNumber value={stat.value} suffix={stat.suffix} />
          </p>

          {/* Label */}
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{stat.label}</p>

          {/* Hover inner glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ boxShadow: `inset 0 0 40px ${stat.color}08` }} />
        </div>
      </div>
    </Reveal>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 5. POSITION CARD — Enhanced holographic, particles, energy waves   */
/* ═══════════════════════════════════════════════════════════════════ */
function PositionCard({
  pos,
  onApply,
  index,
}: {
  pos: typeof POSITIONS[number]
  onApply: (id: string) => void
  index: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const tilt = useTilt(cardRef)
  const [hovered, setHovered] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; angle: number }>>([])
  const [reqsVisible, setReqsVisible] = useState<boolean[]>([])

  // Staggered requirements reveal
  useEffect(() => {
    if (!hovered) {
      setReqsVisible([])
      return
    }
    pos.requirements.forEach((_, i) => {
      setTimeout(() => {
        setReqsVisible(prev => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, i * 150)
    })
  }, [hovered, pos.requirements])

  // Particle burst on hover
  useEffect(() => {
    if (!hovered) { setParticles([]); return }
    const burst: typeof particles = []
    for (let i = 0; i < 12; i++) {
      burst.push({
        id: Date.now() + i,
        x: 50 + (Math.random() - 0.5) * 60,
        y: 50 + (Math.random() - 0.5) * 60,
        angle: (i / 12) * 360,
      })
    }
    setParticles(burst)
    const t = setTimeout(() => setParticles([]), 1000)
    return () => clearTimeout(t)
  }, [hovered])

  return (
    <Reveal delay={index * 100} direction="up">
      <div
        ref={cardRef}
        {...tilt}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); tilt.onMouseLeave() }}
        className="group relative rounded-[20px] border border-white/[0.06] bg-[#0c0c0e]/80 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-white/[0.12]"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* Holographic animated border */}
        <div className="absolute inset-0 rounded-[20px] p-[1px] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div
            className="absolute inset-[-200%]"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, ${pos.color}50 5%, #a855f740 10%, #3b82f640 15%, transparent 20%)`,
              animation: "spin 6s linear infinite",
            }}
          />
        </div>

        {/* Animated gradient sweep on hover */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `linear-gradient(135deg, ${pos.color}06, transparent 40%, ${pos.color}04 60%, transparent 80%)`,
            animation: hovered ? "gradient-sweep 3s ease infinite" : "none",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Particle burst overlay */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none z-30"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: pos.color,
              boxShadow: `0 0 6px ${pos.color}`,
              animation: "particle-burst 0.8s ease-out forwards",
              transform: `translate(${Math.cos(p.angle * Math.PI / 180) * 80}px, ${Math.sin(p.angle * Math.PI / 180) * 80}px)`,
            }}
          />
        ))}

        <div data-shine className="absolute inset-0 pointer-events-none z-10 opacity-0 transition-opacity duration-500 rounded-[20px]" />
        <div data-glow className="absolute inset-0 pointer-events-none z-5 opacity-0 transition-opacity duration-500 rounded-[20px]" />

        {/* Top accent line with scanning effect */}
        <div className="h-[2px] w-full relative overflow-hidden">
          <div className="h-full w-full" style={{
            background: `linear-gradient(90deg, transparent, ${pos.color}, transparent)`,
            opacity: hovered ? 0.8 : 0.4,
            transition: "opacity 0.5s ease",
          }} />
          <div
            className="absolute top-0 h-full w-[60%] opacity-0 group-hover:opacity-100"
            style={{
              background: `linear-gradient(90deg, transparent, ${pos.color}80, transparent)`,
              animation: "scan-line 2s linear infinite",
            }}
          />
        </div>

        <div className="p-7 relative z-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="relative">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/[0.06] transition-all duration-500 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${pos.color}20, ${pos.color}05)`,
                  transform: hovered ? "scale(1.1) rotate(3deg)" : "scale(1)",
                  boxShadow: hovered ? `0 0 40px ${pos.color}20` : "none",
                }}
              >
                <pos.icon className="h-6 w-6 relative z-10" style={{ color: pos.color }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(circle, ${pos.color}25, transparent 70%)` }} />
              </div>
              {/* Orbiting ring */}
              <div
                className="absolute -inset-3 rounded-2xl border opacity-0 group-hover:opacity-100 transition-all duration-700"
                style={{
                  borderColor: `${pos.color}20`,
                  animation: hovered ? "pulse 2s ease-in-out infinite" : "none",
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              {/* HOT floating badge */}
              {pos.popular && (
                <span
                  className="text-[9px] px-2.5 py-1 rounded-full font-black border relative"
                  style={{
                    background: `${pos.color}15`,
                    borderColor: `${pos.color}30`,
                    color: pos.color,
                    animation: "float-badge 2s ease-in-out infinite",
                    boxShadow: `0 0 15px ${pos.color}20`,
                  }}
                >
                  <span className="relative z-10">HOT</span>
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                      background: `${pos.color}20`,
                    }}
                  />
                </span>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400">{pos.openSlots} open</span>
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-xl font-black mb-2 group-hover:text-white transition-colors duration-300">
            {pos.title}
          </h3>
          <p className="text-sm text-white/30 mb-6 leading-relaxed">{pos.description}</p>

          {/* Animated Requirements */}
          <div className="space-y-2.5 mb-6">
            {pos.requirements.map((req, j) => (
              <div
                key={j}
                className="flex items-start gap-3 group/req"
                style={{
                  opacity: hovered ? (reqsVisible[j] ? 1 : 0.3) : 1,
                  transform: hovered ? (reqsVisible[j] ? "translateX(0)" : "translateX(-8px)") : "translateX(0)",
                  transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${j * 80}ms`,
                }}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 group-hover/req:scale-110"
                  style={{ background: `${pos.color}12` }}
                >
                  <Check className="h-3 w-3" style={{ color: pos.color }} />
                </div>
                <span className="text-xs text-white/30 leading-relaxed group-hover/req:text-white/50 transition-colors">
                  {req}
                </span>
              </div>
            ))}
          </div>

          {/* Perks */}
          <div className="flex flex-wrap gap-2 mb-6">
            {pos.perks.map((p, j) => (
              <span
                key={j}
                className="text-[10px] px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-white/25 font-semibold hover:bg-white/[0.06] hover:text-white/40 transition-all cursor-default"
              >
                {p}
              </span>
            ))}
          </div>

          {/* Apply Button with energy wave */}
          <button
            onClick={() => onApply(pos.id)}
            className="relative w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 overflow-hidden transition-all duration-500 group/btn"
            style={{
              background: hovered
                ? `linear-gradient(135deg, ${pos.color}20, ${pos.color}10)`
                : "rgba(255,255,255,0.03)",
              border: `1px solid ${hovered ? pos.color + "40" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            {/* Energy wave effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover/btn:opacity-100"
              style={{
                background: `radial-gradient(circle at center, ${pos.color}15, transparent 70%)`,
                animation: "energy-wave 1.5s ease-in-out infinite",
              }}
            />
            {/* Sweep effect */}
            <div
              className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"
              style={{
                background: `linear-gradient(90deg, transparent, ${pos.color}20, transparent)`,
              }}
            />
            <span className="relative z-10 tracking-wide">Apply Now</span>
            <ArrowRight
              className="h-4 w-4 relative z-10 group-hover/btn:translate-x-1 transition-transform duration-300"
              style={{ color: hovered ? pos.color : "rgba(255,255,255,0.3)" }}
            />
          </button>
        </div>

        {/* Bottom ambient glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ boxShadow: `0 0 30px 10px ${pos.color}10` }}
        />
      </div>
    </Reveal>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 6. TESTIMONIAL CARD — Enhanced 3D tilt, animated quotes, ratings   */
/* ═══════════════════════════════════════════════════════════════════ */
function TestimonialCard({ quote, index }: { quote: typeof TEAM_QUOTES[number]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const tilt = useTilt(cardRef)
  const { ref: viewRef, inView } = useInView(0.3)
  const [starsVisible, setStarsVisible] = useState<boolean[]>([])

  // Stagger star animation
  useEffect(() => {
    if (!inView) return
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        setStarsVisible(prev => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, 300 + i * 120)
    }
  }, [inView])

  return (
    <Reveal delay={index * 120} direction="up">
      <div ref={viewRef}>
        <div
          ref={cardRef}
          {...tilt}
          className="group relative rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/80 backdrop-blur-xl overflow-hidden hover:border-white/[0.12] transition-all duration-500"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >
          <div data-shine className="absolute inset-0 pointer-events-none z-10 opacity-0 transition-opacity duration-500 rounded-2xl" />

          {/* Top accent */}
          <div className="h-[2px] w-full" style={{
            background: `linear-gradient(90deg, transparent, ${quote.color}, transparent)`,
            opacity: 0.4,
          }} />

          <div className="p-7">
            {/* Animated quote marks */}
            <div className="relative mb-2">
              <span
                className="absolute -top-2 -left-1 text-5xl font-serif leading-none transition-all duration-700"
                style={{
                  color: `${quote.color}20`,
                  transform: inView ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.8)",
                  opacity: inView ? 1 : 0,
                }}
              >
                &ldquo;
              </span>
            </div>

            {/* Stars with stagger */}
            <div className="flex gap-1 mb-5 ml-1">
              {[...Array(5)].map((_, j) => (
                <Star
                  key={j}
                  className="h-3.5 w-3.5 transition-all duration-500"
                  style={{
                    fill: starsVisible[j] ? "rgba(251,191,36,0.8)" : "transparent",
                    color: starsVisible[j] ? "rgba(251,191,36,0.8)" : "rgba(255,255,255,0.1)",
                    transform: starsVisible[j] ? "scale(1) rotate(0deg)" : "scale(0.5) rotate(-30deg)",
                    transitionDelay: `${j * 80}ms`,
                  }}
                />
              ))}
            </div>

            {/* Quote */}
            <p className="text-sm text-white/45 leading-[1.8] mb-6 italic pl-2">
              {quote.text}&rdquo;
            </p>

            {/* Author with status ring */}
            <div className="flex items-center gap-3.5 pt-5 border-t border-white/[0.04]">
              <div className="relative">
                {/* Status ring */}
                <div
                  className="absolute -inset-1 rounded-xl"
                  style={{
                    background: `conic-gradient(from 0deg, ${quote.color}, ${quote.color}40, ${quote.color})`,
                    animation: "spin 4s linear infinite",
                    opacity: 0.4,
                  }}
                />
                <div
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black tracking-wider"
                  style={{
                    background: `linear-gradient(135deg, ${quote.color}20, ${quote.color}08)`,
                    color: quote.color,
                    border: `1px solid ${quote.color}20`,
                  }}
                >
                  {quote.avatar}
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0c0c0e]">
                  <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-white/80">{quote.name}</p>
                <p className="text-[11px] text-white/25">{quote.role} · {quote.time}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 7. PERK CARD — Enhanced with bounce, glow, float animation         */
/* ═══════════════════════════════════════════════════════════════════ */
function PerkCard({ perk, index }: { perk: typeof PERKS_GRID[number]; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Reveal delay={index * 60} direction="up">
      <div
        className="group rounded-2xl bg-white/[0.02] border border-white/[0.04] p-6 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-500 relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          animation: `float-gentle ${3 + (index % 3) * 0.5}s ease-in-out infinite`,
          animationDelay: `${index * 200}ms`,
        }}
      >
        {/* Gradient background shift */}
        <div
          className="absolute inset-0 transition-all duration-700 pointer-events-none"
          style={{
            background: isHovered
              ? `radial-gradient(circle at top left, ${perk.color}10, transparent 60%)`
              : `radial-gradient(circle at top left, ${perk.color}03, transparent 60%)`,
          }}
        />

        <div className="relative z-10">
          {/* Icon with bounce + glow on hover */}
          <div
            className="w-11 h-11 rounded-xl border border-white/[0.06] flex items-center justify-center mb-4 transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${perk.color}12, transparent)`,
              transform: isHovered ? "scale(1.15) rotate(5deg) translateY(-4px)" : "scale(1) rotate(0deg)",
              boxShadow: isHovered ? `0 8px 30px ${perk.color}25, 0 0 15px ${perk.color}15` : "none",
            }}
          >
            <perk.icon
              className="h-5 w-5 transition-all duration-500"
              style={{
                color: perk.color,
                filter: isHovered ? `drop-shadow(0 0 8px ${perk.color})` : "none",
              }}
            />
          </div>
          <h4 className="font-bold mb-2 text-white/90 group-hover:text-white transition-colors">{perk.title}</h4>
          <p className="text-xs text-white/25 leading-relaxed group-hover:text-white/35 transition-colors">{perk.desc}</p>
        </div>

        {/* Bottom line glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-500"
          style={{
            opacity: isHovered ? 0.6 : 0,
            background: `linear-gradient(90deg, transparent, ${perk.color}, transparent)`,
          }}
        />
      </div>
    </Reveal>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 8. FLIP CARD — Enhanced smoother 3D, edge glow, content fade-in    */
/* ═══════════════════════════════════════════════════════════════════ */
function FlipCard({
  front,
  back,
  color = "#EF6F29",
}: {
  front: React.ReactNode
  back: React.ReactNode
  color?: string
}) {
  const [flipped, setFlipped] = useState(false)
  const [contentVisible, setContentVisible] = useState(true)

  const handleFlip = () => {
    setContentVisible(false)
    setFlipped(!flipped)
    setTimeout(() => setContentVisible(true), 400)
  }

  return (
    <div
      className="cursor-pointer group"
      style={{ perspective: "1200px" }}
      onClick={handleFlip}
    >
      <div
        className="relative transition-transform duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Edge glow during flip transition */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-30 transition-opacity duration-300"
          style={{
            opacity: 0,
            boxShadow: `0 0 30px ${color}30, inset 0 0 30px ${color}10`,
            animation: flipped ? "edge-glow-flash 0.7s ease-out" : "none",
          }}
        />

        {/* Front face */}
        <div
          className="rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/90 backdrop-blur-sm overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.4 }} />
          <div
            className="p-6 pb-8 transition-opacity duration-300"
            style={{ opacity: !flipped && contentVisible ? 1 : 0 }}
          >
            {front}
          </div>
          <div className="absolute bottom-3 right-3 text-[9px] text-white/15 font-mono flex items-center gap-1 group-hover:text-white/30 transition-colors">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h4l3-9 4 18 3-9h4" />
            </svg>
            flip
          </div>
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/95 backdrop-blur-sm overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.6 }} />
          <div
            className="p-6 pb-8 transition-opacity duration-300"
            style={{ opacity: flipped && contentVisible ? 1 : 0 }}
          >
            {back}
          </div>
          <div className="absolute bottom-3 right-3 text-[9px] text-white/15 font-mono">flip back</div>
        </div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 9. FAQ ITEM — Enhanced accordion, animated chevron, blur-to-sharp  */
/* ═══════════════════════════════════════════════════════════════════ */
function FaqItem({ item, index }: { item: typeof FAQ[number]; index: number }) {
  const [open, setOpen] = useState(false)
  const [flashActive, setFlashActive] = useState(false)

  const handleToggle = () => {
    const willOpen = !open
    setOpen(willOpen)
    if (willOpen) {
      setFlashActive(true)
      setTimeout(() => setFlashActive(false), 600)
    }
  }

  return (
    <Reveal delay={index * 80} direction="up">
      <div
        className="group rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/60 backdrop-blur-sm overflow-hidden transition-all duration-300 relative"
        style={{
          borderColor: open ? "rgba(239,111,41,0.15)" : "rgba(255,255,255,0.04)",
        }}
      >
        {/* Highlight flash on open */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-600"
          style={{
            opacity: flashActive ? 1 : 0,
            background: "radial-gradient(ellipse at center, rgba(239,111,41,0.06), transparent 70%)",
          }}
        />

        <button
          onClick={handleToggle}
          className="flex items-center justify-between w-full p-6 text-left cursor-pointer"
        >
          <span className="text-sm font-bold text-white/80 pr-4 group-hover:text-white transition-colors">{item.q}</span>
          <div
            className="w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center shrink-0 transition-all duration-500"
            style={{
              borderColor: open ? "rgba(239,111,41,0.3)" : "rgba(255,255,255,0.08)",
              background: open ? "rgba(239,111,41,0.1)" : "rgba(255,255,255,0.02)",
              transform: `rotate(${open ? 90 : 0}deg)`,
            }}
          >
            <ChevronRight className="h-4 w-4 transition-colors duration-300" style={{ color: open ? "#EF6F29" : "rgba(255,255,255,0.2)" }} />
          </div>
        </button>

        <div
          className="overflow-hidden transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            maxHeight: open ? "300px" : "0px",
            opacity: open ? 1 : 0,
          }}
        >
          <div className="px-6 pb-6 pt-0">
            <div className="h-px w-full bg-white/[0.04] mb-4" />
            {/* Content with blur-to-sharp transition */}
            <p
              className="text-sm text-white/35 leading-[1.8] transition-all duration-700"
              style={{
                filter: open ? "blur(0px)" : "blur(4px)",
                transform: open ? "translateY(0)" : "translateY(8px)",
              }}
            >
              {item.a}
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 10. PROCESS STEP — Enhanced connector lines, number glow, orbit    */
/* ═══════════════════════════════════════════════════════════════════ */
function ProcessStep({
  step,
  index,
  total,
}: {
  step: {
    step: string
    title: string
    desc: string
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
    color: string
  }
  index: number
  total: number
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Reveal delay={index * 150} direction="up">
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated connector line */}
        {index < total - 1 && (
          <div className="hidden sm:flex absolute top-12 -right-[16px] z-20 items-center">
            <div className="relative">
              <ChevronRight className="h-4 w-4 text-white/10" />
              {/* Animated energy dot traveling along connector */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
                style={{
                  background: step.color,
                  boxShadow: `0 0 6px ${step.color}`,
                  animation: "connector-travel 2s ease-in-out infinite",
                  animationDelay: `${index * 500}ms`,
                }}
              />
            </div>
          </div>
        )}

        <div className="group rounded-2xl border border-white/[0.04] bg-[#0c0c0e]/60 backdrop-blur-sm p-7 text-center hover:border-white/[0.1] transition-all duration-500 relative overflow-hidden">
          {/* Background glow */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: `radial-gradient(circle at center, ${step.color}06, transparent 70%)` }}
          />

          {/* Step label */}
          <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-5 block relative z-10" style={{ color: `${step.color}50` }}>
            Step {step.step}
          </span>

          {/* Icon with orbiting animation on hover */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/[0.06] transition-all duration-500 relative"
              style={{
                background: `linear-gradient(135deg, ${step.color}15, transparent)`,
                transform: isHovered ? "scale(1.1) rotate(3deg)" : "scale(1)",
                boxShadow: isHovered ? `0 0 40px ${step.color}15` : "none",
              }}
            >
              <step.icon className="h-7 w-7 relative z-10" style={{ color: step.color }} />
              <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `${step.color}20` }} />
            </div>
            {/* Orbiting dot */}
            {isHovered && (
              <div
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: step.color,
                  boxShadow: `0 0 8px ${step.color}`,
                  top: "50%",
                  left: "50%",
                  animation: "orbit-small 2s linear infinite",
                }}
              />
            )}
          </div>

          <h4 className="font-black text-xl mb-2.5 relative z-10">{step.title}</h4>
          <p className="text-xs text-white/30 leading-relaxed max-w-[220px] mx-auto relative z-10">{step.desc}</p>

          {/* Number watermark with glow */}
          <div
            className="absolute top-3 right-4 text-[80px] font-black leading-none select-none pointer-events-none transition-all duration-500"
            style={{
              opacity: isHovered ? 0.06 : 0.02,
              color: isHovered ? step.color : "white",
              textShadow: isHovered ? `0 0 40px ${step.color}30` : "none",
            }}
          >
            {step.step}
          </div>
        </div>
      </div>
    </Reveal>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 11. ACHIEVEMENT BADGE — Hexagonal, unlocked animation, particles   */
/* ═══════════════════════════════════════════════════════════════════ */
function AchievementBadge({
  title,
  description,
  icon: Icon,
  color = "#EF6F29",
  unlocked = true,
  index = 0,
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color?: string
  unlocked?: boolean
  index?: number
}) {
  const { ref, inView } = useInView(0.3)
  const [showParticles, setShowParticles] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (inView && unlocked && !hasAnimated) {
      setTimeout(() => {
        setShowParticles(true)
        setHasAnimated(true)
        setTimeout(() => setShowParticles(false), 1200)
      }, index * 200 + 400)
    }
  }, [inView, unlocked, hasAnimated, index])

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center group"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)",
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${index * 150}ms`,
        filter: unlocked ? "none" : "grayscale(1) opacity(0.4)",
      }}
    >
      {/* Particle burst */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none z-30">
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i / 10) * 360
            return (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  left: "50%",
                  top: "40%",
                  background: color,
                  boxShadow: `0 0 6px ${color}`,
                  animation: "achievement-particle 0.8s ease-out forwards",
                  transform: `rotate(${angle}deg) translateX(0px)`,
                  animationDelay: `${i * 30}ms`,
                }}
              />
            )
          })}
        </div>
      )}

      {/* Hexagonal badge */}
      <div className="relative mb-3">
        {/* Golden glow for unlocked */}
        {unlocked && (
          <div
            className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: `radial-gradient(circle, ${color}20, transparent 60%)`,
              filter: "blur(8px)",
            }}
          />
        )}

        <svg viewBox="0 0 100 115" className="w-20 h-20 relative z-10">
          {/* Hexagon shape */}
          <polygon
            points="50,2 95,28 95,87 50,113 5,87 5,28"
            fill={unlocked ? `${color}10` : "rgba(255,255,255,0.02)"}
            stroke={unlocked ? color : "rgba(255,255,255,0.1)"}
            strokeWidth="2"
            className="transition-all duration-500"
            style={{
              filter: unlocked ? `drop-shadow(0 0 10px ${color}30)` : "none",
            }}
          />
          {/* Inner hexagon */}
          <polygon
            points="50,15 85,35 85,80 50,100 15,80 15,35"
            fill="none"
            stroke={unlocked ? `${color}30` : "rgba(255,255,255,0.05)"}
            strokeWidth="1"
          />
        </svg>

        {/* Icon centered in hex */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon
            className="h-7 w-7 transition-all duration-500"
            style={{
              color: unlocked ? color : "rgba(255,255,255,0.2)",
              filter: unlocked ? `drop-shadow(0 0 6px ${color}60)` : "none",
              transform: inView && unlocked ? "scale(1)" : "scale(0.7)",
              transition: "all 0.5s ease",
            }}
          />
        </div>

        {/* Lock overlay */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center border border-white/10">
              <svg className="w-3 h-3 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs font-bold text-white/70 text-center">{title}</p>
      <p className="text-[10px] text-white/30 text-center mt-0.5">{description}</p>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 12. TERMINAL ANIMATION — Enhanced realistic terminal                */
/* ═══════════════════════════════════════════════════════════════════ */
function TerminalAnimation() {
  const [started, setStarted] = useState(false)
  const [tick, setTick] = useState(0)
  const [typedLines, setTypedLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const { ref, inView } = useInView(0.3)

  useEffect(() => { if (inView && !started) setStarted(true) }, [inView, started])

  // Typing animation for terminal lines
  useEffect(() => {
    if (!started) return
    if (currentLine >= TERMINAL_LINES.length) return

    const line = TERMINAL_LINES[currentLine]
    if (currentChar < line.text.length) {
      const speed = line.type === "cmd" ? 30 : 10
      const t = setTimeout(() => setCurrentChar(prev => prev + 1), speed)
      return () => clearTimeout(t)
    } else {
      setTypedLines(prev => [...prev, line.text])
      const delay = line.type === "blank" ? 200 : line.type === "cmd" ? 600 : 300
      const t = setTimeout(() => {
        setCurrentLine(prev => prev + 1)
        setCurrentChar(0)
      }, delay)
      return () => clearTimeout(t)
    }
  }, [started, currentLine, currentChar])

  // Live counter tick
  useEffect(() => {
    if (!started) return
    const interval = setInterval(() => setTick(t => t + 1), 2000)
    return () => clearInterval(interval)
  }, [started])

  const metrics = [
    { label: "UPTIME", value: "99.8%", color: "#22c55e", bar: 99.8 },
    { label: "LOAD", value: `${(12 + (tick % 5)).toFixed(1)}%`, color: "#3b82f6", bar: 12 + (tick % 5) },
    { label: "ORDERS", value: `${774 + tick}`, color: "#eab308", bar: 85 },
    { label: "DETECT", value: "0", color: "#22c55e", bar: 0 },
  ]

  const syntaxHighlight = (text: string, type: string) => {
    if (type === "cmd") {
      return (
        <>
          <span className="text-emerald-400/70">$</span>
          <span className="text-white/50">{text.slice(1)}</span>
        </>
      )
    }
    if (type === "ok") return <span className="text-emerald-400/60">{text}</span>
    if (type === "info") return <span className="text-blue-400/60">{text}</span>
    if (type === "prompt") return <span className="text-primary/70">{text}</span>
    return <span className="text-white/30">{text}</span>
  }

  return (
    <div ref={ref} className="w-full max-w-lg">
      <div className="relative group">
        {/* Outer glow */}
        <div className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-1000"
          style={{ background: "linear-gradient(135deg, rgba(239,111,41,0.15), rgba(168,85,247,0.1), rgba(59,130,246,0.1))" }} />

        <div className="relative rounded-2xl border border-white/[0.08] bg-[#08080a]/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/60">
          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none z-30 opacity-[0.03]"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
              animation: "scanline-scroll 10s linear infinite",
            }}
          />

          {/* Title bar with working buttons appearance */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-500 transition-colors cursor-pointer relative group/btn">
                <span className="absolute inset-0 flex items-center justify-center text-[6px] text-red-900 font-bold opacity-0 group-hover/btn:opacity-100">x</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/70 hover:bg-yellow-500 transition-colors cursor-pointer relative group/btn">
                <span className="absolute inset-0 flex items-center justify-center text-[6px] text-yellow-900 font-bold opacity-0 group-hover/btn:opacity-100">-</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/70 hover:bg-emerald-500 transition-colors cursor-pointer relative group/btn">
                <span className="absolute inset-0 flex items-center justify-center text-[6px] text-emerald-900 font-bold opacity-0 group-hover/btn:opacity-100">+</span>
              </div>
            </div>
            <div className="flex-1 text-center">
              <span className="text-[11px] text-white/25 font-mono">LETHAL -- System Dashboard v2.14</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-emerald-400/70 font-mono">LIVE</span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Live metrics grid with animated bars */}
            <div className="grid grid-cols-4 gap-2">
              {metrics.map((m, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2.5 text-center group/metric hover:bg-white/[0.04] transition-all duration-300"
                  style={{
                    opacity: started ? 1 : 0,
                    transform: started ? "translateY(0)" : "translateY(10px)",
                    transition: `all 0.5s ease ${200 + i * 100}ms`,
                  }}
                >
                  <p className="text-[8px] font-bold tracking-widest mb-1" style={{ color: `${m.color}60` }}>{m.label}</p>
                  <p className="text-base font-black font-mono tabular-nums" style={{ color: m.color }}>{m.value}</p>
                  <div className="h-1 bg-white/[0.04] rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 relative"
                      style={{ width: `${m.bar}%`, background: `linear-gradient(90deg, ${m.color}80, ${m.color})` }}
                    >
                      {/* Shimmer on bar */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                          backgroundSize: "200% 100%",
                          animation: "shimmer 2s linear infinite",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Typing terminal output */}
            <div
              className="rounded-lg bg-black/40 border border-white/[0.04] p-4 font-mono text-[11px] leading-[1.9] min-h-[140px]"
              style={{
                opacity: started ? 1 : 0,
                transition: "opacity 0.8s ease 0.6s",
              }}
            >
              {typedLines.map((line, i) => (
                <div key={i}>{syntaxHighlight(line, TERMINAL_LINES[i]?.type || "info")}</div>
              ))}
              {/* Currently typing line */}
              {currentLine < TERMINAL_LINES.length && (
                <div>
                  {syntaxHighlight(
                    TERMINAL_LINES[currentLine].text.slice(0, currentChar),
                    TERMINAL_LINES[currentLine].type
                  )}
                  {/* Blinking cursor */}
                  <span
                    className="inline-block w-[7px] h-[14px] ml-0.5 align-middle rounded-sm"
                    style={{
                      background: "#EF6F29",
                      animation: "blink-cursor 1s step-end infinite",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Team activity feed */}
            <div
              className="space-y-1.5"
              style={{
                opacity: started ? 1 : 0,
                transition: "opacity 0.8s ease 1.2s",
              }}
            >
              {[
                { name: "cipher", action: "deployed hotfix", time: "2m", color: "#a855f7" },
                { name: "nova", action: "closed 3 tickets", time: "5m", color: "#22c55e" },
                { name: "vex", action: "new reseller deal", time: "8m", color: "#eab308" },
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black"
                    style={{ background: `${e.color}15`, color: e.color }}>
                    {e.name[0].toUpperCase()}
                  </div>
                  <span className="text-[11px] text-white/30 flex-1">
                    <span className="text-white/50 font-semibold">{e.name}</span> {e.action}
                  </span>
                  <span className="text-[9px] text-white/15 font-mono">{e.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="flex items-center justify-between px-5 py-2 border-t border-white/[0.04] bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-white/20 font-mono">all systems go</span>
              </div>
              <div className="h-3 w-px bg-white/[0.06]" />
              <span className="text-[9px] text-white/15 font-mono">{POSITIONS.reduce((s, p) => s + p.openSlots, 0)} open roles</span>
            </div>
            <span className="text-[9px] text-primary/40 font-mono font-bold">HIRING</span>
          </div>
        </div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 13. TECH ORBIT — Enhanced multi-ring, connecting lines, pulse core */
/* ═══════════════════════════════════════════════════════════════════ */
function TechOrbit() {
  const { ref, inView } = useInView(0.2)
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)

  const rings = [
    { radius: 100, items: TECH_STACK.slice(0, 4), speed: 25, direction: 1 },
    { radius: 170, items: TECH_STACK.slice(4), speed: 35, direction: -1 },
  ]

  return (
    <div ref={ref} className="relative w-[380px] h-[380px] sm:w-[440px] sm:h-[440px] mx-auto">
      {/* Center core with pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center backdrop-blur-sm relative">
          <span className="text-2xl font-black text-primary">L</span>
          {/* Inner pulse */}
          <div className="absolute inset-0 rounded-2xl"
            style={{
              background: "radial-gradient(circle, rgba(239,111,41,0.15), transparent 70%)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        </div>
        {/* Multi-layer pulse rings */}
        <div className="absolute inset-0 rounded-2xl border border-primary/20 animate-[ping_3s_ease-out_infinite]" />
        <div className="absolute -inset-3 rounded-3xl border border-primary/10 animate-[ping_3s_ease-out_0.5s_infinite]" />
        <div className="absolute -inset-6 rounded-3xl border border-primary/5 animate-[ping_3s_ease-out_1s_infinite]" />
      </div>

      {/* Orbit ring outlines */}
      {rings.map((ring, ri) => (
        <div
          key={ri}
          className="absolute rounded-full border border-dashed"
          style={{
            width: ring.radius * 2,
            height: ring.radius * 2,
            top: `calc(50% - ${ring.radius}px)`,
            left: `calc(50% - ${ring.radius}px)`,
            borderColor: `rgba(255,255,255,${ri === 0 ? 0.04 : 0.03})`,
          }}
        />
      ))}

      {/* Connecting lines between items */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-5" style={{ opacity: 0.06 }}>
        {TECH_STACK.map((t1, i) =>
          TECH_STACK.filter((_, j) => j > i && (i + j) % 2 === 0).map((t2, j) => {
            const r1 = i < 4 ? rings[0].radius : rings[1].radius
            const r2 = (i + j + 1) < 4 ? rings[0].radius : rings[1].radius
            const angle1 = t1.angle * Math.PI / 180
            const angle2 = t2.angle * Math.PI / 180
            const cx = 220, cy = 220
            return (
              <line
                key={`${i}-${j}`}
                x1={cx + Math.cos(angle1) * r1}
                y1={cy + Math.sin(angle1) * r1}
                x2={cx + Math.cos(angle2) * r2}
                y2={cy + Math.sin(angle2) * r2}
                stroke="#EF6F29"
                strokeWidth="0.5"
                strokeDasharray="4,6"
              />
            )
          })
        )}
      </svg>

      {/* Orbiting tech items on multiple rings */}
      {rings.map((ring, ri) =>
        ring.items.map((tech, i) => {
          const duration = ring.speed + i * 2
          const delay = i * -(ring.speed / ring.items.length)
          const isHovered = hoveredTech === tech.name

          return (
            <div
              key={tech.name}
              className="absolute top-1/2 left-1/2"
              style={{
                animation: inView ? `orbit ${duration}s linear ${delay}s infinite` : "none",
                animationDirection: ring.direction === -1 ? "reverse" : "normal",
                width: 0,
                height: 0,
              }}
            >
              <div
                className="relative -translate-x-1/2 -translate-y-1/2 cursor-default"
                style={{
                  transform: `translate(${Math.cos((tech.angle * Math.PI) / 180) * ring.radius}px, ${Math.sin((tech.angle * Math.PI) / 180) * ring.radius}px)`,
                }}
                onMouseEnter={() => setHoveredTech(tech.name)}
                onMouseLeave={() => setHoveredTech(null)}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/[0.08] bg-[#0c0c0e]/90 backdrop-blur-sm transition-all duration-300"
                  style={{
                    animation: inView
                      ? `counterOrbit ${duration}s linear ${delay}s infinite`
                      : "none",
                    animationDirection: ring.direction === -1 ? "reverse" : "normal",
                    boxShadow: isHovered ? `0 0 25px ${tech.color}30` : `0 0 20px ${tech.color}10`,
                    transform: isHovered ? "scale(1.3)" : "scale(1)",
                    borderColor: isHovered ? `${tech.color}40` : "rgba(255,255,255,0.08)",
                  }}
                >
                  <span className="text-[10px] font-bold" style={{ color: tech.color }}>
                    {tech.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                {/* Counter-rotating label */}
                <div
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? "translateY(0)" : "translateY(4px)",
                  }}
                >
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-black/80 border border-white/10" style={{ color: tech.color }}>
                    {tech.name}
                  </span>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 14. WORLD MAP — Enhanced SVG continents, arcs, scanning beam       */
/* ═══════════════════════════════════════════════════════════════════ */
function WorldMap() {
  const { ref, inView } = useInView(0.2)
  const [activeCity, setActiveCity] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const getTimeForTz = (tz: string) => {
    try {
      const offset = tz.replace("UTC", "")
      let hours = 0, minutes = 0
      if (offset.includes(":")) {
        const parts = offset.split(":")
        hours = parseInt(parts[0])
        minutes = parseInt(parts[1])
      } else if (offset) {
        hours = parseInt(offset)
      }
      const utc = currentTime.getTime() + currentTime.getTimezoneOffset() * 60000
      const local = new Date(utc + (hours * 3600000) + (minutes * 60000))
      return local.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
    } catch { return "--:--" }
  }

  return (
    <div ref={ref} className="relative w-full max-w-4xl mx-auto aspect-[2/1] rounded-3xl overflow-hidden border border-white/[0.04] bg-[#0a0a0c]/80">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }} />

      {/* Simplified continent outlines via SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" viewBox="0 0 1000 500" preserveAspectRatio="none">
        {/* North America */}
        <path d="M80,120 L120,80 L180,70 L220,90 L260,80 L280,100 L270,140 L280,170 L250,200 L230,240 L200,260 L170,230 L140,250 L120,220 L100,200 L80,170 Z" fill="none" stroke="#EF6F29" strokeWidth="1" />
        {/* South America */}
        <path d="M220,280 L250,270 L280,290 L310,330 L320,380 L300,420 L270,440 L240,410 L230,370 L220,330 Z" fill="none" stroke="#EF6F29" strokeWidth="1" />
        {/* Europe */}
        <path d="M440,80 L460,70 L500,75 L540,80 L560,100 L540,120 L510,130 L480,120 L460,110 Z" fill="none" stroke="#EF6F29" strokeWidth="1" />
        {/* Africa */}
        <path d="M460,160 L500,150 L540,170 L560,210 L570,260 L550,320 L520,360 L480,370 L450,340 L440,290 L450,240 L460,200 Z" fill="none" stroke="#EF6F29" strokeWidth="1" />
        {/* Asia */}
        <path d="M560,60 L620,50 L700,60 L760,80 L800,70 L840,90 L830,130 L800,160 L760,170 L720,160 L680,180 L640,170 L600,150 L570,130 L560,100 Z" fill="none" stroke="#EF6F29" strokeWidth="1" />
        {/* Australia */}
        <path d="M780,320 L830,310 L870,330 L880,360 L860,390 L820,400 L780,380 L770,350 Z" fill="none" stroke="#EF6F29" strokeWidth="1" />
      </svg>

      {/* Equator & Meridian */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-white/[0.03]" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/[0.03]" />

      {/* Connection arcs between cities */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {WORLD_CITIES.map((city, i) =>
          WORLD_CITIES.slice(i + 1).filter((_, j) => (i + j) % 3 === 0).map((city2, j) => {
            const x1 = (city.x / 100) * 1000
            const y1 = (city.y / 100) * 500
            const x2 = (city2.x / 100) * 1000
            const y2 = (city2.y / 100) * 500
            const midX = (x1 + x2) / 2
            const midY = Math.min(y1, y2) - Math.abs(x1 - x2) * 0.15
            return (
              <path
                key={`arc-${i}-${j}`}
                d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                fill="none"
                stroke="#EF6F29"
                strokeWidth="0.5"
                strokeDasharray="4,4"
                opacity="0.08"
                style={{
                  animation: inView ? `dash-flow 3s linear ${i * 200}ms infinite` : "none",
                }}
              />
            )
          })
        )}
      </svg>

      {/* City dots with pulses */}
      {WORLD_CITIES.map((city, i) => (
        <div
          key={city.name}
          className="absolute group cursor-pointer z-10"
          style={{
            left: `${city.x}%`,
            top: `${city.y}%`,
            opacity: inView ? 1 : 0,
            transform: inView ? "scale(1)" : "scale(0)",
            transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms`,
          }}
          onMouseEnter={() => setActiveCity(i)}
          onMouseLeave={() => setActiveCity(null)}
        >
          {/* Pulse ring */}
          <div className="absolute -inset-3 rounded-full border border-primary/20 animate-[ping_3s_ease-out_infinite]"
            style={{ animationDelay: `${i * 200}ms` }} />
          {/* Outer glow */}
          <div className="w-6 h-6 rounded-full absolute -inset-[6px] opacity-30"
            style={{ background: "radial-gradient(circle, #EF6F29, transparent 70%)" }} />
          {/* Dot */}
          <div className="w-3 h-3 rounded-full bg-primary relative z-10 group-hover:scale-150 transition-transform duration-300" />

          {/* Enhanced tooltip with timezone clock */}
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-300 z-20 ${activeCity === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
            <div className="px-4 py-3 rounded-lg bg-black/95 border border-white/10 backdrop-blur-sm shadow-xl">
              <p className="text-xs font-bold text-white">{city.name}</p>
              <p className="text-[10px] text-primary">{city.tz}</p>
              <div className="mt-1.5 pt-1.5 border-t border-white/[0.06]">
                <p className="text-[11px] font-mono text-white/60 tabular-nums">{getTimeForTz(city.tz)}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Scanning beam */}
      <div
        className="absolute top-0 bottom-0 w-[2px] opacity-20 pointer-events-none z-5"
        style={{
          background: "linear-gradient(180deg, transparent 10%, #EF6F29 50%, transparent 90%)",
          animation: "world-scan 6s linear infinite",
        }}
      />
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 15. COMPARISON TABLE — Enhanced animated rows, particles, scores    */
/* ═══════════════════════════════════════════════════════════════════ */
function ComparisonTable() {
  const { ref, inView } = useInView(0.15)

  return (
    <div ref={ref} className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div />
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 relative overflow-hidden">
            <span className="text-xs font-black text-primary relative z-10">LETHAL</span>
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(239,111,41,0.1), transparent)",
                animation: "shimmer 3s linear infinite",
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs font-black text-white/30">CORPORATE</span>
          </div>
        </div>
      </div>

      {/* Score bar */}
      <div className="mb-6 px-5">
        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-[2000ms] ease-out"
            style={{
              width: inView ? "100%" : "0%",
              background: "linear-gradient(90deg, #EF6F29, #a855f7)",
            }}
          >
            <div className="absolute inset-0" style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s linear infinite",
            }} />
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-primary/50 font-mono">8/8</span>
          <span className="text-[9px] text-white/20 font-mono">0/8</span>
        </div>
      </div>

      {/* Rows with animated reveals */}
      <div className="space-y-2">
        {COMPARISON.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-3 gap-4 items-center py-3.5 px-5 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 group"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateX(0)" : "translateX(-20px)",
              transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms`,
            }}
          >
            <span className="text-sm text-white/60 font-medium group-hover:text-white/80 transition-colors">{row.feature}</span>
            <div className="text-center">
              <div
                className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110"
                style={{
                  boxShadow: inView ? `0 0 15px rgba(34,197,94,0.1)` : "none",
                  transition: `all 0.3s ease ${i * 80 + 300}ms`,
                }}
              >
                <Check className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-center">
              <div
                className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110"
              >
                <span className="text-red-400 text-lg leading-none">x</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 16. HIRING TIMELINE — Enhanced animated vertical line, energy flow  */
/* ═══════════════════════════════════════════════════════════════════ */
function HiringTimeline() {
  const { ref, inView } = useInView(0.15)
  const [lineProgress, setLineProgress] = useState(0)

  useEffect(() => {
    if (!inView) return
    let frame = 0
    const animate = () => {
      frame++
      setLineProgress(Math.min(frame / 120, 1))
      if (frame < 120) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [inView])

  return (
    <div ref={ref} className="relative max-w-3xl mx-auto">
      {/* Animated vertical line that draws as you scroll */}
      <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px">
        {/* Background line */}
        <div className="absolute inset-0 bg-white/[0.04]" />
        {/* Animated fill */}
        <div
          className="absolute top-0 left-0 right-0 transition-all duration-100"
          style={{
            height: `${lineProgress * 100}%`,
            background: `linear-gradient(180deg, #EF6F29, #a855f7, #3b82f6)`,
            opacity: 0.4,
          }}
        />
        {/* Energy flow particle */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{
            background: "#EF6F29",
            boxShadow: "0 0 10px #EF6F29, 0 0 20px #EF6F2960",
            top: `${(lineProgress * 100)}%`,
            opacity: lineProgress < 1 ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        />
      </div>

      {TIMELINE.map((item, i) => {
        const isLeft = i % 2 === 0
        const itemProgress = lineProgress > (i / TIMELINE.length) ? 1 : 0

        return (
          <div
            key={i}
            className={`relative flex items-center gap-6 mb-12 last:mb-0 ${isLeft ? "sm:flex-row" : "sm:flex-row-reverse"}`}
            style={{
              opacity: inView ? (itemProgress ? 1 : 0.3) : 0,
              transform: inView ? "translateY(0)" : "translateY(30px)",
              transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 150}ms`,
            }}
          >
            {/* Content */}
            <div className={`flex-1 pl-16 sm:pl-0 ${isLeft ? "sm:text-right sm:pr-12" : "sm:text-left sm:pl-12"}`}>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] block mb-2" style={{ color: `${item.color}70` }}>
                {item.year}
              </span>
              <h4 className="text-lg font-black mb-1.5 text-white/90">{item.title}</h4>
              <p className="text-sm text-white/30 leading-relaxed">{item.desc}</p>
            </div>

            {/* Center node with pulse when in view */}
            <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 z-10">
              <div
                className="w-12 h-12 rounded-xl border-2 flex items-center justify-center bg-[#0a0a0a] transition-all duration-500"
                style={{
                  borderColor: itemProgress ? `${item.color}60` : `${item.color}20`,
                  boxShadow: itemProgress ? `0 0 20px ${item.color}20` : "none",
                }}
              >
                <div
                  className="w-3 h-3 rounded-full transition-all duration-500"
                  style={{
                    background: item.color,
                    boxShadow: itemProgress ? `0 0 10px ${item.color}` : "none",
                  }}
                />
              </div>
              {/* Pulse effect when node is active */}
              {itemProgress > 0 && (
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    border: `1px solid ${item.color}30`,
                    animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                  }}
                />
              )}
              <div className="absolute inset-0 rounded-xl blur-xl opacity-30"
                style={{ background: item.color }} />
            </div>

            <div className="hidden sm:block flex-1" />
          </div>
        )
      })}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 17. TOOLS SHOWCASE — Enhanced 3D tilt, skill indicators             */
/* ═══════════════════════════════════════════════════════════════════ */
function ToolsShowcase() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
      {TOOLS_WE_USE.map((tool, i) => {
        const cardRef = useRef<HTMLDivElement>(null)
        const tiltHandlers = useTilt(cardRef)
        const skillLevel = [95, 90, 85, 80, 92, 88][i] || 80

        return (
          <Reveal key={i} delay={i * 80} direction="up">
            <div
              ref={cardRef}
              {...tiltHandlers}
              className="group relative rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/60 p-6 hover:border-white/[0.12] transition-all duration-500 overflow-hidden"
              style={{ transformStyle: "preserve-3d", willChange: "transform" }}
            >
              <div data-shine className="absolute inset-0 pointer-events-none z-10 opacity-0 transition-opacity duration-500 rounded-2xl" />

              {/* Background glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: `radial-gradient(circle at center, ${tool.color}06, transparent 70%)` }} />

              <div className="relative z-10">
                {/* Animated logo container */}
                <div
                  className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 transition-all duration-500"
                  style={{
                    transform: "translateZ(20px)",
                  }}
                >
                  <span className="text-xs font-black group-hover:scale-110 transition-transform duration-300" style={{ color: tool.color }}>
                    {tool.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <h4 className="font-bold text-sm mb-1.5 text-white/80">{tool.name}</h4>
                <p className="text-[11px] text-white/25 leading-relaxed mb-3">{tool.desc}</p>

                {/* Skill level indicator */}
                <div className="relative">
                  <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-[1500ms] group-hover:w-full"
                      style={{
                        width: `${skillLevel}%`,
                        background: `linear-gradient(90deg, ${tool.color}60, ${tool.color})`,
                      }}
                    />
                  </div>
                  <span className="text-[8px] text-white/20 font-mono mt-1 block">{skillLevel}% proficiency</span>
                </div>
              </div>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 18. LIVE FEED — Enhanced auto-scrolling, fade-in/out, green pulse  */
/* ═══════════════════════════════════════════════════════════════════ */
function LiveFeed() {
  const [events, setEvents] = useState([
    { text: "cipher pushed 3 commits to main", time: "2m ago", color: "#a855f7", id: 0 },
    { text: "nova resolved ticket #1842", time: "5m ago", color: "#22c55e", id: 1 },
    { text: "flare uploaded new YouTube thumbnail", time: "12m ago", color: "#ec4899", id: 2 },
    { text: "vex closed $420 reseller deal", time: "18m ago", color: "#eab308", id: 3 },
    { text: "System: all endpoints healthy", time: "30m ago", color: "#3b82f6", id: 4 },
    { text: "cipher deployed hotfix v2.14.3", time: "45m ago", color: "#a855f7", id: 5 },
  ])
  const [counter, setCounter] = useState(6)
  const { ref, inView } = useInView(0.2)

  // Auto-add new events
  useEffect(() => {
    const newEvents = [
      { text: "nova handled 5 support tickets", color: "#22c55e" },
      { text: "vex onboarded 2 new resellers", color: "#eab308" },
      { text: "cipher merged PR #247", color: "#a855f7" },
      { text: "flare published TikTok edit", color: "#ec4899" },
      { text: "System: DDoS protection active", color: "#3b82f6" },
    ]
    const interval = setInterval(() => {
      setCounter(prev => {
        const evt = newEvents[prev % newEvents.length]
        setEvents(old => [
          { ...evt, time: "just now", id: prev },
          ...old.slice(0, 5),
        ])
        return prev + 1
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div ref={ref} className="w-full max-w-md">
      <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c]/80 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 py-3 border-b border-white/[0.04]">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Live Activity</span>
          <span className="text-[9px] text-white/15 font-mono ml-auto">{counter} events</span>
        </div>

        {/* Events with fade transitions */}
        <div className="p-4 space-y-1 max-h-[260px] overflow-hidden">
          {events.map((event, i) => (
            <div
              key={event.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-all duration-500"
              style={{
                opacity: inView ? (i === 0 ? 1 : Math.max(0.3, 1 - i * 0.15)) : 0,
                transform: inView ? "translateX(0) translateY(0)" : "translateX(-15px)",
                transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 50}ms`,
              }}
            >
              <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: event.color }} />
                {i === 0 && (
                  <div
                    className="absolute inset-0 w-1.5 h-1.5 rounded-full"
                    style={{ background: event.color, animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }}
                  />
                )}
              </div>
              <span className="text-xs text-white/35 flex-1 truncate">{event.text}</span>
              <span className="text-[10px] text-white/15 shrink-0 tabular-nums font-mono">{event.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 19. SKILL BAR — Enhanced gradient shimmer, tooltip, bounce          */
/* ═══════════════════════════════════════════════════════════════════ */
function SkillBar({
  label,
  value,
  color,
  delay = 0,
}: {
  label: string
  value: number
  color: string
  delay?: number
}) {
  const { ref, inView } = useInView(0.3)
  const [showTooltip, setShowTooltip] = useState(false)
  const [animatedValue, setAnimatedValue] = useState(0)

  // Overshoot bounce animation
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const duration = 1500
    const overshoot = value + value * 0.05

    const animate = (now: number) => {
      const elapsed = now - start - delay
      if (elapsed < 0) { requestAnimationFrame(animate); return }

      const progress = Math.min(elapsed / duration, 1)
      // Elastic easing
      let val: number
      if (progress < 0.8) {
        val = (progress / 0.8) * overshoot
      } else {
        const t = (progress - 0.8) / 0.2
        val = overshoot - (overshoot - value) * t
      }
      setAnimatedValue(Math.max(0, Math.min(100, val)))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [inView, value, delay])

  return (
    <div
      ref={ref}
      className="group relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex justify-between mb-2">
        <span className="text-xs font-bold text-white/50 group-hover:text-white/70 transition-colors">{label}</span>
        <span className="text-xs font-black tabular-nums" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full relative"
          style={{
            width: `${animatedValue}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            transition: "none",
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s linear infinite",
            }}
          />
        </div>
        {/* Glow beneath */}
        <div
          className="absolute top-0 h-full rounded-full blur-sm"
          style={{
            width: `${animatedValue}%`,
            background: `${color}30`,
          }}
        />

        {/* Floating tooltip at end of bar */}
        <div
          className="absolute top-[-28px] transition-all duration-300 pointer-events-none"
          style={{
            left: `${animatedValue}%`,
            transform: "translateX(-50%)",
            opacity: showTooltip ? 1 : 0,
          }}
        >
          <div className="px-2 py-1 rounded bg-black/90 border border-white/10 text-[9px] font-mono whitespace-nowrap" style={{ color }}>
            {Math.round(animatedValue)}%
          </div>
        </div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 20. ROLE BENEFITS — Enhanced stagger reveal, icon animations        */
/* ═══════════════════════════════════════════════════════════════════ */
function RoleBenefits({ positionId }: { positionId: string }) {
  const benefits = ROLE_BENEFITS[positionId as keyof typeof ROLE_BENEFITS]
  const pos = POSITIONS.find(p => p.id === positionId)
  const { ref, inView } = useInView(0.2)
  if (!benefits || !pos) return null

  return (
    <div ref={ref} className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 mt-4 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${pos.color}04, transparent 60%)`,
        }}
      />

      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 relative z-10" style={{ color: `${pos.color}60` }}>
        {pos.title} Benefits
      </p>

      <div className="space-y-3 relative z-10">
        {benefits.map((b, i) => (
          <div
            key={i}
            className="flex items-center gap-3 group/benefit"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateX(0)" : "translateX(-15px)",
              transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms`,
            }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover/benefit:scale-110 group-hover/benefit:rotate-12"
              style={{
                background: `${pos.color}12`,
                boxShadow: `0 0 0 0 ${pos.color}00`,
                transition: "all 0.3s ease",
              }}
            >
              <Star
                className="h-3 w-3 transition-all duration-300"
                style={{
                  color: pos.color,
                  filter: "none",
                }}
              />
            </div>
            <span className="text-xs text-white/40 leading-relaxed group-hover/benefit:text-white/60 transition-colors">
              {b}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 21. RADAR SCAN — Circular radar with rotating sweep, blips          */
/* ═══════════════════════════════════════════════════════════════════ */
function RadarScan() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { ref, inView } = useInView(0.2)
  const animRef = useRef<number>(0)

  const blips = [
    { label: "Reliability", value: 0.95, angle: 30, color: "#22c55e" },
    { label: "Speed", value: 0.88, angle: 80, color: "#3b82f6" },
    { label: "Support", value: 0.92, angle: 140, color: "#eab308" },
    { label: "Innovation", value: 0.85, angle: 200, color: "#a855f7" },
    { label: "Security", value: 0.98, angle: 260, color: "#ec4899" },
    { label: "Growth", value: 0.9, angle: 320, color: "#EF6F29" },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !inView) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = 300
    canvas.width = size * 2
    canvas.height = size * 2
    ctx.scale(2, 2)

    const cx = size / 2, cy = size / 2
    const maxR = size / 2 - 20
    let sweepAngle = 0

    const draw = () => {
      ctx.clearRect(0, 0, size, size)

      // Concentric rings
      for (let i = 1; i <= 4; i++) {
        const r = (maxR / 4) * i
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(239,111,41,${0.06 + i * 0.01})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Cross lines
      ctx.strokeStyle = "rgba(239,111,41,0.05)"
      ctx.lineWidth = 0.5
      for (let a = 0; a < 360; a += 60) {
        const rad = (a * Math.PI) / 180
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(rad) * maxR, cy + Math.sin(rad) * maxR)
        ctx.stroke()
      }

      // Sweep line with gradient trail
      sweepAngle += 0.015
      const sweepRad = sweepAngle
      for (let i = 0; i < 30; i++) {
        const a = sweepRad - (i * 0.02)
        const alpha = (1 - i / 30) * 0.15
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR)
        ctx.strokeStyle = `rgba(239,111,41,${alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Main sweep line
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(sweepRad) * maxR, cy + Math.sin(sweepRad) * maxR)
      ctx.strokeStyle = "rgba(239,111,41,0.5)"
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Blips
      blips.forEach(blip => {
        const rad = (blip.angle * Math.PI) / 180
        const dist = blip.value * maxR
        const bx = cx + Math.cos(rad) * dist
        const by = cy + Math.sin(rad) * dist

        // Check if sweep just passed
        const sweepDeg = ((sweepAngle * 180) / Math.PI) % 360
        const angleDiff = ((sweepDeg - blip.angle + 360) % 360)
        const brightness = angleDiff < 40 ? 1 - angleDiff / 40 : 0.3

        // Glow
        ctx.beginPath()
        ctx.arc(bx, by, 6, 0, Math.PI * 2)
        const grd = ctx.createRadialGradient(bx, by, 0, bx, by, 6)
        grd.addColorStop(0, `${blip.color}${Math.round(brightness * 60).toString(16).padStart(2, "0")}`)
        grd.addColorStop(1, "transparent")
        ctx.fillStyle = grd
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = blip.color
        ctx.globalAlpha = 0.3 + brightness * 0.7
        ctx.fill()
        ctx.globalAlpha = 1
      })

      // Center dot
      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fillStyle = "#EF6F29"
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx, cy, 6, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(239,111,41,0.3)"
      ctx.lineWidth = 1
      ctx.stroke()

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [inView])

  return (
    <div ref={ref} className="relative">
      <div className="relative w-[300px] h-[300px] mx-auto">
        <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: "auto" }} />

        {/* Angular labels */}
        {blips.map((blip, i) => {
          const rad = (blip.angle * Math.PI) / 180
          const labelDist = 155
          return (
            <div
              key={i}
              className="absolute text-[9px] font-bold whitespace-nowrap"
              style={{
                left: `${50 + (Math.cos(rad) * labelDist) / 1.5}%`,
                top: `${50 + (Math.sin(rad) * labelDist) / 1.5}%`,
                transform: "translate(-50%, -50%)",
                color: `${blip.color}80`,
              }}
            >
              {blip.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 22. INTERACTIVE GLOBE — Canvas 3D wireframe globe                   */
/* ═══════════════════════════════════════════════════════════════════ */
function InteractiveGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { ref, inView } = useInView(0.2)
  const animRef = useRef<number>(0)
  const dragRef = useRef({ isDragging: false, lastX: 0, lastY: 0, rotX: 0.3, rotY: 0 })

  const locations = [
    { lat: 34, lon: -118, name: "LA" },
    { lat: 40.7, lon: -74, name: "NY" },
    { lat: -23.5, lon: -46.6, name: "SP" },
    { lat: 51.5, lon: -0.1, name: "LON" },
    { lat: 52.5, lon: 13.4, name: "BER" },
    { lat: 50.4, lon: 30.5, name: "KYV" },
    { lat: 55.7, lon: 37.6, name: "MOW" },
    { lat: 25.2, lon: 55.3, name: "DXB" },
    { lat: 1.3, lon: 103.8, name: "SIN" },
    { lat: 35.7, lon: 139.7, name: "TKY" },
    { lat: -33.9, lon: 151.2, name: "SYD" },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !inView) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = 350
    canvas.width = size * 2
    canvas.height = size * 2
    ctx.scale(2, 2)

    const cx = size / 2, cy = size / 2, radius = size / 2 - 30
    const drag = dragRef.current

    const project = (lat: number, lon: number) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)

      let x = Math.sin(phi) * Math.cos(theta)
      let y = Math.cos(phi)
      let z = Math.sin(phi) * Math.sin(theta)

      // Rotate Y
      const cosY = Math.cos(drag.rotY), sinY = Math.sin(drag.rotY)
      const tx = x * cosY - z * sinY
      const tz = x * sinY + z * cosY
      x = tx; z = tz

      // Rotate X
      const cosX = Math.cos(drag.rotX), sinX = Math.sin(drag.rotX)
      const ty = y * cosX - z * sinX
      const tz2 = y * sinX + z * cosX
      y = ty; z = tz2

      return {
        x: cx + x * radius,
        y: cy - y * radius,
        z,
        visible: z > -0.1,
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, size, size)

      // Auto-rotate when not dragging
      if (!drag.isDragging) {
        drag.rotY += 0.003
      }

      // Globe outline
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(239,111,41,0.08)"
      ctx.lineWidth = 1
      ctx.stroke()

      // Globe fill
      const grd = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius)
      grd.addColorStop(0, "rgba(239,111,41,0.03)")
      grd.addColorStop(1, "rgba(10,10,10,0.8)")
      ctx.fillStyle = grd
      ctx.fill()

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath()
        let first = true
        for (let lon = 0; lon <= 360; lon += 5) {
          const p = project(lat, lon)
          if (p.visible) {
            if (first) { ctx.moveTo(p.x, p.y); first = false }
            else ctx.lineTo(p.x, p.y)
          } else { first = true }
        }
        ctx.strokeStyle = `rgba(239,111,41,0.04)`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Longitude lines
      for (let lon = 0; lon < 360; lon += 30) {
        ctx.beginPath()
        let first = true
        for (let lat = -90; lat <= 90; lat += 5) {
          const p = project(lat, lon)
          if (p.visible) {
            if (first) { ctx.moveTo(p.x, p.y); first = false }
            else ctx.lineTo(p.x, p.y)
          } else { first = true }
        }
        ctx.strokeStyle = "rgba(239,111,41,0.04)"
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Location dots and arcs
      const projectedLocations = locations.map(loc => ({
        ...loc,
        ...project(loc.lat, loc.lon),
      }))

      // Arcs between visible locations
      for (let i = 0; i < projectedLocations.length; i++) {
        const p1 = projectedLocations[i]
        if (!p1.visible) continue
        for (let j = i + 1; j < projectedLocations.length; j++) {
          if ((i + j) % 3 !== 0) continue
          const p2 = projectedLocations[j]
          if (!p2.visible) continue

          const midX = (p1.x + p2.x) / 2
          const midY = Math.min(p1.y, p2.y) - Math.abs(p1.x - p2.x) * 0.1

          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.quadraticCurveTo(midX, midY, p2.x, p2.y)
          ctx.strokeStyle = "rgba(239,111,41,0.08)"
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }

      // Dots
      projectedLocations.forEach(loc => {
        if (!loc.visible) return
        const alpha = 0.3 + loc.z * 0.7

        // Glow
        ctx.beginPath()
        ctx.arc(loc.x, loc.y, 6, 0, Math.PI * 2)
        const g = ctx.createRadialGradient(loc.x, loc.y, 0, loc.x, loc.y, 6)
        g.addColorStop(0, `rgba(239,111,41,${alpha * 0.3})`)
        g.addColorStop(1, "transparent")
        ctx.fillStyle = g
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(loc.x, loc.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(239,111,41,${alpha})`
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(draw)
    }

    // Mouse handlers for drag
    const handleDown = (e: MouseEvent) => {
      drag.isDragging = true
      drag.lastX = e.clientX
      drag.lastY = e.clientY
    }
    const handleMove = (e: MouseEvent) => {
      if (!drag.isDragging) return
      drag.rotY += (e.clientX - drag.lastX) * 0.005
      drag.rotX += (e.clientY - drag.lastY) * 0.005
      drag.rotX = Math.max(-1.2, Math.min(1.2, drag.rotX))
      drag.lastX = e.clientX
      drag.lastY = e.clientY
    }
    const handleUp = () => { drag.isDragging = false }

    canvas.addEventListener("mousedown", handleDown)
    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleUp)

    draw()
    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener("mousedown", handleDown)
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
  }, [inView])

  return (
    <div ref={ref} className="relative">
      <div className="relative w-[350px] h-[350px] mx-auto cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-white/15 font-mono">
          drag to rotate
        </div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 23. TEAM NETWORK — Canvas network visualization                     */
/* ═══════════════════════════════════════════════════════════════════ */
function TeamNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { ref, inView } = useInView(0.2)
  const animRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const nodes = [
    { name: "cipher", role: "Developer", x: 200, y: 120, color: "#a855f7", size: 18 },
    { name: "nova", role: "Support", x: 340, y: 160, color: "#22c55e", size: 15 },
    { name: "vex", role: "Sales", x: 140, y: 260, color: "#eab308", size: 16 },
    { name: "flare", role: "Media", x: 320, y: 280, color: "#ec4899", size: 14 },
    { name: "core", role: "Lethal HQ", x: 240, y: 200, color: "#EF6F29", size: 22 },
    { name: "ace", role: "SEO", x: 100, y: 150, color: "#3b82f6", size: 13 },
    { name: "ghost", role: "Manager", x: 380, y: 230, color: "#f97316", size: 15 },
  ]

  const connections = [
    [4, 0], [4, 1], [4, 2], [4, 3], [4, 5], [4, 6],
    [0, 5], [1, 3], [2, 6], [0, 1], [3, 6],
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !inView) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 480 * 2
    canvas.height = 380 * 2
    ctx.scale(2, 2)

    let frame = 0

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) * (480 / rect.width),
        y: (e.clientY - rect.top) * (380 / rect.height),
      }
    }
    canvas.addEventListener("mousemove", handleMove)

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, 480, 380)

      // Check hover
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      let hovered: string | null = null

      nodes.forEach(n => {
        const dx = mx - n.x, dy = my - n.y
        if (Math.sqrt(dx * dx + dy * dy) < n.size + 10) {
          hovered = n.name
        }
      })
      setHoveredNode(hovered)

      // Draw connections with pulsing data flow
      connections.forEach(([a, b]) => {
        const n1 = nodes[a], n2 = nodes[b]
        const isHighlight = hovered === n1.name || hovered === n2.name

        ctx.beginPath()
        ctx.moveTo(n1.x, n1.y)
        ctx.lineTo(n2.x, n2.y)
        ctx.strokeStyle = isHighlight ? "rgba(239,111,41,0.2)" : "rgba(255,255,255,0.04)"
        ctx.lineWidth = isHighlight ? 1.5 : 0.8
        ctx.stroke()

        // Data flow particles
        const speed = 0.001
        const t = ((frame * speed * (a + b + 1)) % 1)
        const px = n1.x + (n2.x - n1.x) * t
        const py = n1.y + (n2.y - n1.y) * t

        ctx.beginPath()
        ctx.arc(px, py, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = isHighlight ? "rgba(239,111,41,0.5)" : "rgba(239,111,41,0.15)"
        ctx.fill()
      })

      // Draw nodes
      nodes.forEach(n => {
        const isHovered = hovered === n.name
        const pulse = Math.sin(frame * 0.03 + nodes.indexOf(n)) * 2

        // Outer glow
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.size + 8 + pulse, 0, Math.PI * 2)
        const glow = ctx.createRadialGradient(n.x, n.y, n.size, n.x, n.y, n.size + 8 + pulse)
        glow.addColorStop(0, `${n.color}${isHovered ? "30" : "10"}`)
        glow.addColorStop(1, "transparent")
        ctx.fillStyle = glow
        ctx.fill()

        // Node circle
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2)
        ctx.fillStyle = `${n.color}${isHovered ? "40" : "15"}`
        ctx.fill()
        ctx.strokeStyle = `${n.color}${isHovered ? "80" : "40"}`
        ctx.lineWidth = isHovered ? 2 : 1
        ctx.stroke()

        // Label
        ctx.fillStyle = isHovered ? `${n.color}` : "rgba(255,255,255,0.5)"
        ctx.font = `${isHovered ? "bold " : ""}${isHovered ? 11 : 9}px system-ui`
        ctx.textAlign = "center"
        ctx.fillText(n.name, n.x, n.y + n.size + 16)

        if (isHovered) {
          ctx.fillStyle = "rgba(255,255,255,0.3)"
          ctx.font = "8px system-ui"
          ctx.fillText(n.role, n.x, n.y + n.size + 28)
        }
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener("mousemove", handleMove)
    }
  }, [inView])

  return (
    <div ref={ref} className="relative">
      <div className="relative w-full max-w-[480px] mx-auto aspect-[480/380] rounded-2xl overflow-hidden border border-white/[0.04] bg-[#0a0a0c]/80">
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
        <div className="absolute top-3 left-3 text-[9px] text-white/15 font-mono uppercase tracking-wider">
          Team Network
        </div>
        {hoveredNode && (
          <div className="absolute top-3 right-3 text-[9px] text-primary/50 font-mono">
            {hoveredNode}
          </div>
        )}
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 24. GROWTH LADDER — Visual career progression path                  */
/* ═══════════════════════════════════════════════════════════════════ */
function GrowthLadder() {
  const { ref, inView } = useInView(0.15)
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const steps = [
    { level: "Trial", title: "Prove Yourself", desc: "1-week trial with real tasks. Show us what you can do.", color: "#64748b", icon: "🎯", weeks: "Week 1" },
    { level: "Member", title: "Team Member", desc: "Full access, tools, and training. Start contributing daily.", color: "#22c55e", icon: "✅", weeks: "Week 2-4" },
    { level: "Trusted", title: "Trusted Contributor", desc: "Handle sensitive tasks, get commission bumps, mentorship.", color: "#3b82f6", icon: "⭐", weeks: "Month 2-3" },
    { level: "Senior", title: "Senior Operator", desc: "Lead projects, train newcomers, revenue share increase.", color: "#a855f7", icon: "🚀", weeks: "Month 4-6" },
    { level: "Lead", title: "Team Lead", desc: "Own a department. Strategic decisions. Full profit share.", color: "#EF6F29", icon: "👑", weeks: "Month 6+" },
  ]

  return (
    <div ref={ref} className="relative max-w-xl mx-auto">
      {/* Central path line */}
      <div className="absolute left-8 top-0 bottom-0 w-[2px]">
        <div
          className="h-full transition-all duration-[2000ms]"
          style={{
            background: inView
              ? "linear-gradient(180deg, #64748b, #22c55e, #3b82f6, #a855f7, #EF6F29)"
              : "rgba(255,255,255,0.04)",
            opacity: inView ? 0.4 : 0.1,
          }}
        />
      </div>

      <div className="space-y-8">
        {steps.map((step, i) => {
          const isActive = activeStep === i
          const progressPct = inView ? Math.min(1, (i + 1) / steps.length) : 0

          return (
            <div
              key={i}
              className="relative pl-20 group cursor-default"
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateX(0)" : "translateX(-20px)",
                transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 200}ms`,
              }}
            >
              {/* Stepping stone / node */}
              <div
                className="absolute left-4 top-2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 bg-[#0a0a0a]"
                style={{
                  borderColor: isActive ? step.color : `${step.color}40`,
                  boxShadow: isActive ? `0 0 20px ${step.color}30` : "none",
                }}
              >
                <span className="text-sm">{step.icon}</span>
                {/* Pulse when active */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: `1px solid ${step.color}40`,
                      animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                    }}
                  />
                )}
              </div>

              {/* Current position indicator for first step */}
              {i === 0 && (
                <div className="absolute left-[18px] -top-4 text-[8px] font-black text-white/40 uppercase tracking-widest">
                  YOU
                </div>
              )}

              {/* Content card */}
              <div
                className="rounded-xl border p-5 transition-all duration-500"
                style={{
                  borderColor: isActive ? `${step.color}30` : "rgba(255,255,255,0.04)",
                  background: isActive ? `${step.color}06` : "rgba(255,255,255,0.01)",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: `${step.color}15`, color: step.color }}>
                    {step.level}
                  </span>
                  <span className="text-[10px] text-white/20 font-mono">{step.weeks}</span>
                </div>
                <h4 className="font-bold text-white/80 mb-1">{step.title}</h4>
                <p className="text-xs text-white/30 leading-relaxed">{step.desc}</p>

                {/* Milestone progress bar */}
                <div className="mt-3 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-[1500ms]"
                    style={{
                      width: inView ? "100%" : "0%",
                      background: step.color,
                      opacity: 0.4,
                      transitionDelay: `${i * 300}ms`,
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* 25. ISOMETRIC WORKSPACE — CSS/SVG isometric 3D workspace            */
/* ═══════════════════════════════════════════════════════════════════ */
function IsometricWorkspace() {
  const { ref, inView } = useInView(0.2)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }, [])

  const parallaxX = (mousePos.x - 0.5) * 10
  const parallaxY = (mousePos.y - 0.5) * 8

  return (
    <div ref={ref}>
      <div
        ref={containerRef}
        onMouseMove={handleMove}
        className="relative w-[400px] h-[320px] mx-auto"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Isometric container with subtle parallax */}
        <div
          className="absolute inset-0"
          style={{
            transform: `perspective(800px) rotateX(${2 + parallaxY}deg) rotateY(${parallaxX * 0.5}deg)`,
            transformStyle: "preserve-3d",
            transition: "transform 0.1s ease-out",
          }}
        >
          {/* Desk surface */}
          <div
            className="absolute rounded-xl"
            style={{
              width: "320px",
              height: "180px",
              left: "40px",
              top: "140px",
              background: "linear-gradient(135deg, rgba(30,30,35,0.8), rgba(20,20,25,0.9))",
              border: "1px solid rgba(255,255,255,0.04)",
              transform: "rotateX(55deg) rotateZ(-5deg)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          />

          {/* Monitor stand */}
          <div
            className="absolute"
            style={{
              width: "8px",
              height: "40px",
              left: "196px",
              top: "120px",
              background: "linear-gradient(180deg, rgba(60,60,65,0.8), rgba(40,40,45,0.8))",
              borderRadius: "2px",
              transform: `translateX(${parallaxX * 0.3}px)`,
            }}
          />

          {/* Monitor */}
          <div
            className="absolute rounded-lg overflow-hidden"
            style={{
              width: "240px",
              height: "140px",
              left: "80px",
              top: "-10px",
              background: "linear-gradient(180deg, #111115, #0a0a0e)",
              border: "2px solid rgba(255,255,255,0.06)",
              boxShadow: "0 0 40px rgba(239,111,41,0.05), inset 0 0 60px rgba(0,0,0,0.3)",
              transform: `translateX(${parallaxX * 0.5}px) translateY(${parallaxY * 0.3}px)`,
            }}
          >
            {/* Screen content - code */}
            <div className="p-3 font-mono text-[8px] leading-[1.6] overflow-hidden h-full">
              <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-white/[0.04]">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                <span className="text-[6px] text-white/15 ml-1">lethal-core.ts</span>
              </div>
              <div style={{ opacity: 0.7 }}>
                <span className="text-purple-400/60">const</span> <span className="text-blue-400/60">lethal</span> <span className="text-white/20">=</span> <span className="text-emerald-400/60">{`{`}</span>
              </div>
              <div style={{ opacity: 0.6 }}>
                {"  "}<span className="text-white/30">status</span><span className="text-white/15">:</span> <span className="text-emerald-400/60">&quot;hiring&quot;</span><span className="text-white/15">,</span>
              </div>
              <div style={{ opacity: 0.5 }}>
                {"  "}<span className="text-white/30">team</span><span className="text-white/15">:</span> <span className="text-yellow-400/60">10</span><span className="text-white/15">,</span>
              </div>
              <div style={{ opacity: 0.5 }}>
                {"  "}<span className="text-white/30">uptime</span><span className="text-white/15">:</span> <span className="text-yellow-400/60">99.8</span><span className="text-white/15">,</span>
              </div>
              <div style={{ opacity: 0.4 }}>
                {"  "}<span className="text-white/30">detections</span><span className="text-white/15">:</span> <span className="text-yellow-400/60">0</span>
              </div>
              <div style={{ opacity: 0.4 }}>
                <span className="text-emerald-400/60">{`}`}</span><span className="text-white/15">;</span>
              </div>
              {/* Typing cursor */}
              <div className="mt-1" style={{ opacity: 0.6 }}>
                <span className="text-primary/60">{">"}</span>
                <span
                  className="inline-block w-[4px] h-[8px] bg-primary/50 ml-0.5 align-middle"
                  style={{ animation: "blink-cursor 1s step-end infinite" }}
                />
              </div>
            </div>

            {/* Screen glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.02] to-transparent pointer-events-none" />
          </div>

          {/* Keyboard */}
          <div
            className="absolute rounded-md"
            style={{
              width: "160px",
              height: "50px",
              left: "120px",
              top: "200px",
              background: "linear-gradient(180deg, rgba(40,40,45,0.8), rgba(30,30,35,0.8))",
              border: "1px solid rgba(255,255,255,0.04)",
              transform: `rotateX(15deg) translateX(${parallaxX * 0.2}px)`,
            }}
          >
            {/* Keyboard keys representation */}
            <div className="p-1.5 grid grid-cols-12 gap-[2px]">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[6px] rounded-[1px]"
                  style={{
                    background: `rgba(255,255,255,${0.03 + Math.random() * 0.02})`,
                    animation: i % 7 === 0 ? `key-press ${1 + Math.random()}s ease-in-out ${Math.random() * 2}s infinite` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Coffee mug */}
          <div
            className="absolute"
            style={{
              width: "20px",
              height: "20px",
              left: "300px",
              top: "170px",
              background: "linear-gradient(135deg, rgba(239,111,41,0.15), rgba(239,111,41,0.08))",
              border: "1px solid rgba(239,111,41,0.2)",
              borderRadius: "3px 3px 6px 6px",
              transform: `translateX(${parallaxX * 0.15}px)`,
            }}
          >
            {/* Steam */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-[2px] h-3 opacity-30"
              style={{
                background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.15))",
                animation: "steam 2s ease-in-out infinite",
              }}
            />
          </div>

          {/* Floating elements */}
          {["💻", "🔥", "⚡"].map((emoji, i) => (
            <div
              key={i}
              className="absolute text-lg select-none pointer-events-none"
              style={{
                left: `${60 + i * 130}px`,
                top: `${30 + i * 20}px`,
                opacity: 0.15,
                animation: `float-gentle ${3 + i}s ease-in-out ${i * 0.5}s infinite`,
                transform: `translateX(${parallaxX * (0.3 + i * 0.1)}px) translateY(${parallaxY * (0.2 + i * 0.1)}px)`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>

        {/* Ambient glow under desk */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "200px",
            height: "40px",
            left: "100px",
            top: "280px",
            background: "radial-gradient(ellipse, rgba(239,111,41,0.06), transparent 70%)",
            filter: "blur(10px)",
          }}
        />
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════════ */
/* KEYFRAME ANIMATIONS (injected via style tag in a component)        */
/* ═══════════════════════════════════════════════════════════════════ */
function PartBAnimations() {
  return (
    <style jsx global>{`
      @keyframes sparkle-fade {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0); }
      }
      @keyframes particle-burst {
        0% { opacity: 1; transform: translate(0, 0) scale(1); }
        100% { opacity: 0; transform: translate(var(--tx, 40px), var(--ty, -40px)) scale(0); }
      }
      @keyframes float-badge {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-3px); }
      }
      @keyframes gradient-sweep {
        0% { background-position: 0% 0%; }
        50% { background-position: 100% 100%; }
        100% { background-position: 0% 0%; }
      }
      @keyframes energy-wave {
        0% { transform: scale(0.8); opacity: 0; }
        50% { transform: scale(1.1); opacity: 0.5; }
        100% { transform: scale(1.4); opacity: 0; }
      }
      @keyframes scan-line {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
      @keyframes edge-glow-flash {
        0% { opacity: 0; }
        30% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes connector-travel {
        0% { transform: translateX(-10px); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateX(10px); opacity: 0; }
      }
      @keyframes orbit-small {
        from { transform: rotate(0deg) translateX(35px) rotate(0deg); }
        to { transform: rotate(360deg) translateX(35px) rotate(-360deg); }
      }
      @keyframes achievement-particle {
        0% { transform: rotate(var(--angle, 0deg)) translateX(0px); opacity: 1; }
        100% { transform: rotate(var(--angle, 0deg)) translateX(50px); opacity: 0; }
      }
      @keyframes scanline-scroll {
        0% { transform: translateY(0); }
        100% { transform: translateY(4px); }
      }
      @keyframes blink-cursor {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes world-scan {
        0% { left: -2px; }
        100% { left: 100%; }
      }
      @keyframes dash-flow {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: -16; }
      }
      @keyframes float-gentle {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
      }
      @keyframes key-press {
        0%, 80%, 100% { opacity: 0.04; transform: translateY(0); }
        90% { opacity: 0.08; transform: translateY(1px); }
      }
      @keyframes steam {
        0%, 100% { opacity: 0.2; transform: translateX(-50%) translateY(0) scaleY(1); }
        50% { opacity: 0; transform: translateX(-50%) translateY(-6px) scaleY(1.5); }
      }
      @keyframes orbit {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes counterOrbit {
        from { transform: rotate(0deg); }
        to { transform: rotate(-360deg); }
      }
    `}</style>
  )
}


