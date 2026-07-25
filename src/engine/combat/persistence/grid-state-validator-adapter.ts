import { GridCell, GridCellSchema } from "@/domain/map/grid-cell.schema";
import { GameError } from "@/domain/shared/game-error";

export class GridStateValidatorAdapter {
  public validateCells(cells: GridCell[]): void {
    for (const cell of cells) {
      const result = GridCellSchema.safeParse(cell);
      if (!result.success) {
        throw new GameError(
          "INVALID_ACTION",
          "Grid state validation mismatch during persistence operations",
        );
      }
    }
  }
}
