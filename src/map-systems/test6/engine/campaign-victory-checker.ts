import { GameState } from "@/domain/game/game-state.schema";
import { VictoryChecker } from "@/engine/politics/victory-checker";

export class CampaignVictoryChecker {
  private checker = new VictoryChecker();

  public evaluateWinner(state: GameState): {
    isGameOver: boolean;
    winnerNationId?: string;
    reason?: string;
  } {
    return this.checker.checkVictory(state);
  }
}
