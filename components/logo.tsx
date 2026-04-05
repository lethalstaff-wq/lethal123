export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-xl font-black text-primary">&lt;</span>
      <span className="text-xl font-black text-accent">&gt;</span>
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        Lethal Solutions
      </span>
    </div>
  )
}
