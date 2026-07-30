import { GameState } from "@/domain/game/game-state.schema";

export class ConquestLogWriter {
  public appendConquestLogs(state: GameState): GameState {
    return state;
  }
}
