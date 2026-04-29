"use client";
import { motion } from "motion/react";
import { getColors } from "../../lib/theme";
import { CareerStop } from "../../lib/types";

interface StopCardProps {
  stop: CareerStop | null;
  x: number;
  y: number;
  isDark: boolean;
  raw?: boolean; // if true, x/y are already the card's top-left (no pin offset applied)
}

export default function StopCard({ stop, x, y, isDark, raw = false }: StopCardProps) {
  if (!stop) return null;
  const { stroke, text } = getColors(isDark);
  const cardBg = "#ede8d0";
  const fx = raw ? x : x + 6;
  const fy = raw ? y : y - 28;

  return (
    <foreignObject
      x={fx}
      y={fy}
      width={120}
      height={50}
      style={{ overflow: "visible" }}
    >
      <motion.div
        initial={raw ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={raw ? { opacity: 0 } : { opacity: 0, y: 4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          background: cardBg,
          border: `1px solid ${stroke}`,
          color: text,
          padding: "5px 9px",
          fontSize: "7px",
          lineHeight: 1.6,
          whiteSpace: "normal",
          maxWidth: "120px",
          pointerEvents: "none",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: "4px", right: "6px", fontSize: "7px", fontWeight: "bold" }}>
          #{stop.order}
        </div>
        <div style={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", paddingRight: "14px" }}>
          {stop.club}
        </div>
        <div style={{ opacity: 0.5 }}>{stop.years}</div>
      </motion.div>
    </foreignObject>
  );
}
