"use client";

import React, { useEffect, useState, useRef } from "react";
import { FALLBACK_WORLD_MAP } from "@/application/fallback-map.config";
import {
  subdivideWorld,
  SubdividedRegion,
} from "@/engine/world-divider/world-divider";
import { MapControls } from "@/presentation/components/map-controls";
import { TestPageHeader } from "./components/test-page-header";
import { RegionTooltip } from "./components/region-tooltip";
import { WorldMapSvg } from "./components/world-map-svg";

export default function WorldDividerTestPage() {
  const [regions, setRegions] = useState<SubdividedRegion[]>([]);
  const [hoveredRegion, setHoveredRegion] = useState<SubdividedRegion | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const mapWidth = 1200;
  const mapHeight = 600;

  useEffect(() => {
    async function loadAndPartition() {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson",
        );
        if (!response.ok) throw new Error();
        const geoJson = await response.json();
        const results = subdivideWorld(geoJson.features, 3000);
        setRegions(results);
      } catch {
        const results = subdivideWorld(FALLBACK_WORLD_MAP.features, 100);
        setRegions(results);
      } finally {
        setLoading(false);
      }
    }
    loadAndPartition();
  }, []);

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
            Dividing World into 3000 Grid Sectors...
          </p>
        </div>
      )}

      <TestPageHeader regionCount={regions.length} />

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
          />
        </div>

        <MapControls
          scale={scale}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetView={resetView}
        />

        {hoveredRegion && <RegionTooltip region={hoveredRegion} />}
      </div>
    </div>
  );
}
