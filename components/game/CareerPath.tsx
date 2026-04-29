"use client";
import { useMapContext } from "react-simple-maps";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import StopCard from "./StopCard";
import OverviewCards from "./OverviewCards";
import { getColors } from "../../lib/theme";
import { CareerStop, PinnedStop } from "../../lib/types";

function isActivePinnedStop(p: PinnedStop): p is { stop: CareerStop; x: number; y: number } {
  return p !== null && p !== false;
}

interface CareerPathProps {
  stops?: CareerStop[];
  isDark: boolean;
  currentStop: number;
  onPanTo?: (lng: number, lat: number) => void;
  pinnedStop: PinnedStop;
  setPinnedStop: React.Dispatch<React.SetStateAction<PinnedStop>>;
  showAllCards?: boolean;
  zoom?: number;
}

export default function CareerPath({
  stops = [],
  isDark,
  currentStop,
  onPanTo,
  pinnedStop,
  setPinnedStop,
  showAllCards = false,
  zoom = 1,
}: CareerPathProps) {
  const { projection } = useMapContext();
  const [hoveredStop, setHoveredStop] = useState<PinnedStop>(null);
  const seenIndices = useRef<Set<number>>(new Set());

  const { text, textInv } = getColors(isDark);

  useEffect(() => {
    if (stops.length === 0 || currentStop === 0) return;
    const last = stops[stops.length - 1];
    const pt = projection([last.lng, last.lat]);
    if (!pt) return;
    const t = setTimeout(() => setPinnedStop({ stop: last, x: pt[0], y: pt[1] }), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops.length]);

  if (stops.length === 0) return null;

  const points = stops
    .map((stop) => projection([stop.lng, stop.lat]))
    .filter((pt): pt is [number, number] => pt !== null);

  if (points.length !== stops.length) return null;

  const activeStop =
    pinnedStop ||
    hoveredStop ||
    (pinnedStop !== false ? { stop: stops[0], x: points[0][0], y: points[0][1] } : null);

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
            strokeDasharray="4 3"
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
            r={isActivePinnedStop(pinnedStop) && pinnedStop.stop === stops[i] ? 4.5 : 3}
            fill={text}
            stroke={text}
            strokeWidth={1}
            initial={!seenIndices.current.has(i) ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            onAnimationComplete={() => seenIndices.current.add(i)}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHoveredStop({ stop: stops[i], x: pt[0], y: pt[1] })}
            onMouseLeave={() => setHoveredStop(null)}
            onClick={(e) => {
              e.stopPropagation();
              setPinnedStop((prev) =>
                isActivePinnedStop(prev) && prev.stop === stops[i]
                  ? false
                  : { stop: stops[i], x: pt[0], y: pt[1] }
              );
              onPanTo?.(stops[i].lng, stops[i].lat);
            }}
          />
          <motion.text
            x={pt[0]}
            y={pt[1] + 1.5}
            fontSize={isActivePinnedStop(pinnedStop) && pinnedStop.stop === stops[i] ? 5.5 : 4}
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
        {showAllCards
          ? <OverviewCards stops={stops} points={points} isDark={isDark} zoom={zoom} />
          : activeStop && (
              <StopCard
                key={activeStop.stop.order}
                stop={activeStop.stop}
                x={activeStop.x}
                y={activeStop.y}
                isDark={isDark}
              />
            )
        }
      </AnimatePresence>
    </g>
  );
}
