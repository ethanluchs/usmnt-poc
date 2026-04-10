export function getColors(isDark) {
  return {
    bg:        isDark ? "#1a1917" : "#ede8d0",
    bgHover:   isDark ? "#242220" : "#e0dbbf",
    cardBg:    isDark ? "#000000" : "#ffffff",
    text:      isDark ? "#b8b2a0" : "#000000",
    textInv:   isDark ? "#1a1917" : "#ede8d0",
    stroke:    isDark ? "#b8b2a0" : "#000000",
    dimmed:    isDark ? "#6b6660" : "#888888",
    darkBlue:  isDark ? "#1a4a6e" : "#0d2e4a",
    lightBlue: isDark ? "#7ec8e3" : "#4a9bbf",
  }
}
