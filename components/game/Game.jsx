'use client'
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import TopBar from "./TopBar"
import WorldMap from "./WorldMap"
import BottomBar from "./BottomBar"
import LoadingOverlay from "../LoadingOverlay"
import PuzzleTransition from "./PuzzleTransition"
import SessionOverScreen from "./SessionOverScreen"
import { useGameState } from "../../lib/useGameState"
import { useTheme } from "../../lib/useTheme"

export default function Game() {
  const { isDark, toggleTheme } = useTheme()
  const [isDragging, setIsDragging] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [showTransition, setShowTransition] = useState(false)
  const [showSessionOver, setShowSessionOver] = useState(false)
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0)
  const [guessResult, setGuessResult] = useState(null)
  const [panTarget, setPanTarget] = useState(null)

  const { player, puzzleIndex, currentStop, incorrectGuesses, solved, revealedStops, onGuess, onNextStop, onNextPuzzle, sessionOver, isLastPuzzle, isLastStop, nextFirstStop } = useGameState()

  const handleGuess = (name) => {
    const result = onGuess(name)
    setGuessResult(result)
    if (result === 'wrong') setTimeout(() => setGuessResult(null), 900)
  }

  useEffect(() => {
    if (!solved) return
    if (isLastPuzzle) {
      setPuzzlesCompleted(prev => prev + 1)
      setShowSessionOver(true)
      return
    }
    setShowTransition(true)
    if (nextFirstStop) setTimeout(() => setPanTarget({ lng: nextFirstStop.lng, lat: nextFirstStop.lat }), 600)
  }, [solved, isLastPuzzle])

  useEffect(() => {
    if (sessionOver) setShowSessionOver(true)
  }, [sessionOver])

  const handleNextPuzzle = () => {
    setGuessResult(null)
    setPanTarget(null)
    setShowTransition(false)
    setPuzzlesCompleted(prev => prev + 1)
    onNextPuzzle()
  }

  return (
    <motion.main
      className="relative w-screen h-screen bg-[#ede8d0] dark:bg-[#1a1917]"
      animate={guessResult === 'wrong' ? { x: [0, -12, 12, -9, 9, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
    >
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
        guessResult={guessResult}
        panTarget={panTarget}
      />

      <BottomBar
        incorrectGuesses={incorrectGuesses}
        onGuess={handleGuess}
        onNextStop={onNextStop}
        solved={solved}
        isLastStop={isLastStop}
      />
    </motion.main>
  )
}
