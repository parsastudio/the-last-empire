import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";

export class BitPackedActionAdapter {
  public executeAction(state: GameState, _action: GameAction): GameState {
    return state;
  }
}
