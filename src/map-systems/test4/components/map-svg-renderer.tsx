import React, { useMemo } from "react";
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
  hoveredIsland,
  setHoveredIsland,
  hoveredRegion,
  setHoveredRegion,
}) => {
  const getNationColor = (code: string): string => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (Math.abs((hash & 0xff0000) >> 16) % 120) + 40;
    const g = (Math.abs((hash & 0x00ff00) >> 8) % 120) + 40;
    const b = (Math.abs(hash & 0x0000ff) % 120) + 40;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const staticPhase1 = useMemo(() => {
    if (!phase1Data) return null;
    return phase1Data.map((country) => {
      const color = getNationColor(country.code);
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
          key={country.code}
          d={dPath.trim()}
          fill={color}
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="0.5"
          data-code={country.code}
        />
      );
    });
  }, [phase1Data]);

  const staticPhase2 = useMemo(() => {
    if (!phase2Data) return null;
    return phase2Data.map((island) => {
      const color = getNationColor(island.countryCode);
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
          key={island.id}
          d={dPath.trim()}
          fill={color}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="0.4"
          data-id={island.id}
        />
      );
    });
  }, [phase2Data]);

  const staticPhase3 = useMemo(() => {
    if (!phase3Data) return null;
    return phase3Data.map((region) => {
      const color = getNationColor(region.countryCode);
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
          key={region.id}
          d={dPath.trim()}
          fill={color}
          stroke="rgba(10, 15, 30, 0.4)"
          strokeWidth="0.45"
          data-id={region.id}
        />
      );
    });
  }, [phase3Data]);

  const staticPhase4 = useMemo(() => {
    if (!phase4Data) return null;
    return phase4Data.map((region) => {
      const color = getNationColor(region.countryCode);
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
          key={region.id}
          d={dPath.trim()}
          fill={color}
          stroke="rgba(10, 15, 30, 0.4)"
          strokeWidth="0.45"
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
        {phase === 1
          ? staticPhase1
          : phase === 2
            ? staticPhase2
            : phase === 3
              ? staticPhase3
              : staticPhase4}
      </g>

      {phase === 1 && activeCountryOverlay}
      {phase === 2 && activeIslandOverlay}
      {(phase === 3 || phase === 4) && activeRegionOverlay}
    </svg>
  );
};
