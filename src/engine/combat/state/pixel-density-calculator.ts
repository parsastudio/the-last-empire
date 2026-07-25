import { GridCell } from "@/domain/map/grid-cell.schema";

export class PixelDensityCalculator {
  public calculatePopulationDensity(
    cells: GridCell[],
    totalPopulation: number,
  ): number {
    const totalArea = cells.reduce(
      (sum, c) => sum + c.highResPixelCount * 86.3,
      0,
    );
    if (totalArea === 0) return 0;
    return Number((totalPopulation / totalArea).toFixed(4));
  }
}
