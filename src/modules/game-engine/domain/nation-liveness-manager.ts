import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";

export class NationLivenessManager {
  public updateLiveness(state: GameState): GameState {
    const updatedNations = { ...state.nations };

    for (const [id, nation] of Object.entries(updatedNations)) {
      if (!nation.isAlive) {
        continue;
      }

      const hasTerritory = nation.geography.territorySize > 0;
      const hasPopulation = nation.population > 0;

      if (!hasTerritory || !hasPopulation) {
        updatedNations[id] = {
          ...nation,
          isAlive: false,
          population: 0,
        };
      }
    }

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
