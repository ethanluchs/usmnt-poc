"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import TopBar from "./TopBar";
import WorldMap from "./WorldMap";
import BottomBar from "./BottomBar";
import AsciiOverlay from "../AsciiOverlay";
import PuzzleTransition from "./PuzzleTransition";
import SessionOverScreen from "./SessionOverScreen";
import { useGameState } from "../../lib/hooks/useGameState";
import { useTheme } from "../../lib/hooks/useTheme";
import { useSessionManager } from "../../lib/hooks/useSessionManager";
import { useAuth } from "../AuthProvider";
import { GuessResult, PanTarget, Player } from "../../lib/types";

interface PuzzleResult {
  player: Player;
  stopsRevealed: number;
  solved: boolean;
  guessLog: { stop: number }[];
}

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
    totalPoints,
    handlePuzzleSolved,
  } = useSessionManager(userId);

  const [isDragging, setIsDragging] = useState(false);
  const [showAllCards, setShowAllCards] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const [showSessionOver, setShowSessionOver] = useState(false);
  const [guessResult, setGuessResult] = useState<GuessResult>(null);
  const [panTarget, setPanTarget] = useState<PanTarget>(null);
  const advancingRef = useRef<boolean>(false);
  const puzzleResultsRef = useRef<PuzzleResult[]>([]);

  const {
    player,
    puzzleIndex,
    currentStop,
    incorrectGuesses,
    guessLog,
    solved,
    puzzleFailed,
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
    setShowAllCards(false);
  }, [revealedStops.length]);

  useEffect(() => {
    if (!solved || !player) return;
    handlePuzzleSolved(player, puzzleIndex, currentStop);
    if (!puzzleResultsRef.current.some((r) => r.player.id === player.id)) {
      puzzleResultsRef.current = [...puzzleResultsRef.current, { player, stopsRevealed: currentStop + 1, solved: true, guessLog }];
    }
    if (isLastPuzzle) { setShowSessionOver(true); return; }
    advancingRef.current = false;
    setShowTransition(true);
    if (nextFirstStop) {
      setTimeout(() => setPanTarget({ lng: nextFirstStop.lng, lat: nextFirstStop.lat }), 600);
    }
  }, [solved, player, puzzleIndex, isLastPuzzle, nextFirstStop, handlePuzzleSolved]);

  const failHandledRef = useRef<boolean>(false);

  useEffect(() => {
    if (!puzzleFailed) { failHandledRef.current = false; return; }
    if (!player || failHandledRef.current) return;
    failHandledRef.current = true;
    if (!puzzleResultsRef.current.some((r) => r.player.id === player.id)) {
      puzzleResultsRef.current = [...puzzleResultsRef.current, { player, stopsRevealed: currentStop + 1, solved: false, guessLog }];
    }
    if (isLastPuzzle) { setShowSessionOver(true); return; }
    advancingRef.current = false;
    setShowTransition(true);
    if (nextFirstStop) {
      setTimeout(() => setPanTarget({ lng: nextFirstStop.lng, lat: nextFirstStop.lat }), 600);
    }
  }, [puzzleFailed, player, isLastPuzzle, nextFirstStop]);

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
        {showOverlay && <AsciiOverlay onDone={() => setShowOverlay(false)} isDark={false} />}
      </AnimatePresence>

      <AnimatePresence>
        {showTransition && totalPuzzles > 0 && (
          <PuzzleTransition
            fromNumber={puzzleIndex + 1}
            toNumber={puzzleIndex + 2}
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
            totalPoints={totalPoints}
            totalPuzzles={totalPuzzles}
            sessionPlayers={sessionPlayers}
            puzzleResults={puzzleResultsRef.current}
          />
        )}
      </AnimatePresence>

      <TopBar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isDragging={isDragging}
        puzzleIndex={totalPuzzles === 0 ? 0 : puzzleIndex + 1}
        totalPuzzles={totalPuzzles}
        unlockedCards={unlockedCards}
        playerPool={playerPool}
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
        showAllCards={showAllCards}
      />

      <BottomBar
        incorrectGuesses={incorrectGuesses}
        onGuess={handleGuess}
        onNextStop={onNextStop}
        solved={solved || puzzleFailed || !player || loadingPuzzles}
        isLastStop={isLastStop}
        playerPool={playerPool}
        revealedStops={revealedStops}
        showAllCards={showAllCards}
        onOverview={() => { setShowAllCards((v) => !v); setPanTarget({ overview: true }); }}
      />
    </motion.main>
  );
}
