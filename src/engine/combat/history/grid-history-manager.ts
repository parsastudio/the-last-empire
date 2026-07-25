import { GridState } from "@/engine/combat/state/grid-state";
import { GridStateSerializer } from "@/engine/combat/persistence/grid-state-serializer";
import { GridStateDeserializer } from "@/engine/combat/persistence/grid-state-deserializer";

export class GridHistoryManager {
  private serializer = new GridStateSerializer();
  private deserializer = new GridStateDeserializer();
  private historyStore = new Map<number, string>();

  public saveTurnSnapshot(turn: number, gridState: GridState): void {
    const serialized = this.serializer.serialize(gridState.getAllCells());
    this.historyStore.set(turn, serialized);
  }

  public restoreTurnGrid(turn: number, gridState: GridState): void {
    const serialized = this.historyStore.get(turn);
    if (serialized) {
      gridState.clear();
      const cells = this.deserializer.deserialize(serialized);
      for (const cell of cells) {
        gridState.setCell(cell.x, cell.y, cell);
      }
    }
  }

  public clear(): void {
    this.historyStore.clear();
  }
}
