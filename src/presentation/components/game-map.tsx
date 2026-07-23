"use client";

import React, { useState, useRef } from "react";
import type { VectorProvince } from "@/engine/map/grid-generator";
import type { Province } from "@/domain/map/province.schema";

interface GameMapProps {
  vectorProvinces: VectorProvince[];
  provincesState: Record<string, Province>;
  width: number;
  height: number;
  onCountryClick: (countryCode: string, angle: number) => void;
}

export function GameMap({
  vectorProvinces,
  provincesState,
  width,
  height,
  onCountryClick,
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

  const containerRef = useRef<HTMLDivElement | null>(null);

  const getNationColor = (countryCode: string): string => {
    if (countryCode === "IRN") {
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

  const handleCountryClick = (e: React.MouseEvent, countryCode: string) => {
    e.stopPropagation();
    if (countryCode === "IRN") return;
    onCountryClick(countryCode, 0);
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

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.5, 6));
  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
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
              id="military-stripes-IRN"
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
          </defs>

          <rect width={width} height={height} fill="rgb(10, 15, 30)" />

          {vectorProvinces.map((prov) => {
            const isHovered = hoveredCountry === prov.countryCode;
            const provData = provincesState[prov.id];
            const currentOwner = provData
              ? provData.ownerNationId
              : prov.countryCode;

            const isOccupiedByIran =
              currentOwner === "IRN" && prov.countryCode !== "IRN";

            let fillValue = getNationColor(currentOwner);
            if (isOccupiedByIran) {
              fillValue = "url(#military-stripes-IRN)";
            } else if (isHovered) {
              fillValue = "rgb(14, 165, 233)";
            }

            return (
              <g key={prov.id}>
                <path
                  d={prov.pathData}
                  fill={fillValue}
                  stroke="rgba(10, 15, 30, 0.6)"
                  strokeWidth={isHovered ? "1.5" : "0.5"}
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => setHoveredCountry(prov.countryCode)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={(e) => handleCountryClick(e, prov.countryCode)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-800/80 flex items-center gap-4 shadow-2xl pointer-events-auto z-50">
        <button
          onClick={zoomOut}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 flex items-center justify-center font-bold text-lg select-none transition-colors border border-slate-700/50"
        >
          -
        </button>
        <span className="text-xs font-mono font-bold text-slate-400 select-none min-w-[32px] text-center">
          {scale.toFixed(1)}x
        </span>
        <button
          onClick={zoomIn}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 flex items-center justify-center font-bold text-lg select-none transition-colors border border-slate-700/50"
        >
          +
        </button>
        <div className="w-px h-6 bg-slate-800" />
        <button
          onClick={resetView}
          className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full font-semibold transition-colors border border-slate-700/50"
        >
          Reset View
        </button>
      </div>

      {hoveredCountry && (
        <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800/80 text-xs font-semibold shadow-2xl pointer-events-none z-40">
          <div className="text-slate-400">Target Country</div>
          <div className="text-lg font-bold text-white mt-0.5">
            {hoveredCountry}
          </div>
          {provincesState[`${hoveredCountry}_P1`]?.ownerNationId === "IRN" &&
            hoveredCountry !== "IRN" && (
              <div className="text-[10px] text-emerald-400 mt-1 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Occupied territory of Iran
              </div>
            )}
        </div>
      )}
    </div>
  );
}
