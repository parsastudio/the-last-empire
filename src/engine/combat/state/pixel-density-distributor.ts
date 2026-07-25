import { GridCell } from "@/domain/map/grid-cell.schema";

export class PixelDensityDistributor {
  public distributeResource(
    totalValue: number,
    ownerCells: GridCell[],
  ): Map<string, number> {
    const distribution = new Map<string, number>();
    const totalPixels = ownerCells.reduce(
      (sum, c) => sum + c.highResPixelCount,
      0,
    );

    if (totalPixels === 0) {
      return distribution;
    }

    for (const cell of ownerCells) {
      const proportion = cell.highResPixelCount / totalPixels;
      const value = Math.floor(totalValue * proportion);
      distribution.set(`${cell.x},${cell.y}`, value);
    }

    return distribution;
  }
}
