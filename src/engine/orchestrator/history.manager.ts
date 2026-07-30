import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { StateHistory } from "@/application/state-history";

export class HistoryManager {
  private stateHistory = new StateHistory();

  public recordSnapshot(state: GameState, _gridState: GridState): void {
    this.stateHistory.saveSnapshot(state);
  }

  public getTurnHistory(
    turnNumber: number,
    _gridState: GridState,
  ): GameState | undefined {
    return this.stateHistory.getTurnHistory(turnNumber);
  }
}
