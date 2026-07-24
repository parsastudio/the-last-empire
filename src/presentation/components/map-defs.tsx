import React from "react";
import type { VectorProvince } from "@/engine/map/grid-generator";

interface MapDefsProps {
  stripeId: string;
  vectorProvinces: VectorProvince[];
  occupations: Record<string, number>;
  playerCountryCode: string | null;
  getNationColor: (code: string) => string;
}

export function MapDefs({
  stripeId,
  vectorProvinces,
  occupations,
  playerCountryCode,
  getNationColor,
}: MapDefsProps) {
  return (
    <defs>
      <pattern
        id={stripeId}
        width="12"
        height="12"
        patternTransform="rotate(45)"
        patternUnits="userSpaceOnUse"
      >
        <rect width="12" height="12" fill="rgb(16, 185, 129)" />
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="12"
          stroke="rgba(10, 15, 30, 0.35)"
          strokeWidth="4"
        />
      </pattern>

      {vectorProvinces.map((prov) => {
        const occupiedPercent = occupations[prov.countryCode] || 0;
        if (
          occupiedPercent > 0 &&
          occupiedPercent < 100 &&
          prov.countryCode !== playerCountryCode
        ) {
          const baseColor = getNationColor(prov.countryCode);
          return (
            <linearGradient
              key={`grad-${prov.id}`}
              id={`occupied-grad-${prov.countryCode}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset={`${occupiedPercent}%`}
                stopColor="rgb(16, 185, 129)"
              />
              <stop offset={`${occupiedPercent}%`} stopColor={baseColor} />
            </linearGradient>
          );
        }
        return null;
      })}
    </defs>
  );
}
