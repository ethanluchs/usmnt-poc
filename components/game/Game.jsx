'use client'
import { useState, useEffect } from "react"
import TopBar from "./TopBar"
import WorldMap from "./WorldMap"
import BottomBar from "./BottomBar"
import LoadingOverlay from "../LoadingOverlay"
import { AnimatePresence } from "framer-motion"

export default function Game() {
  const [isDark, setIsDark] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [incorrectGuesses] = useState([])
  const [solved] = useState(false)

  useEffect(() => {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (dark) { document.documentElement.classList.add("dark"); setIsDark(true) }
  }, [])

  const toggleTheme = () => {
    setIsDark(prev => {
      document.documentElement.classList.toggle("dark", !prev)
      return !prev
    })
  }

  return (
    <main className="relative w-screen h-screen bg-[#ede8d0] dark:bg-black">
      <AnimatePresence>
        {showOverlay && <LoadingOverlay onDone={() => setShowOverlay(false)} />}
      </AnimatePresence>

      <TopBar isDark={isDark} onToggleTheme={toggleTheme} isDragging={isDragging} />

      <WorldMap
        isDark={isDark}
        isDragging={isDragging}
        onMoveStart={() => setIsDragging(true)}
        onMoveEnd={() => setIsDragging(false)}
        revealedCountryCodes={new Set()}
      />

      <BottomBar
        incorrectGuesses={incorrectGuesses}
        onGuess={() => {}}
        onNextStop={() => {}}
        solved={solved}
      />
    </main>
  )
}
