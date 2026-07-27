import { Nation } from "@/domain/nation/nation.schema";
import { DistanceCoordinateCalculator } from "./distance-coordinate-calculator";
import { DistanceGraphCalculator } from "./distance-graph-calculator";

export class GeographyDistanceCalculator {
  private coordinateCalculator = new DistanceCoordinateCalculator();
  private graphCalculator = new DistanceGraphCalculator();

  public calculateDistance(
    originId: string,
    originTargetId: string,
    allNations: Record<string, Nation>,
  ): number {
    if (originId === originTargetId) {
      return 0;
    }

    const originNation = allNations[originId];
    const targetNation = allNations[originTargetId];

    if (originNation && targetNation) {
      const coordDistance =
        this.coordinateCalculator.calculateMinCoordinateDistance(
          originNation,
          targetNation,
        );
      if (coordDistance !== -1) {
        return coordDistance;
      }
    }

    return this.graphCalculator.calculateGraphDistance(
      originId,
      originTargetId,
      allNations,
    );
  }
}
