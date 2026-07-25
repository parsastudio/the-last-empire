import { GridCell } from "@/domain/map/grid-cell.schema";
import { GridStateValidatorAdapter } from "@/engine/combat/persistence/grid-state-validator-adapter";

export class GridImportValidator {
  private validator = new GridStateValidatorAdapter();

  public validateImportedData(cells: GridCell[]): boolean {
    try {
      this.validator.validateCells(cells);
      return true;
    } catch {
      return false;
    }
  }
}
