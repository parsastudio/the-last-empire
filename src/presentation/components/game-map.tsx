"use client";

import React, { useState } from "react";
import { MapOverlayNodes } from "./map-overlay-nodes";
import { MapControls } from "./map-controls";
import { useMapGesture } from "../hooks/use-map-gesture";
import { MapDefs } from "./map-defs";
import { MapCountryPaths } from "./map-country-paths";
import { MapTooltip } from "./map-tooltip";
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
  const {
    scale,
    position,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    resetView,
  } = useMapGesture();

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

  const stripeId = playerCountryCode
    ? `military-stripes-${playerCountryCode}`
    : "military-stripes-IRN";

  const getCountryFullName = (code: string): string => {
    const provId = `${code}_P1`;
    const prov = provincesState[provId];
    return prov ? prov.name.replace(" Region", "") : code;
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
          <MapDefs
            stripeId={stripeId}
            vectorProvinces={vectorProvinces}
            occupations={occupations}
            playerCountryCode={playerCountryCode}
            getNationColor={getNationColor}
          />

          <rect width={width} height={height} fill="rgb(10, 15, 30)" />

          <MapCountryPaths
            vectorProvinces={vectorProvinces}
            provincesState={provincesState}
            playerCountryCode={playerCountryCode}
            hoveredCountry={hoveredCountry}
            stripeId={stripeId}
            occupations={occupations}
            getNationColor={getNationColor}
            setHoveredCountry={setHoveredCountry}
            onCountryClick={onCountryClick}
          />

          <MapOverlayNodes
            hoveredCountry={hoveredCountry}
            allProvinces={allProvinces}
            activeAssaultVector={activeAssaultVector}
          />
        </svg>
      </div>

      <MapControls
        scale={scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
      />

      {hoveredCountry && (
        <MapTooltip
          hoveredCountry={hoveredCountry}
          playerCountryCode={playerCountryCode}
          occupations={occupations}
          getCountryFullName={getCountryFullName}
        />
      )}
    </div>
  );
}
