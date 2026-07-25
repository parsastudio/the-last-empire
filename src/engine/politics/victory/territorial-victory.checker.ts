import { GameState } from "@/domain/game/game-state.schema";
import { VictoryCondition } from "./victory-condition.interface";
import { VictoryStatus } from "../victory-checker";

export class TerritorialVictoryChecker implements VictoryCondition {
  public evaluate(state: GameState): VictoryStatus | null {
    const totalProvinces = Object.keys(state.provinces).length;
    if (totalProvinces <= 0) {
      return null;
    }

    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);

    for (const nation of aliveNations) {
      const nationProvinces = Object.values(state.provinces).filter(
        (p) => p.ownerNationId === nation.id,
      ).length;
      const share = nationProvinces / totalProvinces;
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
