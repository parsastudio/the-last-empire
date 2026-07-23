"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useMapLoader } from "@/presentation/hooks/use-map-loader";
import { useMapInteraction } from "@/presentation/hooks/use-map-interaction";
import { GameMap } from "@/presentation/components/game-map";
import { ActivePowersList } from "@/presentation/components/active-powers-list";
import { FALLBACK_WORLD_MAP } from "@/application/fallback-map.config";
import type { GeoJsonData } from "@/engine/map/grid-generator";

const MAP_CDN_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

export default function SelectionDashboardPage() {
  const { grid, loadMapFromData } = useMapLoader();
  const [activeNations, setActiveNations] = useState<Record<string, any>>({});
  const [loadingText, setLoadingText] = useState(
    "Establishing Geopolitical Matrix...",
  );

  const activeKeysSet = useMemo(() => {
    return new Set(Object.keys(activeNations));
  }, [activeNations]);

  const {
    hoveredNationId,
    selectedNationId,
    setHoveredNationId,
    setSelectedNationId,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
  } = useMapInteraction({
    grid,
    gridWidth: 300,
    gridHeight: 150,
  });

  useEffect(() => {
    async function fetchAndSetupMap() {
      try {
        setLoadingText("Fetching Global Vector Geometries...");
        const response = await fetch(MAP_CDN_URL);
        if (!response.ok) {
          throw new Error("CDN_OFFLINE");
        }
        const geoJson: GeoJsonData = await response.json();

        setLoadingText("Filtering Sovereign States and Adjusting Neighbors...");
        const minPopulation = 3000000;
        const filteredFeatures = geoJson.features.filter((f) => {
          const id = f.properties.ISO_A3;
          const pop = f.properties.POP_EST || 0;
          return id && id !== "-99" && pop >= minPopulation;
        });

        const filteredGeoJson: GeoJsonData = {
          type: "FeatureCollection",
          features: filteredFeatures,
        };

        const nationsList: Record<string, any> = {};
        filteredFeatures.forEach((feature) => {
          const props = feature.properties;
          nationsList[props.ISO_A3] = {
            id: props.ISO_A3,
            name: props.NAME,
            gdp: (props.GDP_MD || 1000) * 1000000,
            population: props.POP_EST || 1000000,
          };
        });

        setActiveNations(nationsList);
        const activeKeys = new Set(Object.keys(nationsList));
        await loadMapFromData(filteredGeoJson, 300, 150, activeKeys);
      } catch (err) {
        setLoadingText("Network Offline. Bootstrapping Local Fallback Map...");
        const localNationsList: Record<string, any> = {};
        FALLBACK_WORLD_MAP.features.forEach((feature) => {
          const props = feature.properties;
          localNationsList[props.ISO_A3] = {
            id: props.ISO_A3,
            name: props.NAME,
            gdp: props.GDP_MD * 1000000,
            population: props.POP_EST,
          };
        });

        setActiveNations(localNationsList);
        const fallbackKeys = new Set(Object.keys(localNationsList));
        await loadMapFromData(FALLBACK_WORLD_MAP, 300, 150, fallbackKeys);
      }
    }

    fetchAndSetupMap();
  }, [loadMapFromData]);

  const selectedNationDetails = useMemo(() => {
    if (!selectedNationId) return null;
    return activeNations[selectedNationId] || null;
  }, [selectedNationId, activeNations]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white font-sans p-8">
      <header className="max-w-7xl mx-auto w-full mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-emerald-500 uppercase">
            GEOPOLITICAL ENGINE v0.1.0
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight mt-1">
            Select Your Sovereign Nation
          </h1>
          <p className="text-slate-400 mt-2">
            Establish your regime, manage dynamic resources, and prepare for
            global operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-xs font-semibold text-slate-400 font-mono">
            LIVE SYSTEM ONLINE
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {grid ? (
            <div className="flex-1 flex flex-col justify-center">
              <GameMap
                grid={grid}
                width={300}
                height={150}
                hoveredNationId={hoveredNationId}
                selectedNationId={selectedNationId}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-900/30 rounded-3xl border border-slate-800 min-h-[350px]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">{loadingText}</p>
              </div>
            </div>
          )}

          <div className="bg-slate-900/30 p-6 rounded-3xl border border-slate-800">
            {selectedNationDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase">
                    Nation Identity
                  </div>
                  <div className="text-2xl font-bold mt-1 text-white">
                    {selectedNationDetails.name}
                  </div>
                  <div className="text-xs text-emerald-400 font-mono mt-1">
                    System Identifier: {selectedNationDetails.id}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase">
                    Estimated Population
                  </div>
                  <div className="text-2xl font-bold mt-1 text-slate-100 font-mono">
                    {selectedNationDetails.population.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Active Citizens Base
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase">
                    Gross Domestic Product
                  </div>
                  <div className="text-2xl font-bold mt-1 text-emerald-400 font-mono">
                    ${(selectedNationDetails.gdp / 1e9).toFixed(2)}B
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Global Trade Capital
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full py-4 text-slate-500 font-medium text-sm">
                Click on any continent or country to preview administrative
                statistics and select it.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {grid && Object.keys(activeNations).length > 0 && (
            <ActivePowersList
              grid={grid}
              survivingNations={activeNations}
              hoveredNationId={hoveredNationId}
              selectedNationId={selectedNationId}
              onSelectNation={setSelectedNationId}
              onHoverNation={setHoveredNationId}
            />
          )}

          {selectedNationId && (
            <button
              onClick={() => alert(`Starting game as: ${selectedNationId}`)}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Start Operation Scenario
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
