"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Player } from "../../lib/types";

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Arial Black', 'Arial Bold', sans-serif",
  fontSize: "16px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#ffffff",
  fontWeight: "900",
  textAlign: "center",
};

const LED_PANEL: React.CSSProperties = {
  background: "#0a0a06",
  border: "3px solid #111",
  boxShadow: "inset 0 3px 8px rgba(0,0,0,0.9), inset 0 1px 2px rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "3px 4px",
};

const DSEG_GHOST: React.CSSProperties = {
  fontFamily: "'DSEG7', monospace",
  lineHeight: 1,
  color: "#2a3d1a",
  position: "absolute",
  userSelect: "none",
  pointerEvents: "none",
};

const DSEG_LIT: React.CSSProperties = {
  fontFamily: "'DSEG7', monospace",
  lineHeight: 1,
  position: "relative",
};

function LedDigit({ value, fontSize = 58, color = "#f5a623", width = 52, height = 72 }: {
  value: string; fontSize?: number; color?: string; width?: number; height?: number;
}) {
  return (
    <div style={{ ...LED_PANEL, width, height, position: "relative" }}>
      <span style={{ ...DSEG_GHOST, fontSize }}>8</span>
      <span style={{ ...DSEG_LIT, fontSize, color, textShadow: `0 0 8px ${color}99, 0 0 2px ${color}` }}>
        {value}
      </span>
    </div>
  );
}

function LedNumber({ value, digits = 2, color = "#f5a623" }: {
  value: number; digits?: number; color?: string;
}) {
  const str = String(Math.max(0, value)).padStart(digits, "0");
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {str.split("").map((d, i) => (
        <LedDigit key={i} value={d} color={color} />
      ))}
    </div>
  );
}

interface AutocompleteInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  input: string;
  setInput: (v: string) => void;
  onSubmit: (name: string) => void;
  onDismiss: () => void;
  incorrectGuesses: string[];
  playerPool: Player[];
}

function AutocompleteInput({ inputRef, input, setInput, onSubmit, onDismiss, incorrectGuesses, playerPool }: AutocompleteInputProps) {
  const guessedNames = new Set(incorrectGuesses.map((g) => g.toLowerCase()));
  const filtered = input.length > 0
    ? playerPool.filter((p) => p.name?.toLowerCase().includes(input.toLowerCase()))
    : [];

  const handleSelect = (name: string) => {
    onSubmit(name);
  };

  return (
    <div style={{ padding: "10px 16px" }}>
      {filtered.length > 0 && (
        <ul style={{ marginBottom: 8, maxHeight: 180, overflowY: "auto" }}>
          {filtered.map((p) => {
            const isGuessed = guessedNames.has(p.name.toLowerCase());
            return (
              <li
                key={p.id}
                onMouseDown={() => !isGuessed && handleSelect(p.name)}
                style={{
                  fontFamily: "'FWC2026', sans-serif",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontSize: "13px",
                  color: isGuessed ? "#555" : "#ffffff",
                  padding: "6px 0",
                  cursor: isGuessed ? "default" : "pointer",
                  textDecoration: isGuessed ? "line-through" : "none",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {p.name}
              </li>
            );
          })}
        </ul>
      )}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value.slice(0, 50))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.trim()) handleSelect(input.trim());
          if (e.key === "Escape") onDismiss();
        }}
        onBlur={() => setTimeout(onDismiss, 150)}
        style={{
          background: "transparent",
          border: "none",
          borderBottom: "1px solid rgba(255,255,255,0.4)",
          outline: "none",
          width: "100%",
          color: "#ffffff",
          fontSize: "16px",
          letterSpacing: "0.08em",
          fontFamily: "'FWC2026', sans-serif",
          padding: "4px 0",
        }}
      />
    </div>
  );
}

interface LivesDisplayProps {
  incorrectGuesses: string[];
  maxGuesses?: number;
}

function LivesDisplay({ incorrectGuesses, maxGuesses = 3 }: LivesDisplayProps) {
  const [flash, setFlash] = useState(false);
  const prevCount = useRef(incorrectGuesses.length);

  useEffect(() => {
    if (incorrectGuesses.length > prevCount.current) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
    }
    prevCount.current = incorrectGuesses.length;
  }, [incorrectGuesses.length]);

  const remaining = Math.max(maxGuesses - incorrectGuesses.length, 0);
  const color = flash ? "#dc2626" : remaining <= 1 ? "#ef4444" : "#f5a623";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={remaining}
        initial={{ scale: 1.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <LedDigit value={String(remaining)} color={color} />
      </motion.div>
    </AnimatePresence>
  );
}

