"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMapGesture } from "./hooks/use-map-gesture";
import { MapControls } from "./components/map-controls";
import { useMapData } from "./hooks/use-map-data";
import { useMapMouse } from "./hooks/use-map-mouse";
import { MapHeader } from "./components/map-header";
import { MapHoverCard } from "./components/map-hover-card";
import { useMapGridRenderer } from "./hooks/use-map-grid-renderer";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";

export default function MapTest6Page() {
  const mapWidth = 4096;
  const mapHeight = 2048;

  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
  const [showHeatmap, setShowHeatmap] = useState(false);

  const canvasDestRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const gridState = GridStateProvider.getInstance();

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

  const {
    countries,
    loading,
    error,
    isCached,
    canvasSrcRef,
    canvasShadedRef,
    maskDataRef,
  } = useMapData({ mapWidth, mapHeight });

  const { hoveredCountry, handlePointerMove, setHoveredCountry } = useMapMouse({
    canvasDestRef,
    maskDataRef,
    countries,
    position,
    scale,
    mapWidth,
    mapHeight,
  });

  useMapGridRenderer(canvasDestRef, gridState, loading, showHeatmap);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [loading]);

  useEffect(() => {
    const canvasDest = canvasDestRef.current;
    const canvasShaded = canvasShadedRef.current;
    if (!canvasDest || !canvasShaded || loading) return;

    const ctxDest = canvasDest.getContext("2d");
    if (!ctxDest) return;

    const dpr = window.devicePixelRatio || 1;

    canvasDest.width = dimensions.width * dpr;
    canvasDest.height = dimensions.height * dpr;

    ctxDest.imageSmoothingEnabled = true;

    const fx = mapWidth / dimensions.width;
    const fy = mapHeight / dimensions.height;

    const sx = (-position.x / scale) * fx;
    const sy = (-position.y / scale) * fy;
    const sWidth = (dimensions.width / scale) * fx;
    const sHeight = (dimensions.height / scale) * fy;

    ctxDest.fillStyle = "rgb(15, 20, 30)";
    ctxDest.fillRect(0, 0, canvasDest.width, canvasDest.height);

    ctxDest.drawImage(
      canvasShaded,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      canvasDest.width,
      canvasDest.height,
    );
  }, [scale, position, loading, countries, canvasShadedRef, dimensions]);

  return (
    <div className="w-screen h-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none font-sans text-left">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-50">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">
            Generating High-Fidelity 4K Tactical Map...
          </p>
        </div>
      )}

      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 p-4 bg-red-950/80 border border-red-800/80 text-red-400 rounded-xl shadow-2xl z-50 text-xs font-mono">
          {error}
        </div>
      )}

      <MapHeader isCached={isCached} countriesCount={countries.length} />

      <div
        ref={containerRef}
        className={`flex-1 relative bg-slate-950 overflow-hidden cursor-grab ${
          isDragging ? "cursor-grabbing" : ""
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          handleMouseMove(e);
          handlePointerMove(e);
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setHoveredCountry(null);
        }}
        onWheel={handleWheel}
      >
        <canvas ref={canvasSrcRef} className="hidden" />

        <div className="w-full h-full absolute inset-0">
          <canvas
            ref={canvasDestRef}
            className="pointer-events-none w-full h-full"
            style={{
              filter:
                "drop-shadow(0 2px 4px rgba(25, 35, 55, 0.15)) drop-shadow(0 1px 2px rgba(25, 35, 55, 0.08))",
            }}
          />
        </div>

        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setShowHeatmap((prev) => !prev)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold hover:bg-slate-800 transition-colors"
          >
            {showHeatmap
              ? "DISABLE TACTICAL HEATMAP"
              : "ENABLE TACTICAL HEATMAP"}
          </button>
        </div>

        <MapControls
          scale={scale}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetView={handleResetView}
        />

        {hoveredCountry && <MapHoverCard hoveredCountry={hoveredCountry} />}
      </div>
    </div>
  );
}
