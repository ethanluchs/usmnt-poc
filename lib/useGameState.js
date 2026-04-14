'use client'
import { useState, useEffect } from "react"

const MAX_GUESSES = 5

export function useGameState(sessionPlayers = []) {
    const [puzzleIndex, setPuzzleIndex] = useState(0)
    const [player, setPlayer] = useState(null);
    const [currentStop, setCurrentStop] = useState(0);
    const [incorrectGuesses, setIncorrectGuesses] = useState([]);
    const [solved, setSolved] = useState(false);

    useEffect(() => {
        setPuzzleIndex(0)
    }, [sessionPlayers])

    useEffect(() => {
        const p = sessionPlayers[puzzleIndex]
        console.log('🎲 useGameState effect - puzzleIndex:', puzzleIndex, 'sessionPlayers.length:', sessionPlayers.length, 'player:', p?.name, 'careerStops:', p?.careerStops?.length)
        setPlayer(p || null);
        setCurrentStop(0);
        setIncorrectGuesses([]);
        setSolved(false);
    }, [sessionPlayers, puzzleIndex])

    const revealedStops = player?.careerStops?.slice(0, currentStop + 1) ?? []

    const outOfGuesses = incorrectGuesses.length >= MAX_GUESSES
    const sessionOver = sessionPlayers.length === 0 || outOfGuesses

    const onGuess = (name) => {
        const normalized = name.trim().toLowerCase()
        if (incorrectGuesses.some(g => g.toLowerCase() === normalized)) return null
        if (normalized === player?.name.toLowerCase()) {
            setSolved(true)
            return 'correct'
        } else {
            setIncorrectGuesses(prev => [...prev, name.trim()])
            return 'wrong'
        }
    }

    const onNextStop = () => {
        setCurrentStop(prev => Math.min(prev + 1, (player?.careerStops?.length ?? 1) - 1))
    }

    const isLastPuzzle = sessionPlayers.length > 0 && puzzleIndex >= sessionPlayers.length - 1
    const nextFirstStop = !isLastPuzzle ? sessionPlayers[puzzleIndex + 1]?.careerStops?.[0] : null
    const isLastStop = currentStop >= (player?.careerStops?.length ?? 1) - 1
    const totalPuzzles = sessionPlayers.length

    const onNextPuzzle = () => {
        console.log('🎲 onNextPuzzle called - current puzzleIndex:', puzzleIndex, 'isLastPuzzle:', isLastPuzzle, 'sessionPlayers.length:', sessionPlayers.length)
        if (!isLastPuzzle) {
            console.log('🎲 Setting puzzleIndex to:', puzzleIndex + 1)
            setPuzzleIndex(prev => prev + 1)
        } else {
            console.log('🎲 Already on last puzzle, not advancing')
        }
    }

    return { player, puzzleIndex, currentStop, incorrectGuesses, solved, revealedStops, 
        onGuess, onNextStop, onNextPuzzle, sessionOver, isLastPuzzle, isLastStop, nextFirstStop, totalPuzzles }
}
