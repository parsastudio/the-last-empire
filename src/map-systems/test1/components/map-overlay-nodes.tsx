import React from "react";
import { TacticalAssaultLaser } from "./tactical-assault-laser";
import type { Province } from "@/domain/map/province.schema";

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
  activeAssaultVector = null,
}: MapOverlayNodesProps) {
  return (
    <g className="pointer-events-none">
      {activeAssaultVector && (
        <TacticalAssaultLaser vector={activeAssaultVector} />
      )}
    </g>
  );
}
