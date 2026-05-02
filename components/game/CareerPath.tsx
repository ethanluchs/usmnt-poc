"use client";
import { useMapContext } from "react-simple-maps";
import { motion, AnimatePresence } from "motion/react";
import { useRef } from "react";
import OverviewCards from "./OverviewCards";
import { getColors } from "../../lib/theme";
import { CareerStop } from "../../lib/types";

interface CareerPathProps {
  stops?: CareerStop[];
  isDark: boolean;
  currentStop: number;
  zoom?: number;
}

export default function CareerPath({
  stops = [],
  isDark,
  zoom = 1,
}: CareerPathProps) {
  const { projection } = useMapContext();
  const seenIndices = useRef<Set<number>>(new Set());
  const { text, textInv } = getColors(isDark);

  if (stops.length === 0) return null;

  const points = stops
    .map((stop) => projection([stop.lng, stop.lat]))
    .filter((pt): pt is [number, number] => pt !== null);

  if (points.length !== stops.length) return null;

  return (
    <g>
      {points.slice(0, -1).map((pt, i) => {
        const next = points[i + 1];
        const cx = (pt[0] + next[0]) / 2;
        const cy = (pt[1] + next[1]) / 2 - Math.hypot(next[0] - pt[0], next[1] - pt[1]) * 0.3;
        const d = `M ${pt[0]} ${pt[1]} Q ${cx} ${cy} ${next[0]} ${next[1]}`;
        return (
          <motion.path
            key={`line-${i}`}
            d={d}
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={1}
            initial={!seenIndices.current.has(i) ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ pathLength: { duration: 1.2, ease: "easeInOut" }, opacity: { duration: 0.3 } }}
          />
        );
      })}

      {points.map((pt, i) => (
        <g key={`stop-${i}`}>
          <motion.circle
            cx={pt[0]}
            cy={pt[1]}
            r={3}
            fill={text}
            stroke={text}
            strokeWidth={1}
            initial={!seenIndices.current.has(i) ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            onAnimationComplete={() => seenIndices.current.add(i)}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
          <motion.text
            x={pt[0]}
            y={pt[1] + 1.5}
            fontSize={4}
            fill={textInv}
            textAnchor="middle"
            initial={!seenIndices.current.has(i) ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1, ease: "easeOut", delay: 0.05 }}
            style={{ pointerEvents: "none", userSelect: "none", fontWeight: "bold" }}
          >
            {stops[i].order}
          </motion.text>
        </g>
      ))}

      <AnimatePresence>
        <OverviewCards stops={stops} points={points} isDark={isDark} zoom={zoom} />
      </AnimatePresence>
    </g>
  );
}
