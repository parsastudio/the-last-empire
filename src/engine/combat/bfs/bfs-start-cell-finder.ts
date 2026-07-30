import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class BfsStartCellFinder {
  public findStartCell(
    entryPoint: Coordinate,
    targetCells: GridCell[],
    cellMap: Map<string, GridCell>,
  ): GridCell | undefined {
    const startCell = cellMap.get(`${entryPoint.x},${entryPoint.y}`);
    if (startCell) {
      return startCell;
    }

    let closestCell: GridCell | undefined = undefined;
    let minDist = Infinity;

    for (let i = 0; i < targetCells.length; i++) {
      const c = targetCells[i]!;
      const dist = Math.hypot(c.x - entryPoint.x, c.y - entryPoint.y);
      if (dist < minDist) {
        minDist = dist;
        closestCell = c;
      }
    }

    return closestCell;
  }
}
