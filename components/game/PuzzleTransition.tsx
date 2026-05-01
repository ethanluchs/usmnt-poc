"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface PuzzleTransitionProps {
  fromNumber: number;
  toNumber: number;
  totalPuzzles?: number;
  onDone: () => void;
}

export default function PuzzleTransition({
  fromNumber,
  toNumber,
  totalPuzzles = 5,
  onDone,
}: PuzzleTransitionProps) {
  const [current, setCurrent] = useState(fromNumber);

  useEffect(() => {
    const switchT = setTimeout(() => setCurrent(toNumber), 900);
    const doneT = setTimeout(onDone, 2000);
    return () => { clearTimeout(switchT); clearTimeout(doneT); };
  }, [onDone, toNumber]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <span style={{
        fontFamily: "'FWC2026', sans-serif",
        fontWeight: 800,
        fontSize: "clamp(48px, 10vw, 120px)",
        letterSpacing: "-0.02em",
        color: "#000000",
        lineHeight: 1,
      }}>
        {current} / {totalPuzzles}
      </span>
    </motion.div>
  );
}
