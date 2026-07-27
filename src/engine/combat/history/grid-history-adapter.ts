import { StateHistory } from "@/application/state-history";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridStateSerializer } from "@/engine/combat/persistence/grid-state-serializer";
import { GridStateDeserializer } from "@/engine/combat/persistence/grid-state-deserializer";

export class GridHistoryAdapter {
  private serializer = new GridStateSerializer();
  private deserializer = new GridStateDeserializer();
  private historyStore = new Map<number, string>();

  public captureTurn(
    stateHistory: StateHistory,
    turnNumber: number,
    gridState: GridState,
  ): void {
    stateHistory.getSavedTurns();
    const serialized = this.serializer.serialize(gridState.getAllCells());
    this.historyStore.set(turnNumber, serialized);
  }

  public rollbackTurn(turnNumber: number, gridState: GridState): void {
    const serialized = this.historyStore.get(turnNumber);
    if (serialized) {
      gridState.clear();
      const cells = this.deserializer.deserialize(serialized);
      for (const cell of cells) {
        gridState.setCell(cell.x, cell.y, cell);
      }
    }
  }
}
