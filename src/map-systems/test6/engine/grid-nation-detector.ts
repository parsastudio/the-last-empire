import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridNationDetector {
  public detectUniqueNations(cells: GridCell[]): string[] {
    const nations = new Set<string>();
    for (const cell of cells) {
      const owner = cell.ownerId;
      if (owner && owner !== "WATER") {
        nations.add(owner);
      }
    }
    return Array.from(nations).sort();
  }
}
