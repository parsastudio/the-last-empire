import { GridCell } from "@/domain/map/grid-cell.schema";
import { Coordinate } from "@/domain/map/coordinate.schema";

export class AiGridCampaignGenerator {
  public generateCampaignTargets(
    _attackerId: string,
    _allNationsIds: string[],
    _allCells: GridCell[],
  ): Map<string, Coordinate> {
    return new Map<string, Coordinate>();
  }
}
