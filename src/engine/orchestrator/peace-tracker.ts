import { GameState } from "@/domain/game/game-state.schema";

export class PeaceTracker {
  public updatePeacefulTurns(state: GameState): number {
    return (state.peacefulTurnsCount ?? 0) + 1;
  }
}
