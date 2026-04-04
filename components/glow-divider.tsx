export function GlowDivider() {
  return (
    <div className="relative py-2">
      <div className="absolute left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute left-1/2 -translate-x-1/2 w-1/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-sm" />
    </div>
  )
}
