import { GameState } from "@/domain/game/game-state.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import {
  VictoryCondition,
  VictoryStatus,
} from "@/engine/politics/victory/conquest-victory-checker";

export class EconomicVictoryChecker implements VictoryCondition {
  public evaluate(state: GameState): VictoryStatus | null {
    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);
    const totalGlobalGdp = aliveNations.reduce(
      (sum, n) => sum + getNationGdp(n, state.provinces),
      0,
    );
    if (totalGlobalGdp <= 0) {
      return null;
    }

    for (const nation of aliveNations) {
      const share = getNationGdp(nation, state.provinces) / totalGlobalGdp;
      if (share >= 0.65) {
        return {
          isGameOver: true,
          winnerNationId: nation.id,
          reason: "ECONOMIC_DOMINANCE",
        };
      }
    }

    return null;
  }
}
