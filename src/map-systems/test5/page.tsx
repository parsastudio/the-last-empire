"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useMapGesture } from "@/map-systems/test4/hooks/use-map-gesture";
import { MapControls } from "@/map-systems/test1/components/map-controls";
import type { ConsolidatedRegion } from "./engine/annexation-processor";

export default function MapTest5Page() {
  const [regions, setRegions] = useState<ConsolidatedRegion[]>([]);
  const [hoveredCountryCode, setHoveredCountryCode] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const {
    scale,
    position,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    handleResetView,
  } = useMapGesture();

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

  const groupedRegions = useMemo(() => {
    const groups = new Map<string, ConsolidatedRegion[]>();
    regions.forEach((r) => {
      if (!groups.has(r.countryCode)) {
        groups.set(r.countryCode, []);
      }
      groups.get(r.countryCode)!.push(r);
    });
    return groups;
  }, [regions]);

  const hoveredCountryDetails = useMemo(() => {
    if (!hoveredCountryCode) return null;
    const list = groupedRegions.get(hoveredCountryCode) || [];
    if (list.length === 0) return null;
    const first = list[0]!;
    return {
      code: hoveredCountryCode,
      name: first.countryName,
      area: totalCountryAreas[hoveredCountryCode] || 0,
      neighbors: Array.from(
        new Set(
          list.flatMap((r) =>
            r.neighbors.map((nId) => nId.split("_")[0] || ""),
          ),
        ),
      ).filter((c) => c !== hoveredCountryCode),
    };
  }, [hoveredCountryCode, groupedRegions, totalCountryAreas]);

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

  return (
    <div className="w-screen h-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none font-sans text-left">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-50">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">
            Generating GPU-Accelerated Dynamic Boundary Outline...
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
            Dynamic Alpha Outline Boundaries - Test 5
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            GPU morphology mask rendering. Zero internal lines. 100% robust.
          </p>
        </div>
        <div className="text-right flex items-center gap-4">
          <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
            Status: {isCached ? "CACHED" : "RE-COMPOSED LIVE"}
          </span>
          <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
            {regions.length} Active Provinces
          </span>
        </div>
      </div>

      <div
        className={`flex-1 relative bg-slate-950 overflow-hidden cursor-grab ${
          isDragging ? "cursor-grabbing" : ""
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="w-full h-full origin-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="w-full h-full"
          >
            <defs>
              <filter
                id="country-outline"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feMorphology
                  operator="dilate"
                  radius="0.8"
                  in="SourceAlpha"
                  result="dilated"
                />
                <feComposite
                  operator="out"
                  in="dilated"
                  in2="SourceAlpha"
                  result="outline"
                />
                <feFlood flood-color="rgb(10, 15, 30)" result="flood" />
                <feComposite
                  operator="in"
                  in="flood"
                  in2="outline"
                  result="coloredOutline"
                />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="coloredOutline" />
                </feMerge>
              </filter>
            </defs>

            <rect width={mapWidth} height={mapHeight} fill="rgb(10, 15, 30)" />

            {Array.from(groupedRegions.entries()).map(
              ([countryCode, countryRegions]) => {
                const baseColor = getNationColor(countryCode);
                const isHovered = hoveredCountryCode === countryCode;

                return (
                  <g
                    key={countryCode}
                    filter="url(#country-outline)"
                    className="cursor-pointer"
                  >
                    {countryRegions.map((region) => {
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
                          onMouseEnter={() =>
                            setHoveredCountryCode(countryCode)
                          }
                          onMouseLeave={() => setHoveredCountryCode(null)}
                        />
                      );
                    })}
                  </g>
                );
              },
            )}
          </svg>
        </div>

        <MapControls
          scale={scale}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetView={handleResetView}
        />

        {hoveredCountryDetails && (
          <div className="absolute bottom-6 left-6 p-4 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl z-40 max-w-sm pointer-events-none font-mono text-xs space-y-1.5 backdrop-blur-sm">
            <div className="text-slate-400">Power Details</div>
            <div className="text-sm font-bold text-white">
              {hoveredCountryDetails.name} ({hoveredCountryDetails.code})
            </div>
            <hr className="border-slate-800" />
            <div>
              <span className="text-slate-500">Unified Area:</span>{" "}
              {hoveredCountryDetails.area.toFixed(6)}
            </div>
            <div>
              <span className="text-slate-500">Connected Neighbors:</span>
              <div className="max-h-24 overflow-y-auto mt-1 flex flex-wrap gap-1">
                {hoveredCountryDetails.neighbors.length === 0 ? (
                  <span className="text-slate-600 italic">Isolated Power</span>
                ) : (
                  hoveredCountryDetails.neighbors.slice(0, 10).map((n) => (
                    <span
                      key={n}
                      className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-300"
                    >
                      {n}
                    </span>
                  ))
                )}
                {hoveredCountryDetails.neighbors.length > 10 && (
                  <span className="text-[10px] text-slate-500">
                    +{hoveredCountryDetails.neighbors.length - 10} more
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
