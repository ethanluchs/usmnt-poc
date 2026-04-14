'use client'
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import TopBar from "./TopBar"
import WorldMap from "./WorldMap"
import BottomBar from "./BottomBar"
import LoadingOverlay from "../LoadingOverlay"
import PuzzleTransition from "./PuzzleTransition"
import SessionOverScreen from "./SessionOverScreen"
import CardOverlay from "./CardOverlay"
import { useGameState } from "../../lib/useGameState"
import { useTheme } from "../../lib/useTheme"
import { useSessionManager } from "../../lib/useSessionManager"
import { useAuth } from "../AuthProvider"

export default function Game() {
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  
  // Session-level state managed by useSessionManager hook
  const { sessionPlayers, playerPool, unlockedCards, loadingPuzzles, puzzlesCompleted, handlePuzzleSolved } = useSessionManager(user?.uid)
  
  // UI-only state
  const [isDragging, setIsDragging] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [showTransition, setShowTransition] = useState(false)
  const [showSessionOver, setShowSessionOver] = useState(false)
  const [guessResult, setGuessResult] = useState(null)
  const [panTarget, setPanTarget] = useState(null)
  const [showCards, setShowCards] = useState(false)
  const advancingRef = useRef(false)

  // Puzzle-level state managed by useGameState hook
  const { player, puzzleIndex, currentStop, incorrectGuesses, solved, 
        revealedStops, onGuess, onNextStop, onNextPuzzle, sessionOver, 
        isLastPuzzle, isLastStop, nextFirstStop, totalPuzzles } = useGameState(sessionPlayers)

  const handleGuess = (name) => {
    const result = onGuess(name)
    setGuessResult(result)
    if (result === 'wrong') setTimeout(() => setGuessResult(null), 900)
  }

  // make sure useeffect only refires when game state changes
  const handlePuzzleSolvedRef = useRef(handlePuzzleSolved)
  useEffect(() => { handlePuzzleSolvedRef.current = handlePuzzleSolved }, [handlePuzzleSolved])

  // Handle puzzle completion: unlock card and manage UI transitions
  useEffect(() => {
    if (!solved || !player) return

    console.log('🎯 solved useEffect fired', {
      solved,
      playerName: player?.name,
      puzzleIndex,
    })

    // Delegate card unlocking to session manager
    handlePuzzleSolvedRef.current(player, puzzleIndex)

    // Handle UI transitions
    if (isLastPuzzle) {
      console.log('🎯 Last puzzle - showing session over')
      setShowSessionOver(true)
      return
    }
    console.log('🎯 Not last puzzle - showing transition. nextFirstStop:', nextFirstStop)
    advancingRef.current = false
    setShowTransition(true)
    if (nextFirstStop) {
      setTimeout(() => {
        console.log('🎯 Setting panTarget:', nextFirstStop)
        setPanTarget({ lng: nextFirstStop.lng, lat: nextFirstStop.lat })
      }, 600)
    }
  }, [solved, player, puzzleIndex, isLastPuzzle, nextFirstStop, handlePuzzleSolved])

  // Show session over screen when session ends or no puzzles available
  useEffect(() => {
    if (loadingPuzzles) return
    if (sessionOver || sessionPlayers.length === 0) {
      setShowSessionOver(true)
    }
  }, [sessionOver, sessionPlayers.length, loadingPuzzles])

  const handleNextPuzzle = () => {
    console.log('🎯 handleNextPuzzle called - advancingRef:', advancingRef.current)
    if (advancingRef.current) return
    advancingRef.current = true

    console.log('🎯 Advancing to next puzzle - current puzzleIndex:', puzzleIndex)
    setGuessResult(null)
    setPanTarget(null)
    setShowTransition(false)
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
        {showTransition && totalPuzzles > 0 && (
          <PuzzleTransition
            puzzleNumber={puzzleIndex + 2}
            totalPuzzles={totalPuzzles}
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
            totalPuzzles={totalPuzzles}
          />
        )}
      </AnimatePresence>

      <TopBar isDark={isDark} onToggleTheme={toggleTheme} onOpenCards={() => setShowCards(true)} 
      cardCount={unlockedCards.length} isDragging={isDragging} puzzleIndex={totalPuzzles === 0 ? 0 : puzzleIndex + 1} totalPuzzles={totalPuzzles} playerPool={playerPool} />

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
        solved={solved || !player || loadingPuzzles}
        isLastStop={isLastStop}
        playerPool={playerPool}
      />

      <CardOverlay isDark={isDark} isOpen={showCards} onClose={() => setShowCards(false)} unlockedCards={unlockedCards} />
    </motion.main>
  )
}
