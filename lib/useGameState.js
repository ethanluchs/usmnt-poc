'use client'
import { useState, useEffect } from "react"
import { MOCK_PLAYERS } from "./mockData"

const MAX_GUESSES = 5
const DAILY_PUZZLES_AVAILABLE = 5

function buildSessionPuzzles() {
    const shuffled = [...MOCK_PLAYERS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 5)
}

export function useGameState() {
    const [sessionPlayers] = useState(() => buildSessionPuzzles())
    const [puzzleIndex, setPuzzleIndex] = useState(0)
    const [player, setPlayer] = useState(null);
    const [currentStop, setCurrentStop] = useState(0);
    const [incorrectGuesses, setIncorrectGuesses] = useState([]);
    const [solved, setSolved] = useState(false);

    useEffect(() => {
        const p = sessionPlayers[puzzleIndex]
        setPlayer(p);
        setCurrentStop(0);
        setSolved(false);
    }, [puzzleIndex])

    const revealedStops = player?.careerStops.slice(0, currentStop + 1) ?? []

    const outOfGuesses = incorrectGuesses.length >= MAX_GUESSES
    const sessionOver = outOfGuesses

    const onGuess = (name) => {
        if (name.toLowerCase() === player?.name.toLowerCase()) {
            setSolved(true)
        } else {
            setIncorrectGuesses(prev => [...prev, name])
        }
    }

    const onNextStop = () => {
        setCurrentStop(prev => Math.min(prev + 1, (player?.careerStops.length ?? 1) - 1))
    }

    const isLastPuzzle = puzzleIndex >= sessionPlayers.length - 1

    const onNextPuzzle = () => {
        if (!isLastPuzzle) setPuzzleIndex(prev => prev + 1)
    }

    return { player, puzzleIndex, currentStop, incorrectGuesses, solved, revealedStops, onGuess, onNextStop, onNextPuzzle, sessionOver, isLastPuzzle }
}
