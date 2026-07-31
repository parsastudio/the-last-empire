import { GameState } from "@/domain/game/game-state.schema";
import { VictoryCondition } from "./victory-condition.interface";
import { VictoryStatus } from "../victory-checker";

export class ConquestVictoryChecker implements VictoryCondition {
  public evaluate(state: GameState): VictoryStatus | null {
    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);

    if (aliveNations.length === 0) {
      return {
        isGameOver: true,
        reason: "ALL_NATIONS_DESTROYED",
      };
    }

    if (aliveNations.length === 1) {
      const winner = aliveNations[0];
      return {
        isGameOver: true,
        winnerNationId: winner ? winner.id : undefined,
        reason: "WORLD_CONQUEST",
      };
    }

    const totalWorldTerritory = aliveNations.reduce(
      (sum, n) => sum + n.geography.territorySize,
      0,
    );

    if (totalWorldTerritory > 0) {
      for (const nation of aliveNations) {
        const territoryShare =
          nation.geography.territorySize / totalWorldTerritory;
        if (territoryShare >= 0.8) {
          return {
            isGameOver: true,
            winnerNationId: nation.id,
            reason: "TERRITORIAL_DOMINANCE",
          };
        }
      }
    }

    const humanNation = state.nations[state.humanNationId];
    if (humanNation && !humanNation.isAlive) {
      return {
        isGameOver: true,
        reason: "HUMAN_PLAYER_DEFEATED",
      };
    }

    return null;
  }
}
