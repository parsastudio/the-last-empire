import { GameState } from "@/domain/game/game-state.schema";
import { VictoryCondition } from "./victory-condition.interface";
import { VictoryStatus } from "../victory-checker";

export class TerritorialVictoryChecker implements VictoryCondition {
  public evaluate(state: GameState): VictoryStatus | null {
    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);
    const totalGlobalArea = aliveNations.reduce(
      (sum, n) => sum + n.geography.territorySize,
      0,
    );

    if (totalGlobalArea <= 0) {
      return null;
    }

    for (const nation of aliveNations) {
      const share = nation.geography.territorySize / totalGlobalArea;
      if (share >= 0.6) {
        return {
          isGameOver: true,
          winnerNationId: nation.id,
          reason: "TERRITORIAL_DOMINANCE",
        };
      }
    }

    return null;
  }
}
