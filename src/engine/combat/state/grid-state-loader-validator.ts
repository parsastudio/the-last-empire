import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridStateLoaderValidator {
  public isLoadedStateConsistent(cells: GridCell[]): boolean {
    const validCellCount = cells.filter(
      (c) => c.ownerId !== undefined && c.x >= 0 && c.y >= 0,
    ).length;
    return validCellCount === cells.length && cells.length > 0;
  }
}
