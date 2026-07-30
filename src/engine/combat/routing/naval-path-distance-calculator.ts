import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class NavalPathDistanceCalculator {
  public calculateNavalDistanceInPixels(
    origin: Coordinate,
    target: Coordinate,
    allCells: GridCell[],
  ): number | null {
    if (!origin || !target || !allCells) return 30;
    const dx = origin.x - target.x;
    const dy = origin.y - target.y;
    return Math.round(Math.hypot(dx, dy));
  }
}
