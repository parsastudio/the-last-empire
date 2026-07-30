"use client";

import React, { useState, useRef } from "react";
import { useMapGesture } from "@/presentation/hooks/tactical-map/use-map-gesture";
import { useMapDimensions } from "@/presentation/hooks/tactical-map/use-map-dimensions";
import { useMapData } from "@/presentation/hooks/tactical-map/use-map-data";
import { useCanvasRenderer } from "@/presentation/hooks/tactical-map/use-canvas-renderer";
import { useTacticalMapInteraction } from "@/presentation/hooks/tactical-map/use-tactical-map-interaction";
import { TacticalViewport } from "@/presentation/components/tactical-map/layout/tactical-viewport";
import { CountryHoverContainer } from "@/presentation/components/tactical-map/hud/country-hover-container";
import {
  LayerController,
  TacticalLayer,
} from "@/presentation/components/tactical-map/controls/layer-controller";
import { RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";

export default function InfrastructurePage() {
  const mapWidth = 4096;
  const mapHeight = 2048;

  const [activeMapMode, setActiveMapMode] = useState<
    "default" | "edited" | "partition"
  >("partition");
  const [activeLayer, setActiveLayer] = useState<TacticalLayer>("political");
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [rebuildStatus, setRebuildStatus] = useState<string | null>(null);

  const canvasDestRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const dimensions = useMapDimensions(containerRef);

  const {
    scale,
    position,
    isDragging,
    hasDraggedRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useMapGesture();

  const {
    countries,
    loading,
    error,
    canvasShadedRef,
    maskDataRef,
    packed1024Ref,
    reRenderLayer,
  } = useMapData({
    mapWidth,
    mapHeight,
    mapMode: activeMapMode,
    activeLayer,
  });

  const interaction = useTacticalMapInteraction({
    mapWidth,
    mapHeight,
    countries,
    maskDataRef,
    containerRef,
    dimensions,
    scale,
    position,
    isDragging,
    hasDraggedRef,
  });

  useCanvasRenderer({
    canvasDestRef,
    canvasShadedRef,
    dataLoading: loading,
    dimensions,
    position,
    scale,
    mapWidth,
    mapHeight,
    activeLayer,
  });

  const handleRebuild = async () => {
    setIsRebuilding(true);
    setRebuildStatus("در حال بازسازی فایل‌های باینری و مانیفست...");
    try {
      const res = await fetch(
        "/api/map-preprocessing/manifest?mode=" + activeMapMode,
      );
      if (res.ok) {
        setRebuildStatus("بازسازی مانیفست با موفقیت انجام شد.");
        reRenderLayer();
      } else {
        setRebuildStatus("خطا در بازسازی مانیفست.");
      }
    } catch {
      setRebuildStatus("خطا در ارتباط با سرور.");
    } finally {
      setIsRebuilding(false);
    }
  };

  return (
    <div
      className="w-screen h-screen bg-background overflow-hidden relative flex flex-col"
      dir="rtl"
    >
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-extrabold text-foreground">
            پانل زیرساخت و تست لایه‌های نقشه
          </h1>
          <div className="flex items-center gap-1 bg-secondary px-2.5 py-1 rounded-xl text-xs font-mono">
            <span>حالت فعال:</span>
            <span className="font-bold text-gdp">{activeMapMode}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveMapMode("partition")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeMapMode === "partition"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              پارتیشن (اصلی)
            </button>
            <button
              onClick={() => setActiveMapMode("edited")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeMapMode === "edited"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              ادیت شده
            </button>
            <button
              onClick={() => setActiveMapMode("default")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeMapMode === "default"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              دیفالت
            </button>
          </div>

          <button
            onClick={handleRebuild}
            disabled={isRebuilding}
            className="px-4 py-2 bg-gdp hover:bg-gdp/90 disabled:opacity-50 text-primary-foreground rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <RefreshCw
              size={14}
              className={isRebuilding ? "animate-spin" : ""}
            />
            <span>بازسازی نقشه</span>
          </button>
        </div>
      </header>

      {rebuildStatus && (
        <div className="bg-secondary/90 border-b border-border px-6 py-2 text-xs flex items-center gap-2 z-40">
          <CheckCircle2 size={14} className="text-gdp" />
          <span className="text-foreground font-mono">{rebuildStatus}</span>
        </div>
      )}

      {error && (
        <div className="bg-military/15 border-b border-military/40 px-6 py-2 text-xs flex items-center gap-2 text-military z-40">
          <ShieldAlert size={14} />
          <span className="font-mono">{error}</span>
        </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        <TacticalViewport
          containerRef={containerRef}
          canvasDestRef={canvasDestRef}
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onClick={interaction.handleMapClick}
        >
          <CountryHoverContainer
            countries={countries}
            maskDataRef={maskDataRef}
            packed1024Ref={packed1024Ref}
            mapWidth={mapWidth}
            mapHeight={mapHeight}
            containerRef={containerRef}
            scale={scale}
            position={position}
            isDragging={isDragging}
          />
        </TacticalViewport>

        <LayerController
          activeLayer={activeLayer}
          onChangeLayer={setActiveLayer}
        />
      </div>
    </div>
  );
}
