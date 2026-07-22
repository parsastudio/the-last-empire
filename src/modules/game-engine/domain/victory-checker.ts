import type { GameState } from "@/core/types";

export interface VictoryStatus {
  isGameOver: boolean;
  winnerNationId?: string;
  reason?: string;
}

export class VictoryChecker {
  public checkVictory(state: GameState): VictoryStatus {
    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);

    if (aliveNations.length === 0) {
      return {
        isGameOver: true,
        reason: "ALL_NATIONS_DESTROYED",
      };
    }

    if (aliveNations.length === 1) {
      return {
        isGameOver: true,
        winnerNationId: aliveNations[0].id,
        reason: "WORLD_CONQUEST",
      };
    }

    const humanNation = state.nations[state.humanNationId];
    if (humanNation && !humanNation.isAlive) {
      return {
        isGameOver: true,
        reason: "HUMAN_PLAYER_DEFEATED",
      };
    }

    return {
      isGameOver: false,
    };
  }
}
