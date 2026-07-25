import React, { useMemo } from "react";
import { MINOR_MERGE_MAP } from "@/map-systems/test3/engine/minor-merge-map";
import type { CountryPhase1 } from "../engine/types";

interface Phase5RendererProps {
  data: CountryPhase1[];
  hoveredCountry: string | null;
  setHoveredCountry: (code: string | null) => void;
  getCountryColor: (code: string) => string;
}

const mapWidth = 1200;
const mapHeight = 600;

export const Phase5Renderer: React.FC<Phase5RendererProps> = ({
  data,
  hoveredCountry,
  setHoveredCountry,
  getCountryColor,
}) => {
  const DELETED_CODES = useMemo(
    () => new Set(Object.keys(MINOR_MERGE_MAP)),
    [],
  );

  const annexedCountries = useMemo(() => {
    const countryMap = new Map<
      string,
      { code: string; name: string; rings: [number, number][][] }
    >();

    data.forEach((country) => {
      if (!DELETED_CODES.has(country.code)) {
        countryMap.set(country.code, {
          code: country.code,
          name: country.name,
          rings: country.rings.map((ring) =>
            ring.map((pt) => [pt[0], pt[1]] as [number, number]),
          ),
        });
      }
    });

    data.forEach((country) => {
      if (DELETED_CODES.has(country.code)) {
        const targetCode = MINOR_MERGE_MAP[country.code];
        if (targetCode) {
          const targetCountry = countryMap.get(targetCode);
          if (targetCountry) {
            targetCountry.rings.push(
              ...country.rings.map((ring) =>
                ring.map((pt) => [pt[0], pt[1]] as [number, number]),
              ),
            );
          }
        }
      }
    });

    return Array.from(countryMap.values());
  }, [data, DELETED_CODES]);

  return (
    <g>
      {annexedCountries.map((country) => {
        const color = getCountryColor(country.code);
        const isHovered = hoveredCountry === country.code;

        let dPath = "";
        country.rings.forEach((ring) => {
          let ringPath = "";
          ring.forEach((pt, idx) => {
            const x = ((pt[0] + 180) / 360) * mapWidth;
            const y = ((90 - pt[1]) / 180) * mapHeight;
            if (idx === 0) {
              ringPath += `M ${x.toFixed(1)},${y.toFixed(1)}`;
            } else {
              ringPath += ` L ${x.toFixed(1)},${y.toFixed(1)}`;
            }
          });
          if (ringPath) ringPath += " Z";
          dPath += ringPath + " ";
        });

        return (
          <path
            key={`p5-${country.code}`}
            d={dPath.trim()}
            fill={color}
            fillOpacity={isHovered ? 0.82 : 1}
            stroke="rgba(10, 15, 30, 0.6)"
            strokeWidth="0.8"
            data-code={country.code}
            className="transition-all duration-100 cursor-pointer"
            onMouseEnter={() => setHoveredCountry(country.code)}
            onMouseLeave={() => setHoveredCountry(null)}
          />
        );
      })}
    </g>
  );
};
