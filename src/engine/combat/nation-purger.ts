import type { GameState } from "@/domain/game/game-state.schema";

export class NationPurger {
  public purgeDestroyedNation(
    state: GameState,
    targetId: string,
    conquerorId: string,
  ): GameState {
    const target = state.nations[targetId];
    const conqueror = state.nations[conquerorId];

    if (!target || !conqueror) {
      return state;
    }

    const updatedNations = { ...state.nations };

    updatedNations[targetId] = {
      ...target,
      isAlive: false,
      population: 0,
      treasury: 0,
      geography: {
        ...target.geography,
        territorySize: 0,
      },
    };

    updatedNations[conquerorId] = {
      ...conqueror,
      geography: {
        ...conqueror.geography,
        territorySize:
          conqueror.geography.territorySize + target.geography.territorySize,
      },
    };

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
