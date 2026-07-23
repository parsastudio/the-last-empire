import type { GameState } from "@/domain/game/game-state.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { EspionageManager } from "@/engine/diplomacy/espionage-manager";
import { CoolOffManager } from "@/engine/diplomacy/cool-off-manager";
import { TurnPhase, PipelineContext } from "./turn-phase";

export class ModifiersPhase implements TurnPhase {
  private modifierManager = new ModifierManager();
  private espionageManager = new EspionageManager();
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
        let currentRel = relation;
        currentRel = this.espionageManager.applyDecay(currentRel);

        if (currentRel.coolOffTurnsRemaining > 0) {
          const nextTurns = this.coolOffManager.processTurnTick(
            currentRel.coolOffTurnsRemaining,
          );
          let finalStance = currentRel.stance;
          if (nextTurns === 0 && currentRel.coolOffTargetStance) {
            finalStance = currentRel.coolOffTargetStance;
          }
          currentRel = {
            ...currentRel,
            coolOffTurnsRemaining: nextTurns,
            stance: finalStance,
          };
        }
        updatedRelations[targetId] = currentRel;
      }
      updated.relations = updatedRelations;

      nations[id] = updated;
    }

    nextState.nations = nations;
    return nextState;
  }
}
