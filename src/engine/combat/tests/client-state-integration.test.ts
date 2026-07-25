import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { GridStateLocalFallbackAdapter } from "@/engine/combat/persistence/grid-state-local-fallback-adapter";

export function runClientStateIntegrationTest(): boolean {
  const fallback = new GridStateLocalFallbackAdapter();
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
    gameId: "CLIENT_TEST_GAME",
    currentTurn: 1,
  } as unknown as GameState;

  fallback.saveToLocalStorage(mockState.gameId, mockGridState.getAllCells());
  const loadedCells = fallback.loadFromLocalStorage(mockState.gameId);

  return loadedCells.length === 1 && loadedCells[0]?.ownerId === "USA";
}
