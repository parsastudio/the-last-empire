import { GameState } from "@/domain/game/game-state.schema";

export class BitPackedTurnOrchestrator {
  public processPostTurn(state: GameState): GameState {
    return state;
  }
}
