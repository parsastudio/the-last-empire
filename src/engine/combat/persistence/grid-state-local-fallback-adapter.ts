import { GridCell } from "@/domain/map/grid-cell.schema";
import { GridStateSerializer } from "@/engine/combat/persistence/grid-state-serializer";
import { GridStateDeserializer } from "@/engine/combat/persistence/grid-state-deserializer";

export class GridStateLocalFallbackAdapter {
  private serializer = new GridStateSerializer();
  private deserializer = new GridStateDeserializer();
  private keyPrefix = "grid_state_fallback_";

  public saveToLocalStorage(gameId: string, cells: GridCell[]): void {
    if (typeof window === "undefined") {
      return;
    }
    const serialized = this.serializer.serialize(cells);
    localStorage.setItem(`${this.keyPrefix}${gameId}`, serialized);
  }

  public loadFromLocalStorage(gameId: string): GridCell[] {
    if (typeof window === "undefined") {
      return [];
    }
    const serialized = localStorage.getItem(`${this.keyPrefix}${gameId}`);
    if (!serialized) {
      return [];
    }
    return this.deserializer.deserialize(serialized);
  }
}
