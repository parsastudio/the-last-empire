import { GridCell } from "@/domain/map/grid-cell.schema";
import { GridEnclaveConnector } from "@/engine/combat/state/grid-enclave-connector";

export function runDynamicEnclaveRegroupTest(): boolean {
  const connector = new GridEnclaveConnector();

  const mockCells: GridCell[] = [
    {
      x: 1,
      y: 1,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 1,
    },
    {
      x: 2,
      y: 1,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 1,
    },
    {
      x: 4,
      y: 1,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 1,
    },
  ];

  connector.regroupEnclaves("USA", mockCells);

  const enclaveId1 = mockCells.find((c) => c.x === 1 && c.y === 1)?.enclaveId;
  const enclaveId2 = mockCells.find((c) => c.x === 4 && c.y === 1)?.enclaveId;

  const success =
    enclaveId1 !== undefined &&
    enclaveId2 !== undefined &&
    enclaveId1 !== enclaveId2;

  return success;
}
