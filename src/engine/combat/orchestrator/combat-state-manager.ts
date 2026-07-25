import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { StateSynchronizerFacade } from "@/engine/combat/state/state-synchronizer-facade";
import { GridEnclaveConnector } from "@/engine/combat/state/grid-enclave-connector";

export class CombatStateManager {
  private synchronizer = new StateSynchronizerFacade();
  private connector = new GridEnclaveConnector();

  public processStateChanges(
    state: GameState,
    gridState: GridState,
  ): GameState {
    const allCells = gridState.getAllCells();
    const activeNationsIds = Object.keys(state.nations).filter(
      (id) => state.nations[id]?.isAlive,
    );

    for (const id of activeNationsIds) {
      this.connector.regroupEnclaves(id, allCells);
    }

    return this.synchronizer.synchronizeAll(state, gridState);
  }
}
