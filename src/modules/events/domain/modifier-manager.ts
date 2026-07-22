import type { Nation, ActiveModifier } from "@/core/types/nation.types";
import type { GameModifier } from "@/core/types/modifiers.types";

export class ModifierManager {
  public addModifier(nation: Nation, modifier: GameModifier): Nation {
    const active: ActiveModifier = {
      id: modifier.id,
      name: modifier.name,
      effectType: modifier.effectType,
      magnitude: modifier.magnitude,
      turnsRemaining: modifier.duration,
    };

    const existingIndex = nation.activeModifiers.findIndex(
      (m) => m.id === modifier.id,
    );

    let updatedModifiers = [...nation.activeModifiers];
    if (existingIndex > -1) {
      updatedModifiers[existingIndex] = active;
    } else {
      updatedModifiers.push(active);
    }

    return {
      ...nation,
      activeModifiers: updatedModifiers,
    };
  }

  public removeModifier(nation: Nation, modifierId: string): Nation {
    return {
      ...nation,
      activeModifiers: nation.activeModifiers.filter(
        (m) => m.id !== modifierId,
      ),
    };
  }

  public updateActiveModifiers(nation: Nation): Nation {
    const nextModifiers = nation.activeModifiers
      .map((m) => ({
        ...m,
        turnsRemaining: m.turnsRemaining - 1,
      }))
      .filter((m) => m.turnsRemaining > 0);

    return {
      ...nation,
      activeModifiers: nextModifiers,
    };
  }

  public getModifierImpact(nation: Nation, effectType: string): number {
    return nation.activeModifiers
      .filter((m) => m.effectType === effectType)
      .reduce((sum, m) => sum + m.magnitude, 0);
  }
}
