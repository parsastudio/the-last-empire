import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { BattleExecutionEngine } from "@/engine/combat/battle-execution-engine";

export class BitPackedActionAdapter {
  private battleEngine = new BattleExecutionEngine();

  public executeAction(state: GameState, action: GameAction): GameState {
    if (action.type !== "INITIATE_BATTLE") {
      return state;
    }

    return this.battleEngine.executeBattle(state, action);
  }
}
