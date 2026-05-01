"use client";
import { useMapContext } from "react-simple-maps";
import { Geographies, Geography } from "react-simple-maps";
import { getFlagUrl } from "../../lib/countryFlags";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface FlagGeographiesProps {
  revealedCodes: Set<string>;
  bg: string;
  bgHover: string;
  strokeColor: string;
  guessResult: string | null;
}

export default function FlagGeographies({
  revealedCodes,
  bg,
  bgHover,
  strokeColor,
  guessResult,
}: FlagGeographiesProps) {
  const { path } = useMapContext() as any;

  return (
    <g>
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
