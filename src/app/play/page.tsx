"use client";

import React, { useState, useRef } from "react";
import { useMapGesture } from "@/presentation/hooks/tactical-map/use-map-gesture";
import { useMapDimensions } from "@/presentation/hooks/tactical-map/use-map-dimensions";
import { useMapData } from "@/presentation/hooks/tactical-map/use-map-data";
import { useCanvasRenderer } from "@/presentation/hooks/tactical-map/use-canvas-renderer";
import { TacticalViewport } from "@/presentation/components/tactical-map/layout/tactical-viewport";
import { SidebarContainer } from "@/presentation/components/tactical-map/sidebar/sidebar-container";
import { CountryHoverContainer } from "@/presentation/components/tactical-map/hud/country-hover-container";

export default function MapTest6Page() {
  const mapWidth = 4096;
  const mapHeight = 2048;

  const [activeMapMode] = useState<"default" | "edited" | "partition">(
    "partition",
  );
  const [isSidebarOpen] = useState<boolean>(true);

  const canvasDestRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const dimensions = useMapDimensions(containerRef);

  const {
    scale,
    position,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useMapGesture();

  const {
    countries,
    loading: dataLoading,
    canvasSrcRef,
    canvasShadedRef,
    maskDataRef,
  } = useMapData({ mapWidth, mapHeight, mapMode: activeMapMode });

  useCanvasRenderer({
    canvasDestRef,
    canvasShadedRef,
    dataLoading,
    dimensions,
    position,
    scale,
    mapWidth,
    mapHeight,
  });

  return (
    <div
      className="w-screen h-screen bg-background overflow-hidden relative"
      dir="rtl"
    >
      <TacticalViewport
        containerRef={containerRef}
        canvasDestRef={canvasDestRef}
        canvasSrcRef={canvasSrcRef}
        isDragging={isDragging}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={() => {}}
      >
        <CountryHoverContainer
          countries={countries}
          maskDataRef={maskDataRef}
          mapWidth={mapWidth}
          mapHeight={mapHeight}
          containerRef={containerRef}
          scale={scale}
          position={position}
        />
      </TacticalViewport>

      <SidebarContainer isOpen={isSidebarOpen} />

      {dataLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background z-50">
          <div className="w-12 h-12 border-4 border-gdp border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium font-sans">
            در حال بارگذاری نقشه تاکتیکی...
          </p>
        </div>
      )}
    </div>
  );
}
