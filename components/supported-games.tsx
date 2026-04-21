"use client"

const GAMES = [
  "Fortnite", "Apex Legends", "Warzone", "CS2",
  "Rust", "PUBG", "R6 Siege", "Valorant",
  "Escape from Tarkov", "DayZ", "Arma",
]

export function SupportedGames() {
  return (
    <section className="py-8 border-y border-white/[0.06] overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10" />
      <div className="flex items-center gap-4 mb-4 justify-center">
        <span className="text-xs text-white/55 uppercase tracking-[0.2em]">Supported Games</span>
      </div>
      <div className="flex animate-marquee whitespace-nowrap">
        {[...GAMES, ...GAMES].map((game, i) => (
          <span
            key={i}
            className="mx-8 text-lg font-semibold text-white/20 hover:text-[#f97316] transition-colors duration-300 cursor-default select-none"
          >
            {game}
          </span>
        ))}
      </div>
    </section>
  )
}
