"use client";

import React, { useState } from "react";
import { MapOverlayNodes } from "./map-overlay-nodes";
import { MapControls } from "./map-controls";
import type { VectorProvince } from "@/engine/map/grid-generator";
import type { Province } from "@/domain/map/province.schema";

interface GameMapProps {
  vectorProvinces: VectorProvince[];
  provincesState: Record<string, Province>;
  width: number;
  height: number;
  onCountryClick: (countryCode: string, angle: number) => void;
  occupations?: Record<string, number>;
  allProvinces?: Record<string, Province[]>;
  playerCountryCode?: string | null;
  activeAssaultVector?: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } | null;
}

export function GameMap({
  vectorProvinces,
  provincesState,
  width,
  height,
  onCountryClick,
  occupations = {},
  allProvinces = {},
  playerCountryCode = null,
  activeAssaultVector = null,
}: GameMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const getNationColor = (countryCode: string): string => {
    if (playerCountryCode && countryCode === playerCountryCode) {
      return "rgb(16, 185, 129)";
    }
    let hash = 0;
    for (let i = 0; i < countryCode.length; i++) {
      hash = countryCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (Math.abs((hash & 0xff0000) >> 16) % 100) + 50;
    const g = (Math.abs((hash & 0x00ff00) >> 8) % 100) + 50;
    const b = (Math.abs(hash & 0x0000ff) % 100) + 50;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const stripeId = playerCountryCode
    ? `military-stripes-${playerCountryCode}`
    : "military-stripes-IRN";

  const getCountryFullName = (code: string): string => {
    const provId = `${code}_P1`;
    const prov = provincesState[provId];
    if (prov) {
      return prov.name.replace(" Region", "");
    }
    return code;
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`w-full h-full relative overflow-hidden bg-slate-950 cursor-grab ${
        isDragging ? "cursor-grabbing" : ""
      }`}
    >
      <div
        className="w-full h-full transition-transform duration-75 ease-out select-none origin-center flex items-center justify-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full pointer-events-auto"
        >
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
                    <stop
                      offset={`${occupiedPercent}%`}
                      stopColor={baseColor}
                    />
                  </linearGradient>
                );
              }
              return null;
            })}
          </defs>

          <rect width={width} height={height} fill="rgb(10, 15, 30)" />

          {vectorProvinces.map((prov) => {
            const isHovered = hoveredCountry === prov.countryCode;
            const provData = provincesState[prov.id];
            const currentOwner = provData
              ? provData.ownerNationId
              : prov.countryCode;
            const occupiedPercent = occupations[prov.countryCode] || 0;

            let fillValue = getNationColor(currentOwner);

            if (prov.countryCode !== playerCountryCode) {
              if (
                currentOwner === playerCountryCode ||
                occupiedPercent >= 100
              ) {
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

          <MapOverlayNodes
            hoveredCountry={hoveredCountry}
            allProvinces={allProvinces}
            activeAssaultVector={activeAssaultVector}
          />
        </svg>
      </div>

      <MapControls
        scale={scale}
        onZoomIn={() => setScale((prev) => Math.min(prev + 0.5, 6))}
        onZoomOut={() => setScale((prev) => Math.max(prev - 0.5, 1))}
        onResetView={() => {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }}
      />

      {hoveredCountry && (
        <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800/80 text-xs font-semibold shadow-2xl pointer-events-none z-40">
          <div className="text-slate-400">Target Country</div>
          <div className="text-lg font-bold text-white mt-0.5">
            {getCountryFullName(hoveredCountry)}
          </div>
          {playerCountryCode &&
            hoveredCountry !== playerCountryCode &&
            (occupations[hoveredCountry] || 0) > 0 && (
              <div className="text-[10px] text-emerald-400 mt-1 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {occupations[hoveredCountry]}% occupied by {playerCountryCode}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
