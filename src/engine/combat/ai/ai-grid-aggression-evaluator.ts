import { GridCell } from "@/domain/map/grid-cell.schema";

export class AiGridAggressionEvaluator {
  public calculateThreatDelta(conquered: GridCell[]): number {
    const totalPixels = conquered.reduce(
      (sum, c) => sum + c.highResPixelCount,
      0,
    );
    const threatDelta = Math.floor(totalPixels * 0.02);
    return Math.min(25, Math.max(1, threatDelta));
  }
}
