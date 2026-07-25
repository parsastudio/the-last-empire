"use client";

import React, { useState, useMemo } from "react";
import { useMapData } from "./hooks/use-map-data";
import { useMapGesture } from "./hooks/use-map-gesture";
import { MapHeader } from "./components/map-header";
import { MapHud } from "./components/map-hud";
import { MapSvgRenderer } from "./components/map-svg-renderer";

export default function MapTest4Page() {
  const [phase, setPhase] = useState<1 | 2 | 3 | 4 | 5>(1);
  const { data, loading, error } = useMapData();

  const {
    scale,
    position,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleResetView,
  } = useMapGesture();

  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoveredIsland, setHoveredIsland] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const activeHoveredCountryDetails = useMemo(() => {
    if (phase !== 1 && phase !== 5) return null;
    if (!hoveredCountry || !data?.phase1) return null;
    return data.phase1.find((c) => c.code === hoveredCountry) || null;
  }, [hoveredCountry, data, phase]);

  const activeHoveredIslandDetails = useMemo(() => {
    if (phase !== 2) return null;
    if (!hoveredIsland || !data?.phase2) return null;
    return data.phase2.find((i) => i.id === hoveredIsland) || null;
  }, [hoveredIsland, data, phase]);

  const activeHoveredRegionDetails = useMemo(() => {
    const isPhase3 = phase === 3;
    const isPhase4 = phase === 4;
    const isPhase5 = phase === 5;
    if (!isPhase3 && !isPhase4 && !isPhase5) return null;

    const sourceData = isPhase3 ? data?.phase3 : data?.phase4;
    if (!hoveredRegion || !sourceData || !data?.phase1) return null;

    const found = sourceData.find((r) => r.id === hoveredRegion);
    if (!found) return null;

    const parentCountry = data.phase1.find((c) => c.code === found.countryCode);
    const countryTotalArea = parentCountry ? parentCountry.area : 0;

    return {
      ...found,
      countryTotalArea,
    };
  }, [hoveredRegion, data, phase]);

  return (
    <div className="w-screen h-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none font-sans text-left">
      <MapHeader
        phase={phase}
        setPhase={setPhase}
        onResetView={handleResetView}
      />

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-50">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">
            Processing Local Map Assets...
          </p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="p-4 bg-red-950/80 border border-red-800/80 text-red-400 rounded-xl shadow-2xl">
            <h2 className="text-sm font-bold mb-2">Required Asset Missing</h2>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && data && (
        <div
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex-1 relative bg-slate-950 overflow-hidden cursor-grab ${
            isDragging ? "cursor-grabbing" : ""
          }`}
        >
          <div
            className="absolute inset-0 select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "0 0",
            }}
          >
            <MapSvgRenderer
              phase={phase}
              phase1Data={data.phase1}
              phase2Data={data.phase2}
              phase3Data={data.phase3}
              phase4Data={data.phase4}
              hoveredCountry={hoveredCountry}
              setHoveredCountry={setHoveredCountry}
              hoveredIsland={hoveredIsland}
              setHoveredIsland={setHoveredIsland}
              hoveredRegion={hoveredRegion}
              setHoveredRegion={setHoveredRegion}
            />
          </div>

          <MapHud
            phase={phase}
            activeHoveredCountryDetails={activeHoveredCountryDetails}
            activeHoveredIslandDetails={activeHoveredIslandDetails}
            activeHoveredRegionDetails={activeHoveredRegionDetails}
          />
        </div>
      )}
    </div>
  );
}
