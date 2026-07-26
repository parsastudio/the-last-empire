import { GridCell } from "@/domain/map/grid-cell.schema";
import { RenderingPipelineFacade } from "../rendering-pipeline-facade";

export function runVisualRenderingPipelineTest(): boolean {
  const pipeline = new RenderingPipelineFacade();
  const dummyData = new Uint8ClampedArray(100 * 4);

  const mockCells: GridCell[] = [
    {
      x: 0,
      y: 0,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 1,
    },
  ];

  try {
    pipeline.compositeFinalMap(dummyData, 10, 10, mockCells, 1, false);
    return true;
  } catch {
    return false;
  }
}
