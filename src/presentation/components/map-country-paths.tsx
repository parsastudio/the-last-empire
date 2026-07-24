import React from "react";
import type { VectorProvince } from "@/engine/map/grid-generator";
import type { Province } from "@/domain/map/province.schema";

interface MapCountryPathsProps {
  vectorProvinces: VectorProvince[];
  provincesState: Record<string, Province>;
  playerCountryCode: string | null;
  hoveredCountry: string | null;
  stripeId: string;
  occupations: Record<string, number>;
  getNationColor: (code: string) => string;
  setHoveredCountry: (code: string | null) => void;
  onCountryClick: (code: string, angle: number) => void;
}

export function MapCountryPaths({
  vectorProvinces,
  provincesState,
  playerCountryCode,
  hoveredCountry,
  stripeId,
  occupations,
  getNationColor,
  setHoveredCountry,
  onCountryClick,
}: MapCountryPathsProps) {
  return (
    <>
      {vectorProvinces.map((prov) => {
        const isHovered = hoveredCountry === prov.countryCode;
        const provData = provincesState[prov.id];
        const currentOwner = provData
          ? provData.ownerNationId
          : prov.countryCode;
        const occupiedPercent = occupations[prov.countryCode] || 0;

        let fillValue = getNationColor(currentOwner);

        if (prov.countryCode !== playerCountryCode) {
          if (currentOwner === playerCountryCode || occupiedPercent >= 100) {
            fillValue = `url(#${stripeId})`;
          } else if (occupiedPercent > 0) {
            fillValue = `url(#occupied-grad-${prov.countryCode})`;
          } else if (isHovered) {
            fillValue = "rgb(14, 165, 233)";
          }
        } else if (isHovered) {
          fillValue = "rgb(52, 211, 153)";
        }

        const isOriginallyDifferent = !prov.id.startsWith(currentOwner);
        const strokeColor =
          isOriginallyDifferent ||
          (isHovered && currentOwner === hoveredCountry)
            ? fillValue
            : "rgba(10, 15, 30, 0.6)";

        return (
          <g key={prov.id}>
            <path
              d={prov.pathData}
              fill={fillValue}
              stroke={strokeColor}
              strokeWidth={isHovered ? "1.5" : "0.5"}
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() => setHoveredCountry(prov.countryCode)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={(e) => {
                e.stopPropagation();
                onCountryClick(prov.countryCode, 0);
              }}
            />
          </g>
        );
      })}
    </>
  );
}
