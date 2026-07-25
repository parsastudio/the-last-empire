import { GridCell } from "@/domain/map/grid-cell.schema";
import { GridEnclaveConnector } from "@/engine/combat/state/grid-enclave-connector";

export function runDynamicEnclaveSplittingTest(): boolean {
  const connector = new GridEnclaveConnector();

  const mockCells: GridCell[] = [
    {
      x: 5,
      y: 5,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 2,
    },
    {
      x: 10,
      y: 10,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 2,
    },
  ];

  connector.regroupEnclaves("USA", mockCells);

  const id1 = mockCells.find((c) => c.x === 5 && c.y === 5)?.enclaveId;
  const id2 = mockCells.find((c) => c.x === 10 && c.y === 10)?.enclaveId;

  const success = id1 !== undefined && id2 !== undefined && id1 !== id2;
  return success;
}
