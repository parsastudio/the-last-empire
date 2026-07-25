import { GridCell } from "@/domain/map/grid-cell.schema";

export class TerritoryLossCalculator {
  public calculateLossRatio(countryId: string, allCells: GridCell[]): number {
    const countryCells = allCells.filter((c) => c.ownerId === countryId);
    const totalCount = countryCells.length;

    if (totalCount === 0) {
      return 1.0;
    }

    const occupiedCount = countryCells.filter((c) => c.isOccupied).length;
    return Number((occupiedCount / totalCount).toFixed(4));
  }
}
