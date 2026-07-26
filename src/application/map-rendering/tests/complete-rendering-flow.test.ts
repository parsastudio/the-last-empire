import { GridCell } from "@/domain/map/grid-cell.schema";
import { RenderingPipelineFacade } from "../rendering-pipeline-facade";

export function runCompleteRenderingFlowTest(): boolean {
  const pipeline = new RenderingPipelineFacade();
  const dest = new Uint8ClampedArray(4 * 4);

  const mockCells: GridCell[] = [
    {
      x: 0,
      y: 0,
      ownerId: "USA",
      isOccupied: true,
      occupierId: "IRN",
      highResPixelCount: 16,
      enclaveId: 2,
    },
  ];

  try {
    pipeline.compositeFinalMap(dest, 2, 2, mockCells, 1, true);
    return true;
  } catch {
    return false;
  }
}
