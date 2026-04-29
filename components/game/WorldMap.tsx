"use client";
import { useState, useEffect, useRef } from "react";
import { useMotionValue, animate, MotionValue } from "motion/react";
import {
  ComposableMap,
  Geography,
  Geographies,
  ZoomableGroup,
  useMapContext,
} from "react-simple-maps";
import CareerPath from "./CareerPath";
import { getColors } from "../../lib/theme";
import { getFlagUrl } from "../../lib/countryFlags";
import { useMapPan } from "../../lib/hooks/useMapPan";
import { CareerStop, GuessResult, PanTarget, PinnedStop } from "../../lib/types";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function FlagGeographies({ revealedCodes, bg, bgHover, strokeColor, guessResult }: {
  revealedCodes: Set<string>;
  bg: string;
  bgHover: string;
  strokeColor: string;
  guessResult: string | null;
}) {
  const { path } = useMapContext() as any;

  return (
    <g
      filter={guessResult === "correct" ? "url(#glow-green)" : undefined}
      style={{ transition: "filter 0.4s ease" }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) => {
          const patterns: React.ReactNode[] = [];
          const shapes: React.ReactNode[] = [];

          geographies.forEach((geo) => {
            const code = String(geo.id);
            const isRevealed = revealedCodes.has(code);
            const flagUrl = isRevealed ? getFlagUrl(code) : null;

            if (flagUrl) {
              const bounds = path.bounds(geo as any);
              const bx = bounds[0][0];
              const by = bounds[0][1];
              const bw = bounds[1][0] - bounds[0][0];
              const bh = bounds[1][1] - bounds[0][1];
              // cover-scale: expand flag so it fills the bbox on both axes
              const flagAspect = 2;
              let fw, fh;
              if (bw / bh > flagAspect) {
                fw = bw; fh = bw / flagAspect;
              } else {
                fh = bh; fw = bh * flagAspect;
              }
              const fx = bx + (bw - fw) / 2;
              const fy = by + (bh - fh) / 2;
              patterns.push(
                <pattern
                  key={`pat-${code}`}
                  id={`flag-${code}`}
                  patternUnits="userSpaceOnUse"
                  x={bx} y={by} width={bw} height={bh}
                >
                  <image
                    href={flagUrl}
                    x={fx - bx} y={fy - by}
                    width={fw} height={fh}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </pattern>
              );
            }

            const fill = flagUrl ? `url(#flag-${code})` : bg;
            const fillHover = flagUrl ? `url(#flag-${code})` : bgHover;
            shapes.push(
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: { fill, stroke: strokeColor, strokeWidth: 0.5, outline: "none" },
                  hover: { fill: fillHover, stroke: strokeColor, strokeWidth: 0.5, outline: "none" },
                }}
              />
            );
          });

          return <>{patterns.length > 0 && <defs>{patterns}</defs>}{shapes}</>;
        }}
      </Geographies>
    </g>
  );
}

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
  const bgHover = "#2a5c2a";

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
          maxZoom={7}
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
          />
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
