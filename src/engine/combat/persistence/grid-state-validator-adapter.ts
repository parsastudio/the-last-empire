import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridStateValidator {
  public validateDimensions(
    cells: GridCell[],
    width = 1024,
    height = 512,
  ): boolean {
    const expectedCount = width * height;
    if (cells.length !== expectedCount) {
      return false;
    }

    for (const cell of cells) {
      if (cell.x < 0 || cell.x >= width || cell.y < 0 || cell.y >= height) {
        return false;
      }
    }

    return true;
  }
}
