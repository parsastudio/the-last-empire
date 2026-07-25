import React from "react";
import type { RegionPhase3 } from "../engine/types";

interface Phase34RendererProps {
  data: RegionPhase3[];
  getCountryColor: (code: string) => string;
}

const mapWidth = 1200;
const mapHeight = 600;

export const Phase34Renderer: React.FC<Phase34RendererProps> = ({
  data,
  getCountryColor,
}) => {
  return (
    <g>
      {data.map((region) => {
        const color = getCountryColor(region.countryCode);
        let dPath = "";
        let ringPath = "";
        region.coordinates.forEach((pt, idx) => {
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

        return (
          <path
            key={region.id}
            d={dPath.trim()}
            fill={color}
            stroke="rgba(10, 15, 30, 0.4)"
            strokeWidth="0.45"
            data-id={region.id}
          />
        );
      })}
    </g>
  );
};
