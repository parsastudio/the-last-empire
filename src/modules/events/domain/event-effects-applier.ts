import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { GameEventChoice } from "@/modules/events/schemas/events.schema";
import { ModifierManager } from "./modifier-manager";

export class EventEffectsApplier {
  private modifierManager = new ModifierManager();

  public applyChoiceEffects(nation: Nation, choice: GameEventChoice): Nation {
    let updated = { ...nation };
    const effects = choice.effects;

    if (effects.treasuryDelta) {
      updated.treasury += effects.treasuryDelta;
    }

    if (effects.stabilityDelta) {
      updated.government = {
        ...updated.government,
        stability: Math.max(
          0,
          Math.min(100, updated.government.stability + effects.stabilityDelta),
        ),
      };
    }

    if (effects.manpowerDelta) {
      updated.resources = {
        ...updated.resources,
        manpower: Math.max(
          0,
          updated.resources.manpower + effects.manpowerDelta,
        ),
      };
    }

    if (effects.reputationDelta) {
      updated.globalReputation = Math.max(
        -100,
        Math.min(100, updated.globalReputation + effects.reputationDelta),
      );
    }

    if (effects.relationsDelta) {
      const updatedRelations = { ...updated.relations };
      for (const delta of effects.relationsDelta) {
        const rel = updatedRelations[delta.targetNationId];
        if (rel) {
          updatedRelations[delta.targetNationId] = {
            ...rel,
            opinion: Math.max(-100, Math.min(100, rel.opinion + delta.delta)),
          };
        }
      }
      updated.relations = updatedRelations;
    }

    if (effects.addModifier) {
      updated = this.modifierManager.addModifier(updated, effects.addModifier);
    }

    return updated;
  }
}
