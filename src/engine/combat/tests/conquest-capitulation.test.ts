import { GridCell } from "@/domain/map/grid-cell.schema";
import { CapitulationEngine } from "@/engine/combat/capitulation/capitulation-engine";

export function runConquestCapitulationTest(): boolean {
  const engine = new CapitulationEngine();

  const mockCells: GridCell[] = [
    {
      x: 0,
      y: 0,
      ownerId: "USA",
      isOccupied: true,
      occupierId: "IRN",
      highResPixelCount: 16,
      enclaveId: 0,
    },
    {
      x: 1,
      y: 0,
      ownerId: "USA",
      isOccupied: true,
      occupierId: "IRN",
      highResPixelCount: 16,
      enclaveId: 0,
    },
    {
      x: 2,
      y: 0,
      ownerId: "USA",
      isOccupied: true,
      occupierId: "IRN",
      highResPixelCount: 16,
      enclaveId: 0,
    },
    {
      x: 3,
      y: 0,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 0,
    },
  ];

  const caps = engine.processCapitulation("USA", "IRN", mockCells);

  const success =
    caps.length === 1 &&
    caps[0]?.isOccupied === true &&
    caps[0]?.occupierId === "IRN" &&
    caps[0]?.x === 3;

  return success;
}
