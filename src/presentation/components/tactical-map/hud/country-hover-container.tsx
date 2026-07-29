import React from "react";
import { CountryHoverHud } from "./country-hover-hud";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import { useCountryHoverRankings } from "./hooks/use-country-hover-rankings";
import { useCountryHoverMath } from "./hooks/use-country-hover-math";
import { Nation } from "@/domain/nation/nation.schema";

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
  packed1024Ref?: React.RefObject<Uint8Array | null>;
  mapWidth: number;
  mapHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  position: { x: number; y: number };
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
}

export function CountryHoverContainer({
  countries,
  maskDataRef,
  packed1024Ref,
  mapWidth,
  mapHeight,
  containerRef,
  scale,
  position,
  nationsMap,
  humanNationId,
}: CountryHoverContainerProps) {
  const rankingsMap = useCountryHoverRankings(countries, nationsMap);
  const { hoverData, cursorPos, handleMouseMove, handleMouseLeave } =
    useCountryHoverMath({
      countries,
      maskDataRef,
      packed1024Ref,
      mapWidth,
      mapHeight,
      containerRef,
      scale,
      position,
      rankingsMap,
      nationsMap,
      humanNationId,
    });

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <CountryHoverHud info={hoverData} cursorPos={cursorPos} />
    </div>
  );
}
