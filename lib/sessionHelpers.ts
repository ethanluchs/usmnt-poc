import { Puzzle } from "./types";

export const SESSION_PUZZLE_COUNT = 5;

export function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function selectSessionPuzzles(
  allPuzzles: Puzzle[],
  unlockedCardIds: Set<string>,
  count: number = SESSION_PUZZLE_COUNT
): Puzzle[] {
  const eligiblePuzzles = allPuzzles.filter(
    (puzzle) => !unlockedCardIds.has(puzzle.id)
  );

  const puzzlePool = eligiblePuzzles.length > 0 ? eligiblePuzzles : allPuzzles;

  if (puzzlePool.length === 0) return [];

  const puzzlesToSelect = Math.min(count, puzzlePool.length);
  return shuffle(puzzlePool).slice(0, puzzlesToSelect);
}
