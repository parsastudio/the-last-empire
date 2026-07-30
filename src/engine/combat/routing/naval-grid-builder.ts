import { GridCell } from "@/domain/map/grid-cell.schema";

export class NavalGridBuilder {
  private readonly width = 1024;
  private readonly height = 512;

  public buildTraversableGrid(allCells: GridCell[]): Uint8Array {
    const traversable = new Uint8Array(this.width * this.height);
    for (let i = 0; i < allCells.length; i++) {
      const cell = allCells[i];
      if (cell) {
        if (cell.ownerId === "WATER" || cell.ownerId === "CLOSED_SEA") {
          traversable[(cell.y << 10) | cell.x] = 1;
        }
      }
    }
    return traversable;
  }
}
