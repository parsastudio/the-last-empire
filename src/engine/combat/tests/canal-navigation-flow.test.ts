import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { SeaBridgeConnector } from "@/engine/combat/sea-bridges/sea-bridge-connector";

export function runCanalNavigationFlowTest(): boolean {
  const connector = new SeaBridgeConnector();

  const mockSuezPixel1: Coordinate = { x: 635, y: 170 };
  const mockSuezPixel2: Coordinate = { x: 635, y: 171 };

  const mockCells: GridCell[] = [
    {
      x: 635,
      y: 170,
      ownerId: "WATER",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 0,
      enclaveId: 0,
    },
    {
      x: 635,
      y: 171,
      ownerId: "WATER",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 0,
      enclaveId: 0,
    },
  ];

  const success =
    connector.areConnectedBySeaBridge(mockSuezPixel1, mockSuezPixel2, 33) &&
    mockCells.length === 2;
  return success;
}
