/**
 * Session management utility functions
 * Pure functions for puzzle selection and session configuration
 */

export const SESSION_PUZZLE_COUNT = 5

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} items - Array to shuffle
 * @returns {Array} New shuffled array
 */
export function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

/**
 * Select puzzles for a game session
 * Filters out already-unlocked puzzles and selects a random subset
 * If all puzzles are unlocked, allows replaying from the full pool
 * 
 * @param {Array} allPuzzles - All available puzzles from database
 * @param {Set} unlockedCardIds - Set of card IDs the user has already unlocked
 * @param {number} count - Number of puzzles to select for session
 * @returns {Array} Selected puzzles for the session
 */
export function selectSessionPuzzles(allPuzzles, unlockedCardIds, count = SESSION_PUZZLE_COUNT) {
  // Filter to only puzzles the user hasn't unlocked yet
  const eligiblePuzzles = allPuzzles.filter((puzzle) => !unlockedCardIds.has(puzzle.id))
  
  // If no eligible puzzles, allow replaying from all puzzles
  // Otherwise use the eligible (unplayed) puzzles
  if (eligiblePuzzles.length == 0) console.log("Replaying old puzzle!")
  const puzzlePool = eligiblePuzzles.length > 0 ? eligiblePuzzles : allPuzzles
  
  // If no puzzles at all, return empty array
  if (puzzlePool.length === 0) {
    return []
  }
  
  // Select random subset
  const puzzlesToSelect = Math.min(count, puzzlePool.length)
  return shuffle(puzzlePool).slice(0, puzzlesToSelect)
}
