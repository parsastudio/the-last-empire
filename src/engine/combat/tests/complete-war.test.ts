import { GridCell } from "@/domain/map/grid-cell.schema";
import { ConquestOrchestrator } from "@/engine/combat/orchestrator/conquest-orchestrator";
import { GridEnclaveConnector } from "@/engine/combat/state/grid-enclave-connector";

export function runCompleteWarScenarioTest(): boolean {
  const orchestrator = new ConquestOrchestrator();
  const connector = new GridEnclaveConnector();

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
      x: 20,
      y: 20,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 0,
    },
  ];

  orchestrator.executeAttack("IRN", "USA", { x: 10, y: 10 }, mockCells);
  orchestrator.executeAttack("IRN", "USA", { x: 11, y: 10 }, mockCells);

  connector.regroupEnclaves("USA", mockCells);

  const isolatedCell = mockCells.find((c) => c.x === 20 && c.y === 20);
  const success = isolatedCell !== undefined && isolatedCell.enclaveId === 1;

  return success;
}
