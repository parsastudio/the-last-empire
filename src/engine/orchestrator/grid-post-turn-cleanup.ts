import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridEnclaveConnector } from "@/engine/combat/state/grid-enclave-connector";
import { GridStateCleanup } from "@/engine/combat/state/grid-state-cleanup";
import { EnclaveRegistry } from "@/engine/combat/registry/enclave-registry";
import { StateSynchronizerFacade } from "@/engine/combat/state/state-synchronizer-facade";

export class GridPostTurnCleanup {
  private gridConnector = new GridEnclaveConnector();
  private gridCleanup = new GridStateCleanup();
  private enclaveRegistry = new EnclaveRegistry();
  private stateSynchronizer = new StateSynchronizerFacade();

  public cleanupAndSynchronize(
    state: GameState,
    gridState: GridState,
  ): GameState {
    const allCells = gridState.getAllCells();
    const activeNationsIds = Object.keys(state.nations).filter(
      (id) => state.nations[id]?.isAlive,
    );

    for (const id of activeNationsIds) {
      this.gridConnector.regroupEnclaves(id, allCells);
      this.gridCleanup.cleanupEnclaveRegistry(
        allCells,
        id,
        this.enclaveRegistry,
      );
    }

    return this.stateSynchronizer.synchronizeAll(state, gridState);
  }
}
