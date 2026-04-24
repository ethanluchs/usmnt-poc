"use client";
import { CareerStop } from "../../lib/types";

interface StopCardProps {
  stop: CareerStop | null;
  x: number;
  y: number;
}

export default function StopCard({ stop, x, y }: StopCardProps) {
  if (!stop) return null;

  return (
    <foreignObject x={x + 6} y={y - 28} width={110} height={55} style={{ overflow: "visible" }}>
      <div style={{
        background: "#ffffe1",
        border: "1px solid #000000",
        color: "#000000",
        padding: "3px 6px",
        fontSize: "11px",
        fontFamily: "Arial, sans-serif",
        lineHeight: 1.5,
        whiteSpace: "normal",
        wordBreak: "break-word",
        pointerEvents: "none",
      }}>
        <div style={{ fontWeight: "bold" }}>#{stop.order} {stop.club}</div>
        <div style={{ color: "#444444" }}>{stop.years}</div>
      </div>
    </foreignObject>
  );
}
