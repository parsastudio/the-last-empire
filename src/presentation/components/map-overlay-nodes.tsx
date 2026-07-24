import React from "react";
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
  hoveredCountry,
  allProvinces,
  activeAssaultVector = null,
}: MapOverlayNodesProps) {
  const visibleCountries = hoveredCountry
    ? [hoveredCountry]
    : Object.keys(allProvinces);

  return (
    <g className="pointer-events-none">
      {activeAssaultVector && (
        <g>
          <style>{`
            @keyframes tacticalDash {
              to {
                stroke-dashoffset: -20;
              }
            }
            .tactical-assault-laser {
              animation: tacticalDash 1.2s linear infinite;
            }
          `}</style>
          <path
            d={`M ${activeAssaultVector.fromX},${activeAssaultVector.fromY} Q ${(activeAssaultVector.fromX + activeAssaultVector.toX) / 2},${Math.min(activeAssaultVector.fromY, activeAssaultVector.toY) - 80} ${activeAssaultVector.toX},${activeAssaultVector.toY}`}
            fill="none"
            stroke="rgb(244, 63, 94)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="6 4"
            className="tactical-assault-laser"
            filter="drop-shadow(0 0 4px rgb(244, 63, 94))"
          />
          <circle
            cx={activeAssaultVector.fromX}
            cy={activeAssaultVector.fromY}
            r="6"
            fill="rgb(16, 185, 129)"
            className="animate-ping"
          />
          <circle
            cx={activeAssaultVector.toX}
            cy={activeAssaultVector.toY}
            r="8"
            fill="none"
            stroke="rgb(244, 63, 94)"
            strokeWidth="2"
            className="animate-ping"
          />
        </g>
      )}

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
