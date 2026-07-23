"use client";

import React, { useState, useMemo } from "react";
import { useMapLoader } from "@/presentation/hooks/use-map-loader";
import { GameMap } from "@/presentation/components/game-map";
import type { GeoJsonData } from "@/engine/map/grid-generator";

export default function MapTestPage() {
  const { grid, loading, error, loadMapFromData } = useMapLoader();
  const [dragActive, setDragActive] = useState(false);

  const activeKeysSet = useMemo(() => {
    return new Set([
      "USA",
      "CAN",
      "RUS",
      "SAU",
      "DEU",
      "IRN",
      "CHN",
      "BRA",
      "AUS",
      "ZAF",
      "IND",
      "FRA",
      "GBR",
      "JPN",
      "EGY",
      "TUR",
      "MEX",
      "ARG",
      "ITA",
      "ESP",
    ]);
  }, []);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    try {
      const text = await file.text();
      const geoJson = JSON.parse(text) as GeoJsonData;
      await loadMapFromData(geoJson, 300, 150, activeKeysSet);
    } catch (err) {
      console.error(err);
      alert("Invalid GeoJSON file or parsing failed");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          GeoJSON Map Engine Test
        </h1>
        <p className="text-slate-400 mt-2">
          Upload your World GeoJSON file to test raw map parsing, country
          filtering, and neighborhood absorption.
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center">
        {!grid && !loading && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`w-full max-w-xl p-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
              dragActive
                ? "border-emerald-500 bg-slate-800/50"
                : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
            }`}
          >
            <div className="mb-4 text-slate-500">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-slate-200">
              Drag and drop your GeoJSON file here
            </p>
            <p className="text-sm text-slate-400 mt-1">or</p>
            <label className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-full cursor-pointer transition-colors shadow-lg shadow-emerald-900/30">
              Browse Files
              <input
                type="file"
                accept=".geojson,.json"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">
              Generating Map Matrix and Merging Territories...
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-950/30 border border-red-800 text-red-400 rounded-xl mb-6">
            Error: {error}
          </div>
        )}

        {grid && !loading && (
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
              <div className="text-sm text-slate-400">
                Resolution:{" "}
                <span className="text-emerald-400 font-semibold">
                  300x150 Pixels
                </span>{" "}
                | Top 20 Global Powers Active
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full font-medium transition-colors"
              >
                Reset Map
              </button>
            </div>
            <GameMap
              grid={grid}
              width={300}
              height={150}
              hoveredNationId={null}
              selectedNationId={null}
              onMouseMove={() => {}}
              onMouseLeave={() => {}}
              onClick={() => {}}
            />
          </div>
        )}
      </main>
    </div>
  );
}
