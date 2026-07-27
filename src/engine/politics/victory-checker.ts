import { GameState } from "@/domain/game/game-state.schema";
import { VictoryCondition } from "./victory/victory-condition.interface";
import { ConquestVictoryChecker } from "./victory/conquest-victory.checker";
import { EconomicVictoryChecker } from "./victory/economic-victory.checker";
import { DiplomaticVictoryChecker } from "./victory/diplomatic-victory.checker";

export interface VictoryStatus {
  isGameOver: boolean;
  winnerNationId?: string;
  reason?: string;
}

export class VictoryChecker {
  private checkers: VictoryCondition[] = [
    new ConquestVictoryChecker(),
    new EconomicVictoryChecker(),
    new DiplomaticVictoryChecker(),
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
}
