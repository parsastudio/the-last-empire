import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";

export class CoalitionManager {
  private readonly threshold = 50;

  public processCoalitions(state: GameState): GameState {
    const nextState = { ...state };
    const nations = { ...nextState.nations };

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const updatedNation = { ...nation };
      updatedNation.aggressionScore = Math.max(
        0,
        updatedNation.aggressionScore - 2,
      );

      if (updatedNation.aggressionScore >= this.threshold) {
        for (const neighborId of updatedNation.geography.landNeighbors) {
          const neighbor = nations[neighborId];
          if (neighbor && neighbor.isAlive) {
            const relation = neighbor.relations[id];
            if (
              relation &&
              relation.stance !== "WAR" &&
              relation.stance !== "COALITION"
            ) {
              neighbor.relations[id] = {
                ...relation,
                stance: "COALITION",
              };
            }
          }
        }
      } else {
        for (const neighborId of updatedNation.geography.landNeighbors) {
          const neighbor = nations[neighborId];
          if (neighbor && neighbor.isAlive) {
            const relation = neighbor.relations[id];
            if (relation && relation.stance === "COALITION") {
              neighbor.relations[id] = {
                ...relation,
                stance: "PEACE",
              };
            }
          }
        }
      }

      nations[id] = updatedNation;
    }

    nextState.nations = nations;
    return nextState;
  }
}
