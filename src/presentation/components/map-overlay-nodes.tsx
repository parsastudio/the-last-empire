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
  const visibleCountries = hoveredCountry
    ? [hoveredCountry]
    : Object.keys(allProvinces);

  return (
    <g className="pointer-events-none">
      {visibleCountries.map((cCode) => {
        const targetProvs = allProvinces[cCode];
        if (!targetProvs) return null;

        return (
          <g key={`network-${cCode}`}>
            {targetProvs.map((p) =>
              p.neighbors.map((nId) => {
                const targetProv = targetProvs.find((tp) => tp.id === nId);
                if (targetProv && p.id < nId) {
                  return (
                    <line
                      key={`line-${p.id}-${nId}`}
                      x1={p.x}
                      y1={p.y}
                      x2={targetProv.x}
                      y2={targetProv.y}
                      stroke={
                        hoveredCountry === cCode
                          ? "rgba(16, 185, 129, 0.45)"
                          : "rgba(255, 255, 255, 0.08)"
                      }
                      strokeWidth="1"
                      strokeDasharray="3 3"
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
                  r={p.isCoastal ? "4.5" : "3"}
                  fill={p.isOccupied ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"}
                  stroke="rgb(10, 15, 30)"
                  strokeWidth="1"
                  className={hoveredCountry === cCode ? "animate-pulse" : ""}
                  opacity={hoveredCountry === cCode ? 1.0 : 0.35}
                />
                {p.isCoastal && hoveredCountry === cCode && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="7"
                    fill="none"
                    stroke="rgb(14, 165, 233)"
                    strokeWidth="0.75"
                    strokeDasharray="1.5 1.5"
                  />
                )}
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
}
