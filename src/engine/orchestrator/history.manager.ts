import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { StateHistory } from "@/application/state-history";
import { GridHistoryAdapter } from "@/engine/combat/history/grid-history-adapter";

export class HistoryManager {
  private stateHistory = new StateHistory();
  private gridHistory = new GridHistoryAdapter();

  public recordSnapshot(state: GameState, gridState: GridState): void {
    this.stateHistory.saveSnapshot(state);
    this.gridHistory.captureTurn(
      this.stateHistory,
      state.currentTurn,
      gridState,
    );
  }

  public getTurnHistory(
    turnNumber: number,
    gridState: GridState,
  ): GameState | undefined {
    const state = this.stateHistory.getTurnHistory(turnNumber);
    if (state) {
      this.gridHistory.rollbackTurn(turnNumber, gridState);
    }
    return state;
  }
}
