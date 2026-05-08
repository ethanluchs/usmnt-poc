"use client";
import PlayerCard from "./PlayerCard";
import { useAuth } from "../AuthProvider";
import { Player } from "../../lib/types";
import { useEffect, useRef, useState } from "react";

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

  const countrySet = new Set<string>();
  for (const c of allCountries) countrySet.add(String(c));
  for (const p of playerPool) {
    if (p.nationality) countrySet.add(p.nationality);
  }
  const countryOptions = [...countrySet].sort((a, b) => a.localeCompare(b));

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const countryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) setCountryMenuOpen(false);
  }, [isOpen]);

  useEffect(() => {
    if (!countryMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (countryMenuRef.current && !countryMenuRef.current.contains(e.target as Node)) {
        setCountryMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [countryMenuOpen]);

  useEffect(() => {
    if (!countryMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCountryMenuOpen(false);
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [countryMenuOpen]);

  const list = [...playerPool].sort(
    (a, b) => Number(unlockedIds.has(b.id)) - Number(unlockedIds.has(a.id))
  );
  let sortedPool = list;
  if (selectedCountries.length > 0) {
    const sel = new Set(selectedCountries);
    sortedPool = list.filter((p) => sel.has(p.nationality));
  }

  const visibleTotal = sortedPool.length;
  const visibleUnlocked = sortedPool.reduce((n, p) => n + (unlockedIds.has(p.id) ? 1 : 0), 0);

  const countryTriggerClass = isDark
    ? "border border-white/20 bg-black/30 text-white text-sm"
    : "border border-black/20 bg-white text-black text-sm";

  let countrySummary = "All countries";
  if (selectedCountries.length === 1) countrySummary = selectedCountries[0];
  else if (selectedCountries.length > 1) countrySummary = `${selectedCountries.length} countries`;

  return (
    <div className={`w-full h-full flex flex-col ${isDark ? "bg-[#1a1917]" : "bg-white"}`}>
      <div className="flex items-center justify-between px-12 py-3 shrink-0">
        <span className={`text-md font-bold tracking-widest uppercase ${isDark ? "text-white" : "text-black"}`}>
          {visibleUnlocked} / {visibleTotal} cards
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
          <div ref={countryMenuRef} className="relative flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide">Countries</span>
            <button
              type="button"
              aria-expanded={countryMenuOpen}
              aria-haspopup="dialog"
              onClick={() => setCountryMenuOpen((o) => !o)}
              className={`flex min-w-[12rem] max-w-[min(100%,20rem)] items-center justify-between gap-2 rounded px-2 py-1.5 text-left ${countryTriggerClass}`}
            >
              <span className="truncate">{countrySummary}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className={`shrink-0 opacity-60 transition-transform ${countryMenuOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {countryMenuOpen && (
              <div
                role="group"
                aria-label="Filter by country"
                className={`absolute left-0 top-full z-50 mt-1 w-[min(calc(100vw-6rem),22rem)] overflow-hidden rounded border shadow-lg ${
                  isDark ? "border-white/20 bg-[#252422]" : "border-black/15 bg-white shadow-black/10"
                }`}
              >
                <div className="p-2">
                  <div className="grid grid-cols-2 gap-0.5 sm:grid-cols-3">
                    {countryOptions.map((c) => {
                      const checked = selectedCountries.includes(c);
                      return (
                        <label
                          key={c}
                          className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm ${
                            isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="rounded border-current"
                            checked={checked}
                            onChange={() => {
                              setSelectedCountries((prev) =>
                                prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                              );
                            }}
                          />
                          <span className="truncate">{c}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSelectedCountries([])}
            className={`text-xs underline ${isDark ? "text-white/60" : "text-black/50"}`}
          >
            Clear filter
          </button>
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
