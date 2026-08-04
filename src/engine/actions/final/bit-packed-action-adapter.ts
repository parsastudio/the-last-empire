import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";

export class BitPackedActionAdapter {
  public executeAction(state: GameState, action: GameAction): GameState {
    if (action) {
      return state;
    }
    return state;
  }
}
