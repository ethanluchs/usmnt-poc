"use client"

import { useState, useRef, useEffect } from "react"
import { PLAYER_NAMES } from "../lib/players"

export default function GuessInput({ onGuess, disabled }) {
  const [value, setValue] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!value.trim()) { setSuggestions([]); return }
    const q = value.toLowerCase()
    setSuggestions(PLAYER_NAMES.filter((n) => n.toLowerCase().includes(q)))
  }, [value])

  function handleSelect(name) {
    setValue("")
    setSuggestions([])
    onGuess(name)
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && suggestions.length > 0) handleSelect(suggestions[0])
  }

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type a player name…"
          className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg bg-slate-800 text-slate-100 text-sm focus:outline-none focus:border-[#f43f5e] focus:ring-1 focus:ring-[#f43f5e] disabled:opacity-40 disabled:cursor-not-allowed placeholder-slate-500"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        />
        <button
          onClick={() => suggestions.length > 0 && handleSelect(suggestions[0])}
          disabled={disabled || !value.trim()}
          className="px-5 py-2.5 bg-[#f43f5e] text-white text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e11d48] transition-colors"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          Guess
        </button>
      </div>

      {focused && suggestions.length > 0 && (
        <ul className="absolute z-30 left-0 right-20 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-2xl overflow-hidden">
          {suggestions.map((name) => (
            <li
              key={name}
              onMouseDown={() => handleSelect(name)}
              className="px-4 py-2.5 text-sm text-slate-200 cursor-pointer hover:bg-slate-700 border-b border-white/5 last:border-0"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
