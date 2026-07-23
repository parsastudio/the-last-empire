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
      updatedNation.globalAggression = Math.max(
        0,
        updatedNation.globalAggression - 2,
      );

      if (updatedNation.globalAggression >= this.threshold) {
        for (const neighborId of updatedNation.geography.landNeighbors) {
          const neighbor = nations[neighborId];
          if (neighbor && neighbor.isAlive) {
            const relationToAggressor = neighbor.relations[id];
            if (relationToAggressor && relationToAggressor.stance !== "WAR") {
              neighbor.relations[id] = {
                ...relationToAggressor,
                stance: "WAR",
              };
            }
            const relationToNeighbor = updatedNation.relations[neighborId];
            if (relationToNeighbor && relationToNeighbor.stance !== "WAR") {
              updatedNation.relations[neighborId] = {
                ...relationToNeighbor,
                stance: "WAR",
              };
            }
          }
        }
      } else {
        for (const neighborId of updatedNation.geography.landNeighbors) {
          const neighbor = nations[neighborId];
          if (neighbor && neighbor.isAlive) {
            const relationToAggressor = neighbor.relations[id];
            if (relationToAggressor && relationToAggressor.stance === "WAR") {
              neighbor.relations[id] = {
                ...relationToAggressor,
                stance: "PEACE",
              };
            }
            const relationToNeighbor = updatedNation.relations[neighborId];
            if (relationToNeighbor && relationToNeighbor.stance === "WAR") {
              updatedNation.relations[neighborId] = {
                ...relationToNeighbor,
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
