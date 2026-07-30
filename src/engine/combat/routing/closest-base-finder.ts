import { GridCell } from "@/domain/map/grid-cell.schema";
import { Coordinate } from "@/domain/map/coordinate.schema";

export class ClosestBaseFinder {
  public findClosestBase(
    attackerId: string,
    target: Coordinate,
    gridCells: GridCell[],
  ): GridCell | undefined {
    let closestCell: GridCell | undefined = undefined;
    let minSqDist = Infinity;

    const targetX = target.x;
    const targetY = target.y;

    for (let i = 0; i < gridCells.length; i++) {
      const cell = gridCells[i]!;
      if (cell.ownerId === attackerId) {
        const dx = cell.x - targetX;
        const dy = cell.y - targetY;
        const sqDist = dx * dx + dy * dy;
        if (sqDist < minSqDist) {
          minSqDist = sqDist;
          closestCell = cell;
        }
      }
    }

    return closestCell;
  }

  public findClosestBaseInList(
    target: Coordinate,
    attackerCells: GridCell[],
  ): GridCell | undefined {
    let closestCell: GridCell | undefined = undefined;
    let minSqDist = Infinity;

    const targetX = target.x;
    const targetY = target.y;

    for (let i = 0; i < attackerCells.length; i++) {
      const cell = attackerCells[i]!;
      const dx = cell.x - targetX;
      const dy = cell.y - targetY;
      const sqDist = dx * dx + dy * dy;
      if (sqDist < minSqDist) {
        minSqDist = sqDist;
        closestCell = cell;
      }
    }

    return closestCell;
  }
}
