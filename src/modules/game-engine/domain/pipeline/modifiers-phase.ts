import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { ModifierManager } from "@/modules/events/domain/modifier-manager";
import { EspionageManager } from "@/modules/diplomacy/domain/espionage-manager";
import { TurnPhase, PipelineContext } from "./turn-phase";

export class ModifiersPhase implements TurnPhase {
  private modifierManager = new ModifierManager();
  private espionageManager = new EspionageManager();

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
    const nations = { ...nextState.nations };

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      let updated = this.modifierManager.updateActiveModifiers(nation);

      const updatedRelations = { ...updated.relations };
      for (const [targetId, relation] of Object.entries(updatedRelations)) {
        updatedRelations[targetId] = this.espionageManager.applyDecay(relation);
      }
      updated.relations = updatedRelations;

      nations[id] = updated;
    }

    nextState.nations = nations;
    return nextState;
  }
}
