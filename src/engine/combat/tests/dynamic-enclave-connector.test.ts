import { GridCell } from "@/domain/map/grid-cell.schema";
import { GridEnclaveConnector } from "@/engine/combat/state/grid-enclave-connector";

export function runDynamicEnclaveConnectorTest(): boolean {
  const connector = new GridEnclaveConnector();
  const mockCells: GridCell[] = [
    {
      x: 1,
      y: 1,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 0,
    },
  ];
  connector.regroupEnclaves("USA", mockCells);
  return mockCells.length === 1;
}
