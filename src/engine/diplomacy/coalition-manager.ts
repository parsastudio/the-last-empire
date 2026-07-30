import type { GameState } from "@/domain/game/game-state.schema";

export class CoalitionManager {
  public processCoalitions(state: GameState): GameState {
    const nextState = { ...state };
    const nations = { ...nextState.nations };
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      const updatedNation = { ...nation };
      updatedNation.globalAggression = Math.max(
        0,
        updatedNation.globalAggression - 2,
      );
      nations[id] = updatedNation;
    }
    nextState.nations = nations;
    return nextState;
  }
}
