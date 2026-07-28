import React from "react";
import { CountryHoverHud } from "./country-hover-hud";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import { useCountryHoverRankings } from "./hooks/use-country-hover-rankings";
import { useCountryHoverMath } from "./hooks/use-country-hover-math";

export interface HoverCountryInfo {
  name: string;
  code: string;
  flagCode: string;
  rank: number;
  stance: string;
  gdp: string;
  regionName?: string;
  regionArea?: string;
}

interface CountryHoverContainerProps {
  countries: CountryMapping[];
  maskDataRef: React.RefObject<Uint8Array | null>;
  mapWidth: number;
  mapHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  position: { x: number; y: number };
}

export function CountryHoverContainer({
  countries,
  maskDataRef,
  mapWidth,
  mapHeight,
  containerRef,
  scale,
  position,
}: CountryHoverContainerProps) {
  const rankingsMap = useCountryHoverRankings(countries);
  const { hoverData, handleMouseMove, handleMouseLeave } = useCountryHoverMath({
    countries,
    maskDataRef,
    mapWidth,
    mapHeight,
    containerRef,
    scale,
    position,
    rankingsMap,
  });

  return (
    <div
      className="absolute inset-0 pointer-events-auto z-30"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <CountryHoverHud info={hoverData} />
    </div>
  );
}
