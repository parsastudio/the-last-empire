import React, { useMemo } from "react";
import type { RegionPhase3 } from "../engine/types";

interface Phase5RendererProps {
  data: RegionPhase3[];
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
  const project = (pt: [number, number]): [number, number] => {
    const x = ((pt[0] + 180) / 360) * mapWidth;
    const y = ((90 - pt[1]) / 180) * mapHeight;
    return [x, y];
  };

  const snap = (v: number) => Math.round(v * 10) / 10;

  const countriesData = useMemo(() => {
    const grouped = new Map<string, RegionPhase3[]>();
    data.forEach((region) => {
      if (!grouped.has(region.countryCode)) {
        grouped.set(region.countryCode, []);
      }
      grouped.get(region.countryCode)!.push(region);
    });

    const result: {
      countryCode: string;
      fillPathData: string;
      borderPathData: string;
    }[] = [];

    grouped.forEach((regions, code) => {
      let fillPathData = "";
      const segmentCounts = new Map<string, number>();
      const segmentMap = new Map<
        string,
        [[number, number], [number, number]]
      >();

      regions.forEach((region) => {
        const projectedCoords = region.coordinates.map((pt) => project(pt));
        if (projectedCoords.length === 0) return;

        let ringPath = "";
        projectedCoords.forEach((pt, idx) => {
          if (idx === 0) {
            ringPath += `M ${pt[0].toFixed(1)},${pt[1].toFixed(1)}`;
          } else {
            ringPath += ` L ${pt[0].toFixed(1)},${pt[1].toFixed(1)}`;
          }
        });
        ringPath += " Z";
        fillPathData += ringPath + " ";

        for (let i = 0; i < projectedCoords.length; i++) {
          const p1 = projectedCoords[i];
          const p2 = projectedCoords[(i + 1) % projectedCoords.length];
          if (!p1 || !p2) continue;

          const x1 = snap(p1[0]);
          const y1 = snap(p1[1]);
          const x2 = snap(p2[0]);
          const y2 = snap(p2[1]);

          const key =
            x1 < x2 || (x1 === x2 && y1 < y2)
              ? `${x1},${y1}_${x2},${y2}`
              : `${x2},${y2}_${x1},${y1}`;

          segmentCounts.set(key, (segmentCounts.get(key) || 0) + 1);
          segmentMap.set(key, [p1, p2]);
        }
      });

      let borderPathData = "";
      segmentCounts.forEach((count, key) => {
        if (count === 1) {
          const seg = segmentMap.get(key);
          if (seg) {
            const [p1, p2] = seg;
            borderPathData += `M ${p1[0].toFixed(1)},${p1[1].toFixed(1)} L ${p2[0].toFixed(1)},${p2[1].toFixed(1)} `;
          }
        }
      });

      result.push({
        countryCode: code,
        fillPathData: fillPathData.trim(),
        borderPathData: borderPathData.trim(),
      });
    });

    return result;
  }, [data]);

  return (
    <g>
      {countriesData.map((country) => {
        const color = getCountryColor(country.countryCode);
        const isHovered = hoveredCountry === country.countryCode;

        return (
          <g key={`p5-${country.countryCode}`}>
            <path
              d={country.fillPathData}
              fill={color}
              fillOpacity={isHovered ? 0.82 : 1}
              stroke="none"
              data-code={country.countryCode}
              className="transition-all duration-100 cursor-pointer"
              onMouseEnter={() => setHoveredCountry(country.countryCode)}
              onMouseLeave={() => setHoveredCountry(null)}
            />
            <path
              d={country.borderPathData}
              fill="none"
              stroke="rgba(10, 15, 30, 0.6)"
              strokeWidth="0.8"
              strokeOpacity={isHovered ? 0.82 : 1}
              className="pointer-events-none"
            />
          </g>
        );
      })}
    </g>
  );
};
