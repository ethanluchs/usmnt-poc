"use client";
import { useState } from "react";
import InfoModal from "./InfoModal";
import { AnimatePresence } from "motion/react";

interface TopBarProps {
  puzzleIndex?: number;
  totalPuzzles?: number;
}

export default function TopBar({ puzzleIndex = 1, totalPuzzles = 5 }: TopBarProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 12px",
      background: "#000080",
      borderBottom: "2px solid #ffffff",
      fontFamily: "Arial, sans-serif",
    }}>
      <span style={{ color: "#ffffff", fontWeight: "bold", fontSize: "14px", letterSpacing: "0.05em" }}>
        WORDLE CUP — PUZZLE {puzzleIndex}/{totalPuzzles}
      </span>
      <button
        onClick={() => setShowInfo(true)}
        style={{
          background: "#c0c0c0",
          border: "2px solid",
          borderColor: "#ffffff #808080 #808080 #ffffff",
          color: "#000000",
          fontSize: "11px",
          fontFamily: "Arial, sans-serif",
          padding: "1px 6px",
          cursor: "pointer",
        }}
      >
        ?
      </button>
      <AnimatePresence>
        {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
      </AnimatePresence>
    </div>
  );
}
