"use client";
import { AnimatePresence, useDragControls, useMotionValue, animate, motion } from "motion/react";
import { useState, useEffect } from "react";
import InfoModal from "./InfoModal";
import CardOverlay from "./CardOverlay";
import { Player } from "../../lib/types";

interface TopBarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  puzzleIndex?: number;
  totalPuzzles?: number;
  isDragging?: boolean;
  unlockedCards?: Player[];
  playerPool?: Player[];
}

export default function TopBar({
  isDark,
  onToggleTheme,
  puzzleIndex = 1,
  totalPuzzles = 5,
  isDragging = false,
  unlockedCards = [],
  playerPool = [],
}: TopBarProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [screenH, setScreenH] = useState(800);
  const dragControls = useDragControls();

  useEffect(() => {
    setScreenH(window.innerHeight);
  }, []);

  const y = useMotionValue(-800);
  const tabY = useMotionValue(0);

  useEffect(() => {
    if (screenH === 800) return;
    y.set(-screenH);
  }, [screenH]);

  // tabY = y + screenH so the tab sits at 0 when overlay is hidden, follows it when dragging
  useEffect(() => {
    return y.on("change", (v) => {
      tabY.set(v + screenH);
    });
  }, [y, screenH, tabY]);

  const snapOpen = () => {
    animate(y, 0, { type: "spring", stiffness: 300, damping: 35 });
    setIsOpen(true);
  };

  const snapClosed = () => {
    animate(y, -screenH, { type: "spring", stiffness: 300, damping: 35 });
    setIsOpen(false);
  };

  const handleDragEnd = (_: unknown, info: { velocity: { y: number } }) => {
    if (info.velocity.y > 300 || y.get() > -screenH * 0.5) {
      snapOpen();
    } else {
      snapClosed();
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 flex justify-center z-50" style={{ pointerEvents: "none" }}>
      <motion.div
        drag="y"
        dragControls={dragControls}
        dragListener={isOpen}
        dragConstraints={{ top: -screenH, bottom: 0 }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        style={{ y, pointerEvents: "auto" }}
        className={`fixed inset-0 z-40 flex flex-col ${isDark ? "bg-[#1a1917]" : "bg-[#ede8d0]"}`}
      >
        <CardOverlay
          isDark={isDark}
          isOpen={isOpen}
          onClose={snapClosed}
          unlockedCards={unlockedCards}
          playerPool={playerPool}
        />
      </motion.div>

      <motion.div
        style={{ y: tabY, pointerEvents: "auto" }}
        className="absolute top-0 flex justify-center"
        onPointerDown={(e) => dragControls.start(e)}
        onClick={() => isOpen ? snapClosed() : snapOpen()}
      >
        <div style={{
          background: "#ede8d0",
          borderRadius: "0 0 8px 8px",
          padding: "6px 20px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          userSelect: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          cursor: "grab",
          touchAction: "none",
        }}>
          <div style={{ display: "inline-flex", alignItems: "baseline", gap: 0, lineHeight: 1 }}>
            <span style={{ fontFamily: "'UniversCn', sans-serif", fontStyle: "italic", fontWeight: 700, fontSize: "20px", color: "#000000", letterSpacing: "0px", whiteSpace: "nowrap" }}>
              WordleCup
            </span>
            <span style={{ fontFamily: "'Univers', sans-serif", fontStyle: "normal", fontWeight: 300, fontSize: "20px", color: "#cc1020", letterSpacing: "-0.5px", whiteSpace: "nowrap", marginLeft: "2px" }}>
              USA
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
              style={{ fontFamily: "'Univers', sans-serif", fontSize: "11px", fontWeight: 600, color: "#000000", opacity: 1, lineHeight: 1, cursor: "pointer", background: "none", border: "none", padding: 0, touchAction: "none" }}
            >
              ?
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showInfo && <InfoModal isDark={isDark} onClose={() => setShowInfo(false)} />}
      </AnimatePresence>
    </div>
  );
}
