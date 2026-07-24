"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useMapLoader } from "@/presentation/hooks/use-map-loader";
import { GameMap } from "@/presentation/components/game-map";
import {
  STATIC_ADJACENCY_LIST,
  CENTROIDS,
} from "@/application/map-data.config";
import {
  generateProvinces,
  linkCountryProvinces,
  executeProvinceAttack,
} from "@/application/province-engine";
import type { AbstractProvince } from "@/application/province-engine";
import type { GeoJsonData } from "@/engine/map/grid-generator";
import type { Province } from "@/domain/map/province.schema";

export default function MapTestPage() {
  const { vectorProvinces, provinces, loading, error, loadMapFromData } =
    useMapLoader();
  const [occupiedProvinceIds, setOccupiedProvinceIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    async function autoLoadWorldMap() {
      try {
        const response = await fetch(
          "https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json",
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const geoJson = (await response.json()) as GeoJsonData;
        await loadMapFromData(geoJson, 1200, 600);
      } catch (err) {
        console.error("Auto-load failed", err);
      }
    }
    autoLoadWorldMap();
  }, [loadMapFromData]);

  const provincesMap = useMemo((): Record<string, AbstractProvince[]> => {
    if (!provinces) return {};
    const initialMap: Record<string, AbstractProvince[]> = {};
    for (const prov of Object.values(provinces)) {
      const countryCode = prov.id.replace("_P1", "");
      const hasSeaAccess = [
        "USA",
        "CAN",
        "RUS",
        "CHN",
        "IRN",
        "SAU",
        "DEU",
        "IRQ",
      ].includes(countryCode);
      const center = CENTROIDS[countryCode] || {
        x: (prov.gdp % 400) + 300,
        y: (prov.population % 250) + 150,
      };

      initialMap[countryCode] = generateProvinces(
        countryCode,
        prov.name.replace(" Region", ""),
        center.x,
        center.y,
        hasSeaAccess,
      );
    }
    linkCountryProvinces(initialMap, STATIC_ADJACENCY_LIST);

    for (const provs of Object.values(initialMap)) {
      for (const p of provs) {
        if (occupiedProvinceIds.has(p.id)) {
          p.isOccupied = true;
        }
      }
    }

    return initialMap;
  }, [provinces, occupiedProvinceIds]);

  const occupations = useMemo((): Record<string, number> => {
    const occs: Record<string, number> = {};
    for (const [code, provs] of Object.entries(provincesMap)) {
      if (code === "IRN" || provs.length === 0) continue;
      const occupiedCount = provs.filter((p) => p.isOccupied).length;
      if (occupiedCount > 0) {
        occs[code] = Number(((occupiedCount / provs.length) * 100).toFixed(1));
      }
    }
    return occs;
  }, [provincesMap]);

  const provincesState = useMemo((): Record<string, Province> => {
    if (!provinces) return {};
    const state: Record<string, Province> = {};
    for (const prov of Object.values(provinces)) {
      const countryCode = prov.id.replace("_P1", "");
      const occupiedPercent = occupations[countryCode] || 0;
      state[prov.id] = {
        ...prov,
        ownerNationId: occupiedPercent >= 100 ? "IRN" : prov.ownerNationId,
      };
    }
    return state;
  }, [provinces, occupations]);

  const handleCountryAttack = (countryCode: string) => {
    if (countryCode === "IRN") return;
    const result = executeProvinceAttack(countryCode, provincesMap);
    if (result.newlyConqueredProvId) {
      setOccupiedProvinceIds((prev) => {
        const next = new Set(prev);
        next.add(result.newlyConqueredProvId!);
        return next;
      });
    }
  };

  const activeBorders = useMemo(() => {
    const borderSet = new Set<string>();
    const occupiedNations = new Set<string>(["IRN"]);

    Object.entries(occupations).forEach(([code, percent]) => {
      if (percent > 0) {
        occupiedNations.add(code);
      }
    });

    occupiedNations.forEach((nationCode) => {
      const provId = `${nationCode}_P1`;
      const neighbors = STATIC_ADJACENCY_LIST[provId] || [];
      neighbors.forEach((neighborProvId) => {
        const neighborCode = neighborProvId.replace("_P1", "");
        if (!occupiedNations.has(neighborCode)) {
          borderSet.add(neighborCode);
        }
      });
    });

    return Array.from(borderSet);
  }, [occupations]);

  const empireStats = useMemo(() => {
    let totalGdp = 0;
    let totalPopulation = 0;
    let totalTerritories = 0;

    Object.values(provincesState).forEach((p) => {
      const countryCode = p.id.replace("_P1", "");
      const occupiedPercent = occupations[countryCode] || 0;

      if (p.id === "IRN_P1") {
        totalGdp += p.gdp;
        totalPopulation += p.population;
        totalTerritories += 1;
      } else {
        if (p.ownerNationId === "IRN") {
          totalGdp += p.gdp;
          totalPopulation += p.population;
          totalTerritories += 1;
        } else if (occupiedPercent > 0) {
          totalGdp += p.gdp * (occupiedPercent / 100);
          totalPopulation += p.population * (occupiedPercent / 100);
          totalTerritories += occupiedPercent / 100;
        }
      }
    });

    return { totalGdp, totalPopulation, totalTerritories };
  }, [provincesState, occupations]);

  const conquests = useMemo(() => {
    return Object.values(provincesState)
      .filter((p) => p.id !== "IRN_P1")
      .map((p) => {
        const countryCode = p.id.replace("_P1", "");
        const occupiedPercent = occupations[countryCode] || 0;
        return {
          ...p,
          occupiedPercent,
        };
      })
      .filter((p) => p.occupiedPercent > 0);
  }, [provincesState, occupations]);

  const handleReset = () => {
    setOccupiedProvinceIds(new Set());
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white select-none">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-50">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">
            Generating Strategic Vector Atlas...
          </p>
        </div>
      )}

      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 p-4 bg-red-950/80 border border-red-800/80 text-red-400 rounded-xl shadow-2xl z-50">
          Error: {error}
        </div>
      )}

      {vectorProvinces && !loading && (
        <div className="w-full h-full relative">
          <GameMap
            vectorProvinces={vectorProvinces}
            provincesState={provincesState}
            width={1200}
            height={600}
            onCountryClick={handleCountryAttack}
            occupations={occupations}
            allProvinces={provincesMap}
          />

          <div className="absolute top-6 right-6 w-80 space-y-4 pointer-events-none z-40">
            <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h1 className="text-sm font-extrabold tracking-tight text-white uppercase">
                  Strategic Dashboard
                </h1>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-colors border border-rose-500/30"
                >
                  Reset Map
                </button>
              </div>

              <div>
                <h2 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Iran Empire Stats
                </h2>
                <div className="space-y-1.5 font-mono text-xs bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 text-slate-300">
                  <div>
                    Control Size:{" "}
                    <span className="text-white font-bold">
                      {empireStats.totalTerritories.toFixed(2)} units
                    </span>
                  </div>
                  <div>
                    Total GDP:{" "}
                    <span className="text-white font-bold">
                      ${(empireStats.totalGdp / 1e9).toFixed(1)}B
                    </span>
                  </div>
                  <div>
                    Population:{" "}
                    <span className="text-white font-bold">
                      ${(empireStats.totalPopulation / 1e6).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xs font-bold text-sky-400 mb-2">
                  Active Land Neighbors
                </h2>
                <div className="max-h-[120px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {activeBorders.length === 0 ? (
                    <p className="text-[10px] text-slate-500 font-mono italic">
                      No neighbors.
                    </p>
                  ) : (
                    activeBorders.map((borderNation) => (
                      <div
                        key={borderNation}
                        className="flex items-center justify-between p-2 bg-slate-950/40 border border-slate-800/50 rounded-lg text-[10px] font-mono text-slate-400"
                      >
                        <span>{borderNation}</span>
                        <span className="text-rose-500 font-bold uppercase text-[8px] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                          Border
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xs font-bold text-slate-400 mb-2">
                  Invasion Conquests
                </h2>
                <div className="max-h-[150px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {conquests.length === 0 ? (
                    <p className="text-[10px] text-slate-500 font-mono italic">
                      No conquests.
                    </p>
                  ) : (
                    conquests.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 bg-slate-950/50 border border-slate-800/50 rounded-lg text-[10px] font-mono space-y-0.5 text-slate-300"
                      >
                        <div className="flex justify-between">
                          <span className="text-white font-bold">{p.name}</span>
                          <span className="text-emerald-400 font-extrabold">
                            {p.occupiedPercent}%
                          </span>
                        </div>
                        <div className="text-slate-500 text-[8px]">
                          GDP Contribution: $
                          {((p.gdp * (p.occupiedPercent / 100)) / 1e9).toFixed(
                            1,
                          )}
                          B | Pop: $
                          {(
                            (p.population * (p.occupiedPercent / 100)) /
                            1e6
                          ).toFixed(1)}
                          M
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
