import { useMemo } from "react";
import type { Province } from "@/domain/map/province.schema";

interface UseEmpireStatsProps {
  playerCountryCode: string | null;
  provincesState: Record<string, Province>;
  occupations: Record<string, number>;
}

export function useEmpireStats({
  playerCountryCode,
  provincesState,
  occupations,
}: UseEmpireStatsProps) {
  return useMemo(() => {
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
}
