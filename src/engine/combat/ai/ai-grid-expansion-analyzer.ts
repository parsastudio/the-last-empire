import { GridCell } from "@/domain/map/grid-cell.schema";

export class AiGridExpansionAnalyzer {
  public findOptimalExpansionCells(
    targetCells: GridCell[],
    baseX: number,
    baseY: number,
  ): GridCell[] {
    return [...targetCells].sort((a, b) => {
      const distA = Math.hypot(a.x - baseX, a.y - baseY);
      const distB = Math.hypot(b.x - baseX, b.y - baseY);
      return distA - distB;
    });
  }
}
