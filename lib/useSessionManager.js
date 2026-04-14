'us client'
import { useState, useEffect, useRef, useCallback } from "react"
import { fetchLocationPuzzles, fetchUserUnlockedCardIds, saveUserUnlockedCard } from "./game"
import { selectSessionPuzzles } from "./sessionHelpers"

/**
 * Manages game session state including puzzle selection, card unlocking, and progress tracking
 * Extracts session-level business logic from Game component
 * 
 * @param {string|null} userId - The authenticated user's ID for card persistence
 * @returns {Object} Session state and handlers
 */
export function useSessionManager(userId) {
  const [sessionPlayers, setSessionPlayers] = useState([])
  const [playerPool, setPlayerPool] = useState([])
  const [loadingPuzzles, setLoadingPuzzles] = useState(true)
  const [unlockedCardIds, setUnlockedCardIds] = useState(new Set())
  const [unlockedCards, setUnlockedCards] = useState([])
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0)
  
  // Track which puzzles have been processed to prevent duplicate unlocks
  const processedSolvesRef = useRef(new Set())

  // Initialize session: fetch puzzles and select subset for this session
  useEffect(() => {
    let cancelled = false

    const loadSession = async () => {
      setLoadingPuzzles(true)

      try {
        const [allPuzzles, userCardIds] = await Promise.all([
          fetchLocationPuzzles(),
         userId ? fetchUserUnlockedCardIds(userId) : Promise.resolve(new Set()),
        ])

        if (cancelled) return

        const selectedPuzzles = selectSessionPuzzles(allPuzzles, userCardIds)

        setUnlockedCardIds(userCardIds)
        setPlayerPool(allPuzzles)
        setSessionPlayers(selectedPuzzles)
        setPuzzlesCompleted(0)
        processedSolvesRef.current = new Set()
      } catch (error) {
        console.error("Failed to load puzzles", error)
        if (!cancelled) {
          setSessionPlayers([])
          setPlayerPool([])
        }
      } finally {
        if (!cancelled) setLoadingPuzzles(false)
      }
    }

    loadSession()

    return () => {
      cancelled = true
    }
  }, [userId])

  /**
   * Handle puzzle completion: unlock card and save to backend
   * Called when player successfully solves a puzzle
   * 
   * @param {Object} player - The player data for the solved puzzle
   * @param {number} puzzleIndex - Current puzzl index
   */
  const handlePuzzleSolved = useCallback(async (player, puzzleIndex) => {
    console.log('🎮 handlePuzzleSolved called', {
        puzzleIndex,
        playerName: player?.name,
        currentPuzzlesCompleted: puzzlesCompleted,
        solveKey: `${puzzleIndex}:${player?.id}`,
        alreadyProcessed: processedSolvesRef.current.has(`${puzzleIndex}:${player?.id}`),
        processedSolves: [...processedSolvesRef.current]
    })
    if (!player) return

    // Create unique key to prevent processing the same solve multiple times
    const solveKey = `${puzzleIndex}:${player.id}`
    console.log('🎮 solveKey:', solveKey, 'already processed?', processedSolvesRef.current.has(solveKey))
    if (processedSolvesRef.current.has(solveKey)) {
      console.log('🎮 Already processed, skipping')
      return
    }
    processedSolvesRef.current.add(solveKey)

    console.log('🎮 Adding to unlocked cards')
    // Add to unlocked cards if not already present
    setUnlockedCards((prev) => {
      if (prev.some((card) => card.id === player.id)) {
        return prev
      }
      return [...prev, player]
    })

    // Save to backend if user is authenticated and card not already unlocked
    if (userId && !unlockedCardIds.has(player.id)) {
      console.log('🎮 Saving to backend - userId:', userId)
      try {
        await saveUserUnlockedCard(userId, player)
        console.log('🎮 Successfully saved to backend')
        setUnlockedCardIds((prev) => {
          const next = new Set(prev)
          next.add(player.id)
          return next
        })
      } catch (error) {
        console.error("Failed to save unlocked card", error)
      }
    } else {
      console.log('🎮 Not saving to backend - userId:', userId, 'already unlocked:', unlockedCardIds.has(player.id))
    }

    // Increment progress counter
    console.log('🎮 Incrementing progress counter')
    setPuzzlesCompleted((prev) => prev + 1)
    console.log('🎮 handlePuzzleSolved complete')
  }, [userId, unlockedCardIds])

  return {
    sessionPlayers,
    playerPool,
    unlockedCards,
    loadingPuzzles,
    puzzlesCompleted,
    handlePuzzleSolved,
  }
}
