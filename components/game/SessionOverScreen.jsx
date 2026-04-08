'use client'
import { motion } from "motion/react"

export default function SessionOverScreen({ isDark, puzzlesCompleted, incorrectGuesses }) {
  const bg = isDark ? "#1a1917" : "#ede8d0"
  const text = isDark ? "#b8b2a0" : "#000000"
  const dim = isDark ? "#6b6660" : "#888"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: bg }}
    >
      <div className="flex flex-col items-center gap-6 text-center px-8">
        <span style={{ color: text }} className="text-3xl tracking-widest uppercase">Session Over</span>
        <div className="flex flex-col gap-2">
          <span style={{ color: text }} className="text-lg">
            {puzzlesCompleted} / 5 puzzles solved
          </span>
          <span style={{ color: dim }} className="text-sm">
            {incorrectGuesses} wrong guess{incorrectGuesses !== 1 ? "es" : ""}
          </span>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{ border: `1px solid ${text}`, color: text }}
          className="mt-2 px-6 py-2 text-sm tracking-widest uppercase rounded hover:opacity-60 transition-opacity active:scale-95"
        >
          Play Again
        </button>
      </div>
    </motion.div>
  )
}
