import type { Nation } from "@/domain/nation/nation.schema";

export class ModifierManager {
  public static updateActiveModifiersInPlace(nation: Nation): void {
    if (!nation.activeModifiers || nation.activeModifiers.length === 0) return;

    let writeIndex = 0;
    const len = nation.activeModifiers.length;

    for (let i = 0; i < len; i++) {
      const modifier = nation.activeModifiers[i]!;
      modifier.turnsRemaining -= 1;
      if (modifier.turnsRemaining > 0) {
        nation.activeModifiers[writeIndex++] = modifier;
      }
    }

    nation.activeModifiers.length = writeIndex;
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
