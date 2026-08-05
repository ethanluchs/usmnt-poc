"use client";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import InfoModal from "./InfoModal";
import { Player } from "../../lib/types";
import { LoadingVariant } from "../AsciiOverlay";

const VARIANT_LABEL: Record<LoadingVariant, { text: string; color: string }> = {
  usa:    { text: "USA",    color: "#0a3161" },
  mexico: { text: "MEX",   color: "#006847" },
  canada: { text: "CAN",   color: "#A9141B" },
};

interface TopBarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  puzzleIndex?: number;
  totalPuzzles?: number;
  isDragging?: boolean;
  unlockedCards?: Player[];
  playerPool?: Player[];
  loadingVariant?: LoadingVariant;
}

export default function TopBar({
  isDark,
  onToggleTheme,
  puzzleIndex = 1,
  totalPuzzles = 3,
  isDragging = false,
  unlockedCards = [],
  playerPool = [],
  loadingVariant = "usa",
}: TopBarProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
    <div className="absolute top-0 left-0 right-0 flex justify-center z-50" style={{ pointerEvents: "none" }}>
      <div
        className="absolute top-0 flex justify-center"
        style={{ pointerEvents: "auto" }}
      >
        <div style={{
          background: "#ffffff",
          borderRadius: "0 0 8px 8px",
          padding: "6px 20px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          userSelect: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}>
          <div style={{ display: "inline-flex", alignItems: "baseline", gap: 0, lineHeight: 1 }}>
            <span style={{ fontFamily: "'UniversCn', sans-serif", fontStyle: "italic", fontWeight: 700, fontSize: "20px", color: "#000000", letterSpacing: "0px", whiteSpace: "nowrap" }}>
              WordleCup
            </span>
            <span style={{ fontFamily: "'Univers', sans-serif", fontStyle: "normal", fontWeight: 300, fontSize: "20px", color: VARIANT_LABEL[loadingVariant].color, letterSpacing: "-0.5px", whiteSpace: "nowrap", marginLeft: "2px" }}>
              {VARIANT_LABEL[loadingVariant].text}
            </span>
            <span style={{ fontFamily: "'UniversCn', sans-serif", fontStyle: "normal", fontWeight: 700, fontSize: "20px", color: "#000000", letterSpacing: "0px", whiteSpace: "nowrap", marginLeft: "1px" }}>
              26
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: "'UniversCn', sans-serif", fontWeight: 800, fontSize: "11px", color: "#000000", letterSpacing: "1px", textTransform: "uppercase" }}>
              Puzzle {puzzleIndex} / {totalPuzzles}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowInfo(true); }}
              style={{ fontFamily: "'Univers', sans-serif", fontSize: "11px", fontWeight: 600, color: "#000000", opacity: 1, lineHeight: 1, cursor: "pointer", background: "none", border: "none", padding: 0 }}
            >
              ?
            </button>
          </div>
        </div>
      </div>

    </div>
    <AnimatePresence>
      {showInfo && <InfoModal isDark={isDark} onClose={() => setShowInfo(false)} />}
    </AnimatePresence>
    </>
  );
}
