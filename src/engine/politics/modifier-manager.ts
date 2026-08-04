import type { Nation, ActiveModifier } from "@/domain/nation/nation.schema";

export interface ModifierInput {
  id: string;
  name: string;
  effectType: string;
  magnitude: number;
  duration: number;
}

export class ModifierManager {
  public static addModifier(nation: Nation, modifier: ModifierInput): Nation {
    const active: ActiveModifier = {
      id: modifier.id,
      name: modifier.name,
      effectType: modifier.effectType,
      magnitude: modifier.magnitude,
      turnsRemaining: modifier.duration,
    };

    const currentModifiers = nation.activeModifiers || [];
    const existingIndex = currentModifiers.findIndex(
      (m) => m.id === modifier.id,
    );

    const updatedModifiers = [...currentModifiers];
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

  public static removeModifier(nation: Nation, modifierId: string): Nation {
    return {
      ...nation,
      activeModifiers: (nation.activeModifiers || []).filter(
        (m) => m.id !== modifierId,
      ),
    };
  }

  public static updateActiveModifiers(nation: Nation): Nation {
    const nextModifiers = (nation.activeModifiers || [])
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

  public static getModifierImpact(nation: Nation, effectType: string): number {
    return (nation.activeModifiers || [])
      .filter((m) => m.effectType === effectType)
      .reduce((sum, m) => sum + m.magnitude, 0);
  }
}
