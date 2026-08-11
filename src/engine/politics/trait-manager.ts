import type { Nation, NationTrait } from "@/domain/nation/nation.schema";

export class TraitManager {
  public static hasTrait(nation: Nation, trait: NationTrait): boolean {
    return nation.traits.includes(trait);
  }

  public static getMilitaryPayrollMultiplier(nation: Nation): number {
    let multiplier = 1.0;
    if (TraitManager.hasTrait(nation, "MILITARISTIC")) {
      multiplier -= 0.15;
    }
    return multiplier;
  }

  public static getStabilityDeltaPerTurn(nation: Nation): number {
    let delta = 0;
    if (TraitManager.hasTrait(nation, "ISOLATED_SOCIETY")) {
      delta += 0.5;
    }
    if (TraitManager.hasTrait(nation, "FRAGILE_ECONOMY")) {
      delta -= 0.5;
    }
    return delta;
  }
}
