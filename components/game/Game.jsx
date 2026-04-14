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
import { fetchLocationPuzzles, fetchUserUnlockedCardIds, saveUserUnlockedCard } from "../../lib/game"
import { useAuth } from "../AuthProvider"

// test

const SESSION_PUZZLE_COUNT = 5

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

export default function Game() {
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [isDragging, setIsDragging] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [showTransition, setShowTransition] = useState(false)
  const [showSessionOver, setShowSessionOver] = useState(false)
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0)
  const [guessResult, setGuessResult] = useState(null)
  const [panTarget, setPanTarget] = useState(null)
  const [sessionPlayers, setSessionPlayers] = useState([])
  const [playerPool, setPlayerPool] = useState([])
  const [loadingPuzzles, setLoadingPuzzles] = useState(true)
  const [unlockedCardIds, setUnlockedCardIds] = useState(new Set())
  const [unlockedCards, setUnlockedCards] = useState([]);
  const [showCards, setShowCards] = useState(false)
  const lastHandledSolvedKey = useRef(null)
  const wasSolvedRef = useRef(false)
  const advancingRef = useRef(false)

  const { player, puzzleIndex, currentStop, incorrectGuesses, solved, revealedStops,
    onGuess, onNextStop, onNextPuzzle, sessionOver, isLastPuzzle, isLastStop, nextFirstStop, totalPuzzles } = useGameState(sessionPlayers)

  useEffect(() => {
    let cancelled = false

    const loadSession = async () => {
      setLoadingPuzzles(true)

      try {
        const [allPuzzles, userCardIds] = await Promise.all([
          fetchLocationPuzzles(),
          user?.uid ? fetchUserUnlockedCardIds(user.uid) : Promise.resolve(new Set()),
        ])

        if (cancelled) return

        const eligible = allPuzzles.filter((p) => !userCardIds.has(p.id))
        const picked = shuffle(eligible).slice(0, Math.min(SESSION_PUZZLE_COUNT, eligible.length))

        setUnlockedCardIds(userCardIds)
        setPlayerPool(eligible.length > 0 ? eligible : allPuzzles)
        setSessionPlayers(picked)
        lastHandledSolvedKey.current = null
        wasSolvedRef.current = false
        advancingRef.current = false
        setPuzzlesCompleted(0)
        setShowSessionOver(picked.length === 0)
      } catch (error) {
        console.error("Failed to load puzzles", error)
        if (!cancelled) {
          setSessionPlayers([])
          setPlayerPool([])
          setShowSessionOver(true)
        }
      } finally {
        if (!cancelled) setLoadingPuzzles(false)
      }
    }

    loadSession()

    return () => {
      cancelled = true
    }
  }, [user?.uid])

  const handleGuess = (name) => {
    const result = onGuess(name)
    setGuessResult(result)
    if (result === 'wrong') setTimeout(() => setGuessResult(null), 900)
  }

  useEffect(() => {
    if (!solved) {
      wasSolvedRef.current = false
      return
    }

    if (wasSolvedRef.current) return
    wasSolvedRef.current = true

    if (!player) return

    const solvedKey = `${puzzleIndex}:${player.id}`
    if (lastHandledSolvedKey.current === solvedKey) return
    lastHandledSolvedKey.current = solvedKey

    setUnlockedCards(prev => (prev.some(card => card.id === player.id) ? prev : [...prev, player]))

    if (user?.uid && !unlockedCardIds.has(player.id)) {
      saveUserUnlockedCard(user.uid, player).catch((error) => {
        console.error("Failed to save unlocked card", error)
      })
      setUnlockedCardIds(prev => {
        const next = new Set(prev)
        next.add(player.id)
        return next
      })
    }

    if (isLastPuzzle) {
      setPuzzlesCompleted(prev => prev + 1)
      setShowSessionOver(true)
      return
    }
    advancingRef.current = false
    setShowTransition(true)
    if (nextFirstStop) setTimeout(() => setPanTarget({ lng: nextFirstStop.lng, lat: nextFirstStop.lat }), 600)
  }, [solved, puzzleIndex, player, isLastPuzzle, nextFirstStop, user?.uid, unlockedCardIds])

  useEffect(() => {
    if (loadingPuzzles) return
    if (sessionOver) setShowSessionOver(true)
  }, [sessionOver, loadingPuzzles])

  const handleNextPuzzle = () => {
    if (advancingRef.current) return
    advancingRef.current = true

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
