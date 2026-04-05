// Server Component - clean orange theme background
export function GlobalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Dark base */}
      <div className="absolute inset-0 bg-[#0a0a0b]" />
      
      {/* Top center orange glow */}
      <div 
        className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(239, 111, 41, 0.6) 0%, transparent 60%)',
          filter: 'blur(100px)',
        }}
      />
      
      {/* Very subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
