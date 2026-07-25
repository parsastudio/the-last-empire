"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { MapControls } from "@/map-systems/test1/components/map-controls";
import type { ConsolidatedRegion } from "./engine/annexation-processor";

export default function MapTest5Page() {
  const [regions, setRegions] = useState<ConsolidatedRegion[]>([]);
  const [hoveredRegion, setHoveredRegion] = useState<ConsolidatedRegion | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const mapWidth = 1200;
  const mapHeight = 600;

  useEffect(() => {
    async function loadTest5Map() {
      try {
        const res = await fetch("/api/map-test5");
        const json = await res.json();
        if (json.success) {
          setRegions(json.regions);
          setIsCached(!!json.cached);
        } else {
          setError(json.error || "Failed to consolidate map.");
        }
      } catch {
        setError("Error fetching map test 5 data.");
      } finally {
        setLoading(false);
      }
    }
    loadTest5Map();
  }, []);

  const totalCountryAreas = useMemo(() => {
    const areas: Record<string, number> = {};
    regions.forEach((r) => {
      areas[r.countryCode] = (areas[r.countryCode] || 0) + r.area;
    });
    return areas;
  }, [regions]);

  const getNationColor = (code: string): string => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (Math.abs((hash & 0xff0000) >> 16) % 130) + 45;
    const g = (Math.abs((hash & 0x00ff00) >> 8) % 130) + 45;
    const b = (Math.abs(hash & 0x0000ff) % 130) + 45;
    return `rgb(${r}, ${g}, ${b})`;
  };

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
    const zoomFactor = 1.15;
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev * zoomFactor, 25));
    } else {
      setScale((prev) => Math.max(prev / zoomFactor, 0.8));
    }
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.5, 25));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.5, 0.8));
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
            Generating Organic Voronoi Partition & Boundary Dissolver...
          </p>
        </div>
      )}

      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 p-4 bg-red-950/80 border border-red-800/80 text-red-400 rounded-xl shadow-2xl z-50 text-xs font-mono">
          {error}
        </div>
      )}

      <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center gap-4 z-10">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            Organic Voronoi Border Consolidator - Test 5
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Perfect non-destructive borders with high-performance homogeneous
            division.
          </p>
        </div>
        <div className="text-right flex items-center gap-4">
          <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
            Status: {isCached ? "CACHED" : "BAKED LIVE"}
          </span>
          <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
            {regions.length} Active Regions
          </span>
        </div>
      </div>

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
          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="w-full h-full"
          >
            <rect width={mapWidth} height={mapHeight} fill="rgb(10, 15, 30)" />
            {regions.map((region) => {
              const baseColor = getNationColor(region.countryCode);
              const isHovered = hoveredRegion?.id === region.id;

              let dPath = "";
              region.coordinates.forEach((pt, idx) => {
                if (idx === 0) {
                  dPath += `M ${pt[0].toFixed(1)},${pt[1].toFixed(1)}`;
                } else {
                  dPath += ` L ${pt[0].toFixed(1)},${pt[1].toFixed(1)}`;
                }
              });
              if (dPath) {
                dPath += " Z";
              }

              return (
                <path
                  key={region.id}
                  d={dPath}
                  fill={isHovered ? "rgb(16, 185, 129)" : baseColor}
                  stroke={isHovered ? "#ffffff" : "rgba(10, 15, 30, 0.45)"}
                  strokeWidth={isHovered ? "1.2" : "0.5"}
                  className="transition-all duration-100 cursor-pointer"
                  onMouseEnter={() => setHoveredRegion(region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
              );
            })}
          </svg>
        </div>

        <MapControls
          scale={scale}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetView={resetView}
        />

        {hoveredRegion && (
          <div className="absolute bottom-6 left-6 p-4 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl z-40 max-w-sm pointer-events-none font-mono text-xs space-y-1.5 backdrop-blur-sm">
            <div className="text-slate-400">Sector Details</div>
            <div className="text-sm font-bold text-white">
              {hoveredRegion.id}
            </div>
            <hr className="border-slate-800" />
            <div>
              <span className="text-slate-500">Target Power:</span>{" "}
              {hoveredRegion.countryName} ({hoveredRegion.countryCode})
            </div>
            <div>
              <span className="text-slate-500">Sector Area:</span>{" "}
              {hoveredRegion.area.toFixed(6)}
            </div>
            <div>
              <span className="text-slate-500">Total Unified Area:</span>{" "}
              {(totalCountryAreas[hoveredRegion.countryCode] || 0).toFixed(6)}
            </div>
            <div>
              <span className="text-slate-500">Centroid:</span>{" "}
              {hoveredRegion.center[0].toFixed(2)},{" "}
              {hoveredRegion.center[1].toFixed(2)}
            </div>
            <div>
              <span className="text-slate-500">Connected Nodes:</span>
              <div className="max-h-24 overflow-y-auto mt-1 flex flex-wrap gap-1">
                {hoveredRegion.neighbors.length === 0 ? (
                  <span className="text-slate-600 italic">Isolated</span>
                ) : (
                  hoveredRegion.neighbors.slice(0, 10).map((n) => (
                    <span
                      key={n}
                      className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-300"
                    >
                      {n}
                    </span>
                  ))
                )}
                {hoveredRegion.neighbors.length > 10 && (
                  <span className="text-[10px] text-slate-500">
                    +{hoveredRegion.neighbors.length - 10} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
