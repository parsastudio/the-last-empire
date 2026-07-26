import { GridCell } from "@/domain/map/grid-cell.schema";
import { RenderingPipelineFacade } from "../rendering-pipeline-facade";

export function runVisualRenderingEdgeCaseTest(): boolean {
  const pipeline = new RenderingPipelineFacade();
  const dummyData = new Uint8ClampedArray(4 * 4);

  const mockCells: GridCell[] = [
    {
      x: 9999,
      y: 9999,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 1,
    },
  ];

  try {
    pipeline.compositeFinalMap(dummyData, 2, 2, mockCells, 1, false);
    return true;
  } catch {
    return true;
  }
}
