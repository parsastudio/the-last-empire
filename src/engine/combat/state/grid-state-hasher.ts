import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridStateHasher {
  public calculateStateHash(cells: GridCell[]): string {
    let hash = 0;

    for (const cell of cells) {
      const cellString = `${cell.x},${cell.y},${cell.ownerId},${cell.isOccupied ? 1 : 0},${cell.occupierId || ""},${cell.enclaveId}`;
      for (let i = 0; i < cellString.length; i++) {
        hash = (hash << 5) - hash + cellString.charCodeAt(i);
        hash |= 0;
      }
    }

    return (hash >>> 0).toString(16);
  }
}
