export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-lg font-black text-primary">&lt;</span>
      <span className="text-lg font-black text-accent">&gt;</span>
      <span className="text-sm font-semibold tracking-tight text-foreground ml-0.5">
        Lethal Solutions
      </span>
    </div>
  )
}
