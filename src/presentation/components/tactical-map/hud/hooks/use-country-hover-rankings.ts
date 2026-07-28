import { useMemo } from "react";
import { PowerScoreRanker } from "@/engine/diplomacy/power-score-ranker";
import { SimulationFacade } from "@/application/map-rendering/simulation-facade";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";

export function useCountryHoverRankings(): Map<string, number> {
  return useMemo(() => {
    const cache = new Map<string, number>();
    try {
      const facade = new SimulationFacade();
      const gameState = facade.getActiveSessionState();

      let rawList: Array<{
        id: string;
        gdp: number;
        treasury: number;
        infantry: number;
        airForce: number;
        drone: number;
      }> = [];

      if (
        gameState &&
        gameState.nations &&
        Object.keys(gameState.nations).length > 0
      ) {
        rawList = Object.entries(gameState.nations).map(([id, n]) => ({
          id,
          gdp: n.gdp,
          treasury: n.treasury,
          infantry: n.military.infantry,
          airForce: n.military.airForce,
          drone: n.military.droneMissile,
        }));
      } else {
        rawList = ALL_COUNTRY_PROFILES.map((p) => ({
          id: `NATION_${p.id}`,
          gdp: p.gdp,
          treasury: p.startingTreasury,
          infantry: p.startingInfantry ?? 50,
          airForce: p.startingAirForce ?? 10,
          drone: p.startingDroneMissile ?? 0,
        }));
      }

      const ranker = new PowerScoreRanker();
      const ranked = ranker.rankNations(rawList);

      for (const r of ranked) {
        cache.set(r.id, r.rank);
        const numericMatch = r.id.replace("NATION_", "");
        const profile = ALL_COUNTRY_PROFILES.find(
          (p) => p.id.toString() === numericMatch,
        );
        if (profile) {
          cache.set(profile.code, r.rank);
        }
      }
    } catch {}
    return cache;
  }, []);
}
