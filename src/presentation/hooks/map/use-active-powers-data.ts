import { useMemo } from "react";
import type { Province } from "@/domain/map/province.schema";
import type { ActivePowerNation } from "@/presentation/components/active-powers-list";

interface UseActivePowersDataProps {
  provincesMap: Record<string, Province[]>;
  provincesState: Record<string, Province>;
}

export function useActivePowersData({
  provincesMap,
  provincesState,
}: UseActivePowersDataProps): ActivePowerNation[] {
  return useMemo(() => {
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
}
