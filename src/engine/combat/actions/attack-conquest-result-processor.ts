import { GridCell } from "@/domain/map/grid-cell.schema";

export class AttackConquestResultProcessor {
  public formatConquestSummary(
    attackerId: string,
    defenderId: string,
    conqueredCells: GridCell[],
    capitulatedCells: GridCell[],
  ): string {
    const conqueredCount = conqueredCells.length;
    const capitulatedCount = capitulatedCells.length;
    const totalCaptured = conqueredCount + capitulatedCount;

    if (totalCaptured === 0) {
      return `${attackerId} failed to capture even a single territory from ${defenderId} in this campaign.`;
    }

    return `${attackerId} successfully captured ${totalCaptured} grid cells from ${defenderId}. Conquered: ${conqueredCount}. Capitulated: ${capitulatedCount}.`;
  }
}
