"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useMapLoader } from "@/presentation/hooks/use-map-loader";
import { GameMap } from "@/presentation/components/game-map";
import { StrategicDashboard } from "@/presentation/components/strategic-dashboard";
import { STATIC_ADJACENCY_LIST } from "@/application/map-data.config";
import { processProvincesAndVectors } from "@/application/map-processor";
import {
  expandCountryProvinces,
  executeProvinceAttack,
} from "@/application/province-engine";
import type { Province } from "@/domain/map/province.schema";
import type { GeoJsonData } from "@/engine/map/grid-generator";

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
          "https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json",
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const geoJson = (await response.json()) as GeoJsonData;
        await loadMapFromData(geoJson, 1200, 600);
      } catch (err) {
        console.error(err);
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
      const countryCode = prov.id.replace("_P1", "");
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

  const handleCountryClick = (countryCode: string) => {
    if (!playerCountryCode) {
      const confirmed = window.confirm(
        "Are you sure you want to select this nation?",
      );
      if (confirmed) {
        setPlayerCountryCode(countryCode);
      }
      return;
    }

    if (countryCode === playerCountryCode) return;

    const result = executeProvinceAttack(
      countryCode,
      provincesMap,
      playerCountryCode,
    );
    if (result.newlyConqueredProvIds.length > 0) {
      setOccupiedProvinceIds((prev: Set<string>) => {
        const next = new Set(prev);
        result.newlyConqueredProvIds.forEach((id: string) => next.add(id));
        return next;
      });
    }
  };

  const activeBorders = useMemo(() => {
    if (!playerCountryCode) return [];
    const borderSet = new Set<string>();
    const occupiedNations = new Set<string>([playerCountryCode]);

    Object.entries(occupations).forEach(([code, percent]: [string, number]) => {
      if (percent > 0) {
        occupiedNations.add(code);
      }
    });

    occupiedNations.forEach((nationCode: string) => {
      const provId = `${nationCode}_P1`;
      const neighbors = STATIC_ADJACENCY_LIST[provId] || [];
      neighbors.forEach((neighborProvId: string) => {
        const neighborCode = neighborProvId.replace("_P1", "");
        if (!occupiedNations.has(neighborCode)) {
          borderSet.add(neighborCode);
        }
      });
    });

    return Array.from(borderSet);
  }, [occupations, playerCountryCode]);

  const empireStats = useMemo(() => {
    let totalGdp = 0;
    let totalPopulation = 0;
    let totalTerritories = 0;

    if (!playerCountryCode)
      return { totalGdp, totalPopulation, totalTerritories };

    Object.values(provincesState).forEach((p: Province) => {
      const countryCode = p.id.replace("_P1", "");
      const occupiedPercent = occupations[countryCode] || 0;

      if (p.id === `${playerCountryCode}_P1`) {
        totalGdp += p.gdp;
        totalPopulation += p.population;
        totalTerritories += 1;
      } else {
        if (p.ownerNationId === playerCountryCode) {
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
  }, [provincesState, occupations, playerCountryCode]);

  const conquests = useMemo((): (Province & { occupiedPercent: number })[] => {
    if (!playerCountryCode) return [];
    return Object.values(provincesState)
      .filter((p: Province) => p.id !== `${playerCountryCode}_P1`)
      .map((p: Province) => {
        const countryCode = p.id.replace("_P1", "");
        const occupiedPercent = occupations[countryCode] || 0;
        return {
          ...p,
          occupiedPercent,
        };
      })
      .filter((p) => p.occupiedPercent > 0);
  }, [provincesState, occupations, playerCountryCode]);

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
          />

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
      )}
    </div>
  );
}
