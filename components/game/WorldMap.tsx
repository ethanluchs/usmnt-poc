"use client";
import { useState, useEffect, useRef } from "react";
import { useMotionValue, animate, MotionValue } from "motion/react";
import {
  ComposableMap,
  Geography,
  Geographies,
  ZoomableGroup,
} from "react-simple-maps";
import CareerPath from "./CareerPath";
import { lerpColor } from "../../lib/color";
import { colors } from "../../lib/theme";
import { useMapPan } from "../../lib/hooks/useMapPan";
import { CareerStop, GuessResult, PanTarget, PinnedStop } from "../../lib/types";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
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
  isDragging,
  onMoveStart,
  onMoveEnd,
  revealedStops,
  puzzleIndex,
  currentStop,
  guessResult,
  panTarget,
}: WorldMapProps) {
  const { stroke, darkBlue, lightBlue } = colors;

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
  }, [guessResult]);

  const total = revealedStops.length;
  const countryFills: Record<string, string> = {};
  revealedStops.forEach((stop, i) => {
    const t = total <= 1 ? 1 : i / (total - 1);
    countryFills[stop.countryCode] = lerpColor(darkBlue, lightBlue, t);
  });

  const [pinnedStop, setPinnedStop] = useState<PinnedStop>(null);
  useEffect(() => { setPinnedStop(null); }, [puzzleIndex]);

  const { center, zoom, handleMoveStart, handleMoveEnd, handleWheel, panTo } =
    useMapPan({ revealedStops, puzzleIndex, panTarget });

  return (
    <div
      style={{ width: "100%", height: "100%", position: "relative" }}
      onClick={() => setPinnedStop(false)}
      onWheel={handleWheel as unknown as React.WheelEventHandler<HTMLDivElement>}
    >
      <ComposableMap
        projection="geoMercator"
        width={800}
        height={450}
        style={{ width: "100%", height: "100%", cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
      >
        <defs>
          <pattern id="water" x="0" y="0" width="400" height="267" patternUnits="userSpaceOnUse">
            <image href="/water.avif" x="0" y="0" width="400" height="267" />
          </pattern>
          <pattern id="grass" x="0" y="0" width="270" height="180" patternUnits="userSpaceOnUse">
            <image href="/turf_img.jpg" x="0" y="0" width="270" height="180" />
          </pattern>
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
          <rect x="-2000" y="-2000" width="6000" height="6000" fill="url(#water)" />
          <g
            filter={guessResult === "correct" ? "url(#glow-green)" : undefined}
            style={{ transition: "filter 0.4s ease" }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isRevealed = countryFills[String(geo.id)] !== undefined;
                  const fill = isRevealed ? "url(#grass)" : "#ffffff";
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: { fill, stroke: strokeColor, strokeWidth: 0.5, outline: "none" },
                        hover: { fill, stroke: strokeColor, strokeWidth: 0.5, outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </g>

          <CareerPath
            key={puzzleIndex}
            stops={revealedStops}
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
