import { GridCell } from "@/domain/map/grid-cell.schema";
import { ConquestOrchestrator } from "@/engine/combat/orchestrator/conquest-orchestrator";

export function runDynamicConquestFlowTest(): boolean {
  const orchestrator = new ConquestOrchestrator();

  const mockCells: GridCell[] = [
    {
      x: 10,
      y: 10,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 0,
    },
    {
      x: 11,
      y: 10,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 0,
    },
    {
      x: 12,
      y: 10,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 0,
    },
  ];

  orchestrator.executeAttack("IRN", "USA", { x: 11, y: 10 }, mockCells);

  const conqueredCell = mockCells.find((c) => c.x === 11 && c.y === 10);
  const success =
    conqueredCell !== undefined &&
    conqueredCell.isOccupied === true &&
    conqueredCell.occupierId === "IRN";

  return success;
}
