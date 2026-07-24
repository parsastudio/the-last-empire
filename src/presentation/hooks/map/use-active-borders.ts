import { useMemo } from "react";
import { STATIC_ADJACENCY_LIST } from "@/application/map-data.config";

interface UseActiveBordersProps {
  playerCountryCode: string | null;
  occupations: Record<string, number>;
}

export function useActiveBorders({
  playerCountryCode,
  occupations,
}: UseActiveBordersProps): string[] {
  return useMemo(() => {
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
}
