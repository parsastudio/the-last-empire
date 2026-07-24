import React, { useMemo } from "react";
import { SubdividedRegion } from "@/engine/world-divider/world-divider";

interface WorldMapSvgProps {
  regions: SubdividedRegion[];
  hoveredRegionId: string | null;
  onHoverRegion: (region: SubdividedRegion | null) => void;
  mapWidth: number;
  mapHeight: number;
}

export function WorldMapSvg({
  regions,
  hoveredRegionId,
  onHoverRegion,
  mapWidth,
  mapHeight,
}: WorldMapSvgProps) {
  const getCountryColor = (code: string): string => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (Math.abs((hash & 0xff0000) >> 16) % 150) + 40;
    const g = (Math.abs((hash & 0x00ff00) >> 8) % 150) + 40;
    const b = (Math.abs(hash & 0x0000ff) % 150) + 40;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const renderPaths = useMemo(() => {
    return regions.map((region) => {
      const color = getCountryColor(region.countryCode);
      const isHovered = hoveredRegionId === region.id;

      let dPath = "";
      region.polygons.forEach((poly) => {
        let ringPath = "";
        poly.forEach((pt, idx) => {
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
          key={region.id}
          d={dPath.trim()}
          fill={isHovered ? "rgb(16, 185, 129)" : color}
          stroke={isHovered ? "#ffffff" : "rgba(0,0,0,0.25)"}
          strokeWidth={isHovered ? "1.5" : "0.5"}
          className="transition-all duration-100 cursor-pointer"
          onMouseEnter={() => onHoverRegion(region)}
          onMouseLeave={() => onHoverRegion(null)}
        />
      );
    });
  }, [regions, hoveredRegionId, mapWidth, mapHeight]);

  return (
    <svg
      viewBox={`0 0 ${mapWidth} ${mapHeight}`}
      className="w-full h-full max-h-[85vh]"
    >
      <rect width={mapWidth} height={mapHeight} fill="rgb(10, 15, 30)" />
      {renderPaths}
    </svg>
  );
}
