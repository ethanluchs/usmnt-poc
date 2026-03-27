"use client"

const RARITY = {
  legendary: {
    label: "Legendary", stars: 5,
    bg: "from-yellow-400 via-amber-500 to-orange-700",
    border: "border-yellow-400", shadow: "shadow-yellow-500/60",
    badge: "bg-yellow-400/20 text-yellow-300", accent: "#fbbf24",
  },
  epic: {
    label: "Epic", stars: 4,
    bg: "from-purple-500 via-violet-600 to-purple-900",
    border: "border-purple-400", shadow: "shadow-purple-500/50",
    badge: "bg-purple-400/20 text-purple-300", accent: "#c084fc",
  },
  rare: {
    label: "Rare", stars: 3,
    bg: "from-sky-500 via-blue-600 to-blue-900",
    border: "border-sky-400", shadow: "shadow-sky-500/40",
    badge: "bg-sky-400/20 text-sky-300", accent: "#38bdf8",
  },
  uncommon: {
    label: "Uncommon", stars: 2,
    bg: "from-emerald-500 via-green-700 to-emerald-900",
    border: "border-emerald-400", shadow: "shadow-emerald-500/30",
    badge: "bg-emerald-400/20 text-emerald-300", accent: "#34d399",
  },
  common: {
    label: "Common", stars: 1,
    bg: "from-slate-500 via-slate-600 to-slate-800",
    border: "border-slate-500", shadow: "",
    badge: "bg-slate-400/20 text-slate-400", accent: "#94a3b8",
  },
}

const RARITY_ORDER = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 }

function TradeCard({ card }) {
  const r = RARITY[card.rarity] ?? RARITY.common
  const stars = "★".repeat(r.stars) + "☆".repeat(5 - r.stars)
  const words = card.name.split(" ")

  return (
    <div
      className={`relative flex-shrink-0 rounded-2xl border-2 ${r.border} bg-gradient-to-br ${r.bg} shadow-xl ${r.shadow} overflow-hidden select-none`}
      style={{ width: 120, height: 172 }}
    >
      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />

      {/* Top: rarity badge */}
      <div className="px-3 pt-3">
        <span className={`inline-block text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${r.badge}`}
          style={{ fontFamily: "Inter, sans-serif" }}>
          {r.label}
        </span>
        <p className="text-[10px] mt-0.5" style={{ color: r.accent, letterSpacing: 1 }}>{stars}</p>
      </div>

      {/* Player name */}
      <div className="px-3 mt-2 flex-1">
        {words.map((word, i) => (
          <p key={i}
            className="font-black text-white leading-tight uppercase"
            style={{ fontFamily: "Inter, sans-serif", fontSize: words.length > 2 ? "10px" : "12px" }}>
            {word}
          </p>
        ))}
      </div>

      {/* Bottom: position + score */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
        <p className="text-[8px] uppercase tracking-wider text-white/50 mb-0.5"
          style={{ fontFamily: "Inter, sans-serif" }}>
          {card.position}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-white" style={{ fontFamily: "Inter, sans-serif" }}>
            {card.score}
          </span>
          <span className="text-[9px] text-white/50" style={{ fontFamily: "Inter, sans-serif" }}>pts</span>
        </div>
      </div>

      {/* Corner accent triangle */}
      <div className="absolute top-0 right-0 w-0 h-0"
        style={{ borderLeft: "28px solid transparent", borderTop: `28px solid ${r.accent}33` }} />
    </div>
  )
}

export default function CardCollection({ onClose }) {
  if (typeof window === "undefined") return null

  const cards = JSON.parse(localStorage.getItem("trailblazer-cards") || "[]")
  const sorted = [...cards].sort((a, b) => {
    const rd = (RARITY_ORDER[a.rarity] ?? 4) - (RARITY_ORDER[b.rarity] ?? 4)
    return rd !== 0 ? rd : new Date(b.date) - new Date(a.date)
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0c1322] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white" style={{ fontFamily: "Inter, sans-serif" }}>
              Collection
            </h2>
            <p className="text-[10px] text-slate-400" style={{ fontFamily: "Inter, sans-serif" }}>
              {cards.length} card{cards.length !== 1 ? "s" : ""} earned
            </p>
          </div>
          <button onClick={onClose}
            className="text-slate-500 hover:text-white text-xl leading-none transition-colors w-8 h-8 flex items-center justify-center">
            ✕
          </button>
        </div>

        {/* Cards */}
        <div className="overflow-y-auto p-5">
          {sorted.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-12" style={{ fontFamily: "Inter, sans-serif" }}>
              No cards yet. Finish a game to earn your first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3 justify-center">
              {sorted.map((card, i) => <TradeCard key={i} card={card} />)}
            </div>
          )}
        </div>

        {/* Rarity legend */}
        <div className="px-5 py-3 border-t border-white/5 flex flex-wrap gap-x-4 gap-y-1 flex-shrink-0">
          {Object.entries(RARITY).map(([key, r]) => (
            <span key={key} className="text-[9px] flex items-center gap-1" style={{ fontFamily: "Inter, sans-serif" }}>
              <span style={{ color: r.accent }}>●</span>
              <span className="text-slate-500">{r.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
