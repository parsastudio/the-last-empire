import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class CapitalLinkAnalyzer {
  public hasDirectCapitalSupplyLink(
    capital: Coordinate,
    enclaveCells: GridCell[],
    allCells: GridCell[],
  ): boolean {
    const waterCells = new Set<string>(
      allCells.filter((c) => c.ownerId === "WATER").map((c) => `${c.x},${c.y}`),
    );

    for (const cell of enclaveCells) {
      const distance = Math.hypot(cell.x - capital.x, cell.y - capital.y);
      if (distance < 150) {
        return true;
      }
    }

    return false;
  }
}
