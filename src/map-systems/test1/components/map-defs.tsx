import React from "react";
import type { VectorProvince } from "../engine/grid-generator";
import type { Province } from "@/domain/map/province.schema";

interface MapDefsProps {
  stripeId: string;
  vectorProvinces: VectorProvince[];
  occupations: Record<string, number>;
  playerCountryCode: string | null;
  getNationColor: (code: string) => string;
  provincesState: Record<string, Province>;
}

export function MapDefs({
  stripeId,
  vectorProvinces,
  occupations,
  playerCountryCode,
  getNationColor,
  provincesState,
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

          let x1 = "0%";
          let y1 = "0%";
          let x2 = "100%";
          let y2 = "0%";

          if (playerCountryCode) {
            const playerCapital = provincesState[`${playerCountryCode}_P1`];
            const targetCapital = provincesState[`${prov.countryCode}_P1`];

            if (playerCapital && targetCapital) {
              const dx = playerCapital.x - targetCapital.x;
              const dy = playerCapital.y - targetCapital.y;
              const theta = Math.atan2(dy, dx);

              const cosT = Math.cos(theta);
              const sinT = Math.sin(theta);

              x1 = `${(50 + 50 * cosT).toFixed(1)}%`;
              y1 = `${(50 + 50 * sinT).toFixed(1)}%`;
              x2 = `${(50 - 50 * cosT).toFixed(1)}%`;
              y2 = `${(50 - 50 * sinT).toFixed(1)}%`;
            }
          }

          return (
            <linearGradient
              key={`grad-${prov.id}`}
              id={`occupied-grad-${prov.countryCode}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
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
