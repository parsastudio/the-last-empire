"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/presentation/context/toast-context";
import { useMapData } from "@/presentation/hooks/tactical-map/use-map-data";
import { useCanvasRenderer } from "@/presentation/hooks/tactical-map/use-canvas-renderer";
import { useMapGesture } from "@/presentation/hooks/tactical-map/use-map-gesture";
import { useMapDimensions } from "@/presentation/hooks/tactical-map/use-map-dimensions";
import { TacticalViewport } from "@/presentation/components/tactical-map/layout/tactical-viewport";

export default function InfrastructurePage() {
  const mapWidth = 4096;
  const mapHeight = 2048;

  const router = useRouter();
  const { showToast } = useToast();
  const [activeMode, setActiveMode] = useState<
    "partition" | "edited" | "default"
  >("partition");
  const [isRebuilding, setIsRebuilding] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasDestRef = useRef<HTMLCanvasElement | null>(null);

  const dimensions = useMapDimensions(containerRef);

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
    resetView,
  } = useMapGesture();

  const { loading, canvasSrcRef, canvasShadedRef } = useMapData({
    mapWidth,
    mapHeight,
    mapMode: activeMode,
    activeLayer: "political",
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
    activeLayer: "political",
  });

  const handleRebuildAll = async () => {
    try {
      setIsRebuilding(true);
      const res = await fetch("/api/map-preprocessing/rebuild", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "all" }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(
          "بازسازی موفق",
          "تمام فایل‌های نقشه با موفقیت از صفر بازتولید گردیدند.",
          "success",
        );
        window.location.reload();
      } else {
        showToast(
          "خطا در بازسازی",
          json.error || "مشکلی در تولید فایل‌ها رخ داد.",
          "error",
        );
      }
    } catch {
      showToast(
        "خطای شبکه",
        "ارتباط با سرور برای بازسازی نقشه برقرار نشد.",
        "error",
      );
    } finally {
      setIsRebuilding(false);
    }
  };

  return (
    <div
      className="w-screen h-screen bg-background text-foreground flex flex-col select-none dir-rtl overflow-hidden"
      dir="rtl"
    >
      <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowRight size={15} />
            <span>منوی اصلی</span>
          </button>
          <div className="h-4 w-[1px] bg-border" />
          <h1 className="text-sm font-extrabold text-foreground">
            اتاق کنترل زیرساخت و پایش نقشه
          </h1>
        </div>

        <button
          onClick={handleRebuildAll}
          disabled={isRebuilding}
          className="px-4 py-2 bg-gdp hover:bg-gdp/90 disabled:opacity-50 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={isRebuilding ? "animate-spin" : ""} />
          <span>
            {isRebuilding
              ? "در حال بازسازی فایل‌ها..."
              : "بازسازی کامل تمام نقشه‌ها"}
          </span>
        </button>
      </header>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="absolute top-4 right-4 z-30 bg-card/85 backdrop-blur-xl border border-border p-1.5 rounded-2xl shadow-xl flex items-center gap-1">
          <button
            onClick={() => setActiveMode("partition")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === "partition"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            پارتیشن‌شده (Partition)
          </button>
          <button
            onClick={() => setActiveMode("edited")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === "edited"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            دستکاری‌شده (Edited)
          </button>
          <button
            onClick={() => setActiveMode("default")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === "default"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            پیش‌فرض (Default)
          </button>
        </div>

        <div className="absolute top-4 left-4 z-30 bg-card/85 backdrop-blur-xl border border-border p-1.5 rounded-2xl shadow-xl flex items-center gap-1">
          <button
            onClick={zoomIn}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer"
            title="بزرگ‌نمایی"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer"
            title="کوچک‌نمایی"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={resetView}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer"
            title="بازنشانی"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="w-full h-full flex-1 relative">
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
          />
        </div>

        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-gdp border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-foreground">
              در حال بارگذاری نقشه...
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
