import React, { useMemo } from "react";
import { Phase1Renderer } from "./phase1-renderer";
import { Phase2Renderer } from "./phase2-renderer";
import { Phase34Renderer } from "./phase3-4-renderer";
import type {
  CountryPhase1,
  IslandPhase2,
  RegionPhase3,
} from "../engine/types";

interface MapSvgRendererProps {
  phase: 1 | 2 | 3 | 4;
  phase1Data: CountryPhase1[] | null;
  phase2Data: IslandPhase2[] | null;
  phase3Data: RegionPhase3[] | null;
  phase4Data: RegionPhase3[] | null;
  hoveredCountry: string | null;
  setHoveredCountry: (code: string | null) => void;
  hoveredIsland: string | null;
  setHoveredIsland: (id: string | null) => void;
  hoveredRegion: string | null;
  setHoveredRegion: (id: string | null) => void;
}

const mapWidth = 1200;
const mapHeight = 600;

export const MapSvgRenderer: React.FC<MapSvgRendererProps> = ({
  phase,
  phase1Data,
  phase2Data,
  phase3Data,
  phase4Data,
  hoveredCountry,
  setHoveredCountry,
  hoveredIsland: _hoveredIsland,
  setHoveredIsland,
  hoveredRegion,
  setHoveredRegion,
}) => {
  const getCountryColor = (code: string): string => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (Math.abs((hash & 0xff0000) >> 16) % 120) + 40;
    const g = (Math.abs((hash & 0x00ff00) >> 8) % 120) + 40;
    const b = (Math.abs(hash & 0x0000ff) % 120) + 40;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const activeCountryOverlay = useMemo(() => {
    return null;
  }, []);

  const activeIslandOverlay = useMemo(() => {
    return null;
  }, []);

  const activeRegionOverlay = useMemo(() => {
    const isPhase3 = phase === 3;
    const isPhase4 = phase === 4;
    if (!isPhase3 && !isPhase4) return null;

    const sourceData = isPhase3 ? phase3Data : phase4Data;
    if (!hoveredRegion || !sourceData) return null;

    const hoveredReg = sourceData.find((r) => r.id === hoveredRegion);
    if (!hoveredReg) return null;

    const activeCountryRegions = sourceData.filter(
      (r) => r.countryCode === hoveredReg.countryCode,
    );

    return (
      <g className="pointer-events-none">
        {activeCountryRegions.map((region) => {
          const isHovered = region.id === hoveredRegion;
          let dPath = "";
          let ringPath = "";
          region.coordinates.forEach((pt, idx) => {
            const x = ((pt[0] + 180) / 360) * mapWidth;
            const y = ((90 - pt[1]) / 180) * mapHeight;
            if (idx === 0) {
              ringPath += `M ${x.toFixed(1)},${y.toFixed(1)}`;
            } else {
              ringPath += ` L ${x.toFixed(1)},${y.toFixed(1)}`;
            }
          });
          if (ringPath) ringPath += " Z";
          dPath += ringPath + " ";

          return (
            <path
              key={`overlay-${region.id}`}
              d={dPath.trim()}
              fill={isHovered ? "rgba(255, 255, 255, 0.15)" : "none"}
              stroke={
                isHovered
                  ? "rgba(255, 255, 255, 0.8)"
                  : "rgba(255, 255, 255, 0.3)"
              }
              strokeWidth="0.8"
            />
          );
        })}
      </g>
    );
  }, [phase, hoveredRegion, phase3Data, phase4Data]);

  const handleMouseOver = (e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement;
    const code = target.getAttribute("data-code");
    const id = target.getAttribute("data-id");

    if (phase === 1) {
      if (code) setHoveredCountry(code);
    } else if (phase === 2) {
      if (id) setHoveredIsland(id);
    } else if (phase === 3 || phase === 4) {
      if (id) setHoveredRegion(id);
    }
  };

  const handleMouseOut = () => {
    if (phase === 1) {
      setHoveredCountry(null);
    } else if (phase === 2) {
      setHoveredIsland(null);
    } else if (phase === 3 || phase === 4) {
      setHoveredRegion(null);
    }
  };

  return (
    <svg
      viewBox={`0 0 ${mapWidth} ${mapHeight}`}
      className="w-full h-full"
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <rect width={mapWidth} height={mapHeight} fill="rgb(10, 15, 30)" />

      <g>
        {phase === 1 && phase1Data && (
          <Phase1Renderer
            data={phase1Data}
            hoveredCountry={hoveredCountry}
            getCountryColor={getCountryColor}
          />
        )}
        {phase === 2 && phase2Data && (
          <Phase2Renderer data={phase2Data} getCountryColor={getCountryColor} />
        )}
        {phase === 3 && phase3Data && (
          <Phase34Renderer
            data={phase3Data}
            getCountryColor={getCountryColor}
          />
        )}
        {phase === 4 && phase4Data && (
          <Phase34Renderer
            data={phase4Data}
            getCountryColor={getCountryColor}
          />
        )}
      </g>

      {phase === 1 && activeCountryOverlay}
      {phase === 2 && activeIslandOverlay}
      {(phase === 3 || phase === 4) && activeRegionOverlay}
    </svg>
  );
};
