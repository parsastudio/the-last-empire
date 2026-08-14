import { GameState } from "@/domain/game/game-state.schema";
import {
  ConquestVictoryChecker,
  VictoryCondition,
  VictoryStatus,
} from "@/engine/politics/victory/conquest-victory-checker";
import { EconomicVictoryChecker } from "@/engine/politics/victory/economic-victory-checker";
import {
  VictoryProgressCalculator,
  VictoryProgressMetrics,
} from "@/engine/politics/victory/victory-progress-calculator";

export type { VictoryStatus, VictoryCondition, VictoryProgressMetrics };
export {
  ConquestVictoryChecker,
  EconomicVictoryChecker,
  VictoryProgressCalculator,
};

export class VictoryChecker {
  private checkers: VictoryCondition[] = [
    new ConquestVictoryChecker(),
    new EconomicVictoryChecker(),
  ];

  public checkVictory(state: GameState): VictoryStatus {
    for (const checker of this.checkers) {
      const result = checker.evaluate(state);
      if (result) {
        return result;
      }
    }

    return {
      isGameOver: false,
    };
  }

  public static calculateProgress(
    state: GameState | null,
    nationId: string,
  ): VictoryProgressMetrics {
    return VictoryProgressCalculator.calculateProgress(state, nationId);
  }
}
