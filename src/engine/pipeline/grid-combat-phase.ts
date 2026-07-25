import { GameState } from "@/domain/game/game-state.schema";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridEnclaveConnector } from "@/engine/combat/state/grid-enclave-connector";
import { GridStateCleanup } from "@/engine/combat/state/grid-state-cleanup";
import { EnclaveRegistry } from "@/engine/combat/registry/enclave-registry";
import { StateSynchronizerFacade } from "@/engine/combat/state/state-synchronizer-facade";

export class GridCombatPhase implements TurnPhase {
  private connector = new GridEnclaveConnector();
  private cleanup = new GridStateCleanup();
  private synchronizer = new StateSynchronizerFacade();
  private enclaveRegistry = new EnclaveRegistry();

  public execute(context: PipelineContext): GameState {
    const state = context.state;
    const gridState: GridState =
      (state as { gridState?: GridState }).gridState || new GridState();
    const allCells = gridState.getAllCells();

    const activeNationsIds = Object.keys(state.nations).filter(
      (id) => state.nations[id]?.isAlive,
    );

    for (const id of activeNationsIds) {
      this.connector.regroupEnclaves(id, allCells);
      this.cleanup.cleanupEnclaveRegistry(allCells, id, this.enclaveRegistry);
    }

    return this.synchronizer.synchronizeAll(state, gridState);
  }
}
