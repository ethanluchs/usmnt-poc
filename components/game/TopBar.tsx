"use client";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import InfoModal from "./InfoModal";

interface TopBarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  puzzleIndex?: number;
  totalPuzzles?: number;
  isDragging?: boolean;
}

export default function TopBar({
  isDark,
  onToggleTheme,
  puzzleIndex = 1,
  totalPuzzles = 5,
  isDragging = false,
}: TopBarProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-3 pb-3 z-10 bg-white">
      <div style={{
        display: "inline-flex",
        borderRadius: "3px",
        overflow: "hidden",
        border: "0px solid #111",
        lineHeight: 1,
        userSelect: "none",
        background: "#ffffff",
        padding: "4px 10px",
        alignItems: "baseline",
        gap: 0,
      }}>
        <span style={{
          fontFamily: "'UniversCn', sans-serif",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: "20px",
          color: "#000000",
          letterSpacing: "0px",
          whiteSpace: "nowrap",
        }}>
          WordleCup
        </span>
        <span style={{
          fontFamily: "'Univers', sans-serif",
          fontStyle: "normal",
          fontWeight: 300,
          fontSize: "20px",
          color: "#cc1020",
          letterSpacing: "-0.5px",
          whiteSpace: "nowrap",
          marginLeft: "2px",
        }}>
          CUM
        </span>
        <span style={{
          fontFamily: "'UniversCn', sans-serif",
          fontStyle: "normal",
          fontWeight: 700,
          fontSize: "20px",
          color: "#000000",
          letterSpacing: "0px",
          whiteSpace: "nowrap",
          marginLeft: "1px"
        }}>
          26
        </span>
      </div>
      <span style={{
        fontFamily: "'UniversCn', sans-serif",
        fontStyle: "normal",
        fontWeight: 800,
        fontSize: "15px",
        color: "#000000",
        letterSpacing: "1px",
        textTransform: "",
        userSelect: "none",
        marginTop: "-4px"
      }}>
        Puzzle {puzzleIndex} / {totalPuzzles}
      </span>
      <AnimatePresence>
        {showInfo && <InfoModal isDark={isDark} onClose={() => setShowInfo(false)} />}
      </AnimatePresence>
    </div>
  );
}

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
