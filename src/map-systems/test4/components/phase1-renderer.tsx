import React from "react";
import type { CountryPhase1 } from "../engine/types";

interface Phase1RendererProps {
  data: CountryPhase1[];
  hoveredCountry: string | null;
  getCountryColor: (code: string) => string;
}

const mapWidth = 1200;
const mapHeight = 600;

export const Phase1Renderer: React.FC<Phase1RendererProps> = ({
  data,
  hoveredCountry,
  getCountryColor,
}) => {
  return (
    <g>
      {data.map((country) => {
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
            key={country.code}
            d={dPath.trim()}
            fill={color}
            fillOpacity={isHovered ? 0.8 : 1}
            stroke="rgba(10, 15, 30, 0.4)"
            strokeWidth="0.5"
            data-code={country.code}
            className="transition-all duration-100 cursor-pointer"
          />
        );
      })}
    </g>
  );
};
