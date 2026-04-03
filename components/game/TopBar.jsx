const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

export default function TopBar({ isDark, onToggleTheme, puzzleIndex = 1, totalPuzzles = 5 }) {
  return (
    <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-4 pb-3 z-10 gap-1 backdrop-blur-sm bg-[#ede8d0]/70 dark:bg-black/70 rounded-b-xl">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl tracking-widest uppercase text-black dark:text-[#ede8d0]">
          Wordle Cuple
        </h1>
        <button
          onClick={onToggleTheme}
          className="flex items-center justify-center text-black dark:text-[#ede8d0] transition-colors"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
      <p className="text-xs tracking-widest text-black dark:text-[#ede8d0] opacity-60">
        PUZZLE {puzzleIndex} / {totalPuzzles}
      </p>
    </div>
  )
}
