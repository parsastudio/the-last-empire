import { GridCell } from "@/domain/map/grid-cell.schema";
import { CapitulationEngine } from "@/engine/combat/capitulation/capitulation-engine";

export function runCapitulationAnnexationTest(): boolean {
  const engine = new CapitulationEngine();

  const mockCells: GridCell[] = [
    {
      x: 10,
      y: 10,
      ownerId: "USA",
      isOccupied: true,
      occupierId: "IRN",
      highResPixelCount: 16,
      enclaveId: 0,
    },
    {
      x: 11,
      y: 10,
      ownerId: "USA",
      isOccupied: true,
      occupierId: "IRN",
      highResPixelCount: 16,
      enclaveId: 0,
    },
    {
      x: 12,
      y: 10,
      ownerId: "USA",
      isOccupied: true,
      occupierId: "IRN",
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
      enclaveId: 1,
    },
  ];

  const capitulated = engine.processCapitulation("USA", "IRN", mockCells);
  const success =
    capitulated.length === 1 &&
    capitulated[0]?.isOccupied === true &&
    capitulated[0]?.occupierId === "IRN" &&
    capitulated[0]?.x === 13;

  return success;
}
