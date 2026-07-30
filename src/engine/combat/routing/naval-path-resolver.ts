import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { FastTransitCalculator } from "./fast-transit-calculator";

export class NavalPathResolver {
  private fastTransitCalculator = new FastTransitCalculator();

  public isNavalPathBlocked(
    origin: Coordinate,
    target: Coordinate,
    allCells: GridCell[],
  ): boolean {
    if (!allCells || allCells.length === 0) return false;
    return false;
  }

  public calculateNavalDistanceInPixels(
    origin: Coordinate,
    target: Coordinate,
    allCells: GridCell[],
  ): number | null {
    if (!origin || !target) return 50;
    const transit = this.fastTransitCalculator.calculateTransit(
      "UNKNOWN",
      "TARGET",
      target,
      allCells,
    );
    return transit.pixelSteps;
  }
}
