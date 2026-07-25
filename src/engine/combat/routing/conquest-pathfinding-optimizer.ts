import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class ConquestPathfindingOptimizer {
  public checkDirectLineSeaConnectivity(
    p1: Coordinate,
    p2: Coordinate,
    allCells: GridCell[],
  ): boolean {
    const waterCells = new Set<string>(
      allCells.filter((c) => c.ownerId === "WATER").map((c) => `${c.x},${c.y}`),
    );

    const steps = Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
    if (steps === 0) return true;

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const cx = Math.round(p1.x + (p2.x - p1.x) * t);
      const cy = Math.round(p1.y + (p2.y - p1.y) * t);
      if (!waterCells.has(`${cx},${cy}`)) {
        return false;
      }
    }

    return true;
  }
}
