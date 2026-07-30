import { GridCell } from "@/domain/map/grid-cell.schema";
import { Coordinate } from "@/domain/map/coordinate.schema";

export class AiGridAttackPlanner {
  public planBestTargetPixel(
    _attackerId: string,
    _defenderId: string,
    _allCells: GridCell[],
  ): Coordinate | null {
    return null;
  }
}
