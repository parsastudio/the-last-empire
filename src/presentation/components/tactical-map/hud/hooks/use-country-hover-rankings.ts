import { useMemo } from "react";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";

export function useCountryHoverRankings() {
  return useMemo(() => {
    const scoredList = ALL_COUNTRY_PROFILES.map((profile) => {
      const gdpScore = profile.gdp / 100000 + profile.startingTreasury / 10000;
      const milScore =
        (profile.startingInfantry ?? 50) * 1.0 +
        (profile.startingAirForce ?? 10) * 3.0 +
        (profile.startingDroneMissile ?? 0) * 2.5;

      return {
        id: `NATION_${profile.id}`,
        code: profile.code,
        score: gdpScore + milScore,
      };
    });

    scoredList.sort((a, b) => b.score - a.score);

    const rankMap = new Map<string, number>();
    scoredList.forEach((item, index) => {
      rankMap.set(item.id, index + 1);
      rankMap.set(item.code, index + 1);
    });

    return rankMap;
  }, []);
}
