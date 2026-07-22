import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { ModifierManager } from "@/modules/events/domain/modifier-manager";
import { TurnPhase, PipelineContext } from "./turn-phase";

export class ModifiersPhase implements TurnPhase {
  private modifierManager = new ModifierManager();

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
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
