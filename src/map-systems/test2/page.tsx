"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { SubdividedRegion } from "./engine/types";
import { MapControls } from "../test1/components/map-controls";
import { TestPageHeader } from "./components/test-page-header";
import { RegionTooltip } from "./components/region-tooltip";
import { WorldMapSvg } from "./components/world-map-svg";

export default function WorldDividerTestPage() {
  const [regions, setRegions] = useState<SubdividedRegion[]>([]);
  const [hoveredRegion, setHoveredRegion] = useState<SubdividedRegion | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [baking, setBaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areaThreshold, setAreaThreshold] = useState<number>(0);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const mapWidth = 1200;
  const mapHeight = 600;

  useEffect(() => {
    async function initLifecycle() {
      try {
        const check = await fetch("/world-map-subdivided.json");
        if (check.ok) {
          const cached = await check.json();
          setRegions(cached);
        } else {
          setBaking(true);
          const bakeRes = await fetch("/api/bake-map?type=full");
          const bakeJson = await bakeRes.json();
          if (bakeJson.success) {
            const getBaked = await fetch("/world-map-subdivided.json");
            const data = await getBaked.json();
            setRegions(data);
          } else {
            throw new Error();
          }
        }
      } catch {
        setError("Failed to load or bake world map data");
      } finally {
        setLoading(false);
        setBaking(false);
      }
    }
    initLifecycle();
  }, []);

  const totalCountryAreas = useMemo(() => {
    const areas: Record<string, number> = {};
    regions.forEach((r) => {
      areas[r.countryCode] = (areas[r.countryCode] || 0) + r.area;
    });
    return areas;
  }, [regions]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev * zoomFactor, 20));
    } else {
      setScale((prev) => Math.max(prev / zoomFactor, 0.8));
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 20));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 0.8));
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none font-sans text-left">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-50">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">
            {baking
              ? "Pre-Processing & Baking Global 3D Vector Assets..."
              : "Loading Baked Geopolitical Grid..."}
          </p>
        </div>
      )}

      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 p-4 bg-red-950/80 border border-red-800/80 text-red-400 rounded-xl shadow-2xl z-50">
          {error}
        </div>
      )}

      <TestPageHeader
        regionCount={regions.length}
        areaThreshold={areaThreshold}
        onThresholdChange={setAreaThreshold}
      />

      <div
        className="flex-1 relative bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="w-full h-full origin-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        >
          <WorldMapSvg
            regions={regions}
            hoveredRegionId={hoveredRegion?.id || null}
            onHoverRegion={setHoveredRegion}
            mapWidth={mapWidth}
            mapHeight={mapHeight}
            areaThreshold={areaThreshold}
          />
        </div>

        <MapControls
          scale={scale}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetView={resetView}
        />

        {hoveredRegion && (
          <RegionTooltip
            region={hoveredRegion}
            totalCountryArea={totalCountryAreas[hoveredRegion.countryCode] || 0}
          />
        )}
      </div>
    </div>
  );
}
