import { GridCell } from "@/domain/map/grid-cell.schema";
import { ConquestOrchestrator } from "@/engine/combat/orchestrator/conquest-orchestrator";
import { CapitulationEngine } from "@/engine/combat/capitulation/capitulation-engine";

export function runIntegrationConquestFlowTest(): boolean {
  const orchestrator = new ConquestOrchestrator();
  const capitulation = new CapitulationEngine();

  const mockCells: GridCell[] = [
    {
      x: 0,
      y: 0,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 0,
    },
    {
      x: 1,
      y: 0,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 16,
      enclaveId: 0,
    },
    {
      x: 2,
      y: 0,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
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

  orchestrator.executeAttack("IRN", "USA", { x: 0, y: 0 }, mockCells);

  orchestrator.executeAttack("IRN", "USA", { x: 1, y: 0 }, mockCells);

  orchestrator.executeAttack("IRN", "USA", { x: 2, y: 0 }, mockCells);

  const caps = capitulation.processCapitulation("USA", "IRN", mockCells);

  const success =
    caps.length === 1 &&
    caps[0]?.isOccupied === true &&
    caps[0]?.occupierId === "IRN" &&
    caps[0]?.x === 3;

  return success;
}
