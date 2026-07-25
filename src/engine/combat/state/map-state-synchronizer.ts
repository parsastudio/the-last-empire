import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";

export class MapStateSynchronizer {
  public syncStateToGrid(state: GameState, gridState: GridState): GameState {
    const allCells = gridState.getAllCells();
    const updatedNations = { ...state.nations };

    for (const [id, nation] of Object.entries(updatedNations)) {
      const ownedCells = allCells.filter(
        (c) =>
          (c.ownerId === id && !c.isOccupied) ||
          (c.isOccupied && c.occupierId === id),
      );

      const totalPixels = ownedCells.reduce(
        (sum, c) => sum + c.highResPixelCount,
        0,
      );

      updatedNations[id] = {
        ...nation,
        geography: {
          ...nation.geography,
          territorySize: totalPixels * 86.3,
          contiguousMainlandSize: totalPixels * 86.3,
        },
      };
    }

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
