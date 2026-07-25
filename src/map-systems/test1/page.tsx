'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useMapLoader } from "./hooks/use-map-loader";
import { GameMap } from "./components/game-map";
import { StrategicDashboard } from "@/presentation/components/strategic-dashboard";
import { useMapCalculations } from "./hooks/use-map-calculations";
import { useMapTestSimulation } from "./hooks/use-map-test-simulation";
import { FALLBACK_WORLD_MAP } from "@/application/fallback-map.config";
import { processProvincesAndVectors } from "@/application/map-processor";
import { expandCountryProvinces } from "@/application/province-engine";
import type { Province } from "@/domain/map/province.schema";
import type { GeoJsonData } from "./engine/types";

export default function MapTestPage() {
  const { vectorProvinces, provinces, loading, error, loadMapFromData } =
    useMapLoader();
  const [playerCountryCode, setPlayerCountryCode] = useState<string | null>(
    null,
  );
  const [occupiedProvinceIds, setOccupiedProvinceIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    async function autoLoadWorldMap() {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson",
        );
        if (!response.ok) {
          throw new Error("Local map file not found in public folder");
        }
        const geoJson = (await response.json()) as GeoJsonData;
        await loadMapFromData(geoJson, 1200, 600);
      } catch {
        await loadMapFromData(FALLBACK_WORLD_MAP, 1200, 600);
      }
    }
    autoLoadWorldMap();
  }, [loadMapFromData]);

  const processedMap = useMemo(() => {
    if (!vectorProvinces || !provinces) return null;
    return processProvincesAndVectors(provinces, vectorProvinces);
  }, [vectorProvinces, provinces]);

  const provincesMap = useMemo((): Record<string, Province[]> => {
    if (!processedMap) return {};
    const expanded = expandCountryProvinces(processedMap.provinces);
    const grouped: Record<string, Province[]> = {};

    for (const prov of Object.values(expanded)) {
      if (!grouped[prov.ownerNationId]) {
        grouped[prov.ownerNationId] = [];
      }
      grouped[prov.ownerNationId].push(prov);
    }

    for (const list of Object.values(grouped)) {
      for (const p of list) {
        if (playerCountryCode && p.ownerNationId === playerCountryCode) {
          p.isOccupied = true;
        }
        if (occupiedProvinceIds.has(p.id)) {
          p.isOccupied = true;
        }
      }
    }
    return grouped;
  }, [processedMap, occupiedProvinceIds, playerCountryCode]);

  const occupations = useMemo((): Record<string, number> => {
    const occs: Record<string, number> = {};
    for (const [code, provs] of Object.entries(provincesMap)) {
      if (code === playerCountryCode || provs.length === 0) continue;
      const occupiedCount = provs.filter((p: Province) => p.isOccupied).length;
      if (occupiedCount > 0) {
        occs[code] = Number(((occupiedCount / provs.length) * 100).toFixed(1));
      }
    }
    return occs;
  }, [provincesMap, playerCountryCode]);

  const provincesState = useMemo((): Record<string, Province> => {
    if (!processedMap) return {};
    const state: Record<string, Province> = {};
    for (const prov of Object.values(processedMap.provinces)) {
      const countryCode = prov.id.substring(0, prov.id.indexOf("_P"));
      const occupiedPercent = occupations[countryCode] || 0;
      state[prov.id] = {
        ...prov,
        ownerNationId:
          playerCountryCode && occupiedPercent >= 100
            ? playerCountryCode
            : prov.ownerNationId,
      };
    }
    return state;
  }, [processedMap, occupations, playerCountryCode]);

  const { activeBorders, empireStats, conquests } = useMapCalculations({
    playerCountryCode,
    provincesMap,
    provincesState,
    occupations,
  });

  const { assaultVector, handleCountryClick } = useMapTestSimulation({
    playerCountryCode,
    setPlayerCountryCode,
    provincesMap,
    setOccupiedProvinceIds,
  });

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

      {processedMap && !loading && (
        <div className="w-full h-full relative">
          <GameMap
            vectorProvinces={processedMap.vectorProvinces}
            provincesState={provincesState}
            width={1200}
            height={600}
            onCountryClick={handleCountryClick}
            occupations={occupations}
            allProvinces={provincesMap}
            playerCountryCode={playerCountryCode}
            activeAssaultVector={assaultVector}
          />

          <div className="absolute top-6 right-6 w-80 pointer-events-none z-40">
            <div className="pointer-events-auto">
              <StrategicDashboard
                playerCountryCode={playerCountryCode}
                empireStats={empireStats}
                activeBorders={activeBorders}
                conquests={conquests}
                onReset={() => {
                  setPlayerCountryCode(null);
                  setOccupiedProvinceIds(new Set());
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
