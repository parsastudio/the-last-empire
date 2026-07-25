import { GameState } from "@/domain/game/game-state.schema";
import { VictoryCondition } from "./victory-condition.interface";
import { VictoryStatus } from "../victory-checker";

export class EconomicVictoryChecker implements VictoryCondition {
  public evaluate(state: GameState): VictoryStatus | null {
    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);
    const totalGlobalGdp = aliveNations.reduce((sum, n) => sum + n.gdp, 0);
    if (totalGlobalGdp <= 0) {
      return null;
    }

    for (const nation of aliveNations) {
      const share = nation.gdp / totalGlobalGdp;
      if (share >= 0.6) {
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
