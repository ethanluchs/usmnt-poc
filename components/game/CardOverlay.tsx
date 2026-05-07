"use client";
import PlayerCard from "./PlayerCard";
import { useAuth } from "../AuthProvider";
import { Player } from "../../lib/types";
import { useMemo, useState } from "react";

interface CardOverlayProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  unlockedCards?: Player[];
  playerPool?: Player[];
  allCountries?: string[];
}

export default function CardOverlay({
  isDark,
  isOpen,
  onClose,
  unlockedCards = [],
  playerPool = [],
  allCountries = [],
}: CardOverlayProps) {
  const { user, signInWithGoogle } = useAuth();
  const unlockedIds = new Set(unlockedCards.map((c) => c.id));

  const countryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of allCountries) set.add(String(c));
    for (const p of playerPool) {
      if (p.nationality) set.add(p.nationality);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [allCountries, playerPool]);

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const sortedPool = useMemo(() => {
    const list = [...playerPool].sort(
      (a, b) => Number(unlockedIds.has(b.id)) - Number(unlockedIds.has(a.id))
    );
    if (selectedCountries.length === 0) return list;
    const sel = new Set(selectedCountries);
    return list.filter((p) => sel.has(p.nationality));
  }, [playerPool, unlockedCards, selectedCountries]);

  const selectClass = isDark
    ? "border border-white/20 bg-black/30 text-white text-sm"
    : "border border-black/20 bg-white text-black text-sm";

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

      {countryOptions.length > 0 && (
        <div className={`px-12 pb-2 flex flex-wrap items-end gap-2 ${isDark ? "text-white/80" : "text-black/80"}`}>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide">
            Countries
            <select
              multiple
              size={Math.min(10, countryOptions.length)}
              value={selectedCountries}
              onChange={(e) =>
                setSelectedCountries(Array.from(e.target.selectedOptions, (o) => o.value))
              }
              className={`min-w-[12rem] px-2 py-1 ${selectClass}`}
            >
              {countryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setSelectedCountries([])}
            className={`text-xs underline ${isDark ? "text-white/60" : "text-black/50"}`}
          >
            Clear filter
          </button>
          <span className={`text-xs ${isDark ? "text-white/40" : "text-black/40"}`}>
            Ctrl/Cmd+click for multiple
          </span>
        </div>
      )}

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
