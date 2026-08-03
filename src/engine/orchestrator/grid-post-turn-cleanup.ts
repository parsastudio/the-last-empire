import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridEnclaveConnector } from "@/engine/combat/state/grid-enclave-connector";
import { StateSynchronizerFacade } from "@/engine/combat/state/state-synchronizer-facade";

export class GridPostTurnCleanup {
  private gridConnector = new GridEnclaveConnector();
  private stateSynchronizer = new StateSynchronizerFacade();

  public cleanupAndSynchronize(
    state: GameState,
    gridState: GridState,
  ): GameState {
    const modifiedCells = gridState.getModifiedCells();

    if (modifiedCells.length > 0) {
      const activeNationsIds = Object.keys(state.nations).filter(
        (id) => state.nations[id]?.isAlive,
      );

      for (let i = 0; i < activeNationsIds.length; i++) {
        const id = activeNationsIds[i]!;
        const countryCells = gridState.getCellsByOwner(id);
        if (countryCells.length > 0) {
          this.gridConnector.regroupEnclaves(id, countryCells);
          this.gridConnector.cleanupEnclaves(countryCells);
        }
      }
    }

    return this.stateSynchronizer.synchronizeAll(state, gridState);
  }
}
