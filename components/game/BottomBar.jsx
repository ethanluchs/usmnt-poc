'use client'
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MOCK_PLAYERS } from "../../lib/mockData"

const btnClass = "border border-black dark:border-[#ede8d0] rounded px-4 py-2 bg-[#ede8d0] dark:bg-black text-black dark:text-[#ede8d0] hover:bg-black hover:text-[#ede8d0] dark:hover:bg-[#ede8d0] dark:hover:text-black active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"

function AutocompleteInput({ input, setInput, onSubmit, disabled }) {
  const [showDropdown, setShowDropdown] = useState(false)

  const filtered = input.length > 1
    ? MOCK_PLAYERS.filter(p => p.name.toLowerCase().includes(input.toLowerCase()))
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
        onChange={e => { setInput(e.target.value); setShowDropdown(true) }}
        onKeyDown={e => e.key === "Enter" && input.trim() && handleSelect(input.trim())}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        placeholder="Guess a player..."
        disabled={disabled}
        className="border rounded placeholder:text-gray-700 dark:placeholder:text-gray-400 border-black dark:border-[#ede8d0] bg-[#ede8d0] dark:bg-black text-black dark:text-[#ede8d0] px-3 py-2 outline-none disabled:opacity-40"
      />
      {showDropdown && filtered.length > 0 && (
        <ul className="absolute bottom-full mb-1 left-0 right-0 border border-black dark:border-[#ede8d0] bg-[#ede8d0] dark:bg-black text-black dark:text-[#ede8d0] rounded overflow-hidden z-50">
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
              className="border border-red-700 dark:border-red-400 bg-[#ede8d0] dark:bg-black text-red-700 dark:text-red-500 rounded px-2 py-1 text-sm min-w-[80px] text-center"
            >
              {incorrectGuesses[i]}
            </motion.span>
          ) : (
            <motion.span
              key="empty"
              className="border border-gray-300 dark:border-gray-700 bg-[#ede8d0] dark:bg-black text-transparent rounded px-2 py-1 text-sm min-w-[80px] text-center"
            >
              ·
            </motion.span>
          )}
        </AnimatePresence>
      ))}
    </div>
  )
}

export default function BottomBar({ incorrectGuesses = [], onGuess, onNextStop, solved }) {
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
        <AutocompleteInput input={input} setInput={setInput} onSubmit={onGuess} disabled={isDisabled} />
        <button onClick={handleGuess} disabled={isDisabled} className={btnClass}>Guess</button>
        <button onClick={onNextStop} disabled={solved} className={btnClass}>Next Stop →</button>
      </div>
      <GuessPills incorrectGuesses={incorrectGuesses} />
    </div>
  )
}
