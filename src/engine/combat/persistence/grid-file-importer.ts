import { GridCell } from "@/domain/map/grid-cell.schema";
import { GridStateSerializer } from "@/engine/combat/persistence/grid-state-serializer";
import { GridStateDeserializer } from "@/engine/combat/persistence/grid-state-deserializer";

export class GridFileImporter {
  private serializer = new GridStateSerializer();
  private deserializer = new GridStateDeserializer();

  public exportToJSON(cells: GridCell[]): string {
    const serialized = this.serializer.serialize(cells);
    return JSON.stringify({ data: serialized, timestamp: Date.now() });
  }

  public importFromJSON(jsonString: string): GridCell[] {
    const parsed = JSON.parse(jsonString) as { data?: string };
    if (!parsed.data) return [];
    return this.deserializer.deserialize(parsed.data);
  }
}
