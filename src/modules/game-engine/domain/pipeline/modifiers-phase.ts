import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { ModifierManager } from "@/modules/events/domain/modifier-manager";
import { CoolOffManager } from "@/modules/diplomacy/domain/cool-off-manager";
import { TurnPhase, PipelineContext } from "./turn-phase";

export class ModifiersPhase implements TurnPhase {
  private modifierManager = new ModifierManager();
  private coolOffManager = new CoolOffManager();

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
    const nations = { ...nextState.nations };

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      const updated = this.modifierManager.updateActiveModifiers(nation);

      const updatedRelations = { ...updated.relations };
      for (const [targetId, relation] of Object.entries(updatedRelations)) {
        if (relation.coolOffTurnsRemaining > 0) {
          const nextTurns = this.coolOffManager.processTurnTick(
            relation.coolOffTurnsRemaining,
          );
          let finalStance = relation.stance;
          if (nextTurns === 0 && relation.coolOffTargetStance) {
            finalStance = relation.coolOffTargetStance;
          }
          updatedRelations[targetId] = {
            ...relation,
            coolOffTurnsRemaining: nextTurns,
            stance: finalStance,
          };
        }
      }
      updated.relations = updatedRelations;

      nations[id] = updated;
    }

    nextState.nations = nations;
    return nextState;
  }
}
