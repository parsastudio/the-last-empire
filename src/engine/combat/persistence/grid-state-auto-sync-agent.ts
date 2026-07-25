import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridSyncCoordinator } from "@/engine/combat/persistence/grid-sync-coordinator";

export class GridStateAutoSyncAgent {
  private coordinator = new GridSyncCoordinator();

  public handleAutoSync(state: GameState, gridState: GridState): void {
    this.coordinator.queueGridSync(state.gameId, gridState);
  }
}
