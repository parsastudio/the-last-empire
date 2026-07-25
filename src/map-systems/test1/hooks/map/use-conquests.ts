import { useMemo } from "react";
import type { Province } from "@/domain/map/province.schema";

interface UseConquestsProps {
  playerCountryCode: string | null;
  provincesState: Record<string, Province>;
  occupations: Record<string, number>;
}

export function useConquests({
  playerCountryCode,
  provincesState,
  occupations,
}: UseConquestsProps): (Province & { occupiedPercent: number })[] {
  return useMemo(() => {
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
}
