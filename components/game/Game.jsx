'use client'
import { useState, useEffect } from "react"
import TopBar from "./TopBar"
import WorldMap from "./WorldMap"
import BottomBar from "./BottomBar"
import LoadingOverlay from "../LoadingOverlay"
import PuzzleTransition from "./PuzzleTransition"
import SessionOverScreen from "./SessionOverScreen"
import { AnimatePresence } from "framer-motion"
import { useGameState } from "../../lib/useGameState"

export default function Game() {
  const [isDark, setIsDark] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [showTransition, setShowTransition] = useState(false)
  const [showSessionOver, setShowSessionOver] = useState(false)
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0)

  const { player, puzzleIndex, currentStop, incorrectGuesses, solved, revealedStops, onGuess, onNextStop, onNextPuzzle, sessionOver, isLastPuzzle } = useGameState()

  useEffect(() => {
    if (!solved) return
    if (isLastPuzzle) {
      setPuzzlesCompleted(prev => prev + 1)
      setShowSessionOver(true)
    } else {
      setShowTransition(true)
    }
  }, [solved, isLastPuzzle])

  useEffect(() => {
    if (sessionOver) setShowSessionOver(true)
  }, [sessionOver])

  const handleNextPuzzle = () => {
    setShowTransition(false)
    setPuzzlesCompleted(prev => prev + 1)
    onNextPuzzle()
  }

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const dark = stored ? stored === 'dark' : prefersDark
    if (dark) { document.documentElement.classList.add("dark"); setIsDark(true) }
    else { document.documentElement.classList.remove("dark") }
  }, [])

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev
      document.documentElement.classList.toggle("dark", next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <main className="relative w-screen h-screen bg-[#ede8d0] dark:bg-[#1a1917]">
      <AnimatePresence>
        {showOverlay && <LoadingOverlay onDone={() => setShowOverlay(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showTransition && (
          <PuzzleTransition
            puzzleNumber={puzzleIndex + 2}
            onDone={handleNextPuzzle}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSessionOver && (
          <SessionOverScreen
            isDark={isDark}
            puzzlesCompleted={puzzlesCompleted}
            incorrectGuesses={incorrectGuesses.length}
          />
        )}
      </AnimatePresence>

      <TopBar isDark={isDark} onToggleTheme={toggleTheme} isDragging={isDragging} puzzleIndex={puzzleIndex + 1} />

      <WorldMap
        isDark={isDark}
        isDragging={isDragging}
        onMoveStart={() => setIsDragging(true)}
        onMoveEnd={() => setIsDragging(false)}
        revealedStops={revealedStops}
        puzzleIndex={puzzleIndex}
        currentStop={currentStop}
      />

      <BottomBar
        incorrectGuesses={incorrectGuesses}
        onGuess={onGuess}
        onNextStop={onNextStop}
        solved={solved}
      />
    </main>
  )
}
