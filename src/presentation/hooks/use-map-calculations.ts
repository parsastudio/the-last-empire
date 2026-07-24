import { useMemo } from "react";
import type { Province } from "@/domain/map/province.schema";
import type { ActivePowerNation } from "@/presentation/components/active-powers-list";
import { STATIC_ADJACENCY_LIST } from "@/application/map-data.config";

interface UseMapCalculationsProps {
  playerCountryCode: string | null;
  provincesMap: Record<string, Province[]>;
  provincesState: Record<string, Province>;
  occupations: Record<string, number>;
}

export function useMapCalculations({
  playerCountryCode,
  provincesMap,
  provincesState,
  occupations,
}: UseMapCalculationsProps) {
  const activeBorders = useMemo(() => {
    if (!playerCountryCode) return [];
    const borderSet = new Set<string>();
    const occupiedNations = new Set<string>([playerCountryCode]);

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
  }, [occupations, playerCountryCode]);

  const empireStats = useMemo(() => {
    let totalGdp = 0;
    let totalPopulation = 0;
    let totalTerritories = 0;

    if (!playerCountryCode) {
      return { totalGdp, totalPopulation, totalTerritories };
    }

    Object.values(provincesState).forEach((p) => {
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
      .filter((p) => p.id !== `${playerCountryCode}_P1`)
      .map((p) => {
        const countryCode = p.id.replace("_P1", "");
        const occupiedPercent = occupations[countryCode] || 0;
        return {
          ...p,
          occupiedPercent,
        };
      })
      .filter((p) => p.occupiedPercent > 0);
  }, [provincesState, occupations, playerCountryCode]);

  const activePowersListData = useMemo((): ActivePowerNation[] => {
    const list: ActivePowerNation[] = [];
    for (const [code, provs] of Object.entries(provincesMap)) {
      const provId = `${code}_P1`;
      const prov = provincesState[provId];
      if (prov) {
        list.push({
          id: code,
          name: prov.name.replace(" Region", ""),
          gdp: provs.reduce((sum, p) => sum + p.gdp, 0),
          population: provs.reduce((sum, p) => sum + p.population, 0),
          provinceCount: provs.length,
        });
      }
    }
    return list;
  }, [provincesMap, provincesState]);

  return {
    activeBorders,
    empireStats,
    conquests,
    activePowersListData,
  };
}
