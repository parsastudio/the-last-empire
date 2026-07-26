import { useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { PowerScoreCalculator } from "@/engine/diplomacy/power-score-calculator";

export function useGlobalRankings(state: GameState | null) {
  const calculator = useMemo(() => new PowerScoreCalculator(), []);

  const rankings = useMemo(() => {
    if (!state) {
      return [];
    }

    const rawList = Object.values(state.nations)
      .filter((n) => n.isAlive)
      .map((n) => ({
        id: n.id,
        gdp: n.gdp,
        treasury: n.treasury,
        infantry: n.military.infantry,
        airForce: n.military.airForce,
        drone: n.military.droneMissile,
      }));

    return calculator.rankNations(rawList);
  }, [state, calculator]);

  return rankings;
}
