import React from "react";
import type { IslandPhase2 } from "../engine/types";

interface Phase2RendererProps {
  data: IslandPhase2[];
  getCountryColor: (code: string) => string;
}

const mapWidth = 1200;
const mapHeight = 600;

export const Phase2Renderer: React.FC<Phase2RendererProps> = ({
  data,
  getCountryColor,
}) => {
  return (
    <g>
      {data.map((island) => {
        const color = getCountryColor(island.countryCode);
        let dPath = "";
        let ringPath = "";
        island.coordinates.forEach((pt, idx) => {
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
            key={island.id}
            d={dPath.trim()}
            fill={color}
            stroke="rgba(0,0,0,0.25)"
            strokeWidth="0.4"
            data-id={island.id}
          />
        );
      })}
    </g>
  );
};
