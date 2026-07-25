import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class NavalPathResolver {
  public isNavalPathBlocked(
    origin: Coordinate,
    target: Coordinate,
    allCells: GridCell[],
  ): boolean {
    const obstacleCells = new Set<string>(
      allCells
        .filter((c) => c.ownerId !== "WATER" && !c.isOccupied)
        .map((c) => `${c.x},${c.y}`),
    );

    const steps = Math.max(
      Math.abs(origin.x - target.x),
      Math.abs(origin.y - target.y),
    );
    if (steps === 0) return false;

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const cx = Math.round(origin.x + (target.x - origin.x) * t);
      const cy = Math.round(origin.y + (target.y - origin.y) * t);
      if (obstacleCells.has(`${cx},${cy}`)) {
        return true;
      }
    }

    return false;
  }
}
