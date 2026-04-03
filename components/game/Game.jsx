'use client'
import { useState, useEffect } from "react"
import TopBar from "./TopBar"
import WorldMap from "./WorldMap"
import BottomBar from "./BottomBar"
import AsciiOverlay from "../AsciiOverlay"

export default function Game() {
  const [isDark, setIsDark] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false) //set to false cause its annoying. either change back to true or put on bw screens like login -> game
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
      {showOverlay && <AsciiOverlay isDark={isDark} onDone={() => setShowOverlay(false)} />}

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
