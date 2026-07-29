import { GridCell } from "@/domain/map/grid-cell.schema";

export class CapitulationEngine {
  private readonly capitulationThreshold = 0.85;

  public processCapitulation(
    countryId: string,
    conquerorId: string,
    allCells: GridCell[],
  ): GridCell[] {
    const countryCells = allCells.filter((c) => c.ownerId === countryId);
    const totalCellsCount = countryCells.length;

    if (totalCellsCount === 0) {
      return [];
    }

    const conqueredCount = countryCells.filter(
      (c) => c.ownerId === conquerorId,
    ).length;
    const ratio = conqueredCount / totalCellsCount;

    if (ratio >= this.capitulationThreshold) {
      const capitulatedCells: GridCell[] = [];
      for (const cell of countryCells) {
        if (cell.ownerId === countryId) {
          cell.ownerId = conquerorId;
          capitulatedCells.push(cell);
        }
      }
      return capitulatedCells;
    }

    return [];
  }
}
