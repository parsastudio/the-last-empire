import type { Nation } from "@/core/types/nation.types";
import type { GameEventChoice } from "@/core/types/events.types";
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
      updated.government.stability = Math.max(
        0,
        Math.min(100, updated.government.stability + effects.stabilityDelta),
      );
    }

    if (effects.manpowerDelta) {
      updated.resources.manpower = Math.max(
        0,
        updated.resources.manpower + effects.manpowerDelta,
      );
    }

    if (effects.reputationDelta) {
      updated.reputation = Math.max(
        -100,
        Math.min(100, updated.reputation + effects.reputationDelta),
      );
    }

    if (effects.relationsDelta) {
      for (const delta of effects.relationsDelta) {
        const rel = updated.relations[delta.targetNationId];
        if (rel) {
          updated.relations[delta.targetNationId] = {
            ...rel,
            opinion: Math.max(-100, Math.min(100, rel.opinion + delta.delta)),
          };
        }
      }
    }

    if (effects.addModifier) {
      updated = this.modifierManager.addModifier(updated, effects.addModifier);
    }

    return updated;
  }
}
