import React from "react";
import type { Province } from "@/domain/map/province.schema";
import { TacticalAssaultLaser } from "./map/tactical-assault-laser";
import { NetworkConnectionLines } from "./map/network-connection-lines";
import { CoastalNodeIndicators } from "./map/coastal-node-indicators";

interface MapOverlayNodesProps {
  hoveredCountry: string | null;
  allProvinces: Record<string, Province[]>;
  activeAssaultVector?: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } | null;
}

export function MapOverlayNodes({
  hoveredCountry,
  allProvinces,
  activeAssaultVector = null,
}: MapOverlayNodesProps) {
  const visibleCountries = hoveredCountry ? [hoveredCountry] : [];

  return (
    <g className="pointer-events-none">
      {activeAssaultVector && (
        <TacticalAssaultLaser vector={activeAssaultVector} />
      )}

      {visibleCountries.map((cCode) => {
        const targetProvs = allProvinces[cCode];
        if (!targetProvs) return null;

        return (
          <g key={`network-${cCode}`}>
            <NetworkConnectionLines targetProvs={targetProvs} />
            <CoastalNodeIndicators targetProvs={targetProvs} />
          </g>
        );
      })}
    </g>
  );
}
