import { GridCell } from "@/domain/map/grid-cell.schema";
import { GridStateValidator } from "@/engine/combat/persistence/grid-state-validator";

export class GridStateValidatorFacade {
  private validator = new GridStateValidator();

  public isGridStateHealthy(cells: GridCell[]): boolean {
    return this.validator.validateDimensions(cells, 1024, 512);
  }
}
