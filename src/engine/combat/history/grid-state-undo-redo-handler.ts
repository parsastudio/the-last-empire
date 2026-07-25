import { GridState } from "@/engine/combat/state/grid-state";
import { GridHistoryManager } from "@/engine/combat/history/grid-history-manager";

export class GridStateUndoRedoHandler {
  private manager = new GridHistoryManager();

  public handleUndo(turn: number, gridState: GridState): void {
    this.manager.restoreTurnGrid(turn, gridState);
  }
}
