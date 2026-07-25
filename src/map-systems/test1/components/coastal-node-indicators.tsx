import React from "react";
import type { Province } from "@/domain/map/province.schema";

interface CoastalNodeIndicatorsProps {
  targetProvs: Province[];
}

export function CoastalNodeIndicators({
  targetProvs,
}: CoastalNodeIndicatorsProps) {
  return (
    <>
      {targetProvs.map((p) => (
        <g key={`node-${p.id}`}>
          <circle
            cx={p.x}
            cy={p.y}
            r={p.isCoastal ? "4.5" : "3"}
            fill={p.isOccupied ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"}
            stroke="rgb(10, 15, 30)"
            strokeWidth="1"
            className="animate-pulse"
          />
          {p.isCoastal && (
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
    </>
  );
}
