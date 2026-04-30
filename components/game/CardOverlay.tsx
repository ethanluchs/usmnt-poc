"use client";
import PlayerCard from "./PlayerCard";
import { useAuth } from "../AuthProvider";
import { Player } from "../../lib/types";

interface CardOverlayProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  unlockedCards?: Player[];
  playerPool?: Player[];
}

export default function CardOverlay({
  isDark,
  isOpen,
  onClose,
  unlockedCards = [],
  playerPool = [],
}: CardOverlayProps) {
  const { user, signInWithGoogle } = useAuth();
  const unlockedIds = new Set(unlockedCards.map((c) => c.id));
  const sortedPool = [...playerPool].sort(
    (a, b) => Number(unlockedIds.has(b.id)) - Number(unlockedIds.has(a.id))
  );

  return (
    <div className={`w-full h-full flex flex-col ${isDark ? "bg-[#1a1917]" : "bg-white"}`}>
      <div className="flex items-center justify-between px-12 py-3 shrink-0">
        <span className={`text-md font-bold tracking-widest uppercase ${isDark ? "text-white" : "text-black"}`}>
          {unlockedCards.length} / {playerPool.length} cards
        </span>
        <div className="flex items-center gap-4">
          {!user && (
            <span className={`text-sm ${isDark ? "text-white" : "text-black"}`}>
              <a className="underline cursor-pointer" onClick={signInWithGoogle}>Sign in</a>
              {" to save progress"}
            </span>
          )}
          <button
            onClick={onClose}
            className={`text-2xl leading-none ${isDark ? "text-white/60 hover:text-white" : "text-black/40 hover:text-black"}`}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-12 pb-16">
        <div className="grid grid-cols-5 gap-4 sm:grid-cols-6">
          {sortedPool.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              unlocked={unlockedIds.has(player.id)}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
