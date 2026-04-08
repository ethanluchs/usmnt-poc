'use client'
import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import InfoModal from "./InfoModal"

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const LETTERS_EXPANDED = ["W", "o", "r", "d", "l", "e", " ", "C", "u", "p"]
const LETTERS_COLLAPSED = ["W", "C", "2", "6"]

export default function TopBar({ isDark, onToggleTheme, puzzleIndex = 1, totalPuzzles = 5, isDragging = false }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showInfo, setShowInfo] = useState(false)

  if (isDragging && isExpanded) setIsExpanded(false)

  return (
    <div
      onMouseEnter={() => { if (!isDragging) setIsExpanded(true) }}
      onMouseLeave={() => setIsExpanded(false)}
      className="absolute top-0 left-0 right-0 flex flex-col items-center pt-4 pb-3 z-10 gap-1 rounded-b-xl"
    >
      {/* background */}
      <AnimatePresence mode="popLayout">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 rounded-b-xl ${isDark ? "bg-black/70" : "bg-[#ede8d0]/70"}`}
          />
        )}
      </AnimatePresence>

      {/* letters and icon*/}
      <div className="relative flex items-center justify-center gap-1 ml-10">
        <AnimatePresence mode="wait">
          {(isExpanded ? LETTERS_EXPANDED : LETTERS_COLLAPSED).map((letter, i) => (
            <motion.span
              key={letter === " " ? "space" : letter + i}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: i * 0.02 }}
              className="text-2xl tracking-widest uppercase text-black dark:text-[#b8b2a0]"
            >
              {letter}
            </motion.span>
          ))}

          {isExpanded && (
            <motion.button
              key="theme-toggle"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onToggleTheme}
              className="flex items-center justify-center text-black dark:text-[#b8b2a0] ml-2"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </motion.button>
          )}
          {isExpanded && (
            <motion.button
              key="info-toggle"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowInfo(true)}
              className="flex items-center justify-center text-black dark:text-[#b8b2a0] ml-1 text-sm leading-none opacity-60 hover:opacity-100 transition-opacity"
            >
              ?
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Puzzle counter */}
      <AnimatePresence>
        {isExpanded && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative text-xs tracking-widest text-black dark:text-[#b8b2a0] opacity-60"
          >
            PUZZLE {puzzleIndex} / {totalPuzzles}
          </motion.p>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showInfo && <InfoModal isDark={isDark} onClose={() => setShowInfo(false)} />}
      </AnimatePresence>
    </div>
  )
}
