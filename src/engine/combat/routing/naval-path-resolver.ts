import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { NavalPathBlockChecker } from "./naval-path-block-checker";
import { NavalPathDistanceCalculator } from "./naval-path-distance-calculator";

export class NavalPathResolver {
  private blockChecker = new NavalPathBlockChecker();
  private distanceCalculator = new NavalPathDistanceCalculator();

  public isNavalPathBlocked(
    origin: Coordinate,
    target: Coordinate,
    allCells: GridCell[],
  ): boolean {
    return this.blockChecker.isNavalPathBlocked(origin, target, allCells);
  }

  public calculateNavalDistanceInPixels(
    origin: Coordinate,
    target: Coordinate,
    allCells: GridCell[],
  ): number | null {
    return this.distanceCalculator.calculateNavalDistanceInPixels(
      origin,
      target,
      allCells,
    );
  }
}
