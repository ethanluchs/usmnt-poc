"use client"

import { useState } from "react"

const MAX_WRONG = 5

const RARITY_LABEL = { legendary: "Legendary ★★★★★", epic: "Epic ★★★★", rare: "Rare ★★★", uncommon: "Uncommon ★★", common: "Common ★" }

function getRarity(score) {
  if (score >= 91) return "legendary"
  if (score >= 76) return "epic"
  if (score >= 51) return "rare"
  if (score >= 26) return "uncommon"
  return "common"
}

function buildShareText(score, wrongGuesses, voluntaryReveals, won) {
  const attempts = Array.from({ length: MAX_WRONG }, (_, i) => {
    if (i < wrongGuesses) return "🟥"
    if (i === wrongGuesses && won) return "🟩"
    return "⬜"
  }).join("")
  const revealStr = voluntaryReveals > 0 ? ` · ${voluntaryReveals} reveal${voluntaryReveals !== 1 ? "s" : ""}` : ""
  return `Trailblazer 🗺️\n${score} pts${revealStr}\n${attempts}`
}

export default function ResultCard({ player, score, stopsUsed, voluntaryReveals, wrongGuesses, won, onViewCollection }) {
  const [copied, setCopied] = useState(false)
  const rarity = getRarity(score)

  function handleShare() {
    const text = buildShareText(score, wrongGuesses, voluntaryReveals, won)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="border border-white/10 rounded-2xl p-5 bg-slate-900/80 backdrop-blur-md shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#f43f5e] mb-1"
             style={{ fontFamily: "Inter, sans-serif" }}>
            {won ? "Correct!" : "The answer was"}
          </p>
          <h2 className="text-xl font-bold tracking-tight text-white">{player.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
            {player.position} · {player.caps} caps
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-3xl font-bold text-[#f43f5e]">{score}</p>
          <p className="text-[10px] text-slate-400" style={{ fontFamily: "Inter, sans-serif" }}>points</p>
          <p className="text-[10px] text-slate-500 mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
            {RARITY_LABEL[rarity]}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm italic text-slate-300 border-l-2 border-[#f43f5e] pl-3">
        "{player.line}"
      </p>

      <div className="mt-3 flex gap-5 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
        <div>
          <span className="text-slate-400">Wrong </span>
          <span className="font-semibold text-slate-200">{wrongGuesses}/{MAX_WRONG}</span>
        </div>
        <div>
          <span className="text-slate-400">Reveals </span>
          <span className="font-semibold text-slate-200">{voluntaryReveals}</span>
        </div>
        <div>
          <span className="text-slate-400">Stops seen </span>
          <span className="font-semibold text-slate-200">{stopsUsed}/{player.stops.length}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={handleShare}
          className="flex-1 py-2.5 border border-white/10 rounded-lg text-sm font-semibold text-slate-200 hover:bg-white/5 transition-colors"
          style={{ fontFamily: "Inter, sans-serif" }}>
          {copied ? "Copied ✓" : "Share 🗺️"}
        </button>
        <button onClick={onViewCollection}
          className="flex-1 py-2.5 border border-white/10 rounded-lg text-sm font-semibold text-slate-200 hover:bg-white/5 transition-colors"
          style={{ fontFamily: "Inter, sans-serif" }}>
          View card 🃏
        </button>
      </div>
    </div>
  )
}
