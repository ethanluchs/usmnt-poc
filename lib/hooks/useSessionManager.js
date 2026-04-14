'use client'
import { useState, useEffect, useRef, useCallback } from "react"
import { fetchLocationPuzzles, fetchUserUnlockedCardIds, saveUserUnlockedCard } from "../game"
import { selectSessionPuzzles } from "../sessionHelpers"

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
  const unlockedCardIdsRef = useRef(new Set())
  const [unlockedCards, setUnlockedCards] = useState([])
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0)
  
  // Track which puzzles have been processed to prevent duplicate unlocks
  const processedSolvesRef = useRef(new Set())

  useEffect(() => {
    if (userId === undefined) return  // auth not resolved yet so end early

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

        unlockedCardIdsRef.current = userCardIds
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
   * @param {number} puzzleIndex - Current puzzle index
   */
  const handlePuzzleSolved = useCallback(async (player, puzzleIndex) => {
    if (!player) return

    const solveKey = `${puzzleIndex}:${player.id}`
    if (processedSolvesRef.current.has(solveKey)) return
    processedSolvesRef.current.add(solveKey)

    setUnlockedCards(prev => [...prev, player])

    if (userId && !unlockedCardIdsRef.current.has(player.id)) {
      try {
        await saveUserUnlockedCard(userId, player)
        unlockedCardIdsRef.current.add(player.id)
      } catch (error) {
        console.error("Failed to save unlocked card", error)
      }
    }

    setPuzzlesCompleted((prev) => prev + 1)
  }, [userId])

  return {
    sessionPlayers,
    playerPool,
    unlockedCards,
    loadingPuzzles,
    puzzlesCompleted,
    handlePuzzleSolved,
  }
}
