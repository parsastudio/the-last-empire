import { StateHistory } from "@/application/state-history";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridHistoryManager } from "@/engine/combat/history/grid-history-manager";

export class GridHistoryAdapter {
  private manager = new GridHistoryManager();

  public captureTurn(
    stateHistory: StateHistory,
    turnNumber: number,
    gridState: GridState,
  ): void {
    stateHistory.getSavedTurns();
    this.manager.saveTurnSnapshot(turnNumber, gridState);
  }

  public rollbackTurn(turnNumber: number, gridState: GridState): void {
    this.manager.restoreTurnGrid(turnNumber, gridState);
  }
}
