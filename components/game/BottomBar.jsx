'use client'
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MOCK_PLAYERS } from "../../lib/mockData"
import Button from "../ui/Button"

function AutocompleteInput({ input, setInput, onSubmit, disabled, incorrectGuesses }) {
  const [showDropdown, setShowDropdown] = useState(false)

  const guessedNames = new Set(incorrectGuesses.map(g => g.toLowerCase()))
  const filtered = input.length > 1
    ? MOCK_PLAYERS.filter(p => p.name.toLowerCase().includes(input.toLowerCase()) && !guessedNames.has(p.name.toLowerCase()))
    : []

  const handleSelect = (name) => {
    setInput("")
    setShowDropdown(false)
    onSubmit(name)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={input}
        onChange={e => { setInput(e.target.value.slice(0, 50)); setShowDropdown(true) }}
        onKeyDown={e => e.key === "Enter" && input.trim() && handleSelect(input.trim())}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        placeholder="Guess a player..."
        disabled={disabled}
        className="border rounded placeholder:text-gray-500 dark:placeholder:text-gray-500 border-black dark:border-[#b8b2a0] bg-[#ede8d0] dark:bg-[#1a1917] text-black dark:text-[#b8b2a0] px-3 py-2 outline-none disabled:opacity-40"
      />
      {showDropdown && filtered.length > 0 && (
        <ul className="absolute bottom-full mb-1 left-0 right-0 border border-black dark:border-[#b8b2a0] bg-[#ede8d0] dark:bg-[#1a1917] text-black dark:text-[#b8b2a0] rounded overflow-hidden z-50">
          {filtered.map(p => (
            <li
              key={p.id}
              onMouseDown={() => handleSelect(p.name)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-black hover:text-[#ede8d0] dark:hover:bg-[#ede8d0] dark:hover:text-black transition-colors"
            >
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function GuessPills({ incorrectGuesses }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <AnimatePresence key={i} mode="wait">
          {incorrectGuesses[i] ? (
            <motion.span
              key={incorrectGuesses[i]}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "tween", duration: 0.3 }}
              className="border border-red-700 dark:border-red-400 bg-[#ede8d0] dark:bg-[#1a1917] text-red-700 dark:text-red-500 rounded px-2 py-1 text-sm min-w-[80px] text-center"
            >
              {incorrectGuesses[i]}
            </motion.span>
          ) : (
            <motion.span
              key="empty"
              className="border border-gray-300 dark:border-gray-700 bg-[#ede8d0] dark:bg-[#1a1917] text-transparent rounded px-2 py-1 text-sm min-w-[80px] text-center"
            >
              ·
            </motion.span>
          )}
        </AnimatePresence>
      ))}
    </div>
  )
}

export default function BottomBar({ incorrectGuesses = [], onGuess, onNextStop, solved, isLastStop }) {
  const [input, setInput] = useState("")
  const isDisabled = solved || incorrectGuesses.length >= 5

  const handleGuess = () => {
    if (input.trim()) {
      onGuess(input.trim())
      setInput("")
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 pt-3 pb-3">
      <div className="flex gap-2">
        <AutocompleteInput input={input} setInput={setInput} onSubmit={onGuess} disabled={isDisabled} incorrectGuesses={incorrectGuesses} />
        <Button onClick={handleGuess} disabled={isDisabled}>Guess</Button>
        <Button onClick={onNextStop} disabled={solved || isLastStop}>Next Stop →</Button>
      </div>
      <GuessPills incorrectGuesses={incorrectGuesses} />
    </div>
  )
}
