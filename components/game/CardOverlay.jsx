'use client'
import { motion, AnimatePresence } from "motion/react"
import PlayerCard from "./PlayerCard"

export default function CardOverlay({ isDark, isOpen, onClose, unlockedCards = [], playerPool = [] }) {
  const unlockedIds = new Set(unlockedCards.map(c => c.id))
  const sortedPool = [...playerPool].sort((a, b) => Number(unlockedIds.has(b.id)) - Number(unlockedIds.has(a.id))
)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y:"100%", opacity: 0 }}
          animate={{ opacity: 1, y:"0" }}
          exit={{ opacity: 0, y:"100%" }}
          transition={{ duration: 0.2, ease:"circInOut" }}
          className={`absolute inset-0 z-50 flex flex-col ${isDark ? "bg-[#1a1917]" : "bg-[#ede8d0]"}`}
        >
          {/* header */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <span className={`text-sm font-bold tracking-widest uppercase ${isDark ? "text-white/50" : "text-black/40"}`}>
              {unlockedCards.length} / {playerPool.length} cards
            </span>
            <button
              onClick={onClose}
              className={`text-2xl leading-none ${isDark ? "text-white/60 hover:text-white" : "text-black/40 hover:text-black"}`}
            >
              ✕
            </button>
          </div>

          {/* grid */}
          <div className="flex-1 overflow-y-auto scrollbar-none px-12 pb-16">
            {playerPool.length === 0 ? (
              <p className={`text-sm text-center py-16 tracking-wide ${isDark ? "text-white/40" : "text-black/40"}`}>
                No cards yet
              </p>
            ) : (
              <div className="grid grid-cols-5 gap-4 sm:grid-cols-6">
                {sortedPool.map(player => (
                  <PlayerCard key={player.id} player={player} unlocked={unlockedIds.has(player.id)} isDark={isDark} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}