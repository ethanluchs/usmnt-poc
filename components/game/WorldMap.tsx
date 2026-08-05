"use client";
import { useState, useEffect, useRef } from "react";
import { useMotionValue, animate, MotionValue } from "motion/react";
import { ComposableMap, ZoomableGroup } from "react-simple-maps";
import CareerPath from "./CareerPath";
import FlagGeographies from "./FlagGeographies";
import { getColors } from "../../lib/theme";
import { getFlagUrl } from "../../lib/countryFlags";
import { useMapPan } from "../../lib/hooks/useMapPan";
import { CareerStop, GuessResult, PanTarget } from "../../lib/types";

interface WorldMapProps {
  isDark: boolean;
  isDragging: boolean;
  onMoveStart: () => void;
  onMoveEnd: () => void;
  revealedStops: CareerStop[];
  puzzleIndex: number;
  currentStop: number;
  guessResult: GuessResult;
  panTarget: PanTarget;
}

const REFERENCE_CONTAINER_WIDTH = 800; // container width at which cards render at their designed size

export default function WorldMap({
  isDark,
  isDragging,
  onMoveStart,
  onMoveEnd,
  revealedStops,
  puzzleIndex,
  currentStop,
  guessResult,
  panTarget,
}: WorldMapProps) {
  const { stroke } = getColors(isDark);
  const bg = "#3a7a3a";
  const bgHover = "#2e6a2e";

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(REFERENCE_CONTAINER_WIDTH);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setContainerWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // When the container is narrower than the reference width, the fixed
  // 800-unit viewBox gets compressed and SVG-unit text/cards shrink with it.
  // Scale card content up inversely so it holds a consistent on-screen size.
  const cardScale = Math.min(
    2,
    Math.max(1, REFERENCE_CONTAINER_WIDTH / Math.max(containerWidth, 1))
  );

  const strokeMV: MotionValue<string> = useMotionValue(stroke);
  const [strokeColor, setStrokeColor] = useState(stroke);
  const prevGuessResult = useRef<GuessResult>(null);

  useEffect(() => {
    return strokeMV.on("change", (v) => setStrokeColor(v));
  }, [strokeMV]);

  useEffect(() => {
    const prev = prevGuessResult.current;
    prevGuessResult.current = guessResult;
    const target =
      guessResult === "wrong" ? "#ef4444"
      : guessResult === "correct" ? "#22c55e"
      : stroke;
    const duration = guessResult === "correct" ? 0.7 : prev === "correct" ? 0.5 : 0.2;
    animate(strokeMV, target, { duration, ease: "easeOut" });
  }, [guessResult, stroke]);

  const revealedCodes = new Set(revealedStops.map((s) => s.countryCode));


  const { center, zoom, handleMoveStart, handleMoveEnd, handleWheel } =
    useMapPan({ revealedStops, puzzleIndex, panTarget });

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
      onWheel={handleWheel as unknown as React.WheelEventHandler<HTMLDivElement>}
    >
      <ComposableMap
        projection="geoMercator"
        width={800}
        height={450}
        style={{ width: "100%", height: "100%", cursor: isDragging ? "grabbing" : "grab", touchAction: "none", background: "#1a6aaa" }}
      >
        <defs>
          <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feFlood floodColor="#22c55e" floodOpacity="0.55" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ZoomableGroup
          center={center}
          zoom={zoom}
          minZoom={1}
          maxZoom={4}
          translateExtent={[[-25, -125], [850, 550]]}
          filterZoomEvent={(e: Event) => e.type !== "wheel"}
          onMoveStart={() => { handleMoveStart(); onMoveStart(); }}
          onMoveEnd={(e) => { handleMoveEnd(e); onMoveEnd(); }}
        >
          <FlagGeographies
            revealedCodes={revealedCodes}
            bg={bg}
            bgHover={bgHover}
            strokeColor={strokeColor}
            guessResult={guessResult}
          />

          <CareerPath
            key={puzzleIndex}
            stops={revealedStops}
            isDark={isDark}
            currentStop={currentStop}
            zoom={zoom}
            cardScale={cardScale}
          />
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
