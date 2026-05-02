"use client";
import { useState, useEffect, useRef } from "react";
import Button from "../ui/Button";
import { Player } from "../../lib/types";

interface AutocompleteInputProps {
  input: string;
  setInput: (v: string) => void;
  onSubmit: (name: string) => void;
  disabled: boolean;
  incorrectGuesses: string[];
  playerPool: Player[];
}

function AutocompleteInput({ input, setInput, onSubmit, disabled, incorrectGuesses, playerPool }: AutocompleteInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const guessedNames = new Set(incorrectGuesses.map((g) => g.toLowerCase()));
  const filtered = input.length > 1
    ? playerPool.filter((p) => p.name?.toLowerCase().includes(input.toLowerCase()))
    : [];

  const handleSelect = (name: string) => {
    setInput("");
    setShowDropdown(false);
    onSubmit(name);
  };

  return (
    <div className="relative flex items-stretch border border-black rounded bg-white overflow-visible">
      <input
        type="text"
        value={input}
        onChange={(e) => { setInput(e.target.value.slice(0, 50)); setShowDropdown(true); }}
        onKeyDown={(e) => e.key === "Enter" && input.trim() && handleSelect(input.trim())}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        placeholder="Guess a player..."
        disabled={disabled}
        className="flex-1 placeholder:text-gray-500 bg-transparent text-black px-3 py-2 outline-none disabled:opacity-40"
      />
      <button
        onMouseDown={(e) => { e.preventDefault(); input.trim() && handleSelect(input.trim()); }}
        disabled={disabled || !input.trim()}
        className="px-3 flex items-center justify-center border-l border-black text-black disabled:opacity-30 hover:bg-black hover:text-white transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 7h10M8 3l4 4-4 4" />
        </svg>
      </button>
      {showDropdown && filtered.length > 0 && (
        <ul className="absolute bottom-full mb-1 left-0 right-0 border border-black bg-white text-black rounded overflow-hidden z-50">
          {filtered.map((p) => {
            const isGuessed = guessedNames.has(p.name.toLowerCase());
            return (
              <li
                key={p.id}
                onMouseDown={() => !isGuessed && handleSelect(p.name)}
                className={`px-3 py-2 text-sm transition-colors ${isGuessed ? "line-through opacity-40 cursor-default" : "cursor-pointer hover:bg-black hover:text-white"}`}
              >
                {p.name}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StrikeDots({ incorrectGuesses, maxGuesses = 3 }: { incorrectGuesses: string[]; maxGuesses?: number }) {
  const prevCount = useRef(incorrectGuesses.length);
  const [explodingIndex, setExplodingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (incorrectGuesses.length > prevCount.current) {
      const lostIndex = incorrectGuesses.length - 1;
      setExplodingIndex(lostIndex);
      setTimeout(() => setExplodingIndex(null), 600);
    }
    prevCount.current = incorrectGuesses.length;
  }, [incorrectGuesses.length]);

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: maxGuesses }).map((_, i) => {
        const isLost = i < incorrectGuesses.length;
        const isExploding = i === explodingIndex;
        return (
          <img
            key={i}
            src={isExploding ? "/cartoon_explosion.png" : "/soccer_ball.svg"}
            alt=""
            className="w-5 h-5"
            style={{ opacity: isLost && !isExploding ? 0 : 1 }}
          />
        );
      })}
    </div>
  );
}


interface BottomBarProps {
  incorrectGuesses?: string[];
  onGuess: (name: string) => void;
  onNextStop: () => void;
  solved: boolean;
  isLastStop: boolean;
  playerPool?: Player[];
}

export default function BottomBar({
  incorrectGuesses = [],
  onGuess,
  onNextStop,
  solved,
  isLastStop,
  playerPool = [],
}: BottomBarProps) {
  const [input, setInput] = useState("");
  const isDisabled = solved || incorrectGuesses.length >= 5;

  return (
    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-1.5 pb-3">
      <div className="flex items-center gap-2">
        <AutocompleteInput
          input={input}
          setInput={setInput}
          onSubmit={onGuess}
          disabled={isDisabled}
          incorrectGuesses={incorrectGuesses}
          playerPool={playerPool}
        />
        <Button onClick={onNextStop} disabled={solved || isLastStop} className="bg-white">
          Next Stop
        </Button>
        <StrikeDots incorrectGuesses={incorrectGuesses} />
      </div>
    </div>
  );
}
