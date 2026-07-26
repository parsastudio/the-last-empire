import { GameState } from "@/domain/game/game-state.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridDownsampler } from "@/application/map-rendering/grid-downsampler";

export class StateGridMigration {
  private downsampler = new GridDownsampler();

  public ensureGridStateInitialized(
    state: GameState,
    maskBufferFallback: Uint8Array,
  ): GameState {
    const extendedState = state as { gridState?: GridState };
    if (extendedState.gridState) {
      return state;
    }

    const gridState = this.downsampler.downsampleMask(
      maskBufferFallback,
      4096,
      2048,
      4,
    );

    extendedState.gridState = gridState;
    return extendedState as GameState;
  }
}
