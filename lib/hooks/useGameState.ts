"use client";
import { useState, useEffect } from "react";
import { CareerStop, GuessResult, Player } from "../types";

const MAX_GUESSES = 3;

interface GameStateReturn {
  player: Player | null;
  puzzleIndex: number;
  currentStop: number;
  incorrectGuesses: string[];
  solved: boolean;
  revealedStops: CareerStop[];
  onGuess: (name: string) => GuessResult;
  onNextStop: () => void;
  onNextPuzzle: () => void;
  sessionOver: boolean;
  isLastPuzzle: boolean;
  isLastStop: boolean;
  nextFirstStop: CareerStop | null | undefined;
  totalPuzzles: number;
}

export function useGameState(sessionPlayers: Player[] = []): GameStateReturn {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [player, setPlayer] = useState<Player | null>(null);
  const [currentStop, setCurrentStop] = useState(0);
  const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    setPuzzleIndex(0);
  }, [sessionPlayers]);

  useEffect(() => {
    const p = sessionPlayers[puzzleIndex];
    setPlayer(p || null);
    setCurrentStop(0);
    setIncorrectGuesses([]);
    setSolved(false);
  }, [sessionPlayers, puzzleIndex]);

  const revealedStops: CareerStop[] =
    player?.careerStops?.slice(0, currentStop + 1) ?? [];

  const outOfGuesses = incorrectGuesses.length >= MAX_GUESSES;
  const sessionOver = sessionPlayers.length === 0 || outOfGuesses;

  const onGuess = (name: string): GuessResult => {
    const normalized = name.trim().toLowerCase();
    if (incorrectGuesses.some((g) => g.toLowerCase() === normalized))
      return null;
    if (normalized === player?.name.toLowerCase()) {
      setSolved(true);
      setIncorrectGuesses([]);
      return "correct";
    } else {
      setIncorrectGuesses((prev) => [...prev, name.trim()]);
      return "wrong";
    }
  };

  const onNextStop = () => {
    setCurrentStop((prev) =>
      Math.min(prev + 1, (player?.careerStops?.length ?? 1) - 1)
    );
  };

  const isLastPuzzle =
    sessionPlayers.length > 0 && puzzleIndex >= sessionPlayers.length - 1;
  const nextFirstStop = !isLastPuzzle
    ? sessionPlayers[puzzleIndex + 1]?.careerStops?.[0]
    : null;
  const isLastStop = currentStop >= (player?.careerStops?.length ?? 1) - 1;
  const totalPuzzles = sessionPlayers.length;

  const onNextPuzzle = () => {
    setSolved(false);
    if (!isLastPuzzle) setPuzzleIndex((prev) => prev + 1);
  };

  return {
    player,
    puzzleIndex,
    currentStop,
    incorrectGuesses,
    solved,
    revealedStops,
    onGuess,
    onNextStop,
    onNextPuzzle,
    sessionOver,
    isLastPuzzle,
    isLastStop,
    nextFirstStop,
    totalPuzzles,
  };
}
