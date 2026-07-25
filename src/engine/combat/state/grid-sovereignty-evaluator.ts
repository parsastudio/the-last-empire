import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridSovereigntyEvaluator {
  private readonly criticalSovereigntyLoss = 0.5;

  public isSovereigntyThreatened(
    countryId: string,
    allCells: GridCell[],
  ): boolean {
    const countryCells = allCells.filter((c) => c.ownerId === countryId);
    const totalCount = countryCells.length;

    if (totalCount === 0) {
      return true;
    }

    const occupiedCount = countryCells.filter((c) => c.isOccupied).length;
    const lossRatio = occupiedCount / totalCount;

    return lossRatio >= this.criticalSovereigntyLoss;
  }
}
