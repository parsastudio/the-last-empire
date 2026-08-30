import { GameState } from "@/domain/game/game-state.schema";
import { getNationGdp, GameStateMetricsUtility } from "@geopolitics/domain";
import {
  VictoryCondition,
  VictoryStatus,
} from "@/engine/politics/victory/conquest-victory-checker";

export class EconomicVictoryChecker implements VictoryCondition {
  public evaluate(state: GameState): VictoryStatus | null {
    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);
    const totalGlobalGdp = GameStateMetricsUtility.getTotalGlobalGdp(
      aliveNations,
      state.provinces,
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
