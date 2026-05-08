"use client";
import { motion } from "motion/react";
import { getColors } from "../../lib/theme";
import { CareerStop } from "../../lib/types";

interface StopCardProps {
  stop: CareerStop | null;
  x: number;
  y: number;
  isDark: boolean;
  raw?: boolean;
  totalStops?: number;
}

export default function StopCard({ stop, x, y, isDark, raw = false, totalStops }: StopCardProps) {
  if (!stop) return null;
  const { stroke } = getColors(isDark);
  const fx = raw ? x : x + 6;
  const fy = raw ? y : y - 28;

  const STOP_COLORS: [string, string][] = [
    ["#ffffff", "#000000"],  // 1
    ["#D1D4D1", "#000000"],  // 2
    ["#9ea1a1", "#000000"],  // 3 
    ["#474A4A", "#ffffff"],  // 4 
    ["#1a1a1a", "#ffffff"],  // 5
  ];
  const [cardBg, cardText] = totalStops && stop.order <= STOP_COLORS.length
    ? STOP_COLORS[stop.order - 1]
    : ["#ffffff", "#000000"];

  return (
    <foreignObject
      x={fx}
      y={fy}
      width={96}
      height={48}
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
          color: cardText,
          padding: "3px 7px",
          fontSize: "7px",
          lineHeight: 1.25,
          whiteSpace: "normal",
          maxWidth: "96px",
          pointerEvents: "none",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <div style={{ position: "absolute", top: "3px", right: "6px", fontSize: "7px", fontWeight: "bold" }}>
          #{stop.order}
        </div>
        <div style={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", paddingRight: "14px" }}>
          {stop.club}
        </div>
        {stop.years ? (
          <div
            style={{
              marginTop: "2px",
              fontSize: "8px",
              fontWeight: 600,
              letterSpacing: "0.02em",
              opacity: 0.92,
              lineHeight: 1.2,
            }}
          >
            {stop.years}
          </div>
        ) : null}
      </motion.div>
    </foreignObject>
  );
}
