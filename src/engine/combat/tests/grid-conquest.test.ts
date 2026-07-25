import { GridCell } from "@/domain/map/grid-cell.schema";
import { ConquestOrchestrator } from "@/engine/combat/orchestrator/conquest-orchestrator";

export function runGridConquestTest(): boolean {
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
    {
      x: 13,
      y: 10,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 0,
    },
  ];

  const result = orchestrator.executeAttack(
    "IRN",
    "USA",
    { x: 11, y: 10 },
    mockCells,
  );

  const success =
    result.conqueredCells.length === 1 &&
    result.conqueredCells[0]?.isOccupied === true &&
    result.conqueredCells[0]?.occupierId === "IRN";

  return success;
}
