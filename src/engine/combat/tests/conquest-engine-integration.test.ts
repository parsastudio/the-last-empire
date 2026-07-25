import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { EngineIntegration } from "@/engine/combat/orchestrator/engine-integration";

export function runConquestEngineIntegrationTest(): boolean {
  const integration = new EngineIntegration();

  const mockGridState = new GridState();
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
  ];

  for (const cell of mockCells) {
    mockGridState.setCell(cell.x, cell.y, cell);
  }

  const mockState = {
    gameId: "INTEGRATION_TEST_GAME",
    currentTurn: 1,
    seed: 1234,
    isGameOver: false,
    humanNationId: "IRN",
    globalThreatLevel: 0,
    nations: {},
  } as unknown as GameState;

  const bootstrapped = integration.bootstrapEngineState(
    mockState,
    mockGridState,
  );
  const retrievedGrid = (bootstrapped as { gridState?: GridState }).gridState;

  return (
    retrievedGrid !== undefined &&
    retrievedGrid.getCell(10, 10)?.ownerId === "USA"
  );
}
