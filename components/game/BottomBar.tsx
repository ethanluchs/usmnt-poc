"use client";
import { useState, useEffect, useRef } from "react";
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

interface PlayerInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  input: string;
  setInput: (v: string) => void;
  onSubmit: (name: string) => void;
  incorrectGuesses: string[];
  playerPool: Player[];
  isDisabled: boolean;
}

function PlayerInput({ inputRef, input, setInput, onSubmit, incorrectGuesses, playerPool, isDisabled }: PlayerInputProps) {
  const guessedNames = new Set(incorrectGuesses.map((g) => g.toLowerCase()));
  const filtered = input.length > 0
    ? playerPool.filter((p) => p.name?.toLowerCase().includes(input.toLowerCase()))
    : [];

  const handleSelect = (name: string) => {
    setInput("");
    onSubmit(name);
  };

  return (
    <div style={{ position: "relative", width: 380, padding: "0 16px" }}>
      {/* autocomplete dropdown — floats above */}
      {filtered.length > 0 && (
        <ul
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: -16,
            right: -16,
            listStyle: "none",
            margin: 0,
            padding: 0,
            overflow: "hidden",
            background: "#1a3a6e",
            outline: "3px solid #0f2a52",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.1), inset 0 -2px 0 rgba(0,0,0,0.4)",
          }}
        >
          {filtered.slice(0, 6).map((p, i) => {
            const isGuessed = guessedNames.has(p.name.toLowerCase());
            return (
              <li
                key={p.id}
                onMouseDown={() => !isGuessed && handleSelect(p.name)}
                style={{
                  fontFamily: "'Arial Black', 'Arial Bold', sans-serif",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontSize: "13px",
                  color: isGuessed ? "#2a4a7a" : "#ffffff",
                  padding: "6px 16px",
                  cursor: isGuessed ? "default" : "pointer",
                  textDecoration: isGuessed ? "line-through" : "none",
                  borderBottom: i < Math.min(filtered.length, 6) - 1 ? "2px solid #0f2a52" : "none",
                  background: "transparent",
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
        disabled={isDisabled}
        onChange={(e) => setInput(e.target.value.slice(0, 50))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.trim()) handleSelect(input.trim());
          if (e.key === "Escape") setInput("");
        }}
        placeholder=""
        style={{
          background: "transparent",
          border: "none",
          borderBottom: "1px solid rgba(255,255,255,0.25)",
          outline: "none",
          width: "100%",
          color: isDisabled ? "rgba(255,255,255,0.25)" : "#ffffff",
          fontSize: "22px",
          letterSpacing: "0.05em",
          fontFamily: "'Arial Black', 'Arial Bold', sans-serif",
          textTransform: "uppercase",
          padding: 0,
          caretColor: "#f5a623",
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
  const remaining = Math.max(maxGuesses - incorrectGuesses.length, 0);
  const color = remaining <= 1 ? "#ef4444" : "#f5a623";

  return <LedDigit value={String(remaining)} color={color} />;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const isDisabled = solved || incorrectGuesses.length >= 5;

  const handleGuess = (name: string) => {
    if (name.trim()) {
      onGuess(name.trim());
      setInput("");
    }
  };

  // focus the inline input on any printable keypress
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isDisabled) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.activeElement === inputRef.current) return;
      if (e.key.length === 1) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDisabled]);

  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end pb-5 gap-6">

      {/* ── SCOREBOARD PANEL ── */}
      <div style={{ display: "inline-flex", flexDirection: "column" }}>
        <div style={{
          background: "#1a3a6e",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.7), inset 0 2px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.4), inset 2px 0 0 rgba(255,255,255,0.08), inset -2px 0 0 rgba(0,0,0,0.3)",
          outline: "3px solid #0f2a52",
          display: "inline-flex",
          flexDirection: "column",
        }}>

          {/* ── label row ── */}
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

          {/* ── numbers row ── */}
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

          {/* ── player name row ── */}
          <div style={{ borderTop: "2px solid #0f2a52" }}>
            <div style={{ padding: "4px 0 2px", display: "flex", justifyContent: "center" }}>
              <span style={LABEL_STYLE}>Who is it?</span>
            </div>
            <div style={{ padding: "2px 0 8px", display: "flex", justifyContent: "center" }}>
              <PlayerInput
                inputRef={inputRef}
                input={input}
                setInput={setInput}
                onSubmit={handleGuess}
                incorrectGuesses={incorrectGuesses}
                playerPool={playerPool}
                isDisabled={isDisabled}
              />
            </div>
          </div>

        </div>
      </div>

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
