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
  phase: 1 | 2 | 3 | 4 | 5;
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
  hoveredIsland,
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

  const staticPhase5 = useMemo(() => {
    if (!phase4Data) return null;
    return phase4Data.map((region) => {
      const color = getCountryColor(region.countryCode);
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
          key={`p5-${region.id}`}
          d={dPath.trim()}
          fill={color}
          stroke={color}
          strokeWidth="0.6"
          data-id={region.id}
        />
      );
    });
  }, [phase4Data]);

  const activeCountryOverlay = useMemo(() => {
    if (phase !== 1 || !hoveredCountry || !phase1Data) return null;
    const country = phase1Data.find((c) => c.code === hoveredCountry);
    if (!country) return null;

    let dPath = "";
    country.rings.forEach((ring) => {
      let ringPath = "";
      ring.forEach((pt, idx) => {
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
    });

    return (
      <path
        d={dPath.trim()}
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
        className="pointer-events-none"
      />
    );
  }, [phase, hoveredCountry, phase1Data]);

  const activeIslandOverlay = useMemo(() => {
    if (phase !== 2 || !hoveredIsland || !phase2Data) return null;
    const island = phase2Data.find((i) => i.id === hoveredIsland);
    if (!island) return null;

    let dPath = "";
    let ringPath = "";
    island.coordinates.forEach((pt, idx) => {
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
        d={dPath.trim()}
        fill="rgb(244, 63, 94)"
        stroke="#ffffff"
        strokeWidth="1.0"
        className="pointer-events-none"
      />
    );
  }, [phase, hoveredIsland, phase2Data]);

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
              fill={isHovered ? "rgb(239, 68, 68)" : "none"}
              stroke={isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.45)"}
              strokeWidth={isHovered ? "1.2" : "0.7"}
            />
          );
        })}
      </g>
    );
  }, [phase, hoveredRegion, phase3Data, phase4Data]);

  const activePhase5Overlay = useMemo(() => {
    if (phase !== 5 || !hoveredRegion || !phase4Data) return null;
    const hoveredReg = phase4Data.find((r) => r.id === hoveredRegion);
    if (!hoveredReg) return null;

    const activeCountryRegions = phase4Data.filter(
      (r) => r.countryCode === hoveredReg.countryCode,
    );

    return (
      <g className="pointer-events-none">
        {activeCountryRegions.map((region) => {
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

          const isHovered = region.id === hoveredRegion;

          return (
            <path
              key={`overlay-p5-${region.id}`}
              d={dPath.trim()}
              fill={isHovered ? "rgba(255, 255, 255, 0.15)" : "none"}
              stroke="#ffffff"
              strokeWidth={isHovered ? "1.4" : "0.8"}
            />
          );
        })}
      </g>
    );
  }, [phase, hoveredRegion, phase4Data]);

  const handleMouseOver = (e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement;
    const code = target.getAttribute("data-code");
    const id = target.getAttribute("data-id");

    if (phase === 1) {
      if (code) setHoveredCountry(code);
    } else if (phase === 2) {
      if (id) setHoveredIsland(id);
    } else if (phase === 3 || phase === 4 || phase === 5) {
      if (id) setHoveredRegion(id);
    }
  };

  const handleMouseOut = () => {
    if (phase === 1) {
      setHoveredCountry(null);
    } else if (phase === 2) {
      setHoveredIsland(null);
    } else if (phase === 3 || phase === 4 || phase === 5) {
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
        {phase === 5 && staticPhase5}
      </g>

      {phase === 1 && activeCountryOverlay}
      {phase === 2 && activeIslandOverlay}
      {(phase === 3 || phase === 4) && activeRegionOverlay}
      {phase === 5 && activePhase5Overlay}
    </svg>
  );
};
