"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useMapLoader } from "@/presentation/hooks/use-map-loader";
import { GameMap } from "@/presentation/components/game-map";
import { BorderGraphCalculator } from "@/engine/map/border-graph-calculator";
import type { GeoJsonData } from "@/engine/map/grid-generator";
import type { Province } from "@/domain/map/province.schema";

export default function MapTestPage() {
  const { vectorProvinces, provinces, loading, error, loadMapFromData } =
    useMapLoader();
  const [provincesState, setProvincesState] = useState<
    Record<string, Province>
  >({});

  const graphCalculator = useMemo(() => new BorderGraphCalculator(), []);

  const staticAdjacencyList: Record<string, string[]> = useMemo(
    () => ({
      IRN_P1: ["IRQ_P1", "TUR_P1", "AFG_P1", "PAK_P1", "AZE_P1", "ARM_P1"],
      USA_P1: ["CAN_P1", "MEX_P1"],
      CAN_P1: ["USA_P1"],
      MEX_P1: ["USA_P1"],
      AFG_P1: ["IRN_P1", "PAK_P1", "CHN_P1"],
      PAK_P1: ["IRN_P1", "AFG_P1", "IND_P1"],
      IRQ_P1: ["IRN_P1", "TUR_P1", "SAU_P1", "SYR_P1"],
      TUR_P1: ["IRN_P1", "IRQ_P1", "SYR_P1"],
      SAU_P1: ["YEM_P1", "OMN_P1", "IRQ_P1", "ARE_P1"],
      CHN_P1: ["RUS_P1", "IND_P1", "AFG_P1", "PAK_P1"],
      RUS_P1: ["CHN_P1", "UKR_P1", "FIN_P1"],
      IND_P1: ["PAK_P1", "CHN_P1"],
      BRA_P1: ["ARG_P1", "COL_P1"],
    }),
    [],
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

  useEffect(() => {
    if (provinces) {
      setProvincesState(provinces);
    }
  }, [provinces]);

  const handleCountryAttack = (countryCode: string) => {
    const provinceId = `${countryCode}_P1`;
    const province = provincesState[provinceId];
    if (!province) return;

    setProvincesState((prev) => ({
      ...prev,
      [provinceId]: {
        ...province,
        ownerNationId: "IRN",
      },
    }));
  };

  const activeBorders = useMemo(() => {
    return graphCalculator.calculateActiveBorders(
      "IRN",
      provincesState,
      staticAdjacencyList,
    );
  }, [provincesState, graphCalculator, staticAdjacencyList]);

  const empireStats = useMemo(() => {
    let totalGdp = 0;
    let totalPopulation = 0;
    let totalTerritories = 0;

    Object.values(provincesState).forEach((p) => {
      if (p.ownerNationId === "IRN") {
        totalGdp += p.gdp;
        totalPopulation += p.population;
        totalTerritories++;
      }
    });

    return { totalGdp, totalPopulation, totalTerritories };
  }, [provincesState]);

  const handleReset = () => {
    if (provinces) {
      setProvincesState(provinces);
    }
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
                    Territories:{" "}
                    <span className="text-white font-bold">
                      {empireStats.totalTerritories}
                    </span>
                  </div>
                  <div>
                    GDP:{" "}
                    <span className="text-white font-bold">
                      ${(empireStats.totalGdp / 1e9).toFixed(1)}B
                    </span>
                  </div>
                  <div>
                    Population:{" "}
                    <span className="text-white font-bold">
                      {(empireStats.totalPopulation / 1e6).toFixed(1)}M
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
                  {Object.values(provincesState).filter(
                    (p) => p.ownerNationId === "IRN" && p.id !== "IRN_P1",
                  ).length === 0 ? (
                    <p className="text-[10px] text-slate-500 font-mono italic">
                      No conquests.
                    </p>
                  ) : (
                    Object.values(provincesState)
                      .filter(
                        (p) => p.ownerNationId === "IRN" && p.id !== "IRN_P1",
                      )
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 bg-slate-950/50 border border-slate-800/50 rounded-lg text-[10px] font-mono space-y-0.5 text-slate-300"
                        >
                          <div className="text-white font-bold">{p.name}</div>
                          <div className="text-slate-500 text-[8px]">
                            GDP: ${(p.gdp / 1e9).toFixed(1)}B | Pop:{" "}
                            {(p.population / 1e6).toFixed(1)}M
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
