import type { Nation } from "@/domain/nation/nation.schema";

export class ModifierManager {
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
