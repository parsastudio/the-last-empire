import { useRef, useEffect } from "react";
import { PowerScoreRanker } from "@/engine/diplomacy/power-score-ranker";
import { SimulationFacade } from "@/application/map-rendering/simulation-facade";

export function useCountryHoverRankings() {
  const rankerRef = useRef<PowerScoreRanker>(new PowerScoreRanker());
  const rankingsCacheRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    try {
      const facade = new SimulationFacade();
      const gameState = facade.getActiveSessionState();
      if (gameState && gameState.nations) {
        const rawList = Object.values(gameState.nations).map((n) => ({
          id: n.id,
          gdp: n.gdp,
          treasury: n.treasury,
          infantry: n.military.infantry,
          airForce: n.military.airForce,
          drone: n.military.droneMissile,
        }));
        const ranked = rankerRef.current.rankNations(rawList);
        const cache = new Map<string, number>();
        for (const r of ranked) {
          cache.set(r.id, r.rank);
        }
        rankingsCacheRef.current = cache;
      }
    } catch {}
  }, []);

  return rankingsCacheRef;
}
