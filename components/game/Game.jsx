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
    if (solved && !isLastPuzzle) setShowTransition(true)
    if (solved && isLastPuzzle) { setPuzzlesCompleted(prev => prev + 1); setShowSessionOver(true) }
  }, [solved])

  useEffect(() => {
    if (sessionOver) setShowSessionOver(true)
  }, [sessionOver])

  const handleNextPuzzle = () => {
    setShowTransition(false)
    if (isLastPuzzle) {
      setPuzzlesCompleted(prev => prev + 1)
      setShowSessionOver(true)
    } else {
      setPuzzlesCompleted(prev => prev + 1)
      onNextPuzzle()
    }
  }

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
