"use client";
import { motion } from "motion/react";
import { useAuth } from "../AuthProvider";
import { Player } from "../../lib/types";

interface PuzzleResult {
  player: Player;
  stopsRevealed: number;
  solved: boolean;
  guessLog: { stop: number }[];
}

interface SessionOverScreenProps {
  isDark: boolean;
  puzzlesCompleted: number;
  totalPoints: number;
  totalPuzzles: number;
  sessionPlayers: Player[];
  puzzleResults: PuzzleResult[];
}

const WC_GREEN = "#3CAC3B";
const WC_RED = "#E61D25";
const WC_GRAY = "#D1D4D1";

function StopBlock({ club, wrongCount, isCorrect, isRevealed }: {
  club: string;
  wrongCount: number;
  isCorrect: boolean;
  isRevealed: boolean;
}) {
  const slices: string[] = [];
  if (isRevealed) {
    for (let i = 0; i < wrongCount; i++) slices.push(WC_RED);
    if (isCorrect) slices.push(WC_GREEN);
    if (slices.length === 0) slices.push(WC_GRAY);
  } else {
    slices.push("#000000");
  }

  const textColor = slices[0] === WC_GRAY ? "#000000" : isRevealed ? "#ffffff" : "#aaaaaa";

  return (
    <div className="flex-1 flex overflow-hidden rounded-md relative gap-px" style={{ minWidth: 0 }}>
      {slices.map((color, i) => (
        <div key={i} className="flex-1 h-full" style={{ background: color }} />
      ))}
      <div className="absolute inset-0 flex items-center px-1.5">
        <span
          className="text-xs uppercase leading-tight break-words"
          style={{ color: textColor, wordBreak: "break-word", overflowWrap: "break-word" }}
        >
          {club}
        </span>
      </div>
    </div>
  );
}

function ResultPill({ player, result }: { player: Player; result: PuzzleResult | undefined }) {
  const solved = result?.solved ?? false;
  const stopsRevealed = result?.stopsRevealed ?? 0;
  const guessLog = result?.guessLog ?? [];

  return (
    <div className="w-full flex overflow-hidden rounded-xl" style={{ minHeight: "95px" }}>
      <div className="flex flex-col justify-center px-4 shrink-0 w-1/4">
        <span className={`text-xl uppercase leading-tight ${solved ? "text-green-600" : "text-red-600"}`}>
          {solved ? player.name : "???"}
        </span>
        <span className="text-sm text-black mt-1">
          {player.nationality}
        </span>
      </div>

      <div className="flex flex-1 items-stretch gap-1 px-2 py-1.5">
        {player.careerStops.map((stop, i) => {
          const wrongCount = guessLog.filter((g) => g.stop === i).length;
          const isCorrect = solved && i === stopsRevealed - 1;
          const isRevealed = i < stopsRevealed;
          return (
            <StopBlock
              key={i}
              club={stop.club}
              wrongCount={wrongCount}
              isCorrect={isCorrect}
              isRevealed={isRevealed}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function SessionOverScreen({
  isDark,
  puzzlesCompleted,
  totalPoints,
  totalPuzzles,
  sessionPlayers,
  puzzleResults,
}: SessionOverScreenProps) {
  const { user, signInWithGoogle } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`absolute inset-0 z-[60] overflow-y-auto scrollbar-none ${isDark ? "bg-[#1a1917]" : "bg-white"}`}
    >
      <div className="flex flex-col items-center gap-4 px-6 py-10 min-h-full">

        <div className="flex flex-col items-center gap-1">
          <span className="text-lg tracking-widest text-black">
            {puzzlesCompleted} / {totalPuzzles} SOLVED · {totalPoints} PTS
          </span>
          {!user && (
            <span className="text-sm text-black">
              <a className="underline cursor-pointer" onClick={signInWithGoogle}>Log in</a>
              {" to save progress"}
            </span>
          )}
        </div>

        <div className="flex flex-col w-full max-w-2xl">
          {sessionPlayers.map((player, idx) => {
            const result = puzzleResults.find((r) => r.player.id === player.id);
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.09, duration: 0.35, ease: "easeOut" }}
              >
                <ResultPill player={player} result={result} />
              </motion.div>
            );
          })}
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-8 py-2.5 text-xs uppercase tracking-widest border border-black text-black hover:opacity-60 transition-opacity active:scale-95"
        >
          PLAY AGAIN
        </button>

      </div>
    </motion.div>
  );
}
