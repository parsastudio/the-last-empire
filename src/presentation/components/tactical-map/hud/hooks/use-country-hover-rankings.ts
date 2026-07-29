import { useMemo } from "react";
import { PowerScoreRanker } from "@/engine/diplomacy/power-score-ranker";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";
import { Nation } from "@/domain/nation/nation.schema";

export function useCountryHoverRankings(
  _countries?: unknown[],
  nationsMap?: Record<string, Nation>,
): Map<string, number> {
  const ranker = useMemo(() => new PowerScoreRanker(), []);

  return useMemo(() => {
    const cache = new Map<string, number>();

    const rawList = ALL_COUNTRY_PROFILES.map((profile) => {
      const fullId = `NATION_${profile.id}`;
      const liveNation = nationsMap ? nationsMap[fullId] : null;

      const gdp = liveNation ? liveNation.gdp : profile.gdp;
      const treasury = liveNation
        ? liveNation.treasury
        : profile.startingTreasury;
      const infantry = liveNation
        ? liveNation.military.infantry
        : (profile.startingInfantry ?? 50);
      const airForce = liveNation
        ? liveNation.military.airForce
        : (profile.startingAirForce ?? 10);
      const drone = liveNation
        ? liveNation.military.droneMissile
        : (profile.startingDroneMissile ?? 0);
      const techLevel = liveNation
        ? liveNation.military.techLevel
        : (profile.startingTechLevel ?? 1);

      return {
        id: fullId,
        numericId: profile.id,
        code: profile.code,
        flagCode: profile.flagCode,
        gdp,
        treasury,
        infantry,
        airForce,
        drone,
        techLevel,
      };
    });

    const ranked = ranker.rankNations(rawList);

    for (const r of ranked) {
      const rawItem = rawList.find((item) => item.id === r.id);
      if (!rawItem) continue;

      const rank = r.rank;
      const numStr = rawItem.numericId.toString();

      cache.set(r.id, rank);
      cache.set(r.id.toUpperCase(), rank);
      cache.set(r.id.toLowerCase(), rank);
      cache.set(numStr, rank);
      cache.set(`NATION_${numStr}`, rank);
      cache.set(`nation_${numStr}`, rank);
      cache.set(rawItem.code.toUpperCase(), rank);
      cache.set(rawItem.code.toLowerCase(), rank);
      cache.set(rawItem.flagCode.toUpperCase(), rank);
      cache.set(rawItem.flagCode.toLowerCase(), rank);
    }

    return cache;
  }, [nationsMap, ranker]);
}
