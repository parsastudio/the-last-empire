"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useMapGesture } from "@/map-systems/test4/hooks/use-map-gesture";
import { MapControls } from "@/map-systems/test1/components/map-controls";
import type { CountryMapping } from "./engine/map-generator";

export default function MapTest6Page() {
  const [countries, setCountries] = useState<CountryMapping[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<CountryMapping | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

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
    async function loadTest6Map() {
      try {
        const res = await fetch("/api/map-test6");
        const json = await res.json();
        if (json.success) {
          setCountries(json.data.countries);
          setIsCached(!!json.cached);
        } else {
          setError(json.error || "Failed to load map data.");
        }
      } catch {
        setError("Error fetching map test 6 metadata.");
      } finally {
        setLoading(false);
      }
    }
    loadTest6Map();
  }, []);

  const handleImageLoad = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (canvas && img) {
      canvas.width = mapWidth;
      canvas.height = mapHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, mapWidth, mapHeight);
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const mapX = Math.floor((clientX - position.x) / scale);
    const mapY = Math.floor((clientY - position.y) / scale);

    if (mapX >= 0 && mapX < mapWidth && mapY >= 0 && mapY < mapHeight) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const pixel = ctx.getImageData(mapX, mapY, 1, 1).data;
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        if (r !== undefined && g !== undefined && b !== undefined) {
          const matched = countries.find(
            (c) => c.color[0] === r && c.color[1] === g && c.color[2] === b,
          );
          if (matched && matched.code !== "WATER") {
            setHoveredCountry(matched);
          } else {
            setHoveredCountry(null);
          }
        }
      }
    } else {
      setHoveredCountry(null);
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none font-sans text-left">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-50">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">
            Generating Raster ID Map Mask...
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
            Raster PNG Mask Map - Test 6
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Color Index Mapping. No dynamic geometries. 100% stable.
          </p>
        </div>
        <div className="text-right flex items-center gap-4">
          <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
            Status: {isCached ? "CACHED" : "RE-GENERATED LIVE"}
          </span>
          <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
            {countries.length} Indexed Countries
          </span>
        </div>
      </div>

      <div
        className={`flex-1 relative bg-slate-950 overflow-hidden cursor-grab ${
          isDragging ? "cursor-grabbing" : ""
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          handleMouseMove(e);
          handlePointerMove(e);
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="hidden" />

        <div
          className="w-full h-full origin-center transition-transform duration-75 ease-out flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <Image
            ref={imageRef}
            src="/test6/world-mask.png"
            alt="World Map Raster ID Mask"
            onLoad={handleImageLoad}
            className="pointer-events-none"
            width={mapWidth}
            height={mapHeight}
            unoptimized
          />
        </div>

        <MapControls
          scale={scale}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetView={handleResetView}
        />

        {hoveredCountry && (
          <div className="absolute bottom-6 left-6 p-4 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl z-40 max-w-sm pointer-events-none font-mono text-xs space-y-1.5 backdrop-blur-sm">
            <div className="text-slate-400">Lookup Identification</div>
            <div className="text-sm font-bold text-white">
              {hoveredCountry.name} ({hoveredCountry.code})
            </div>
            <hr className="border-slate-800" />
            <div>
              <span className="text-slate-500">Color Mask RGB:</span> [
              {hoveredCountry.color.join(", ")}]
            </div>
            <div>
              <span className="text-slate-500">Indexed Numeric ID:</span>{" "}
              {hoveredCountry.id}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
