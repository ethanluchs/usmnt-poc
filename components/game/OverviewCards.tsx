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

  const offsets = placeLabels(points);
  const sorted = stops
    .map((stop, i) => ({ stop, i }))
    .sort((a, b) =>
      a.stop.order === topStopOrder ? 1 : b.stop.order === topStopOrder ? -1 : 0
    );

  const s = 1 / zoom;

  return (
    <>
      {sorted.map(({ stop, i }) => {
        const [px, py] = points[i];
        const [dx, dy] = offsets[i];
        const ex = dx + CARD_W / 2;
        const ey = dy + CARD_H / 2;

        return (
          <g
            key={stop.order}
            transform={`translate(${px},${py}) scale(${s})`}
            onClick={(e) => { e.stopPropagation(); setTopStopOrder(stop.order); }}
            style={{ cursor: "pointer" }}
          >
            <line
              x1={0} y1={0}
              x2={ex} y2={ey}
              stroke="black"
              strokeWidth={1}
            />
            <StopCard stop={stop} x={dx} y={dy} isDark={isDark} raw totalStops={stops.length} />
          </g>
        );
      })}
    </>
  );
}
