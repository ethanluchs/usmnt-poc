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

const PAD_X = 7;
const PAD_TOP = 6;
const LINE_HEIGHT = 8.5;
const FONT_SIZE = 7;
const CLUB_MAX_CHARS = 14; // rough char budget per line at 7px in a ~76px-wide card

function wrapClubName(name: string): string[] {
  const words = name.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > CLUB_MAX_CHARS && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

export default function StopCard({ stop, x, y, isDark, raw = false, totalStops }: StopCardProps) {
  if (!stop) return null;
  const { stroke } = getColors(isDark);
  const fx = raw ? x : x + 6;
  const fy = raw ? y : y - 28;

  // step from white → light gray → mid gray → dark gray → near-black
  const STOP_COLORS: [string, string][] = [
    ["#ffffff", "#000000"],  // 1
    ["#D1D4D1", "#000000"],  // 2 — WC26 light gray
    ["#9ea1a1", "#000000"],  // 3 — mid
    ["#474A4A", "#ffffff"],  // 4 — WC26 dark gray
    ["#1a1a1a", "#ffffff"],  // 5
  ];
  const [cardBg, cardText] = totalStops && stop.order <= STOP_COLORS.length
    ? STOP_COLORS[stop.order - 1]
    : ["#ffffff", "#000000"];

  const clubLines = wrapClubName(stop.club.toUpperCase());
  const cardH = PAD_TOP + clubLines.length * LINE_HEIGHT + LINE_HEIGHT + 4;
  const cardW = 90;

  return (
    <motion.g
      initial={raw ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={raw ? { opacity: 0 } : { opacity: 0, y: 4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{ pointerEvents: "none" }}
    >
      <rect
        x={fx}
        y={fy}
        width={cardW}
        height={cardH}
        fill={cardBg}
        stroke={stroke}
        strokeWidth={1}
      />
      <text
        x={fx + cardW - 6}
        y={fy + PAD_TOP + 2}
        fontSize={FONT_SIZE}
        fontWeight="bold"
        fill={cardText}
        textAnchor="end"
      >
        #{stop.order}
      </text>
      <text
        x={fx + PAD_X}
        y={fy + PAD_TOP + 2}
        fontSize={FONT_SIZE}
        fontWeight="bold"
        fill={cardText}
        style={{ letterSpacing: "0.3px" }}
      >
        {clubLines.map((line, i) => (
          <tspan key={i} x={fx + PAD_X} dy={i === 0 ? 0 : LINE_HEIGHT}>
            {line}
          </tspan>
        ))}
      </text>
      <text
        x={fx + PAD_X}
        y={fy + PAD_TOP + clubLines.length * LINE_HEIGHT + LINE_HEIGHT}
        fontSize={FONT_SIZE}
        fill={cardText}
        opacity={0.5}
      >
        {stop.years}
      </text>
    </motion.g>
  );
}
