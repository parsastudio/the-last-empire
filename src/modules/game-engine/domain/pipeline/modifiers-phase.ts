import type { GameState } from "@/core/types/game-state.types";
import { ModifierManager } from "@/modules/events/domain/modifier-manager";
import { TurnPhase } from "./turn-phase";

export class ModifiersPhase implements TurnPhase {
  private modifierManager = new ModifierManager();

  public execute(state: GameState): GameState {
    const nextState = { ...state };
    const nations = { ...nextState.nations };

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      nations[id] = this.modifierManager.updateActiveModifiers(nation);
    }

    nextState.nations = nations;
    return nextState;
  }
}
