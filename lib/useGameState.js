'use client'
import { useState, useEffect } from "react"
import { MOCK_PLAYERS, MOCK_PUZZLES } from "./mockData"

const MAX_GUESSES = 5
const DAILY_PUZZLES_AVAILABLE = 5

export function useGameState() {
    const [puzzleIndex, setPuzzleIndex] = useState(0)
    const [player, setPlayer] = useState(null);
    const [currentStop, setCurrentStop] = useState(0);
    const [incorrectGuesses, setIncorrectGuesses] = useState([]);
    const [solved, setSolved] = useState(false);

    useEffect(() => {
        const p = MOCK_PLAYERS.find(p => p.id === MOCK_PUZZLES[puzzleIndex].playerId)
        setPlayer(p);
        setCurrentStop(0);
        setIncorrectGuesses([]);
        setSolved(false);
    }, [puzzleIndex])

    const revealedStops = player?.careerStops.slice(0, currentStop + 1) ?? []

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

    const onNextPuzzle = () => {
        if (puzzleIndex < MOCK_PUZZLES.length - 1) setPuzzleIndex(prev => prev + 1)
    }

    return { player, puzzleIndex, currentStop, incorrectGuesses, solved, revealedStops, onGuess, onNextStop, onNextPuzzle }
}
