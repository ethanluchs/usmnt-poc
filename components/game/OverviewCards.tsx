"use client";
import { useState } from "react";
import StopCard from "./StopCard";
import { placeLabels, CARD_W, CARD_H } from "../../lib/labelPlacement";
import { CareerStop } from "../../lib/types";

interface OverviewCardsProps {
  stops: CareerStop[];
  points: [number, number][];
  isDark: boolean;
  zoom: number;
}

export default function OverviewCards({ stops, points, isDark, zoom }: OverviewCardsProps) {
  const [topStopOrder, setTopStopOrder] = useState<number | null>(null);

  const labelPositions = placeLabels(points);
  const sorted = stops
    .map((stop, i) => ({ stop, i }))
    .sort((a, b) =>
      a.stop.order === topStopOrder ? 1 : b.stop.order === topStopOrder ? -1 : 0
    );

  const s = 1 / zoom;

  return (
    <>
      {sorted.map(({ stop, i }) => {
        const [lx, ly] = labelPositions[i];
        const [px, py] = points[i];
        const cardCx = lx + CARD_W / 2;
        const ex = lx + (cardCx < px ? CARD_W : 0);
        const ey = ly + CARD_H / 2;

        return (
          <g
            key={stop.order}
            transform={`translate(${px},${py}) scale(${s}) translate(${-px},${-py})`}
            onClick={(e) => { e.stopPropagation(); setTopStopOrder(stop.order); }}
            style={{ cursor: "pointer" }}
          >
            <line
              x1={px} y1={py}
              x2={ex} y2={ey}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth={0.6 * zoom}
              strokeDasharray={`${2 * zoom} ${2 * zoom}`}
            />
            <StopCard stop={stop} x={lx} y={ly} isDark={isDark} raw totalStops={stops.length} />
          </g>
        );
      })}
    </>
  );
}
