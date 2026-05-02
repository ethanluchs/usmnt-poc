"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchLocationPuzzles,
  fetchUserUnlockedCardIds,
  saveUserUnlockedCard,
} from "../game";
import { selectSessionPuzzles } from "../sessionHelpers";
import { Player } from "../types";

interface CacheEntry {
  allCards: Player[];
  unlockedIds: string[];
  cachedAt: number;
}

interface SessionManagerReturn {
  sessionPlayers: Player[];
  playerPool: Player[];
  unlockedCards: Player[];
  loadingPuzzles: boolean;
  puzzlesCompleted: number;
  totalPoints: number;
  handlePuzzleSolved: (player: Player, puzzleIndex: number, stopsUsed: number) => Promise<void>;
}

export function useSessionManager(
  userId: string | null | undefined
): SessionManagerReturn {
  const [sessionPlayers, setSessionPlayers] = useState<Player[]>([]);
  const [playerPool, setPlayerPool] = useState<Player[]>([]);
  const [loadingPuzzles, setLoadingPuzzles] = useState(true);
  const unlockedCardIdsRef = useRef<Set<string>>(new Set());
  const [unlockedCards, setUnlockedCards] = useState<Player[]>([]);
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const processedSolvesRef = useRef<Set<string>>(new Set());
  const cacheKey = `wordle-cup:cards:${userId ?? "guest"}`;

  useEffect(() => {
    if (userId === undefined) return;

    let cancelled = false;

    const loadSession = async () => {
      setLoadingPuzzles(true);
      try {
        const cached = localStorage.getItem(cacheKey);
        const parsed: CacheEntry | null = cached ? JSON.parse(cached) : null;

        if (parsed && Date.now() - parsed.cachedAt < 3600000) {
          const cachedUnlockedIds = new Set(parsed.unlockedIds);
          const selectedPuzzles = selectSessionPuzzles(parsed.allCards, cachedUnlockedIds);
          unlockedCardIdsRef.current = cachedUnlockedIds;
          setUnlockedCards(parsed.allCards.filter((c) => cachedUnlockedIds.has(c.id)));
          setPlayerPool(parsed.allCards);
          setSessionPlayers(selectedPuzzles);
          setPuzzlesCompleted(0);
          setTotalPoints(0);
          processedSolvesRef.current = new Set();
          return;
        }

        const [allPuzzles, userCardIds] = await Promise.all([
          fetchLocationPuzzles(),
          userId
            ? fetchUserUnlockedCardIds(userId)
            : Promise.resolve(new Set<string>()),
        ]);

        if (cancelled) return;

        const selectedPuzzles = selectSessionPuzzles(allPuzzles, userCardIds);
        unlockedCardIdsRef.current = userCardIds;
        setUnlockedCards(allPuzzles.filter((c) => userCardIds.has(c.id)));
        setPlayerPool(allPuzzles);
        setSessionPlayers(selectedPuzzles);
        setPuzzlesCompleted(0);
        setTotalPoints(0);
        processedSolvesRef.current = new Set();

        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            allCards: allPuzzles,
            unlockedIds: [...userCardIds],
            cachedAt: Date.now(),
          } satisfies CacheEntry)
        );
      } catch (error) {
        console.error("Failed to load puzzles", error);
        if (!cancelled) {
          setSessionPlayers([]);
          setPlayerPool([]);
        }
      } finally {
        if (!cancelled) setLoadingPuzzles(false);
      }
    };

    loadSession();
    return () => { cancelled = true; };
  }, [userId]);

  const handlePuzzleSolved = useCallback(
    async (player: Player, puzzleIndex: number, stopsUsed: number): Promise<void> => {
      if (!player) return;

      const solveKey = `${puzzleIndex}:${player.id}`;
      if (processedSolvesRef.current.has(solveKey)) return;
      processedSolvesRef.current.add(solveKey);

      const points = Math.max(0, 3 - stopsUsed);
      setTotalPoints((prev) => prev + points);

      setUnlockedCards((prev) => [...prev, player]);

      if (userId && !unlockedCardIdsRef.current.has(player.id)) {
        try {
          await saveUserUnlockedCard(userId, player);
          unlockedCardIdsRef.current.add(player.id);
        } catch (error) {
          console.error("Failed to save unlocked card", error);
        }

        const existing: Partial<CacheEntry> = JSON.parse(
          localStorage.getItem(cacheKey) ?? "{}"
        );
        existing.unlockedIds = [...unlockedCardIdsRef.current];
        localStorage.setItem(cacheKey, JSON.stringify(existing));
      }

      setPuzzlesCompleted((prev) => prev + 1);
    },
    [userId]
  );

  return {
    sessionPlayers,
    playerPool,
    unlockedCards,
    loadingPuzzles,
    puzzlesCompleted,
    totalPoints,
    handlePuzzleSolved,
  };
}
