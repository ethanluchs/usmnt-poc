"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
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

function AutocompleteInput({
  input,
  setInput,
  onSubmit,
  disabled,
  incorrectGuesses,
  playerPool,
}: AutocompleteInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const guessedNames = new Set(incorrectGuesses.map((g) => g.toLowerCase()));
  const filtered =
    input.length > 1
      ? playerPool.filter((p) =>
          p.name?.toLowerCase().includes(input.toLowerCase())
        )
      : [];

  const handleSelect = (name: string) => {
    setInput("");
    setShowDropdown(false);
    onSubmit(name);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={input}
        onChange={(e) => { setInput(e.target.value.slice(0, 50)); setShowDropdown(true); }}
        onKeyDown={(e) => e.key === "Enter" && input.trim() && handleSelect(input.trim())}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        placeholder="Guess a player..."
        disabled={disabled}
        className="border rounded placeholder:text-gray-500 border-black bg-[#ede8d0] text-black px-3 py-2 outline-none disabled:opacity-40"
      />
      {showDropdown && filtered.length > 0 && (
        <ul className="absolute bottom-full mb-1 left-0 right-0 border border-black bg-[#ede8d0] text-black rounded overflow-hidden z-50">
          {filtered.map((p) => {
            const isGuessed = guessedNames.has(p.name.toLowerCase());
            return (
              <li
                key={p.id}
                onMouseDown={() => !isGuessed && handleSelect(p.name)}
                className={`px-3 py-2 text-sm transition-colors ${
                  isGuessed
                    ? "line-through opacity-40 cursor-default"
                    : "cursor-pointer hover:bg-black hover:text-[#ede8d0]"
                }`}
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

interface StrikeDotsProps {
  incorrectGuesses: string[];
  maxGuesses?: number;
}

function StrikeDots({ incorrectGuesses, maxGuesses = 3 }: StrikeDotsProps) {
  const prevCount = useRef(incorrectGuesses.length);
  const [flashingIndex, setFlashingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (incorrectGuesses.length > prevCount.current) {
      const lostIndex = incorrectGuesses.length - 1;
      setFlashingIndex(lostIndex);
      setTimeout(() => setFlashingIndex(null), 500);
    }
    prevCount.current = incorrectGuesses.length;
  }, [incorrectGuesses.length, maxGuesses]);

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: maxGuesses }).map((_, i) => {
        const isLost = i < incorrectGuesses.length;
        const isFlashing = i === flashingIndex;
        return (
          <motion.img
            key={i}
            src="/soccer_ball.svg"
            alt=""
            animate={isFlashing ? { scale: [1, 1.4, 0.8, 1], rotate: [0, -20, 20, 0] } : {}}
            transition={{ duration: 0.4 }}
            style={{
              width: 20,
              height: 20,
              opacity: isLost ? 0 : 1,
              transition: "opacity 0.3s",
            }}
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

  const handleGuess = () => {
    if (input.trim()) {
      onGuess(input.trim());
      setInput("");
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 pt-3 pb-3">
      <div className="flex flex-col gap-1.5">
        <StrikeDots incorrectGuesses={incorrectGuesses} />
        <div className="flex gap-2">
          <AutocompleteInput
            input={input}
            setInput={setInput}
            onSubmit={onGuess}
            disabled={isDisabled}
            incorrectGuesses={incorrectGuesses}
            playerPool={playerPool}
          />
          <Button onClick={handleGuess} disabled={isDisabled} className="bg-[#ede8d0]">
            Guess
          </Button>
          <Button onClick={onNextStop} disabled={solved || isLastStop} className="bg-[#ede8d0]">
            Next Stop →
          </Button>
        </div>
      </div>
    </div>
  );
}
