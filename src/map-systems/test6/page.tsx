"use client";

import React, { useEffect, useState, useRef } from "react";
import { useMapGesture } from "@/map-systems/test4/hooks/use-map-gesture";
import { MapControls } from "@/map-systems/test1/components/map-controls";
import { OCEAN_COLOR, MAP_PALETTE_172 } from "./engine/color-palette";
import type { CountryMapping } from "./engine/map-generator";

export default function MapTest6Page() {
  const [countries, setCountries] = useState<CountryMapping[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<CountryMapping | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const canvasSrcRef = useRef<HTMLCanvasElement | null>(null);
  const canvasDestRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  const mapWidth = 4096;
  const mapHeight = 2048;

  const displayWidth = 1200;
  const displayHeight = 600;

  const renderHighResMap = (
    img: HTMLImageElement,
    countryList: CountryMapping[],
  ) => {
    const canvasSrc = canvasSrcRef.current;
    const canvasDest = canvasDestRef.current;
    if (!canvasSrc || !canvasDest) return;

    canvasSrc.width = mapWidth;
    canvasSrc.height = mapHeight;
    canvasDest.width = mapWidth;
    canvasDest.height = mapHeight;

    const ctxSrc = canvasSrc.getContext("2d");
    const ctxDest = canvasDest.getContext("2d");
    if (!ctxSrc || !ctxDest) return;

    ctxSrc.imageSmoothingEnabled = false;
    ctxDest.imageSmoothingEnabled = false;

    ctxSrc.drawImage(img, 0, 0, mapWidth, mapHeight);

    const shuffledPalette = [...MAP_PALETTE_172];
    for (let i = shuffledPalette.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffledPalette[i];
      const target = shuffledPalette[j];
      if (temp && target) {
        shuffledPalette[i] = target;
        shuffledPalette[j] = temp;
      }
    }

    const palette: Record<number, [number, number, number]> = {};
    countryList.forEach((c, index) => {
      if (c.id > 0) {
        const assignedColor = shuffledPalette[index % shuffledPalette.length];
        if (assignedColor) {
          palette[c.id] = assignedColor;
        }
      }
    });

    const srcData = ctxSrc.getImageData(0, 0, mapWidth, mapHeight).data;
    const destImage = ctxDest.createImageData(mapWidth, mapHeight);
    const destData = destImage.data;

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const idx = (y * mapWidth + x) * 4;
        const id = srcData[idx + 2] || 0;

        let r = OCEAN_COLOR[0];
        let g = OCEAN_COLOR[1];
        let b = OCEAN_COLOR[2];

        if (id > 0) {
          const col = palette[id];
          if (col) {
            r = col[0];
            g = col[1];
            b = col[2];
          }
        }

        let isBorder = false;

        if (x < mapWidth - 1) {
          const rightId = srcData[idx + 4 + 2] || 0;
          if (rightId !== id) {
            isBorder = true;
          }
        }
        if (y < mapHeight - 1) {
          const bottomId = srcData[idx + mapWidth * 4 + 2] || 0;
          if (bottomId !== id) {
            isBorder = true;
          }
        }

        if (isBorder) {
          r = 15;
          g = 23;
          b = 42;
        }

        destData[idx] = r;
        destData[idx + 1] = g;
        destData[idx + 2] = b;
        destData[idx + 3] = 255;
      }
    }

    ctxDest.putImageData(destImage, 0, 0);
    setLoading(false);
  };

  useEffect(() => {
    async function loadTest6Map() {
      try {
        const res = await fetch("/api/map-test6");
        const json = await res.json();
        if (json.success) {
          setCountries(json.data.countries);
          setIsCached(!!json.cached);

          const img = new Image();
          img.src = "/test6/world-mask.png";
          img.onload = () => {
            renderHighResMap(img, json.data.countries);
          };
        } else {
          setError(json.error || "Failed to load map data.");
        }
      } catch {
        setError("Error fetching map test 6 metadata.");
      }
    }
    loadTest6Map();
  }, []);

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvasSrc = canvasSrcRef.current;
    if (!canvasSrc || loading) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const displayX = clientX - position.x;
    const displayY = clientY - position.y;

    const mapX = Math.floor((displayX / scale) * (mapWidth / displayWidth));
    const mapY = Math.floor((displayY / scale) * (mapHeight / displayHeight));

    if (mapX >= 0 && mapX < mapWidth && mapY >= 0 && mapY < mapHeight) {
      const ctxSrc = canvasSrc.getContext("2d");
      if (ctxSrc) {
        const pixel = ctxSrc.getImageData(mapX, mapY, 1, 1).data;
        const id = pixel[2];

        if (id !== undefined && id > 0) {
          const matched = countries.find((c) => c.id === id);
          if (matched) {
            setHoveredCountry(matched);
            return;
          }
        }
      }
    }
    setHoveredCountry(null);
  };

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

      <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center gap-4 z-10">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            Pristine 4K Board-Game Map - Test 6
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero blurring. 1px precise deep navy borders. Light slate ocean
            theme.
          </p>
        </div>
        <div className="text-right flex items-center gap-4">
          <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
            Status: {isCached ? "CACHED" : "RE-GENERATED 4K LIVE"}
          </span>
          <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
            {countries.length} States Connected
          </span>
        </div>
      </div>

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
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas ref={canvasSrcRef} className="hidden" />

        <div
          className="w-full h-full origin-center transition-transform duration-75 ease-out flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <canvas
            ref={canvasDestRef}
            className="pointer-events-none"
            style={{
              width: `${displayWidth}px`,
              height: `${displayHeight}px`,
              imageRendering: "pixelated",
            }}
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
            <div className="text-slate-400">Tactical Scan Identification</div>
            <div className="text-sm font-bold text-white">
              {hoveredCountry.name} ({hoveredCountry.code})
            </div>
            <hr className="border-slate-800" />
            <div>
              <span className="text-slate-500">Indexed Map ID:</span>{" "}
              {hoveredCountry.id}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