interface BottomBarProps {
  incorrectGuesses?: string[];
  onGuess: (name: string) => void;
  onNextStop: () => void;
  solved: boolean;
  isLastStop: boolean;
  playerPool?: Player[];
  onOpenCards?: () => void;
  cardCount?: number;
  currentStop?: number;
  totalStops?: number;
}

function RedButton() {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{ width: 100, height: 100, cursor: "pointer", userSelect: "none" }}
    >
      <img
        src={pressed ? "/btn_down.png" : "/btn_up.png"}
        alt="Next Stop"
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        draggable={false}
      />
    </div>
  );
}

const DIVIDER: React.CSSProperties = { borderLeft: "2px solid #0f2a52" };

export default function BottomBar({
  incorrectGuesses = [],
  onGuess,
  onNextStop,
  solved,
  isLastStop,
  playerPool = [],
  onOpenCards,
  cardCount = 0,
  currentStop = 0,
  totalStops = 0,
}: BottomBarProps) {
  const [input, setInput] = useState("");
  const [inputVisible, setInputVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDisabled = solved || incorrectGuesses.length >= 5;

  const handleGuess = (name: string) => {
    if (name.trim()) {
      onGuess(name.trim());
      setInput("");
      setInputVisible(false);
    }
  };

  // any printable keypress anywhere opens the input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isDisabled) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") { setInputVisible(false); setInput(""); return; }
      if (e.key.length === 1) {
        setInputVisible(true);
        setInput((prev) => prev + e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDisabled]);

  useEffect(() => {
    if (inputVisible) inputRef.current?.focus();
  }, [inputVisible]);

  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end pb-5 gap-6">

      {/* ── SCOREBOARD PANEL ── */}
      <div style={{ position: "relative", display: "inline-flex", flexDirection: "column" }}>

        {/* floating input — appears above scoreboard on keypress */}
        <AnimatePresence>
          {inputVisible && !isDisabled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                bottom: "100%",
                left: 0,
                right: 0,
                marginBottom: 8,
                zIndex: 50,
              }}
            >
              <AutocompleteInput
                inputRef={inputRef}
                input={input}
                setInput={setInput}
                onSubmit={handleGuess}
                onDismiss={() => { setInputVisible(false); setInput(""); }}
                incorrectGuesses={incorrectGuesses}
                playerPool={playerPool}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{
          background: "#1a3a6e",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.7), inset 0 2px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.4), inset 2px 0 0 rgba(255,255,255,0.08), inset -2px 0 0 rgba(0,0,0,0.3)",
          outline: "3px solid #0f2a52",
          display: "inline-flex",
          flexDirection: "column",
        }}>

        {/* ── ROW 2: label row ── */}
        <div style={{ display: "flex" }}>
          <div style={{ width: 120, padding: "6px 0 3px", display: "flex", justifyContent: "center" }}>
            <span style={LABEL_STYLE}>Lives</span>
          </div>
          <div style={{ width: 160, padding: "6px 0 3px", ...DIVIDER, display: "flex", justifyContent: "center" }}>
            <span style={LABEL_STYLE}>Current Stop</span>
          </div>
          <div style={{ width: 160, padding: "6px 0 3px", ...DIVIDER, display: "flex", justifyContent: "center" }}>
            <span style={LABEL_STYLE}>Total Stops</span>
          </div>
        </div>

        {/* ── ROW 3: data row ── */}
        <div style={{ display: "flex", alignItems: "center", padding: "4px 0 8px" }}>
          <div style={{ width: 120, display: "flex", justifyContent: "center" }}>
            <LivesDisplay incorrectGuesses={incorrectGuesses} />
          </div>
          <div style={{ width: 160, display: "flex", justifyContent: "center", ...DIVIDER }}>
            <LedNumber value={currentStop} digits={2} />
          </div>
          <div style={{ width: 160, display: "flex", justifyContent: "center", ...DIVIDER }}>
            <LedNumber value={totalStops} digits={2} />
          </div>
        </div>


        </div>{/* end inner scoreboard */}
      </div>{/* end outer relative wrapper */}

      {/* ── RED BUTTON ── */}
      <div style={{ paddingBottom: "8px" }}>
        <button
          onClick={onNextStop}
          disabled={solved || isLastStop}
          className="disabled:opacity-40 disabled:pointer-events-none"
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <RedButton />
        </button>
      </div>

    </div>
  );
}
