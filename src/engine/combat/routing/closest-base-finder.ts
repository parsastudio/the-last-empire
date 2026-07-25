import { GridCell } from "@/domain/map/grid-cell.schema";
import { Coordinate } from "@/domain/map/coordinate.schema";

export class ClosestBaseFinder {
  public findClosestBase(
    attackerId: string,
    target: Coordinate,
    gridCells: GridCell[],
  ): GridCell | undefined {
    let closestCell: GridCell | undefined = undefined;
    let minDistance = Infinity;

    for (const cell of gridCells) {
      if (cell.ownerId === attackerId || cell.occupierId === attackerId) {
        const dist = Math.hypot(cell.x - target.x, cell.y - target.y);
        if (dist < minDistance) {
          minDistance = dist;
          closestCell = cell;
        }
      }
    }

    return closestCell;
  }
}
