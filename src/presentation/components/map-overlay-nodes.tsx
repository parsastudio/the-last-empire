import React from "react";
import type { AbstractProvince } from "@/application/province-engine";

interface MapOverlayNodesProps {
  hoveredCountry: string | null;
  allProvinces: Record<string, AbstractProvince[]>;
}

export function MapOverlayNodes({
  hoveredCountry,
  allProvinces,
}: MapOverlayNodesProps) {
  if (!hoveredCountry || !allProvinces[hoveredCountry]) return null;

  const targetProvs = allProvinces[hoveredCountry];
  if (!targetProvs) return null;

  return (
    <g className="pointer-events-none">
      {targetProvs.map((p) =>
        p.neighbors.map((nId) => {
          const targetProv = targetProvs.find((tp) => tp.id === nId);
          if (targetProv) {
            return (
              <line
                key={`line-${p.id}-${nId}`}
                x1={p.x}
                y1={p.y}
                x2={targetProv.x}
                y2={targetProv.y}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            );
          }
          return null;
        }),
      )}

      {targetProvs.map((p) => (
        <g key={`node-${p.id}`}>
          <circle
            cx={p.x}
            cy={p.y}
            r={p.isCoastal ? "7" : "5"}
            fill={p.isOccupied ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"}
            stroke="rgb(10, 15, 30)"
            strokeWidth="1.5"
            className="transition-all duration-300 animate-pulse"
          />
          {p.isCoastal && (
            <circle
              cx={p.x}
              cy={p.y}
              r="10"
              fill="none"
              stroke="rgb(14, 165, 233)"
              strokeWidth="1"
              strokeDasharray="2 1"
            />
          )}
        </g>
      ))}
    </g>
  );
}
