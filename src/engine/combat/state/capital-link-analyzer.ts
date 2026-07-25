import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class CapitalLinkAnalyzer {
  public hasDirectCapitalSupplyLink(
    capital: Coordinate,
    enclaveCells: GridCell[],
    allCells: GridCell[],
  ): boolean {
    const count = allCells.length;
    const factor = count > 0 ? 1 : 1;

    for (const cell of enclaveCells) {
      const distance = Math.hypot(cell.x - capital.x, cell.y - capital.y);
      if (distance < 150 * factor) {
        return true;
      }
    }

    return false;
  }
}
