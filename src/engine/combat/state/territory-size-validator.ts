import { GridCell } from "@/domain/map/grid-cell.schema";

export class TerritorySizeValidator {
  public verifyConservation(
    previousCells: GridCell[],
    currentCells: GridCell[],
  ): boolean {
    const previousTotalPixels = previousCells.reduce(
      (sum, c) => sum + c.highResPixelCount,
      0,
    );
    const currentTotalPixels = currentCells.reduce(
      (sum, c) => sum + c.highResPixelCount,
      0,
    );
    return previousTotalPixels === currentTotalPixels;
  }
}
