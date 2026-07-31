import type { Nation, NationTrait } from "@/domain/nation/nation.schema";

export class TraitManager {
  public hasTrait(nation: Nation, trait: NationTrait): boolean {
    return nation.traits.includes(trait);
  }

  public getGdpGrowthModifier(nation: Nation): number {
    let modifier = 0;
    if (this.hasTrait(nation, "FRAGILE_ECONOMY")) {
      modifier -= 0.05;
    }
    if (this.hasTrait(nation, "INDUSTRIAL_HUB")) {
      modifier += 0.02;
    }

    return modifier;
  }

  public getUpkeepMultiplier(nation: Nation): number {
    let multiplier = 1.0;
    if (this.hasTrait(nation, "MILITARISTIC")) {
      multiplier -= 0.15;
    }
    if (this.hasTrait(nation, "INDUSTRIAL_HUB")) {
      multiplier -= 0.05;
    }
    return multiplier;
  }

  public getBaseStabilityDelta(nation: Nation): number {
    let delta = 0;
    if (this.hasTrait(nation, "ISOLATED_SOCIETY")) {
      delta += 5;
    }
    if (this.hasTrait(nation, "FRAGILE_ECONOMY")) {
      delta -= 5;
    }
    return delta;
  }
}
