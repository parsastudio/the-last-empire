import { GridCell } from "@/domain/map/grid-cell.schema";

export class AiGridExpansionPriority {
  public evaluateTargetValue(cells: GridCell[]): number {
    return cells.reduce((sum, c) => sum + c.highResPixelCount * 250000, 0);
  }
}
