import { useMemo } from "react";
import type { Province } from "@/domain/map/province.schema";

interface UseActiveBordersProps {
  playerCountryCode: string | null;
  provincesState: Record<string, Province>;
}

export function useActiveBorders({
  playerCountryCode,
  provincesState,
}: UseActiveBordersProps): string[] {
  return useMemo(() => {
    if (!playerCountryCode) return [];
    const borderSet = new Set<string>();

    Object.values(provincesState).forEach((p) => {
      if (p.ownerNationId === playerCountryCode) {
        p.neighbors.forEach((neighborId) => {
          const neighborProv = provincesState[neighborId];
          if (neighborProv) {
            const neighborOwner = neighborProv.ownerNationId;
            if (neighborOwner !== playerCountryCode) {
              borderSet.add(neighborOwner);
            }
          } else {
            const neighborCountry = neighborId.replace("_P1", "");
            if (neighborCountry !== playerCountryCode) {
              borderSet.add(neighborCountry);
            }
          }
        });
      }
    });

    return Array.from(borderSet);
  }, [provincesState, playerCountryCode]);
}
