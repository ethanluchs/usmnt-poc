"use client";
import { useState, useEffect, useRef } from "react";
import { useMotionValue, animate, MotionValue } from "motion/react";
import { ComposableMap, ZoomableGroup } from "react-simple-maps";
import CareerPath from "./CareerPath";
import FlagGeographies from "./FlagGeographies";
import { getColors } from "../../lib/theme";
import { getFlagUrl } from "../../lib/countryFlags";
import { useMapPan } from "../../lib/hooks/useMapPan";
import { CareerStop, GuessResult, PanTarget, PinnedStop } from "../../lib/types";

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
  showAllCards?: boolean;
}

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
  showAllCards = false,
}: WorldMapProps) {
  const { stroke } = getColors(isDark);
  const bg = "#3a7a3a";
  const bgHover = "#2e6a2e";

  const strokeMV: MotionValue<string> = useMotionValue(stroke);
  const [strokeColor, setStrokeColor] = useState(stroke);
  useEffect(() => strokeMV.on("change", (v) => setStrokeColor(v)), []);
  const prevGuessResult = useRef<GuessResult>(null);

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

  const [pinnedStop, setPinnedStop] = useState<PinnedStop>(null);
  useEffect(() => { setPinnedStop(null); }, [puzzleIndex]);

  const { center, zoom, handleMoveStart, handleMoveEnd, handleWheel, panTo } =
    useMapPan({ revealedStops, puzzleIndex, panTarget });

  return (
    <div
      style={{ width: "100%", height: "100%" }}
      onClick={() => setPinnedStop(false)}
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
          filterZoomEvent={(e: Event) => e.type !== "wheel" && e.type !== "touchstart"}
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
            onPanTo={panTo}
            pinnedStop={pinnedStop}
            setPinnedStop={setPinnedStop}
            showAllCards={showAllCards}
            zoom={zoom}
          />
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
