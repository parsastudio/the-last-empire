import { GridCell } from "@/domain/map/grid-cell.schema";

export class CapitulationEngine {
  private readonly capitulationThreshold = 0.85;

  public processCapitulation(
    countryId: string,
    conquerorId: string,
    allCells: GridCell[],
  ): GridCell[] {
    const countryCells: GridCell[] = [];
    let conqueredCount = 0;

    for (let i = 0; i < allCells.length; i++) {
      const c = allCells[i]!;
      if (c.ownerId === countryId) {
        countryCells.push(c);
      } else if (c.ownerId === conquerorId && c.isOccupied) {
        conqueredCount++;
      }
    }

    const totalCellsCount = countryCells.length + conqueredCount;
    if (totalCellsCount === 0) {
      return [];
    }

    const ratio = conqueredCount / totalCellsCount;

    if (ratio >= this.capitulationThreshold) {
      const capitulatedCells: GridCell[] = [];
      for (let i = 0; i < countryCells.length; i++) {
        const cell = countryCells[i]!;
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
