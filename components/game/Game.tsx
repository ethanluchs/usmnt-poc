"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import TopBar from "./TopBar";
import WorldMap from "./WorldMap";
import BottomBar from "./BottomBar";
import LoadingOverlay from "../LoadingOverlay";
import PuzzleTransition from "./PuzzleTransition";
import SessionOverScreen from "./SessionOverScreen";
import CardOverlay from "./CardOverlay";
import { useGameState } from "../../lib/hooks/useGameState";
import { useTheme } from "../../lib/hooks/useTheme";
import { useSessionManager } from "../../lib/hooks/useSessionManager";
import { useAuth } from "../AuthProvider";
import { GuessResult, PanTarget } from "../../lib/types";

export default function Game() {
  const { user, loading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const userId = authLoading ? undefined : (user?.uid ?? null);

  const {
    sessionPlayers,
    playerPool,
    unlockedCards,
    loadingPuzzles,
    puzzlesCompleted,
    handlePuzzleSolved,
  } = useSessionManager(userId);

  const [isDragging, setIsDragging] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const [showSessionOver, setShowSessionOver] = useState(false);
  const [guessResult, setGuessResult] = useState<GuessResult>(null);
  const [panTarget, setPanTarget] = useState<PanTarget>(null);
  const [showCards, setShowCards] = useState(false);
  const advancingRef = useRef<boolean>(false);

  const {
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
  } = useGameState(sessionPlayers);

  const handleGuess = (name: string) => {
    const result = onGuess(name);
    setGuessResult(result);
    if (result === "wrong") setTimeout(() => setGuessResult(null), 900);
  };

  useEffect(() => {
    if (!solved || !player) return;

    handlePuzzleSolved(player, puzzleIndex);

    if (isLastPuzzle) {
      setShowSessionOver(true);
      return;
    }
    advancingRef.current = false;
    setShowTransition(true);
    if (nextFirstStop) {
      setTimeout(
        () => setPanTarget({ lng: nextFirstStop.lng, lat: nextFirstStop.lat }),
        600
      );
    }
  }, [solved, player, puzzleIndex, isLastPuzzle, nextFirstStop, handlePuzzleSolved]);

  useEffect(() => {
    if (loadingPuzzles) return;
    if (sessionOver || sessionPlayers.length === 0) {
      setShowSessionOver(true);
    }
  }, [sessionOver, sessionPlayers.length, loadingPuzzles]);

  const handleNextPuzzle = () => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setGuessResult(null);
    setPanTarget(null);
    setShowTransition(false);
    onNextPuzzle();
  };

  return (
    <motion.main
      className="relative w-screen h-screen bg-[#ede8d0] dark:bg-[#1a1917] transition-colors duration-300"
      animate={guessResult === "wrong" ? { x: [0, -12, 12, -9, 9, -5, 5, 0] } : { x: 0 }}
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

      <TopBar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isDragging={isDragging}
        puzzleIndex={totalPuzzles === 0 ? 0 : puzzleIndex + 1}
        totalPuzzles={totalPuzzles}
      />

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
        onOpenCards={() => setShowCards(true)}
        cardCount={unlockedCards.length}
        currentStop={currentStop + 1}
        totalStops={player?.careerStops?.length ?? 0}
      />

      <CardOverlay
        isDark={isDark}
        isOpen={showCards}
        onClose={() => setShowCards(false)}
        unlockedCards={unlockedCards}
        playerPool={playerPool}
      />
    </motion.main>
  );
}
