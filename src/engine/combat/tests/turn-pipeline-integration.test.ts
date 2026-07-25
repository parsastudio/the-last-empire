import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { GridCombatPhase } from "@/engine/pipeline/grid-combat-phase";
import { SeededRandom } from "@/domain/shared/seeded-random";

export function runTurnPipelineIntegrationTest(): boolean {
  const phase = new GridCombatPhase();
  const prng = new SeededRandom(12345);

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
  ];

  for (const cell of mockCells) {
    mockGridState.setCell(cell.x, cell.y, cell);
  }

  const mockState = {
    gameId: "INTEGRATION_TEST",
    currentTurn: 1,
    seed: 777,
    isGameOver: false,
    humanNationId: "IRN",
    globalThreatLevel: 0,
    nations: {
      USA: { id: "USA", isAlive: true, geography: { territorySize: 48 } },
      IRN: { id: "IRN", isAlive: true, geography: { territorySize: 0 } },
    },
    gridState: mockGridState,
  } as unknown as GameState;

  const resultState = phase.execute({ state: mockState, prng });
  const irnTerritory = resultState.nations.IRN?.geography.territorySize;

  return irnTerritory !== undefined && irnTerritory > 0;
}
