import type { GameState } from "@/domain/game/game-state.schema";
import type { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { CoolOffManager } from "@/engine/diplomacy/cool-off-manager";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";

export class ModifiersPhase implements TurnPhase {
  private coolOffManager = new CoolOffManager();

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
    const nations = { ...nextState.nations };

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      const updated = ModifierManager.updateActiveModifiers(nation);

      const updatedRelations: Record<string, RelationProfile> = {
        ...(updated.relations || {}),
      };

      for (const [targetId, relation] of Object.entries(updatedRelations) as [
        string,
        RelationProfile,
      ][]) {
        let currentRel: RelationProfile = relation;

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
