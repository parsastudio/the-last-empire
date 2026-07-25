import { GridState } from "@/engine/combat/state/grid-state";
import { GridHistoryManager } from "@/engine/combat/history/grid-history-manager";

export class GridStateHistoryFacade {
  private manager = new GridHistoryManager();

  public recordTurn(turn: number, gridState: GridState): void {
    this.manager.saveTurnSnapshot(turn, gridState);
  }

  public restoreTurn(turn: number, gridState: GridState): void {
    this.manager.restoreTurnGrid(turn, gridState);
  }
}
